import type { MmsCollectionProduct } from './mms-collection-products';
import { mmsCollectionProducts } from './mms-collection-products';

export type MmsBottleViewId = 'front' | 'label' | 'gift' | 'poured';

export type MmsProductProcessStep = { title: string; desc: string };

export type MmsProductReviewCard = {
	name: string;
	date: string;
	rating: number;
	title: string;
	body: string;
};

export type MmsProductDetailModel = {
	product: MmsCollectionProduct;
	/** Large word behind bottle art */
	watermark: string;
	subtitle: string;
	distilleryLine: string;
	caskTypeShort: string;
	volumeDefault: string;
	reviewCount: number;
	mmsScore: number;
	curator: { name: string; role: string; initials: string };
	about: {
		title: string;
		paragraphs: string[];
		steps: MmsProductProcessStep[];
	};
	tasting: {
		colour: string;
		nose: string;
		palate: string;
		finish: string;
		verdict: string;
		flavours: { label: string; value: number }[];
		radar: { label: string; value: number }[];
	};
	specs: { section: string; rows: { k: string; v: string }[] }[];
	reviews: {
		avg: number;
		total: number;
		bars: { star: number; widthPct: number; count: number }[];
		cards: MmsProductReviewCard[];
	};
};

/** Persisted JSON shape (everything except `product`, merged at runtime). */
export type MmsProductDetailPayload = Omit<MmsProductDetailModel, 'product'>;

