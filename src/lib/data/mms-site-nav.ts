import { mmsCollectionProducts, type MmsCollectionCategory } from './mms-collection-products';
import { MMS_ORIGIN_TAB_ORDER, originTabLabel, type OriginKey } from './mms-origins';
import { JOURNAL_TOPIC_TAGS, type JournalCat } from './mms-journal';

const MMS_COLLECTION_CAT_VALUES: MmsCollectionCategory[] = [
	'all',
	'scotch',
	'cognac',
	'japanese',
	'tequila',
	'rum',
	'other'
];

const MMS_JOURNAL_CHANNEL_VALUES: JournalCat[] = [
	'all',
	'tasting',
	'distillery',
	'guide',
	'history',
	'pairing',
	'howto'
];

const MMS_COLLECTION_COUNTRY_PRIORITY = [
	'Scotland',
	'France',
	'Japan',
	'Mexico',
	'Ireland',
	'Caribbean',
	'Venezuela'
] as const;

/** Reads validated `?cat=` for `/collections`. */
export function mmsParseCollectionCategory(params: URLSearchParams): MmsCollectionCategory {
	const raw = params.get('cat');
	if (!raw) return 'all';
	return MMS_COLLECTION_CAT_VALUES.includes(raw as MmsCollectionCategory)
		? (raw as MmsCollectionCategory)
		: 'all';
}

/** Country filter: priority list plus any other countries present in seed products. */
export function mmsNavCollectionCountries(): string[] {
	const fromProducts = [...new Set(mmsCollectionProducts.map((p) => p.country))];
	const seen = new Set<string>();
	const ordered: string[] = [];
	for (const c of MMS_COLLECTION_COUNTRY_PRIORITY) {
		if (fromProducts.includes(c) || c === 'Ireland' || c === 'Caribbean') {
			ordered.push(c);
			seen.add(c);
		}
	}
	for (const c of fromProducts.sort((a, b) => a.localeCompare(b))) {
		if (!seen.has(c)) {
			ordered.push(c);
			seen.add(c);
		}
	}
	return ordered;
}

export const MMS_COLLECTION_COUNTRY_ALLOWLIST = new Set(mmsNavCollectionCountries());

const _regionSet = new Set(mmsCollectionProducts.map((p) => p.region));
export const MMS_COLLECTION_REGION_ALLOWLIST = _regionSet;

/** Top regions by frequency in seed data (for mega menu). */
export function mmsNavCollectionRegions(limit = 14): string[] {
	const freq = new Map<string, number>();
	for (const p of mmsCollectionProducts) {
		freq.set(p.region, (freq.get(p.region) ?? 0) + 1);
	}
	return [...freq.entries()]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.map(([r]) => r)
		.slice(0, limit);
}

export function mmsParseCollectionCountry(params: URLSearchParams): string | null {
	const v = params.get('country');
	if (!v) return null;
	return MMS_COLLECTION_COUNTRY_ALLOWLIST.has(v) ? v : null;
}

export function mmsParseCollectionRegion(params: URLSearchParams): string | null {
	const v = params.get('region');
	if (!v) return null;
	return MMS_COLLECTION_REGION_ALLOWLIST.has(v) ? v : null;
}

export function mmsBuildCollectionsUrl(
	collectionsPath: string,
	opts: { cat?: MmsCollectionCategory; country?: string | null; region?: string | null }
): string {
	const sp = new URLSearchParams();
	if (opts.cat && opts.cat !== 'all') sp.set('cat', opts.cat);
	if (opts.country) sp.set('country', opts.country);
	if (opts.region) sp.set('region', opts.region);
	const q = sp.toString();
	return q ? `${collectionsPath}?${q}` : collectionsPath;
}

/** Append `?cat=` only (legacy helper). */
export function mmsCollectionsHref(collectionsPath: string, cat: MmsCollectionCategory): string {
	return mmsBuildCollectionsUrl(collectionsPath, { cat, country: null, region: null });
}

/** Spirit-type links under Shop → Collections (matches `?cat=` on `/collections`). */
export const MMS_NAV_COLLECTION_CATS: {
	cat: Exclude<MmsCollectionCategory, 'all'>;
	label: string;
}[] = [
	{ cat: 'scotch', label: 'Scotch' },
	{ cat: 'cognac', label: 'Cognac' },
	{ cat: 'japanese', label: 'Japanese' },
	{ cat: 'tequila', label: 'Tequila' },
	{ cat: 'rum', label: 'Rum' },
	{ cat: 'other', label: 'Other' }
];

export function mmsParseOriginKey(params: URLSearchParams): OriginKey {
	const raw = params.get('origin');
	if (raw && (MMS_ORIGIN_TAB_ORDER as readonly string[]).includes(raw)) return raw as OriginKey;
	return 'scotland';
}

export function mmsOriginsHref(originsPath: string, key: OriginKey): string {
	return key === 'scotland' ? originsPath : `${originsPath}?origin=${key}`;
}

export function mmsParseJournalChannel(params: URLSearchParams): JournalCat {
	const raw = params.get('channel');
	if (!raw) return 'all';
	return MMS_JOURNAL_CHANNEL_VALUES.includes(raw as JournalCat) ? (raw as JournalCat) : 'all';
}

export function mmsParseJournalTopic(params: URLSearchParams): string | null {
	const raw = params.get('topic');
	if (!raw) return null;
	const hit = JOURNAL_TOPIC_TAGS.find((t) => t.toLowerCase() === raw.toLowerCase());
	return hit ?? null;
}

export function mmsJournalHref(
	journalPath: string,
	opts: { channel?: JournalCat; topic?: string | null }
): string {
	const sp = new URLSearchParams();
	if (opts.channel && opts.channel !== 'all') sp.set('channel', opts.channel);
	if (opts.topic) sp.set('topic', opts.topic);
	const q = sp.toString();
	return q ? `${journalPath}?${q}` : journalPath;
}
