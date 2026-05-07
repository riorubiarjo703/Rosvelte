import type { MmsProductDetailPayload } from '$lib/data/mms-product-detail';

/** Lenient parse for admin “detail JSON” textarea; invalid JSON → null (server falls back). */
export function parseCatalogDetailJson(raw: string | null | undefined): MmsProductDetailPayload | null {
	if (raw == null) return null;
	const s = String(raw).trim();
	if (!s) return null;
	try {
		const v = JSON.parse(s) as unknown;
		if (typeof v !== 'object' || v === null) return null;
		const o = v as Record<string, unknown>;
		if (typeof o.watermark !== 'string' || typeof o.subtitle !== 'string') return null;
		return v as MmsProductDetailPayload;
	} catch {
		return null;
	}
}
