import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	parseInventorySpreadsheetFromFile,
	tabularRowToInventoryRow
} from '$lib/server/catalog/inventory-transfer';
import { runInventoryImport } from '$lib/server/catalog/run-inventory-import';
import {
	deleteCatalogProduct,
	listAllCatalogProducts,
	restockCatalogProductsByThreshold
} from '$lib/server/catalog/repo';
import { assertSuperstore } from '$lib/server/superstore/access';
import { formatZodIssues } from '$lib/server/format-zod-issues';
import {
	catalogProductDeleteSchema,
	inventoryExportRowSchema,
	type InventoryExportRow,
	inventoryImportFileSchema,
	inventoryRestockSchema
} from '$lib/superstore/schemas';

const MAX_IMPORT_BYTES = 8 * 1024 * 1024;

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
	importInventory: async (event) => {
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
		let rows: InventoryExportRow[] = [];

		if (lowerName.endsWith('.json') || mime.includes('json') || mime === '') {
			let parsedJson: unknown;
			try {
				parsedJson = JSON.parse(await file.text());
			} catch {
				return fail(400, { importResult: null, message: 'Could not parse JSON.' });
			}

			const parsedBundle = inventoryImportFileSchema.safeParse(parsedJson);
			if (parsedBundle.success) {
				rows = parsedBundle.data.rows;
			} else if (Array.isArray(parsedJson)) {
				let row = 0;
				for (const raw of parsedJson) {
					row += 1;
					const p = inventoryExportRowSchema.safeParse(raw);
					if (p.success) rows.push(p.data);
					else {
						errors.push(`#${row}: ${formatZodIssues(p.error)}`);
					}
				}
			} else {
				return fail(400, {
					importResult: null,
					message:
						parsedBundle.error.flatten().formErrors.join(' ') ||
						'Invalid JSON shape: expected version 1 bundle or array of rows.'
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
			const sheetRows = await parseInventorySpreadsheetFromFile(file);
			let row = 1;
			for (const raw of sheetRows) {
				row += 1;
				const parsed = tabularRowToInventoryRow(raw);
				if (parsed.value) rows.push(parsed.value);
				if (parsed.error) errors.push(`#${row}: ${parsed.error}`);
			}
		} else {
			return fail(400, {
				importResult: null,
				message: 'Unsupported file type. Use JSON, CSV, XLSX, or XLS.'
			});
		}

		if (rows.length === 0) {
			return fail(400, {
				importResult: null,
				message: `No valid rows found to import.${errors.length > 0 ? ` ${errors[0]}` : ''}`
			});
		}

		const result = await runInventoryImport(rows);
		const mergedErrors = [...errors, ...result.errors];

		return {
			importResult: { updated: result.updated, errors: mergedErrors },
			message: ''
		};
	},

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
