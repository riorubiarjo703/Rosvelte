import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { catalogProduct, catalogProductImage, superstoreUpload } from '$lib/server/db/schema';
import { getSuperstoreUploadDir } from '$lib/server/superstore/upload-path';

/**
 * Serves a staff-uploaded image when it is linked to at least one published catalogue product
 * (hero column or gallery slot). Staff preview continues to use `/superstore/uploads/[id]`.
 */
export const GET: RequestHandler = async (event) => {
	const uploadId = Number(event.params.uploadId);
	if (!Number.isInteger(uploadId) || uploadId < 1) {
		throw error(400, 'Invalid id');
	}

	const [viaHero] = await db
		.select({ id: catalogProduct.id })
		.from(catalogProduct)
		.where(and(eq(catalogProduct.heroImageUploadId, uploadId), eq(catalogProduct.published, true)))
		.limit(1);

	const [viaGallery] = viaHero
		? [null]
		: await db
				.select({ id: catalogProduct.id })
				.from(catalogProduct)
				.innerJoin(catalogProductImage, eq(catalogProductImage.productId, catalogProduct.id))
				.where(and(eq(catalogProduct.published, true), eq(catalogProductImage.uploadId, uploadId)))
				.limit(1);

	if (!viaHero && !viaGallery?.id) {
		throw error(404, 'Not found');
	}

	const [row] = await db.select().from(superstoreUpload).where(eq(superstoreUpload.id, uploadId)).limit(1);
	if (!row) {
		throw error(404, 'Not found');
	}

	const fullPath = join(getSuperstoreUploadDir(), row.storedFilename);
	let body: Buffer;
	try {
		body = await readFile(fullPath);
	} catch {
		throw error(404, 'File missing on disk');
	}

	return new Response(new Uint8Array(body), {
		headers: {
			'Content-Type': row.mimeType,
			'Cache-Control': 'public, max-age=86400',
			'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(row.originalName)}`
		}
	});
};
