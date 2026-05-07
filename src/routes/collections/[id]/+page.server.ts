import { error } from '@sveltejs/kit';
import { mmsCollectionProducts, mmsGetProductById } from '$lib/data/mms-collection-products';
import {
	catalogRowToProduct,
	getCatalogProductById,
	getCatalogProductImageUploadIds,
	listPublishedCatalogProducts
} from '$lib/server/catalog/repo';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number.parseInt(params.id, 10);
	if (!Number.isFinite(id) || id < 1) error(404, 'Product not found');

	const catRows = await listPublishedCatalogProducts();
	const catalogProducts =
		catRows.length > 0 ? catRows.map(catalogRowToProduct) : mmsCollectionProducts;

	const row = await getCatalogProductById(id);

	if (row) {
		if (!row.published) error(404, 'Product not found');
		const imageUploadIds = await getCatalogProductImageUploadIds(id);
		return {
			product: { ...catalogRowToProduct(row), imageUploadIds },
			detailPayload: row.detailPayload ?? null,
			catalogProducts
		};
	}

	const product = mmsGetProductById(id);
	if (!product) error(404, 'Product not found');

	return {
		product,
		detailPayload: null,
		catalogProducts
	};
};
