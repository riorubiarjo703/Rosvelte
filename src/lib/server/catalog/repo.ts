import { asc, eq, inArray } from 'drizzle-orm';
import type { MmsCollectionProduct, MmsProductBadge } from '$lib/data/mms-collection-products';
import type { MmsProductDetailPayload } from '$lib/data/mms-product-detail';
import { db } from '$lib/server/db';
import { catalogProduct, catalogProductImage, superstoreUpload } from '$lib/server/db/schema';
import {
	MAX_CATALOG_PRODUCT_IMAGES,
	firstCatalogImageUploadId,
	padCatalogImageSlots
} from '$lib/server/catalog/product-image-slots';
import { slugifyCatalog } from '$lib/server/catalog/slugify-catalog';

export type CatalogProductRow = typeof catalogProduct.$inferSelect;

export type CatalogProductInsert = {
	slug: string;
	sku: string;
	name: string;
	country: string;
	region: string;
	cat: MmsCollectionProduct['cat'];
	age: string;
	abv: string;
	price: number;
	rating: number;
	badge: MmsProductBadge;
	desc: string;
	stockQty: number;
	published: boolean;
	/** Up to four slots; null keeps a slot empty. List hero = first non-null. */
	imageSlots: (number | null)[];
	detailPayload: MmsProductDetailPayload | null;
};

export function catalogRowToProduct(row: CatalogProductRow): MmsCollectionProduct {
	return {
		id: row.id,
		name: row.name,
		country: row.country,
		region: row.region,
		cat: row.cat as MmsCollectionProduct['cat'],
		age: row.age,
		abv: row.abv,
		price: row.price,
		rating: row.rating,
		badge: (row.badge ?? '') as MmsProductBadge,
		desc: row.desc,
		stockQty: row.stockQty,
		heroImageUploadId: row.heroImageUploadId ?? null
	};
}

export async function getCatalogProductImageSlots(productId: number): Promise<(number | null)[]> {
	const rows = await db
		.select({ position: catalogProductImage.position, uploadId: catalogProductImage.uploadId })
		.from(catalogProductImage)
		.where(eq(catalogProductImage.productId, productId))
		.orderBy(asc(catalogProductImage.position));
	if (rows.length > 0) {
		const slots = padCatalogImageSlots([]);
		for (const r of rows) {
			if (r.position >= 0 && r.position < MAX_CATALOG_PRODUCT_IMAGES) {
				slots[r.position] = r.uploadId;
			}
		}
		return slots;
	}
	const row = await getCatalogProductById(productId);
	if (row?.heroImageUploadId) {
		const legacy = padCatalogImageSlots([]);
		legacy[0] = row.heroImageUploadId;
		return legacy;
	}
	return padCatalogImageSlots([]);
}

/** Ordered upload ids (slot order, skips empty slots) for PDP / admin previews. */
export async function getCatalogProductImageUploadIds(productId: number): Promise<number[]> {
	const slots = await getCatalogProductImageSlots(productId);
	return padCatalogImageSlots(slots).flatMap((u) => (u != null ? [u] : []));
}

export async function replaceCatalogProductImageSlots(
	productId: number,
	slots: (number | null)[]
): Promise<void> {
	const normalized = padCatalogImageSlots(slots);
	await db.delete(catalogProductImage).where(eq(catalogProductImage.productId, productId));
	const inserts: { productId: number; position: number; uploadId: number }[] = [];
	for (let i = 0; i < MAX_CATALOG_PRODUCT_IMAGES; i++) {
		const u = normalized[i];
		if (u != null) inserts.push({ productId, position: i, uploadId: u });
	}
	if (inserts.length > 0) {
		await db.insert(catalogProductImage).values(inserts);
	}
	const hero = firstCatalogImageUploadId(normalized);
	await db
		.update(catalogProduct)
		.set({ heroImageUploadId: hero, updatedAt: new Date() })
		.where(eq(catalogProduct.id, productId));
}

async function slugFree(slug: string, excludeId?: number): Promise<boolean> {
	const hit = await db.select({ id: catalogProduct.id }).from(catalogProduct).where(eq(catalogProduct.slug, slug)).limit(1);
	if (!hit[0]) return true;
	return excludeId !== undefined && hit[0].id === excludeId;
}

export async function resolveCatalogSlug(desired: string, excludeId?: number): Promise<string> {
	const base = slugifyCatalog(desired);
	let candidate = base;
	let n = 0;
	while (!(await slugFree(candidate, excludeId))) {
		n += 1;
		candidate = `${base}-${n}`;
		if (n > 500) throw new Error('Could not allocate unique slug');
	}
	return candidate;
}

