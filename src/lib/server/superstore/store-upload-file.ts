import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { db } from '$lib/server/db';
import { superstoreUpload } from '$lib/server/db/schema';
import { getSuperstoreUploadDir, maxUploadBytes } from './upload-path';

function safeExt(filename: string): string {
	const m = filename.match(/(\.[a-z0-9]{1,8})$/i);
	return m ? m[1]!.toLowerCase() : '';
}

const HERO_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function isValidHeroImageFile(f: File): boolean {
	if (!HERO_IMAGE_MIMES.has(f.type)) return false;
	if (f.size <= 0 || f.size > maxUploadBytes()) return false;
	return true;
}

/** Writes to disk and inserts `superstore_upload`. Returns new row id. */
export async function persistSuperstoreUploadFile(
	f: File,
	uploadedByUserId: string | null | undefined
): Promise<number> {
	const dir = getSuperstoreUploadDir();
	await mkdir(dir, { recursive: true });
	const stored = `${randomUUID()}${safeExt(f.name)}`;
	const full = join(dir, stored);
	await writeFile(full, Buffer.from(await f.arrayBuffer()));

	const [row] = await db
		.insert(superstoreUpload)
		.values({
			originalName: f.name.slice(0, 512),
			storedFilename: stored,
			mimeType: f.type,
			sizeBytes: f.size,
			uploadedByUserId: uploadedByUserId ?? null
		})
		.returning({ id: superstoreUpload.id });
	if (!row) throw new Error('superstore_upload insert failed');
	return row.id;
}
