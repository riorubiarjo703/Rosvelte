import { listPublishedCatalogProducts } from '$lib/server/catalog/repo';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	let catalogHeroImages: Record<string, number | null> = {};
	try {
		const rows = await listPublishedCatalogProducts();
		for (const r of rows) {
			catalogHeroImages[String(r.id)] = r.heroImageUploadId ?? null;
		}
	} catch {
		catalogHeroImages = {};
	}

	return {
		customer: locals.customer ?? null,
		catalogHeroImages
	};
};
