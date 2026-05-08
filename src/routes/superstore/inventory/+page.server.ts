import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	deleteCatalogProduct,
	listAllCatalogProducts,
	restockCatalogProductsByThreshold
} from '$lib/server/catalog/repo';
import { assertSuperstore } from '$lib/server/superstore/access';
import { catalogProductDeleteSchema, inventoryRestockSchema } from '$lib/superstore/schemas';

export const load: PageServerLoad = async (event) => {
	assertSuperstore(event);
	try {
		const products = await listAllCatalogProducts();
		return { products };
	} catch (e) {
		console.error('[superstore/inventory] catalog load failed', e);
		throw error(
			503,
			'Could not load inventory from the database. Confirm DATABASE_URL, run npm run db:push in a terminal (TTY), then retry.'
		);
	}
};

export const actions: Actions = {
	restockLow: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const parsed = inventoryRestockSchema.safeParse({
			threshold: fd.get('threshold'),
			targetStock: fd.get('targetStock')
		});
		if (!parsed.success) {
			return fail(400, {
				message:
					parsed.error.issues[0]?.message ??
					'Invalid restock settings. Please check threshold and target.'
			});
		}

		const result = await restockCatalogProductsByThreshold(
			parsed.data.threshold,
			parsed.data.targetStock
		);

		if (result.updated === 0) {
			return {
				message: `No SKUs at or below ${parsed.data.threshold}; nothing to restock.`
			};
		}

		return {
			message: `Restocked ${result.updated} SKU(s) to ${parsed.data.targetStock}. Added ${result.addedUnits} total unit(s).`
		};
	},

	deleteProduct: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const parsed = catalogProductDeleteSchema.safeParse({ id: fd.get('id') });
		if (!parsed.success) {
			return fail(400, { message: 'Invalid product id' });
		}
		await deleteCatalogProduct(parsed.data.id);
		throw redirect(303, event.url.pathname);
	}
};