/** Reference detail payload for Macallan 18 Sherry (pair with product row). */
export function mmsMacallan18DetailPayload(): MmsProductDetailPayload {
	return {
		watermark: 'MACALLAN',
		subtitle: 'Sherry Oak Cask · Single Malt Scotch Whisky · 43% ABV',
		distilleryLine: 'Craigellachie',
		caskTypeShort: 'Sherry',
		volumeDefault: '700ml',
		reviewCount: 128,
		mmsScore: 96,
		curator: { name: 'James Whitfield', role: 'Head Curator', initials: 'JW' },
		about: {
			title: 'The Art of Sherry Oak Maturation',
			paragraphs: [
				'The Macallan 18 Year Old Sherry Oak is one of the most celebrated expressions in the world of Single Malt Scotch Whisky. Matured exclusively in hand-picked sherry seasoned oak casks from Jerez, Spain, it represents the pinnacle of The Macallan’s commitment to natural colour and exceptional flavour.',
				'Every cask used in the production of the 18 Year Old is selected by The Macallan’s master whisky maker and seasoned with Oloroso sherry for between 18 and 24 months before being filled with new make spirit.',
				'The result is a whisky of extraordinary depth, complexity, and elegance — one that has remained unchanged in character for decades, while simultaneously evolving in each annual release.'
			],
			steps: [
				{
					title: 'Cask Selection',
					desc: 'Each cask is hand-chosen from the bodegas of Jerez, Spain — seasoned for 18–24 months with Oloroso sherry before the spirit ever touches wood.'
				},
				{
					title: 'Distillation',
					desc: 'The Macallan uses the smallest stills in Speyside, concentrating flavour and producing a rich, full-bodied new make spirit with natural character.'
				},
				{
					title: '18 Years of Maturation',
					desc: 'Aged in the cool, dark Macallan warehouses for a minimum of 18 years. Each year adds layers of dried fruit, spice, and tannin from the sherry oak.'
				},
				{
					title: 'Natural Colour, No Chill-Filtration',
					desc: 'Bottled with its natural colour — never caramel coloured — and without chill-filtration, preserving every molecule of flavour.'
				}
			]
		},
		tasting: {
			colour:
				'Deep mahogany with burnished copper highlights — the unmistakable hue of long sherry oak maturation.',
			nose: 'Rich dried fruit — Medjool dates, dark raisin, and candied orange peel. Beneath it, warm cinnamon, dark chocolate, and the deep, ancient smell of sherry-seasoned wood.',
			palate:
				'Full-bodied and sumptuously smooth. The sherry influence is profound but never overpowering — Christmas cake, stem ginger, espresso cream, and a wave of vanilla that rises mid-palate and refuses to fade.',
			finish:
				'Exceptionally long. Dried fruit, warming oak tannin, and a whisper of dark chocolate persist for several minutes.',
			verdict:
				'The Macallan 18 Sherry Oak is the benchmark against which all sherry-matured Scotch is measured. A 96/100 is not given lightly — this one earns every point.',
			flavours: [
				{ label: 'Sherry', value: 92 },
				{ label: 'Oak', value: 78 },
				{ label: 'Fruit', value: 88 },
				{ label: 'Spice', value: 72 },
				{ label: 'Smoke', value: 22 }
			],
			radar: [
				{ label: 'Richness', value: 0.92 },
				{ label: 'Complexity', value: 0.9 },
				{ label: 'Balance', value: 0.88 },
				{ label: 'Length', value: 0.95 },
				{ label: 'Elegance', value: 0.85 },
				{ label: 'Intensity', value: 0.78 }
			]
		},
		specs: [
			{
				section: 'Spirit Information',
				rows: [
					{ k: 'Distillery', v: 'The Macallan Distillery' },
					{ k: 'Region', v: 'Speyside, Scotland' },
					{ k: 'Spirit Type', v: 'Single Malt Scotch Whisky' },
					{ k: 'Age Statement', v: '18 Years Old' },
					{ k: 'Vintage', v: '2019 Expression' },
					{ k: 'ABV', v: '43% Vol.' },
					{ k: 'Volume', v: '700ml' },
					{ k: 'Colour', v: 'Natural — no artificial colouring' }
				]
			},
			{
				section: 'Cask & Maturation',
				rows: [
					{ k: 'Cask Type', v: 'Sherry Seasoned European Oak (Oloroso)' },
					{ k: 'Cask Origin', v: 'Jerez de la Frontera, Spain' },
					{ k: 'Sherry Seasoning', v: '18–24 months prior to spirit fill' },
					{ k: 'Warehouse Style', v: 'Traditional dunnage' },
					{ k: 'Chill-Filtration', v: 'Non chill-filtered' }
				]
			},
			{
				section: 'Grain & Production',
				rows: [
					{ k: 'Grain', v: '100% Scottish malted barley' },
					{ k: 'Still Type', v: 'Copper pot still — smallest in Speyside' },
					{ k: 'Distillations', v: 'Double distilled' },
					{ k: 'Water Source', v: 'Ringorm Burn, Easter Elchies Estate' }
				]
			},
			{
				section: 'Packaging',
				rows: [
					{ k: 'Presentation', v: 'Gift box — dark lacquered with gold foiling' },
					{ k: 'Bottle Design', v: 'Signature Macallan flask shape' },
					{ k: 'Country of Origin', v: 'Scotland, United Kingdom' },
					{ k: 'MMS SKU', v: 'MMS-SCT-MC18-2019-700' }
				]
			}
		],
		reviews: {
			avg: 4.9,
			total: 128,
			bars: [
				{ star: 5, widthPct: 88, count: 113 },
				{ star: 4, widthPct: 9, count: 11 },
				{ star: 3, widthPct: 2, count: 3 },
				{ star: 2, widthPct: 1, count: 1 },
				{ star: 1, widthPct: 0, count: 0 }
			],
			cards: [
				{
					name: 'Marcus T.',
					date: 'Nov 2025',
					rating: 5,
					title: 'Worth every rupiah',
					body: 'Silky sherry depth without being cloying. I’ve had older Macallan releases and this 18 holds its own. Arrived perfectly packed.'
				},
				{
					name: 'Elena V.',
					date: 'Oct 2025',
					rating: 5,
					title: 'Benchmark sherried malt',
					body: 'The finish goes on forever. MMS packaging and authenticity checks gave me confidence — first time buying here, not the last.'
				},
				{
					name: 'David L.',
					date: 'Sep 2025',
					rating: 4,
					title: 'Exceptional, slight batch variance',
					body: 'Compared to a bottle from two years ago, a touch more oak forward. Still an outstanding dram. Curator notes matched what I tasted.'
				},
				{
					name: 'A. Rahman',
					date: 'Aug 2025',
					rating: 5,
					title: 'Gift for my father',
					body: 'Presented in original box as promised. He opened it for Eid — the room went quiet. Thank you for the fast concierge reply.'
				}
			]
		}
	};
}

