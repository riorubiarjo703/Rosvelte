import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { superstoreUpload } from '$lib/server/db/schema';
import { assertSuperstore } from '$lib/server/superstore/access';
import { getSuperstoreUploadDir } from '$lib/server/superstore/upload-path';

export const GET: RequestHandler = async (event) => {
	assertSuperstore(event);

	const id = Number(event.params.id);
	if (!Number.isInteger(id) || id < 1) {
		throw error(400, 'Invalid id');
	}

	const [row] = await db.select().from(superstoreUpload).where(eq(superstoreUpload.id, id));
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
			'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(row.originalName)}`
		}
	});
};
