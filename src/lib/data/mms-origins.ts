import originsJson from './mms-origins.json';

export const MMS_ORIGIN_TAB_ORDER = [
	'scotland',
	'france',
	'japan',
	'mexico',
	'ireland',
	'caribbean',
	'usa'
] as const;

export type OriginKey = (typeof MMS_ORIGIN_TAB_ORDER)[number];

export interface OriginMeta {
	v: string;
	l: string;
}

export interface OriginRegion {
	num: string;
	name: string;
	type: string;
	desc: string;
	meta: OriginMeta[];
}

export interface OriginBrand {
	init: string;
	name: string;
	origin: string;
	type: string;
	products: string;
}

export interface OriginFlavour {
	l: string;
	v: number;
}

export interface OriginDistRow {
	l: string;
	v: string;
}

export interface OriginTimeline {
	year: string;
	event: string;
	desc: string;
}

export interface OriginData {
	flag: string;
	title: string;
	titleEm: string;
	desc: string;
	tags: string[];
	bgColor: string;
	bgPattern: string;
	regions: OriginRegion[];
	brands: OriginBrand[];
	flavours: OriginFlavour[];
	distInfo: OriginDistRow[];
	timeline: OriginTimeline[];
}

export const mmsOrigins = originsJson as Record<OriginKey, OriginData>;

/** Map SVG pin → origin tab (Venezuela grouped with Caribbean for MMS rum). */
export const MMS_ORIGIN_MAP_PINS: {
	key: OriginKey;
	country: string;
	spirit: string;
	labels: string;
	x: number;
	y: number;
	pulseDelay?: string;
	outerR: number;
	innerR: number;
}[] = [
	{ key: 'scotland', country: 'Scotland', spirit: 'Scotch Whisky', labels: '14 expressions', x: 410, y: 72, outerR: 10, innerR: 5 },
	{
		key: 'france',
		country: 'France',
		spirit: 'Cognac & Armagnac',
		labels: '9 expressions',
		x: 420,
		y: 95,
		pulseDelay: '0.5s',
		outerR: 9,
		innerR: 5
	},
	{
		key: 'ireland',
		country: 'Ireland',
		spirit: 'Irish Whiskey',
		labels: '5 expressions',
		x: 400,
		y: 85,
		pulseDelay: '1s',
		outerR: 7,
		innerR: 4
	},
	{
		key: 'japan',
		country: 'Japan',
		spirit: 'Japanese Whisky',
		labels: '8 expressions',
		x: 706,
		y: 92,
		pulseDelay: '0.8s',
		outerR: 9,
		innerR: 5
	},
	{
		key: 'mexico',
		country: 'Mexico',
		spirit: 'Tequila & Mezcal',
		labels: '7 expressions',
		x: 130,
		y: 185,
		pulseDelay: '1.2s',
		outerR: 9,
		innerR: 5
	},
	{
		key: 'caribbean',
		country: 'Caribbean',
		spirit: 'Rum',
		labels: '5 expressions',
		x: 178,
		y: 205,
		pulseDelay: '0.3s',
		outerR: 7,
		innerR: 4
	},
	{
		key: 'caribbean',
		country: 'Venezuela',
		spirit: 'Rum',
		labels: '3 expressions',
		x: 200,
		y: 270,
		pulseDelay: '0.7s',
		outerR: 6,
		innerR: 4
	},
	{
		key: 'usa',
		country: 'USA',
		spirit: 'Bourbon Whiskey',
		labels: '4 expressions',
		x: 160,
		y: 155,
		pulseDelay: '1.5s',
		outerR: 7,
		innerR: 4
	}
];

export function originTabLabel(key: OriginKey): string {
	return key.charAt(0).toUpperCase() + key.slice(1);
}
