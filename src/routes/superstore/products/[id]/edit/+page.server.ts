import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { mmsFallbackDetailPayload } from '$lib/data/mms-product-detail';
import { parseCatalogDetailJson } from '$lib/server/catalog/detail-json';
import { mergeCatalogImageSlotsFromForm } from '$lib/server/catalog/product-image-slots';
import {
	catalogRowToProduct,
	getCatalogProductById,
	getCatalogProductImageSlots,
	resolveCatalogSku,
	resolveCatalogSlug,
	updateCatalogProduct,
	deleteCatalogProduct
} from '$lib/server/catalog/repo';
import { assertSuperstore } from '$lib/server/superstore/access';
import {
	catalogProductDeleteSchema,
	catalogProductUpdateSchema
} from '$lib/superstore/schemas';

export const load: PageServerLoad = async (event) => {
	assertSuperstore(event);
	const id = Number.parseInt(event.params.id, 10);
	if (!Number.isFinite(id) || id < 1) error(404, 'Not found');

	const row = await getCatalogProductById(id);
	if (!row) error(404, 'Not found');

	const product = catalogRowToProduct(row);
	const detailJsonDefault = row.detailPayload
		? JSON.stringify(row.detailPayload, null, 2)
		: JSON.stringify(mmsFallbackDetailPayload(product), null, 2);

	const imageSlots = await getCatalogProductImageSlots(id);

	return {
		fields: {
			id: row.id,
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
			badge: row.badge || '',
			desc: row.desc,
			stockQty: row.stockQty,
			published: row.published,
			heroImageUploadId: row.heroImageUploadId ?? null
		},
		imageSlots,
		detailJsonDefault
	};
};

function readCatalogForm(fd: FormData) {
	return {
		id: fd.get('id'),
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
	updateProduct: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const parsed = catalogProductUpdateSchema.safeParse(readCatalogForm(fd));
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors, message: 'Check the form fields.' });
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

		const id = parsed.data.id;
		const existing = await getCatalogProductById(id);
		if (!existing) return fail(400, { errors: {}, message: 'Product not found.' });

		const slug = await resolveCatalogSlug(parsed.data.slug || parsed.data.name, id);
		const sku = await resolveCatalogSku(parsed.data.sku, id);

		const slotsBefore = await getCatalogProductImageSlots(id);
		const merged = await mergeCatalogImageSlotsFromForm(fd, slotsBefore, event.locals.user?.id);
		if ('error' in merged) {
			return fail(400, { errors: {}, message: merged.error });
		}

		await updateCatalogProduct(id, {
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

		throw redirect(303, event.url.pathname);
	},

	deleteProduct: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const parsed = catalogProductDeleteSchema.safeParse({ id: fd.get('id') });
		if (!parsed.success) return fail(400, { errors: {}, message: 'Invalid product id' });
		await deleteCatalogProduct(parsed.data.id);
		throw redirect(303, '/superstore/products');
	}
};
