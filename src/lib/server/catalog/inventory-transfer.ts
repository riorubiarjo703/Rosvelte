import * as XLSX from 'xlsx';
import { inventoryExportRowSchema, type InventoryExportRow } from '$lib/superstore/schemas';
import { formatZodIssues } from '$lib/server/format-zod-issues';

export const INVENTORY_EXPORT_VERSION = 1 as const;

const TABULAR_COLUMNS = ['sku', 'stockQty'] as const;

type TabularRow = Record<(typeof TABULAR_COLUMNS)[number], string | number>;

function toText(v: unknown): string {
	return String(v ?? '').trim();
}

function toInt(v: unknown, fallback = 0): number {
	const n = Number(v);
	if (!Number.isFinite(n)) return fallback;
	return Math.trunc(n);
}

export function buildInventoryExportBundle(rows: InventoryExportRow[]) {
	return {
		version: INVENTORY_EXPORT_VERSION,
		exportedAt: new Date().toISOString(),
		rows
	};
}

function toTabularRows(rows: InventoryExportRow[]): TabularRow[] {
	return rows.map((r) => ({ sku: r.sku, stockQty: r.stockQty }));
}

export function toCsvFromInventoryRows(rows: InventoryExportRow[]): string {
	const tab = toTabularRows(rows);
	const ws = XLSX.utils.json_to_sheet(tab, { header: [...TABULAR_COLUMNS] });
	return XLSX.utils.sheet_to_csv(ws);
}

export function toXlsxBufferFromInventoryRows(rows: InventoryExportRow[]): Buffer {
	const tab = toTabularRows(rows);
	const ws = XLSX.utils.json_to_sheet(tab, { header: [...TABULAR_COLUMNS] });
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'inventory');
	return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

function sheetRowsFromWorkbook(wb: XLSX.WorkBook): Record<string, unknown>[] {
	const first = wb.SheetNames[0];
	if (!first) return [];
	const sheet = wb.Sheets[first];
	if (!sheet) return [];
	return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
}

export async function parseInventorySpreadsheetFromFile(file: File): Promise<Record<string, unknown>[]> {
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

export function tabularRowToInventoryRow(
	row: Record<string, unknown>
): { value?: InventoryExportRow; error?: string } {
	const candidate: InventoryExportRow = {
		sku: toText(row.sku),
		stockQty: toInt(row.stockQty)
	};
	const parsed = inventoryExportRowSchema.safeParse(candidate);
	if (!parsed.success) {
		return { error: formatZodIssues(parsed.error) || 'invalid row' };
	}
	return { value: parsed.data };
}
