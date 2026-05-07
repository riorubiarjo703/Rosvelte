import type { MmsProductDetailPayload } from '$lib/data/mms-product-detail';
import type { CatalogExportProductRow } from '$lib/superstore/schemas';
import { parseCatalogDetailJson } from '$lib/server/catalog/detail-json';
import { padCatalogImageSlots } from '$lib/server/catalog/product-image-slots';
import type { CatalogProductInsert } from '$lib/server/catalog/repo';
import {
	filterImageSlotsToExistingUploads,
	getCatalogProductBySku,
	insertCatalogProduct,
	resolveCatalogSku,
	resolveCatalogSlug,
	updateCatalogProduct
} from '$lib/server/catalog/repo';

function detailPayloadFromImport(raw: unknown | null): MmsProductDetailPayload | null {
	if (raw == null) return null;
	try {
		if (typeof raw === 'string') {
			return parseCatalogDetailJson(raw);
		}
		return parseCatalogDetailJson(JSON.stringify(raw));
	} catch {
		return null;
	}
}

async function rowToInsert(row: CatalogExportProductRow): Promise<CatalogProductInsert> {
	const imageSlots = await filterImageSlotsToExistingUploads(padCatalogImageSlots(row.imageSlots ?? []));
	return {
		slug: row.slug,
		sku: row.sku,
		name: row.name,
		country: row.country,
		region: row.region,
		cat: row.cat,
		age: row.age,
		abv: row.abv,
		price: row.price,
		rating: row.rating,
		badge: row.badge,
		desc: row.desc,
		stockQty: row.stockQty,
		published: row.published,
		imageSlots,
		detailPayload: detailPayloadFromImport(row.detailPayload)
	};
}

export async function runCatalogImport(
	products: CatalogExportProductRow[]
): Promise<{ created: number; updated: number; errors: string[] }> {
	const errors: string[] = [];
	let created = 0;
	let updated = 0;

	let index = 0;
	for (const row of products) {
		index += 1;
		try {
			const base = await rowToInsert(row);
			const existing = await getCatalogProductBySku(row.sku);

			if (existing) {
				const slug = await resolveCatalogSlug(base.slug || base.name, existing.id);
				const skuFinal = await resolveCatalogSku(base.sku, existing.id);
				await updateCatalogProduct(existing.id, { ...base, slug: slug, sku: skuFinal });
				updated += 1;
			} else {
				const slug = await resolveCatalogSlug(base.slug || base.name);
				const skuFinal = await resolveCatalogSku(base.sku);
				await insertCatalogProduct({ ...base, slug, sku: skuFinal });
				created += 1;
			}
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			errors.push(`#${index} SKU ${row.sku}: ${msg}`);
		}
	}

	return { created, updated, errors };
}
