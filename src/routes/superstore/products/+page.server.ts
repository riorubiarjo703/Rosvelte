import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	parseSpreadsheetRowsFromFile,
	tabularRowToCatalogRow
} from '$lib/server/catalog/catalog-transfer';
import { runCatalogImport } from '$lib/server/catalog/run-catalog-import';
import { deleteCatalogProduct, listAllCatalogProducts } from '$lib/server/catalog/repo';
import { assertSuperstore } from '$lib/server/superstore/access';
import {
	catalogExportProductSchema,
	type CatalogExportProductRow,
	catalogImportFileSchema,
	catalogProductDeleteSchema
} from '$lib/superstore/schemas';

const MAX_IMPORT_BYTES = 8 * 1024 * 1024;

export const load: PageServerLoad = async (event) => {
	assertSuperstore(event);
	try {
		const products = await listAllCatalogProducts();
		return { products };
	} catch (e) {
		console.error('[superstore/products] catalog load failed', e);
		throw error(
			503,
			'Could not load the product catalogue from the database. Confirm DATABASE_URL, run npm run db:push in a terminal (TTY), then retry.'
		);
	}
};

export const actions: Actions = {
	importCatalog: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const file = fd.get('file');
		if (!(file instanceof File) || file.size === 0) {
			return fail(400, {
				importResult: null,
				message: 'Choose a JSON, CSV, or Excel file produced by Export.'
			});
		}
		if (file.size > MAX_IMPORT_BYTES) {
			return fail(400, {
				importResult: null,
				message: `File too large (max ${MAX_IMPORT_BYTES / 1024 / 1024} MB).`
			});
		}

		const lowerName = file.name.toLowerCase();
		const mime = file.type.toLowerCase();
		const errors: string[] = [];
		let products: CatalogExportProductRow[] = [];

		if (lowerName.endsWith('.json') || mime.includes('json') || mime === '') {
			let parsedJson: unknown;
			try {
				parsedJson = JSON.parse(await file.text());
			} catch {
				return fail(400, { importResult: null, message: 'Could not parse JSON.' });
			}

			const parsedBundle = catalogImportFileSchema.safeParse(parsedJson);
			if (parsedBundle.success) {
				products = parsedBundle.data.products;
			} else if (Array.isArray(parsedJson)) {
				let row = 0;
				for (const raw of parsedJson) {
					row += 1;
					const p = catalogExportProductSchema.safeParse(raw);
					if (p.success) {
						products.push(p.data);
					} else {
						errors.push(
							`#${row}: ${p.error.issues.map((i) => `${i.path.join('.') || 'row'} ${i.message}`).join('; ')}`
						);
					}
				}
			} else {
				return fail(400, {
					importResult: null,
					message:
						`Invalid JSON shape: ${parsedBundle.error.flatten().formErrors.join(' ') || 'check version and shape.'}`
				});
			}
		} else if (
			lowerName.endsWith('.csv') ||
			lowerName.endsWith('.xlsx') ||
			lowerName.endsWith('.xls') ||
			mime.includes('csv') ||
			mime.includes('spreadsheet') ||
			mime.includes('excel')
		) {
			const rows = await parseSpreadsheetRowsFromFile(file);
			let row = 1;
			for (const raw of rows) {
				row += 1; // header is line 1
				const parsed = tabularRowToCatalogRow(raw);
				if (parsed.value) products.push(parsed.value);
				if (parsed.error) errors.push(`#${row}: ${parsed.error}`);
			}
		} else {
			return fail(400, {
				importResult: null,
				message: 'Unsupported file type. Use JSON, CSV, XLSX, or XLS.'
			});
		}

		if (products.length === 0) {
			return fail(400, {
				importResult: null,
				message: `No valid rows found to import.${errors.length > 0 ? ` ${errors[0]}` : ''}`
			});
		}

		const result = await runCatalogImport(products);
		const mergedErrors = [...errors, ...result.errors];

		return {
			importResult: { created: result.created, updated: result.updated, errors: mergedErrors },
			message: ''
		};
	},

	deleteProduct: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const parsed = catalogProductDeleteSchema.safeParse({ id: fd.get('id') });
		if (!parsed.success) return fail(400, { errors: {}, message: 'Invalid product id' });
		await deleteCatalogProduct(parsed.data.id);
		throw redirect(303, event.url.pathname);
	}
};