async function skuFree(sku: string, excludeId?: number): Promise<boolean> {
	const hit = await db.select({ id: catalogProduct.id }).from(catalogProduct).where(eq(catalogProduct.sku, sku)).limit(1);
	if (!hit[0]) return true;
	return excludeId !== undefined && hit[0].id === excludeId;
}

export async function resolveCatalogSku(desired: string, excludeId?: number): Promise<string> {
	const base = desired.trim().slice(0, 120) || 'SKU';
	let candidate = base;
	let n = 0;
	while (!(await skuFree(candidate, excludeId))) {
		n += 1;
		candidate = `${base}-${n}`;
		if (n > 500) throw new Error('Could not allocate unique SKU');
	}
	return candidate;
}

export async function listPublishedCatalogProducts(): Promise<CatalogProductRow[]> {
	return db
		.select()
		.from(catalogProduct)
		.where(eq(catalogProduct.published, true))
		.orderBy(asc(catalogProduct.id));
}

export async function listAllCatalogProducts(): Promise<CatalogProductRow[]> {
	return db.select().from(catalogProduct).orderBy(asc(catalogProduct.id));
}

export async function getCatalogProductById(id: number): Promise<CatalogProductRow | undefined> {
	const rows = await db.select().from(catalogProduct).where(eq(catalogProduct.id, id)).limit(1);
	return rows[0];
}

export async function getCatalogProductBySku(sku: string): Promise<CatalogProductRow | undefined> {
	const key = sku.trim();
	if (!key) return undefined;
	const rows = await db.select().from(catalogProduct).where(eq(catalogProduct.sku, key)).limit(1);
	return rows[0];
}

/** Drop gallery slot IDs that no longer exist in `superstore_upload` (cross-env imports). */
export async function filterImageSlotsToExistingUploads(slots: (number | null)[]): Promise<(number | null)[]> {
	const padded = padCatalogImageSlots(slots);
	const ids = [...new Set(padded.filter((x): x is number => x != null && x >= 1))];
	if (ids.length === 0) return padded;
	const found = await db
		.select({ id: superstoreUpload.id })
		.from(superstoreUpload)
		.where(inArray(superstoreUpload.id, ids));
	const ok = new Set(found.map((f) => f.id));
	return padded.map((u) => (u != null && ok.has(u) ? u : null));
}

export async function insertCatalogProduct(values: CatalogProductInsert): Promise<number> {
	const [row] = await db
		.insert(catalogProduct)
		.values({
			slug: values.slug,
			sku: values.sku,
			name: values.name,
			country: values.country,
			region: values.region,
			cat: values.cat,
			age: values.age,
			abv: values.abv,
			price: values.price,
			rating: values.rating,
			badge: values.badge ?? '',
			desc: values.desc,
			stockQty: values.stockQty,
			published: values.published,
			heroImageUploadId: null,
			detailPayload: values.detailPayload,
			updatedAt: new Date()
		})
		.returning({ id: catalogProduct.id });
	if (!row) throw new Error('Insert catalog product failed');
	await replaceCatalogProductImageSlots(row.id, values.imageSlots);
	return row.id;
}

export async function updateCatalogProduct(id: number, values: CatalogProductInsert): Promise<void> {
	await db
		.update(catalogProduct)
		.set({
			slug: values.slug,
			sku: values.sku,
			name: values.name,
			country: values.country,
			region: values.region,
			cat: values.cat,
			age: values.age,
			abv: values.abv,
			price: values.price,
			rating: values.rating,
			badge: values.badge ?? '',
			desc: values.desc,
			stockQty: values.stockQty,
			published: values.published,
			detailPayload: values.detailPayload,
			updatedAt: new Date()
		})
		.where(eq(catalogProduct.id, id));
	await replaceCatalogProductImageSlots(id, values.imageSlots);
}

export async function deleteCatalogProduct(id: number): Promise<void> {
	await db.delete(catalogProduct).where(eq(catalogProduct.id, id));
}

export async function restockCatalogProductsByThreshold(
	threshold: number,
	targetStock: number
): Promise<{ updated: number; addedUnits: number }> {
	const rows = await db
		.select({ id: catalogProduct.id, stockQty: catalogProduct.stockQty })
		.from(catalogProduct)
		.orderBy(asc(catalogProduct.id));

	const candidates = rows.filter((row) => row.stockQty <= threshold);
	if (candidates.length === 0) {
		return { updated: 0, addedUnits: 0 };
	}

	const ids = candidates.map((c) => c.id);
	const addedUnits = candidates.reduce((sum, c) => sum + Math.max(0, targetStock - c.stockQty), 0);

	await db
		.update(catalogProduct)
		.set({ stockQty: targetStock, updatedAt: new Date() })
		.where(inArray(catalogProduct.id, ids));

	return { updated: candidates.length, addedUnits };
}
