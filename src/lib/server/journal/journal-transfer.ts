import * as XLSX from 'xlsx';
import { journalExportPostSchema, type JournalExportPostRow } from '$lib/superstore/schemas';
import type { JournalRow } from '$lib/server/journal/repo';
import { formatZodIssues } from '$lib/server/format-zod-issues';

export const JOURNAL_EXPORT_VERSION = 1 as const;

const TABULAR_COLUMNS = [
	'legacyArticleId',
	'slug',
	'title',
	'cat',
	'catLabel',
	'author',
	'excerpt',
	'adminDateDisplay',
	'readTime',
	'tagsJson',
	'featured',
	'wide',
	'viewsCount',
	'status',
	'publishedAtIso'
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

function parseTagsJson(raw: unknown): string[] {
	const s = toText(raw);
	if (!s) return [];
	try {
		const j = JSON.parse(s) as unknown;
		if (Array.isArray(j)) return j.map((x) => String(x).trim()).filter(Boolean);
	} catch {
		/* fall through */
	}
	return s
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean);
}

export function buildJournalExportBundle(posts: JournalExportPostRow[]) {
	return {
		version: JOURNAL_EXPORT_VERSION,
		exportedAt: new Date().toISOString(),
		posts
	};
}

export function journalRowToExportPost(r: JournalRow): JournalExportPostRow {
	const tags = Array.isArray(r.tags) ? r.tags : [];
	return {
		legacyArticleId: r.legacyArticleId,
		slug: r.slug,
		title: r.title,
		cat: r.cat as JournalExportPostRow['cat'],
		catLabel: r.catLabel,
		author: r.author,
		excerpt: r.excerpt,
		adminDateDisplay: r.adminDateDisplay,
		readTime: r.readTime,
		tags,
		featured: r.featured,
		wide: r.wide,
		viewsCount: r.viewsCount,
		status: r.status as JournalExportPostRow['status'],
		publishedAtIso: r.publishedAt ? r.publishedAt.toISOString() : ''
	};
}

function toTabularRows(posts: JournalExportPostRow[]): TabularRow[] {
	return posts.map((p) => ({
		legacyArticleId: p.legacyArticleId,
		slug: p.slug,
		title: p.title,
		cat: p.cat,
		catLabel: p.catLabel,
		author: p.author,
		excerpt: p.excerpt,
		adminDateDisplay: p.adminDateDisplay,
		readTime: p.readTime,
		tagsJson: JSON.stringify(p.tags),
		featured: p.featured ? 'true' : 'false',
		wide: p.wide ? 'true' : 'false',
		viewsCount: p.viewsCount,
		status: p.status,
		publishedAtIso: p.publishedAtIso || ''
	}));
}

export function toCsvFromJournalPosts(posts: JournalExportPostRow[]): string {
	const rows = toTabularRows(posts);
	const ws = XLSX.utils.json_to_sheet(rows, { header: [...TABULAR_COLUMNS] });
	return XLSX.utils.sheet_to_csv(ws);
}

export function toXlsxBufferFromJournalPosts(posts: JournalExportPostRow[]): Buffer {
	const rows = toTabularRows(posts);
	const ws = XLSX.utils.json_to_sheet(rows, { header: [...TABULAR_COLUMNS] });
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'journal');
	return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

function sheetRowsFromWorkbook(wb: XLSX.WorkBook): Record<string, unknown>[] {
	const first = wb.SheetNames[0];
	if (!first) return [];
	const sheet = wb.Sheets[first];
	if (!sheet) return [];
	return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
}

export async function parseJournalSpreadsheetFromFile(file: File): Promise<Record<string, unknown>[]> {
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

export function tabularRowToJournalPost(
	row: Record<string, unknown>
): { value?: JournalExportPostRow; error?: string } {
	const tags = parseTagsJson(row.tagsJson);
	const candidate: JournalExportPostRow = {
		legacyArticleId: toInt(row.legacyArticleId),
		slug: toText(row.slug),
		title: toText(row.title),
		cat: toText(row.cat).toLowerCase() as JournalExportPostRow['cat'],
		catLabel: toText(row.catLabel),
		author: toText(row.author),
		excerpt: toText(row.excerpt),
		adminDateDisplay: toText(row.adminDateDisplay),
		readTime: toText(row.readTime),
		tags,
		featured: toBool(row.featured),
		wide: toBool(row.wide),
		viewsCount: toInt(row.viewsCount),
		status: toText(row.status).toLowerCase() as JournalExportPostRow['status'],
		publishedAtIso: toText(row.publishedAtIso)
	};

	const parsed = journalExportPostSchema.safeParse(candidate);
	if (!parsed.success) {
		return { error: formatZodIssues(parsed.error) || 'invalid row' };
	}
	return { value: parsed.data };
}
