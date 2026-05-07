import raw from './mms-tasting-spirits.json';
import type { MmsCollectionCategory } from './mms-collection-products';

export type MmsTastingScoreAxis = 'nose' | 'palate' | 'finish' | 'balance' | 'complexity';

export type MmsTastingScores = Record<MmsTastingScoreAxis, number>;

export type MmsTastingFlavourBar = { l: string; v: number };

export type MmsTastingSpirit = {
	id: number;
	name: string;
	origin: string;
	region: string;
	cat: Exclude<MmsCollectionCategory, 'all' | 'other'>;
	style: string;
	age: number;
	abv: number;
	price: number;
	badge: '' | 'rare' | 'new' | 'exc';
	scores: MmsTastingScores;
	overall: number;
	color: string;
	nose: string;
	palate: string;
	finish: string;
	verdict: string;
	author: string;
	tags: string[];
	flavours: MmsTastingFlavourBar[];
};

/** Curator tasting notes seed (from MMS_tasting_notes_page.html) */
export const mmsTastingSpirits = raw as MmsTastingSpirit[];

export type MmsTastingNotesFilter = 'all' | Exclude<MmsCollectionCategory, 'other'>;

export const MMS_TASTING_FILTER_TABS: { filter: MmsTastingNotesFilter; label: string }[] = [
	{ filter: 'all', label: 'All Spirits' },
	{ filter: 'scotch', label: 'Scotch' },
	{ filter: 'cognac', label: 'Cognac' },
	{ filter: 'japanese', label: 'Japanese' },
	{ filter: 'tequila', label: 'Tequila' },
	{ filter: 'rum', label: 'Rum' }
];

export function formatMmsIdrPrice(n: number): string {
	return `Rp ${n.toLocaleString('id-ID')}`;
}

export const MMS_TASTING_RADAR_DEMO: MmsTastingScores = {
	nose: 94,
	palate: 92,
	finish: 91,
	balance: 93,
	complexity: 93
};
