/** Journal helpers shared by repo + seed (no DB import). */

function slugifyJournal(input: string): string {
	const s = input
		.toLowerCase()
		.trim()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 120);
	return s || 'post';
}

export function formatJournalViews(n: number): string {
	if (n <= 0) return '—';
	if (n < 1000) return String(n);
	const k = n / 1000;
	const s = k >= 10 ? String(Math.round(k)) : k.toFixed(1).replace(/\.0$/, '');
	return `${s}k`;
}

/** Deterministic plausible view counts for seeded content (no analytics yet). */
export function seededViewsFromArticleId(id: number): number {
	return 800 + ((id * 7919) % 9200);
}

export function slugForJournalArticle(title: string, legacyArticleId: number): string {
	return `${slugifyJournal(title)}-${legacyArticleId}`;
}

/** Parse `DD Mon YYYY`-style lines used in `mms-journal.json` into a Date. */
export function parseJournalDisplayDate(display: string): Date | null {
	const trimmed = display.trim();
	const m = trimmed.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/);
	if (m) {
		const [, day, mon, year] = m;
		const t = Date.parse(`${mon} ${day}, ${year}`);
		return Number.isNaN(t) ? null : new Date(t);
	}
	const t = Date.parse(trimmed);
	return Number.isNaN(t) ? null : new Date(t);
}

export function authorInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '?';
	if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
	return `${parts[0]![0]!}${parts.at(-1)![0]!}`.toUpperCase();
}

export function tagsFromCommaList(raw: string | undefined): string[] {
	if (raw == null || raw.trim() === '') return [];
	return raw
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean)
		.slice(0, 40);
}
