import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { formatIdr } from '$lib/cart/mms-cart';
import { parseOrderSpreadsheetRowsFromFile, tabularRowToOrderRow } from '$lib/server/orders/order-transfer';
import { runOrderImport } from '$lib/server/orders/run-order-import';
import { listAllStorefrontOrders } from '$lib/server/orders/repo';
import { assertSuperstore } from '$lib/server/superstore/access';
import { formatZodIssues } from '$lib/server/format-zod-issues';
import {
	orderExportRowSchema,
	type OrderExportRow,
	orderImportFileSchema
} from '$lib/superstore/schemas';
import type { OrderStatus } from '$lib/superstore/mms-admin-demo-data';

const MAX_IMPORT_BYTES = 8 * 1024 * 1024;

function startOfThisMonth(): Date {
	const d = new Date();
	return new Date(d.getFullYear(), d.getMonth(), 1);
}

function formatOrderDate(d: Date): string {
	return d.toLocaleString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export const load: PageServerLoad = async (event) => {
	assertSuperstore(event);
	try {
		const rows = await listAllStorefrontOrders();
		const monthStart = startOfThisMonth();
		const ordersThisMonth = rows.filter((r) => r.orderedAt >= monthStart).length;
		const totalIdr = rows.reduce((s, r) => s + r.totalIdr, 0);
		const pending = rows.filter(
			(r) => r.status === 'pending' || r.paymentStatus === 'pending_payment'
		).length;

		const orders = rows.map((r) => ({
			dbId: r.id,
			id: `#${r.orderCode}`,
			customer: r.customerName,
			product: r.productSummary,
			date: formatOrderDate(r.orderedAt),
			total: formatIdr(r.totalIdr),
			status: r.status as OrderStatus
		}));

		return {
			orders,
			kpis: {
				ordersThisMonth,
				totalRevenueDisplay: formatIdr(totalIdr),
				badgeOrders: pending
			}
		};
	} catch (e) {
		console.error('[superstore/orders] load failed', e);
		throw error(
			503,
			'Could not load orders from the database. Confirm DATABASE_URL, run npm run db:push and npm run db:seed:orders, then retry.'
		);
	}
};

export const actions: Actions = {
	importOrders: async (event) => {
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
		let orders: OrderExportRow[] = [];

		if (lowerName.endsWith('.json') || mime.includes('json') || mime === '') {
			let parsedJson: unknown;
			try {
				parsedJson = JSON.parse(await file.text());
			} catch {
				return fail(400, { importResult: null, message: 'Could not parse JSON.' });
			}

			const parsedBundle = orderImportFileSchema.safeParse(parsedJson);
			if (parsedBundle.success) {
				orders = parsedBundle.data.orders;
			} else if (Array.isArray(parsedJson)) {
				let row = 0;
				for (const raw of parsedJson) {
					row += 1;
					const p = orderExportRowSchema.safeParse(raw);
					if (p.success) orders.push(p.data);
					else {
						errors.push(`#${row}: ${formatZodIssues(p.error)}`);
					}
				}
			} else {
				return fail(400, {
					importResult: null,
					message:
						parsedBundle.error.flatten().formErrors.join(' ') || 'Invalid JSON shape: expected version 1 bundle or array of rows.'
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
			const sheetRows = await parseOrderSpreadsheetRowsFromFile(file);
			let row = 1;
			for (const raw of sheetRows) {
				row += 1;
				const parsed = tabularRowToOrderRow(raw);
				if (parsed.value) orders.push(parsed.value);
				if (parsed.error) errors.push(`#${row}: ${parsed.error}`);
			}
		} else {
			return fail(400, {
				importResult: null,
				message: 'Unsupported file type. Use JSON, CSV, XLSX, or XLS.'
			});
		}

		if (orders.length === 0) {
			return fail(400, {
				importResult: null,
				message: `No valid rows found to import.${errors.length > 0 ? ` ${errors[0]}` : ''}`
			});
		}

		const result = await runOrderImport(orders);
		const mergedErrors = [...errors, ...result.errors];

		return {
			importResult: { created: result.created, updated: result.updated, errors: mergedErrors },
			message: ''
		};
	}
};
