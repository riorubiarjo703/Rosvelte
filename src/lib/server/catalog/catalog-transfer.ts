import * as XLSX from 'xlsx';
import {
	catalogExportProductSchema,
	type CatalogExportProductRow
} from '$lib/superstore/schemas';
import { MAX_CATALOG_PRODUCT_IMAGES, padCatalogImageSlots } from './product-image-slots';

export const CATALOG_EXPORT_VERSION = 1 as const;

const TABULAR_COLUMNS = [
	'sku',
	'name',
	'slug',
	'country',
	'region',
	'cat',
	'age',
	'abv',
	'price',
	'rating',
	'badge',
	'desc',
	'stockQty',
	'published',
	'imageSlot1',
	'imageSlot2',
	'imageSlot3',
	'imageSlot4',
	'detailPayloadJson'
] as const;

type TabularRow = Record<(typeof TABULAR_COLUMNS)[number], string | number | boolean>;

function toText(v: unknown): string {
	return String(v ?? '').trim();
}

function toInt(v: unknown, fallback = 0): number {
	const n = Number(v);
	if (!Number.isFinite(n)) return fallback;
	return Math.trunc(n);
}

function toBool(v: unknown): boolean {
	const s = toText(v).toLowerCase();
	return s === '1' || s === 'true' || s === 'yes' || s === 'y' || s === 'on';
}

function toSlotInt(v: unknown): number | null {
	const n = Number(v);
	if (!Number.isFinite(n) || n < 1) return null;
	return Math.trunc(n);
}

function parseDetailPayload(raw: unknown): unknown | null {
	const s = toText(raw);
	if (!s) return null;
	try {
		return JSON.parse(s);
	} catch {
		return null;
	}
}

export function buildCatalogExportBundle(products: CatalogExportProductRow[]) {
	return {
		version: CATALOG_EXPORT_VERSION,
		exportedAt: new Date().toISOString(),
		products
	};
}

export function toTabularRows(products: CatalogExportProductRow[]): TabularRow[] {
	return products.map((p) => {
		const slots = padCatalogImageSlots(p.imageSlots ?? []);
		return {
			sku: p.sku,
			name: p.name,
			slug: p.slug,
			country: p.country,
			region: p.region,
			cat: p.cat,
			age: p.age,
			abv: p.abv,
			price: p.price,
			rating: p.rating,
			badge: p.badge,
			desc: p.desc,
			stockQty: p.stockQty,
			published: p.published ? 'true' : 'false',
			imageSlot1: slots[0] ?? '',
			imageSlot2: slots[1] ?? '',
			imageSlot3: slots[2] ?? '',
			imageSlot4: slots[3] ?? '',
			detailPayloadJson: p.detailPayload == null ? '' : JSON.stringify(p.detailPayload)
		};
	});
}

export function toCsvFromProducts(products: CatalogExportProductRow[]): string {
	const rows = toTabularRows(products);
	const ws = XLSX.utils.json_to_sheet(rows, { header: [...TABULAR_COLUMNS] });
	return XLSX.utils.sheet_to_csv(ws);
}

export function toXlsxBufferFromProducts(products: CatalogExportProductRow[]): Buffer {
	const rows = toTabularRows(products);
	const ws = XLSX.utils.json_to_sheet(rows, { header: [...TABULAR_COLUMNS] });
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'catalog');
	return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

function sheetRowsFromWorkbook(wb: XLSX.WorkBook): Record<string, unknown>[] {
	const first = wb.SheetNames[0];
	if (!first) return [];
	const sheet = wb.Sheets[first];
	if (!sheet) return [];
	return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
}

export async function parseSpreadsheetRowsFromFile(file: File): Promise<Record<string, unknown>[]> {
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

export function tabularRowToCatalogRow(
	row: Record<string, unknown>
): { value?: CatalogExportProductRow; error?: string } {
	const slots: (number | null)[] = [];
	for (let i = 0; i < MAX_CATALOG_PRODUCT_IMAGES; i++) {
		slots.push(toSlotInt(row[`imageSlot${i + 1}`]));
	}

	const candidate: CatalogExportProductRow = {
		sku: toText(row.sku),
		name: toText(row.name),
		slug: toText(row.slug),
		country: toText(row.country),
		region: toText(row.region),
		cat: toText(row.cat).toLowerCase() as CatalogExportProductRow['cat'],
		age: toText(row.age),
		abv: toText(row.abv),
		price: toInt(row.price),
		rating: toInt(row.rating),
		badge: toText(row.badge).toLowerCase() as CatalogExportProductRow['badge'],
		desc: toText(row.desc),
		stockQty: toInt(row.stockQty),
		published: toBool(row.published),
		detailPayload: parseDetailPayload(row.detailPayloadJson),
		imageSlots: slots
	};

	const parsed = catalogExportProductSchema.safeParse(candidate);
	if (!parsed.success) {
		const errs = parsed.error.issues
			.map((i) => `${i.path.join('.') || 'row'}: ${i.message}`)
			.join('; ');
		return { error: errs || 'invalid row' };
	}
	return { value: parsed.data };
}
