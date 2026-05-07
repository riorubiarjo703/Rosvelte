import journalJson from './mms-journal.json';

export type JournalCat =
	| 'all'
	| 'tasting'
	| 'distillery'
	| 'guide'
	| 'history'
	| 'pairing'
	| 'howto';

export type JournalArticleCat = Exclude<JournalCat, 'all'>;

export interface JournalArticle {
	id: number;
	cat: JournalArticleCat;
	catLabel: string;
	title: string;
	excerpt: string;
	author: string;
	initials: string;
	date: string;
	read: string;
	tags: string[];
	wide?: boolean;
	featured?: boolean;
}

export interface JournalFeatured {
	catLabel: string;
	title: string;
	excerpt: string;
	author: string;
	initials: string;
	date: string;
	read: string;
	cat: JournalArticleCat;
}

export interface JournalPopular {
	title: string;
	cat: string;
	date: string;
}

export interface JournalEditorsPick {
	label: string;
	title: string;
	meta: string;
}

export const mmsJournal = journalJson as {
	featured: JournalFeatured;
	articles: JournalArticle[];
	popular: JournalPopular[];
	editorsPicks: JournalEditorsPick[];
};

export const JOURNAL_CATEGORY_TABS: { id: JournalCat; label: string }[] = [
	{ id: 'all', label: 'All Articles' },
	{ id: 'tasting', label: 'Tasting Notes' },
	{ id: 'distillery', label: 'Distillery Visits' },
	{ id: 'guide', label: "Collector's Guide" },
	{ id: 'history', label: 'Spirit History' },
	{ id: 'pairing', label: 'Pairing & Food' },
	{ id: 'howto', label: "How It's Made" }
];

export const JOURNAL_MARQUEE_ITEMS = [
	'Tasting Notes',
	'Distillery Visits',
	"Collector's Guide",
	'Pairing & Food',
	'Spirit History',
	"How It's Made",
	'Rare Finds'
] as const;

export const JOURNAL_TOPIC_TAGS = [
	'Scotch',
	'Cognac',
	'Japanese',
	'Tequila',
	'Rum',
	'Bourbon',
	'Islay',
	'Speyside',
	'Aged Spirits',
	'Rare Finds',
	'Pairing',
	'Investing',
	'History',
	'Cocktails'
] as const;

export function journalBgForCat(cat: string): string {
	const m: Record<string, string> = {
		tasting: '#1A1035',
		distillery: '#0D1F35',
		guide: '#1A1008',
		history: '#0D1A10',
		pairing: '#1A0F08',
		howto: '#0E0E14'
	};
	return m[cat] ?? '#1A1713';
}

/** Matches reference HTML title emphasis for the featured Macallan piece. */
export function formatFeaturedTitle(title: string): { before: string; em: string; after: string } | null {
	const prefix = 'Inside the Macallan 30:';
	if (!title.startsWith(prefix)) return null;
	return {
		before: 'Inside the ',
		em: 'Macallan 30:',
		after: title.slice(prefix.length)
	};
}
