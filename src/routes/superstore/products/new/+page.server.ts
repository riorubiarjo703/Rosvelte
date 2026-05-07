import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { parseCatalogDetailJson } from '$lib/server/catalog/detail-json';
import {
	mergeCatalogImageSlotsFromForm,
	padCatalogImageSlots
} from '$lib/server/catalog/product-image-slots';
import { insertCatalogProduct, resolveCatalogSku, resolveCatalogSlug } from '$lib/server/catalog/repo';
import { assertSuperstore } from '$lib/server/superstore/access';
import { catalogProductCreateSchema } from '$lib/superstore/schemas';

export const load: PageServerLoad = async (event) => {
	assertSuperstore(event);
	return {};
};

function readCatalogForm(fd: FormData) {
	return {
		name: fd.get('name'),
		slug: fd.get('slug') ?? '',
		sku: fd.get('sku'),
		country: fd.get('country'),
		region: fd.get('region'),
		cat: fd.get('cat'),
		age: fd.get('age'),
		abv: fd.get('abv'),
		price: fd.get('price'),
		rating: fd.get('rating'),
		badge: fd.get('badge') ?? '',
		desc: fd.get('desc'),
		stockQty: fd.get('stockQty'),
		published: fd.get('published'),
		detailJson: fd.get('detailJson') ?? ''
	};
}

export const actions: Actions = {
	createProduct: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const parsed = catalogProductCreateSchema.safeParse(readCatalogForm(fd));
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors, message: 'Check the form fields.' });
		}

		const emptySlots = padCatalogImageSlots([]);
		const merged = await mergeCatalogImageSlotsFromForm(fd, emptySlots, event.locals.user?.id);
		if ('error' in merged) {
			return fail(400, { errors: {}, message: merged.error });
		}

		const trimmedDetail = parsed.data.detailJson.trim();
		let detailPayload = null;
		if (trimmedDetail) {
			detailPayload = parseCatalogDetailJson(trimmedDetail);
			if (!detailPayload) {
				return fail(400, {
					errors: {},
					message: 'Detail JSON is invalid (expected object with watermark, subtitle, …).'
				});
			}
		}

		const slug = await resolveCatalogSlug(parsed.data.slug || parsed.data.name);
		const sku = await resolveCatalogSku(parsed.data.sku);
		const id = await insertCatalogProduct({
			slug,
			sku,
			name: parsed.data.name,
			country: parsed.data.country,
			region: parsed.data.region,
			cat: parsed.data.cat,
			age: parsed.data.age,
			abv: parsed.data.abv,
			price: parsed.data.price,
			rating: parsed.data.rating,
			badge: parsed.data.badge,
			desc: parsed.data.desc,
			stockQty: parsed.data.stockQty,
			published: parsed.data.published,
			imageSlots: merged.slots,
			detailPayload
		});

		throw redirect(303, `/superstore/products/${id}/edit`);
	}
};
