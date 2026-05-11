import * as XLSX from 'xlsx';
import { customerExportRowSchema, type CustomerExportRow } from '$lib/superstore/schemas';
import { storefrontCustomerUser } from '$lib/server/db/customer-auth.schema';
import { formatZodIssues } from '$lib/server/format-zod-issues';

export const CUSTOMER_EXPORT_VERSION = 1 as const;

const TABULAR_COLUMNS = [
	'id',
	'name',
	'email',
	'emailVerified',
	'phone',
	'birthDate',
	'preferredLanguage',
	'spiritPreference',
	'image',
	'createdAt',
	'updatedAt'
] as const;

type TabularRow = Record<(typeof TABULAR_COLUMNS)[number], string | number | boolean>;

function toText(v: unknown): string {
	return String(v ?? '').trim();
}

function toBool(v: unknown): boolean {
	const s = toText(v).toLowerCase();
	return s === '1' || s === 'true' || s === 'yes' || s === 'y' || s === 'on';
}

export function buildCustomerExportBundle(customers: CustomerExportRow[]) {
	return {
		version: CUSTOMER_EXPORT_VERSION,
		exportedAt: new Date().toISOString(),
		customers
	};
}

export function dbCustomerToExportRow(
	row: typeof storefrontCustomerUser.$inferSelect
): CustomerExportRow {
	return {
		id: row.id,
		name: row.name,
		email: row.email,
		emailVerified: row.emailVerified,
		phone: row.phone ?? '',
		birthDate: row.birthDate ?? '',
		preferredLanguage: row.preferredLanguage ?? '',
		spiritPreference: row.spiritPreference ?? '',
		image: row.image ?? null,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString()
	};
}

export function toCsvFromCustomers(customers: CustomerExportRow[]): string {
	const rows: TabularRow[] = customers.map((c) => ({
		id: c.id ?? '',
		name: c.name,
		email: c.email,
		emailVerified: c.emailVerified ? 'true' : 'false',
		phone: c.phone ?? '',
		birthDate: c.birthDate ?? '',
		preferredLanguage: c.preferredLanguage ?? '',
		spiritPreference: c.spiritPreference ?? '',
		image: c.image ?? '',
		createdAt: c.createdAt ?? '',
		updatedAt: c.updatedAt ?? ''
	}));
	const ws = XLSX.utils.json_to_sheet(rows, { header: [...TABULAR_COLUMNS] });
	return XLSX.utils.sheet_to_csv(ws);
}

export function toXlsxBufferFromCustomers(customers: CustomerExportRow[]): Buffer {
	const rows: TabularRow[] = customers.map((c) => ({
		id: c.id ?? '',
		name: c.name,
		email: c.email,
		emailVerified: c.emailVerified ? 'true' : 'false',
		phone: c.phone ?? '',
		birthDate: c.birthDate ?? '',
		preferredLanguage: c.preferredLanguage ?? '',
		spiritPreference: c.spiritPreference ?? '',
		image: c.image ?? '',
		createdAt: c.createdAt ?? '',
		updatedAt: c.updatedAt ?? ''
	}));
	const ws = XLSX.utils.json_to_sheet(rows, { header: [...TABULAR_COLUMNS] });
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'customers');
	return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

function sheetRowsFromWorkbook(wb: XLSX.WorkBook): Record<string, unknown>[] {
	const first = wb.SheetNames[0];
	if (!first) return [];
	const sheet = wb.Sheets[first];
	if (!sheet) return [];
	return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
}

export async function parseCustomerSpreadsheetFromFile(file: File): Promise<Record<string, unknown>[]> {
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

export function tabularRowToCustomerRow(
	row: Record<string, unknown>
): { value?: CustomerExportRow; error?: string } {
	const imageRaw = toText(row.image);
	const candidate: CustomerExportRow = {
		id: toText(row.id) || undefined,
		name: toText(row.name),
		email: toText(row.email),
		emailVerified: toBool(row.emailVerified),
		phone: toText(row.phone),
		birthDate: toText(row.birthDate),
		preferredLanguage: toText(row.preferredLanguage),
		spiritPreference: toText(row.spiritPreference),
		image: imageRaw ? imageRaw : null
	};

	const parsed = customerExportRowSchema.safeParse(candidate);
	if (!parsed.success) {
		return { error: formatZodIssues(parsed.error) || 'invalid row' };
	}
	return { value: parsed.data };
}
