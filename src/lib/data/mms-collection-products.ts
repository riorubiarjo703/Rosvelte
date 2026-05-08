export type MmsCollectionCategory =
	| 'all'
	| 'scotch'
	| 'cognac'
	| 'japanese'
	| 'tequila'
	| 'rum'
	| 'other';

export type MmsProductBadge = '' | 'rare' | 'new' | 'limited' | 'exclusive';

export type MmsCollectionProduct = {
	id: number;
	name: string;
	country: string;
	region: string;
	cat: Exclude<MmsCollectionCategory, 'all'>;
	age: string;
	abv: string;
	price: number;
	rating: number;
	badge: MmsProductBadge;
	desc: string;
	/** Available units for sale; `0` means out of stock. Undefined keeps legacy seed behavior. */
	stockQty?: number;
	/** When set, storefront uses `/catalog/image/{id}` (published products only). Synced to first gallery slot for DB-backed products. */
	heroImageUploadId?: number | null;
	/** Ordered public gallery upload ids (DB-backed PDP); omit for static seed products. */
	imageUploadIds?: number[];
};

/** Seed data from MMS_collections_page.html */
export const mmsCollectionProducts: MmsCollectionProduct[] = [
	{
		id: 1,
		name: 'Glenfarclas 25',
		country: 'Scotland',
		region: 'Speyside',
		cat: 'scotch',
		age: '25',
		abv: '43',
		price: 4_200_000,
		rating: 95,
		badge: 'rare',
		desc: 'Rich sherry-cask matured Speyside, with dried fruit, dark chocolate and warming oak.'
	},
	{
		id: 2,
		name: 'Laphroaig 18',
		country: 'Scotland',
		region: 'Islay',
		cat: 'scotch',
		age: '18',
		abv: '48',
		price: 2_900_000,
		rating: 93,
		badge: '',
		desc: 'Intensely peated with iodine, seaweed and a long smoky finish characteristic of Islay.'
	},
	{
		id: 3,
		name: 'Rémy Martin XO',
		country: 'France',
		region: 'Grande Champagne',
		cat: 'cognac',
		age: 'XO',
		abv: '40',
		price: 3_600_000,
		rating: 94,
		badge: 'exclusive',
		desc: 'A blend of over 400 eaux-de-vie, offering jasmine, fig and a velvety, opulent finish.'
	},
	{
		id: 4,
		name: 'Yamazaki 12',
		country: 'Japan',
		region: 'Osaka',
		cat: 'japanese',
		age: '12',
		abv: '43',
		price: 2_200_000,
		rating: 91,
		badge: '',
		desc: 'Delicate with tropical fruits, mizunara oak spice and a clean, elegant finish.'
	},
	{
		id: 5,
		name: 'Don Julio 1942',
		country: 'Mexico',
		region: 'Jalisco',
		cat: 'tequila',
		age: 'NAS',
		abv: '38',
		price: 1_800_000,
		rating: 90,
		badge: 'new',
		desc: 'Añejo aged over two years, with rich caramel, vanilla and warm oak from American barrels.'
	},
	{
		id: 6,
		name: 'Macallan 18 Sherry',
		country: 'Scotland',
		region: 'Speyside',
		cat: 'scotch',
		age: '18',
		abv: '43',
		price: 5_800_000,
		rating: 97,
		badge: 'rare',
		desc: 'The definitive sherry oak expression. Dried fruits, ginger, orange peel and rich Christmas cake.'
	},
	{
		id: 7,
		name: 'Armagnac Tariquet XO',
		country: 'France',
		region: 'Gascony',
		cat: 'cognac',
		age: 'XO',
		abv: '40',
		price: 1_600_000,
		rating: 88,
		badge: '',
		desc: 'Rustic and characterful, with prune, walnut and a long, warming Gascon finish.'
	},
	{
		id: 8,
		name: 'Nikka From the Barrel',
		country: 'Japan',
		region: 'Hokkaido',
		cat: 'japanese',
		age: 'NAS',
		abv: '51.4',
		price: 950_000,
		rating: 92,
		badge: 'new',
		desc: 'A bold, high-strength blend of malt and grain whisky. Honey, cocoa and a powerful finish.'
	},
	{
		id: 9,
		name: 'El Silencio Espadin',
		country: 'Mexico',
		region: 'Oaxaca',
		cat: 'tequila',
		age: 'NAS',
		abv: '40',
		price: 680_000,
		rating: 85,
		badge: '',
		desc: 'Artisanal mezcal with a clean smoke, green herbs and a citrus-forward finish.'
	},
	{
		id: 10,
		name: 'Diplomatico Reserva',
		country: 'Venezuela',
		region: 'Andes',
		cat: 'rum',
		age: '12',
		abv: '40',
		price: 850_000,
		rating: 89,
		badge: '',
		desc: 'Pot still rum aged in American whiskey barrels. Vanilla, toffee and tropical sweetness.'
	},
	{
		id: 11,
		name: 'Bruichladdich Classic',
		country: 'Scotland',
		region: 'Islay',
		cat: 'scotch',
		age: 'NAS',
		abv: '50',
		price: 1_200_000,
		rating: 88,
		badge: '',
		desc: 'Unpeated and terroir-driven, expressing the pure character of Islay barley and Atlantic air.'
	},
	{
		id: 12,
		name: 'Hennessy Paradis',
		country: 'France',
		region: 'Cognac',
		cat: 'cognac',
		age: 'XO+',
		abv: '40',
		price: 12_500_000,
		rating: 98,
		badge: 'exclusive',
		desc: 'Among the rarest Hennessy expressions. Jasmine, rose and sandalwood in extraordinary harmony.'
	}
];

export function mmsGetProductById(id: number): MmsCollectionProduct | undefined {
	return mmsCollectionProducts.find((p) => p.id === id);
}
