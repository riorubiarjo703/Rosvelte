import { fail, redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { catalogProduct, catalogProductImage, superstoreUpload } from '$lib/server/db/schema';
import { assertSuperstore } from '$lib/server/superstore/access';
import { getSuperstoreUploadDir, maxUploadBytes } from '$lib/server/superstore/upload-path';
import { persistSuperstoreUploadFile } from '$lib/server/superstore/store-upload-file';
import { uploadFormSchema } from '$lib/superstore/schemas';

export const load: PageServerLoad = async (event) => {
	assertSuperstore(event);
	const rows = await db
		.select()
		.from(superstoreUpload)
		.orderBy(desc(superstoreUpload.id))
		.limit(100);
	return { uploads: rows };
};

export const actions: Actions = {
	upload: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const file = fd.get('file');
		const parsed = uploadFormSchema.safeParse({ file });
		if (!parsed.success) {
			const msg = parsed.error.flatten().formErrors[0] ?? 'Invalid file';
			return fail(400, { message: msg });
		}
		const f = parsed.data.file;
		if (f.size > maxUploadBytes()) {
			return fail(400, { message: `File too large (max ${maxUploadBytes() / 1024 / 1024} MB)` });
		}

		await persistSuperstoreUploadFile(f, event.locals.user?.id);

		throw redirect(303, event.url.pathname);
	},

	deleteUpload: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const id = Number(fd.get('id'));
		if (!Number.isInteger(id) || id < 1) {
			return fail(400, { message: 'Invalid id' });
		}
		const [usedHero] = await db
			.select({ id: catalogProduct.id })
			.from(catalogProduct)
			.where(eq(catalogProduct.heroImageUploadId, id))
			.limit(1);
		const [usedGallery] = await db
			.select({ id: catalogProductImage.id })
			.from(catalogProductImage)
			.where(eq(catalogProductImage.uploadId, id))
			.limit(1);
		if (usedHero || usedGallery) {
			return fail(400, {
				message:
					'This file is used on a catalogue product (gallery or cover). Remove it from the product first.'
			});
		}

		const [row] = await db.select().from(superstoreUpload).where(eq(superstoreUpload.id, id));
		if (row) {
			try {
				await unlink(join(getSuperstoreUploadDir(), row.storedFilename));
			} catch {
				/* missing file is fine */
			}
		}
		await db.delete(superstoreUpload).where(eq(superstoreUpload.id, id));
		throw redirect(303, event.url.pathname);
	}
};
