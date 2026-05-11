import { mmsCollectionProducts } from '$lib/data/mms-collection-products';
import type { MmsCatalogSearchItem } from '$lib/data/mms-catalog-search';
import {
	listPublishedCatalogProducts,
	type CatalogProductRow
} from '$lib/server/catalog/repo';
import type { LayoutServerLoad } from './$types';

function rowToSearchItem(r: CatalogProductRow): MmsCatalogSearchItem {
	return {
		id: r.id,
		name: r.name,
		country: r.country,
		region: r.region,
		cat: r.cat,
		price: r.price,
		desc: r.desc,
		heroImageUploadId: r.heroImageUploadId ?? null
	};
}

export const load: LayoutServerLoad = async ({ locals }) => {
	let catalogHeroImages: Record<string, number | null> = {};
	let catalogStockQtys: Record<string, number> = {};
	let catalogSearchItems: MmsCatalogSearchItem[] = [];
	try {
		const rows = await listPublishedCatalogProducts();
		if (rows.length > 0) {
			catalogSearchItems = rows.map(rowToSearchItem);
			for (const r of rows) {
				catalogHeroImages[String(r.id)] = r.heroImageUploadId ?? null;
				catalogStockQtys[String(r.id)] = Math.max(0, Math.trunc(r.stockQty));
			}
		} else {
			catalogSearchItems = mmsCollectionProducts.map((p) => ({
				id: p.id,
				name: p.name,
				country: p.country,
				region: p.region,
				cat: p.cat,
				price: p.price,
				desc: p.desc,
				heroImageUploadId: p.heroImageUploadId ?? null
			}));
		}
	} catch {
		catalogHeroImages = {};
		catalogStockQtys = {};
		catalogSearchItems = mmsCollectionProducts.map((p) => ({
			id: p.id,
			name: p.name,
			country: p.country,
			region: p.region,
			cat: p.cat,
			price: p.price,
			desc: p.desc,
			heroImageUploadId: p.heroImageUploadId ?? null
		}));
	}

	return {
		customer: locals.customer ?? null,
		catalogHeroImages,
		catalogStockQtys,
		catalogSearchItems
	};
};
