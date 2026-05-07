import { mmsCollectionProducts } from '$lib/data/mms-collection-products';
import { catalogRowToProduct, listPublishedCatalogProducts } from '$lib/server/catalog/repo';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await listPublishedCatalogProducts();
	const products = rows.length > 0 ? rows.map(catalogRowToProduct) : mmsCollectionProducts;
	return { products };
};
