import * as XLSX from 'xlsx';
import { orderExportRowSchema, type OrderExportRow } from '$lib/superstore/schemas';
import { normalizeOrderCode } from '$lib/server/orders/repo';
import { formatZodIssues } from '$lib/server/format-zod-issues';

export const ORDER_EXPORT_VERSION = 1 as const;

const TABULAR_COLUMNS = [
	'orderCode',
	'customerName',
	'customerEmail',
	'productSummary',
	'totalIdr',
	'currency',
	'status',
	'orderedAt'
] as const;

type TabularRow = Record<(typeof TABULAR_COLUMNS)[number], string | number>;

function toText(v: unknown): string {
	return String(v ?? '').trim();
}

function toInt(v: unknown, fallback = 0): number {
	const n = Number(v);
	if (!Number.isFinite(n)) return fallback;
	return Math.trunc(n);
}

export function buildOrderExportBundle(orders: OrderExportRow[]) {
	return {
		version: ORDER_EXPORT_VERSION,
		exportedAt: new Date().toISOString(),
		orders
	};
}

export function orderRowToExportRow(row: {
	orderCode: string;
	customerName: string;
	customerEmail: string;
	productSummary: string;
	totalIdr: number;
	currency: string;
	status: string;
	orderedAt: Date;
}): OrderExportRow {
	return {
		orderCode: row.orderCode,
		customerName: row.customerName,
		customerEmail: row.customerEmail,
		productSummary: row.productSummary,
		totalIdr: row.totalIdr,
		currency: row.currency,
		status: row.status as OrderExportRow['status'],
		orderedAt: row.orderedAt.toISOString()
	};
}

function toTabularRows(orders: OrderExportRow[]): TabularRow[] {
	return orders.map((o) => ({
		orderCode: o.orderCode,
		customerName: o.customerName,
		customerEmail: o.customerEmail,
		productSummary: o.productSummary,
		totalIdr: o.totalIdr,
		currency: o.currency,
		status: o.status,
		orderedAt: o.orderedAt || ''
	}));
}

export function toCsvFromOrders(orders: OrderExportRow[]): string {
	const rows = toTabularRows(orders);
	const ws = XLSX.utils.json_to_sheet(rows, { header: [...TABULAR_COLUMNS] });
	return XLSX.utils.sheet_to_csv(ws);
}

export function toXlsxBufferFromOrders(orders: OrderExportRow[]): Buffer {
	const rows = toTabularRows(orders);
	const ws = XLSX.utils.json_to_sheet(rows, { header: [...TABULAR_COLUMNS] });
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'orders');
	return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

function sheetRowsFromWorkbook(wb: XLSX.WorkBook): Record<string, unknown>[] {
	const first = wb.SheetNames[0];
	if (!first) return [];
	const sheet = wb.Sheets[first];
	if (!sheet) return [];
	return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
}

export async function parseOrderSpreadsheetRowsFromFile(file: File): Promise<Record<string, unknown>[]> {
	const name = file.name.toLowerCase();
	const mime = file.type.toLowerCase();

	if (name.endsWith('.csv') || mime.includes('csv')) {
		const text = await file.text();
		const wb = XLSX.read(text, { type: 'string' });
		return sheetRowsFromWorkbook(wb);
	}

	const bytes = new Uint8Array(await file.arrayBuffer());
	const wb = XLSX.read(bytes, { type: 'array' });
	return sheetRowsFromWorkbook(wb);
}

export function tabularRowToOrderRow(
	row: Record<string, unknown>
): { value?: OrderExportRow; error?: string } {
	const candidate: OrderExportRow = {
		orderCode: normalizeOrderCode(toText(row.orderCode)),
		customerName: toText(row.customerName),
		customerEmail: toText(row.customerEmail),
		productSummary: toText(row.productSummary),
		totalIdr: toInt(row.totalIdr),
		currency: toText(row.currency) || 'IDR',
		status: toText(row.status).toLowerCase() as OrderExportRow['status'],
		orderedAt: toText(row.orderedAt)
	};

	const parsed = orderExportRowSchema.safeParse(candidate);
	if (!parsed.success) {
		return { error: formatZodIssues(parsed.error) || 'invalid row' };
	}
	return { value: parsed.data };
}
