import { join } from 'node:path';
import { env } from '$env/dynamic/private';

export function getSuperstoreUploadDir(): string {
	const dir = env.SUPERSTORE_UPLOAD_DIR?.trim() || '.data/superstore-uploads';
	return join(process.cwd(), dir);
}

export function maxUploadBytes(): number {
	const mb = Number(env.SUPERSTORE_MAX_UPLOAD_MB || 10);
	if (!Number.isFinite(mb) || mb < 1) return 10 * 1024 * 1024;
	return Math.min(mb, 50) * 1024 * 1024;
}