/** Full reference content (Macallan 18 Sherry — id 6). */
function detailMacallan18(p: MmsCollectionProduct): MmsProductDetailModel {
	return { product: p, ...mmsMacallan18DetailPayload() };
}

/** Auto-generated rich detail when no JSON is stored (e.g. new admin products). */
export function mmsFallbackDetailPayload(p: MmsCollectionProduct): MmsProductDetailPayload {
	const wm = p.name
		.split(/\s+/)
		.slice(0, 2)
		.join(' ')
		.toUpperCase()
		.slice(0, 14);
	const reviewCount = 24 + (p.id % 40);
	const avg = Math.min(5, 3.8 + p.rating / 100);
	const mmsScore = p.rating;
	return {
		watermark: wm,
		subtitle: `${p.region} · ${p.cat === 'cognac' ? 'Cognac' : p.cat === 'scotch' ? 'Single Malt' : 'Spirits'} · ${p.abv}% ABV`,
		distilleryLine: p.region,
		caskTypeShort: p.cat === 'scotch' ? 'Oak' : p.cat === 'cognac' ? 'French Oak' : 'Barrel',
		volumeDefault: '700ml',
		reviewCount,
		mmsScore,
		curator: { name: 'James Whitfield', role: 'Head Curator', initials: 'JW' },
		about: {
			title: `The craft behind ${p.name}`,
			paragraphs: [
				p.desc,
				`Sourced with MMS provenance standards from ${p.country}. Each release is tasted blind by our panel before it reaches the collection.`,
				'Production details vary by distillery; see Specifications for the full breakdown supplied by the producer and verified by our team.'
			],
			steps: [
				{
					title: 'Cask selection',
					desc: 'Wood is chosen to complement the spirit character — European and American oak, ex-wine and ex-spirits casks where specified.'
				},
				{
					title: 'Distillation',
					desc: 'Traditional copper stills and time-honoured cuts preserve the house style of the distillery.'
				},
				{
					title: 'Maturation',
					desc: `Aged ${p.age === 'NAS' ? 'to profile' : `${p.age === 'XO' || p.age === 'XO+' ? p.age : p.age + ' years'}`} under controlled warehouse conditions.`
				},
				{
					title: 'Bottling',
					desc: 'Bottled at the stated strength with original packaging when supplied by the distillery.'
				}
			]
		},
		tasting: {
			colour: 'Deep amber with golden rim — natural colour where stated by the producer.',
			nose: `Lifted aromatics echo ${p.region}: orchard fruit, warm spice, and subtle oak integration.`,
			palate: `Textured and balanced. Core notes align with the house style — see curator score ${mmsScore}/100 for overall balance.`,
			finish: 'Medium-long to long, with oak and fruit in gentle tension.',
			verdict: `${p.name} delivers a compelling pour at this price tier. Our panel scores it ${mmsScore}/100 for complexity, balance, and value within its category.`,
			flavours: [
				{ label: 'Fruit', value: 55 + (p.rating % 30) },
				{ label: 'Oak', value: 50 + (p.id % 35) },
				{ label: 'Spice', value: 45 + (p.rating % 25) },
				{ label: 'Sweet', value: 48 + (p.id % 28) },
				{ label: 'Smoke', value: p.cat === 'scotch' && p.region === 'Islay' ? 72 : 20 + (p.id % 20) }
			],
			radar: [
				{ label: 'Richness', value: 0.65 + (p.rating % 20) / 100 },
				{ label: 'Complexity', value: 0.62 + (p.id % 25) / 100 },
				{ label: 'Balance', value: 0.7 + (p.rating % 15) / 100 },
				{ label: 'Length', value: 0.58 + (p.id % 30) / 100 },
				{ label: 'Elegance', value: 0.68 + (p.rating % 18) / 100 },
				{ label: 'Intensity', value: 0.55 + (p.id % 35) / 100 }
			]
		},
		specs: [
			{
				section: 'Spirit Information',
				rows: [
					{ k: 'Brand / Expression', v: p.name },
					{ k: 'Region', v: `${p.region}, ${p.country}` },
					{ k: 'Category', v: p.cat },
					{ k: 'Age', v: p.age },
					{ k: 'ABV', v: `${p.abv}%` },
					{ k: 'MMS Score', v: `${mmsScore} / 100` }
				]
			},
			{
				section: 'Cask & Maturation',
				rows: [
					{ k: 'Cask type', v: 'As specified by producer — see producer sheet' },
					{ k: 'Maturation', v: p.age === 'NAS' ? 'No age statement' : `Minimum ${p.age}` }
				]
			},
			{
				section: 'Packaging',
				rows: [
					{ k: 'Volume', v: '700ml (unless variant selected)' },
					{ k: 'Presentation', v: 'Original distillery packaging when available' },
					{ k: 'MMS SKU', v: `MMS-${p.cat.toUpperCase().slice(0, 3)}-${p.id}-700` }
				]
			}
		],
		reviews: {
			avg: Math.round(avg * 10) / 10,
			total: reviewCount,
			bars: [
				{ star: 5, widthPct: 72, count: Math.round(reviewCount * 0.72) },
				{ star: 4, widthPct: 18, count: Math.round(reviewCount * 0.18) },
				{ star: 3, widthPct: 6, count: Math.round(reviewCount * 0.06) },
				{ star: 2, widthPct: 3, count: Math.max(1, Math.round(reviewCount * 0.03)) },
				{ star: 1, widthPct: 1, count: Math.max(0, reviewCount - 50) }
			],
			cards: [
				{
					name: 'Verified buyer',
					date: '2025',
					rating: 5,
					title: 'Excellent bottle',
					body: `${p.name} matched the tasting notes. Smooth transaction and authentic packaging.`
				},
				{
					name: 'Collector_07',
					date: '2025',
					rating: 5,
					title: 'As described',
					body: 'MMS curator score aligned with my expectations. Will shop again.'
				},
				{
					name: 'Siti M.',
					date: '2024',
					rating: 4,
					title: 'Very good',
					body: 'Minor shipping delay but bottle condition perfect.'
				},
				{
					name: 'Hans K.',
					date: '2024',
					rating: 5,
					title: 'Top tier',
					body: 'Provenance documentation was clear. Recommended for serious buyers.'
				}
			]
		}
	};
}

function fallbackDetail(p: MmsCollectionProduct): MmsProductDetailModel {
	return { product: p, ...mmsFallbackDetailPayload(p) };
}

export function mmsBuildProductDetailModel(
	p: MmsCollectionProduct,
	storedDetail?: MmsProductDetailPayload | null
): MmsProductDetailModel {
	if (storedDetail) return { product: p, ...storedDetail };
	if (p.id === 6) return detailMacallan18(p);
	return fallbackDetail(p);
}

export function mmsRelatedProducts(
	current: MmsCollectionProduct,
	limit = 4,
	catalog: MmsCollectionProduct[] = mmsCollectionProducts
): MmsCollectionProduct[] {
	const same = catalog.filter((x) => x.id !== current.id && x.cat === current.cat);
	if (same.length >= limit) return same.slice(0, limit);
	const rest = catalog.filter((x) => x.id !== current.id && !same.some((s) => s.id === x.id));
	return [...same, ...rest].slice(0, limit);
}
