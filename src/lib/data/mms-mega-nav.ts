/**
 * Promo tiles for mega menus. Images use picsum.photos (seeded) for stable delivery;
 * swap for brand assets under /static when ready.
 */
export type MmsMegaPromo = {
	href: string;
	image: string;
	imageAlt: string;
	eyebrow: string;
	title: string;
	subtitle?: string;
	logoText?: string;
};

const P = 'https://picsum.photos';

export const MMS_MEGA_SHOP_PROMOS: MmsMegaPromo[] = [
	{
		href: '',
		image: `${P}/seed/mms-spirit-glass/720/900`,
		imageAlt: 'Spirits tasting',
		eyebrow: 'Curated',
		title: 'Scottish single malts',
		subtitle: 'From Speyside sherry cask depth to coastal Islay peat.',
		logoText: 'MMS'
	},
	{
		href: '',
		image: `${P}/seed/mms-cellar-shelf/720/900`,
		imageAlt: 'Cellar selection',
		eyebrow: 'Cellar release',
		title: 'The reserve edit',
		subtitle: 'Rare allocations and limited cellar picks.',
		logoText: 'MMS'
	},
	{
		href: '',
		image: `${P}/seed/mms-oak-warehouse/640/520`,
		imageAlt: 'Oak casks in warehouse',
		eyebrow: 'Journal',
		title: 'How we score every bottle',
		subtitle: 'Five-axis curator notes and flavour maps.',
		logoText: 'MMS'
	}
];

export const MMS_MEGA_ORIGINS_PROMOS: MmsMegaPromo[] = [
	{
		href: '',
		image: `${P}/seed/mms-highlands/720/900`,
		imageAlt: 'Highland landscape',
		eyebrow: 'Geography',
		title: 'Scotland & the isles',
		subtitle: 'Malts shaped by sea, peat, and time.',
		logoText: 'MMS'
	},
	{
		href: '',
		image: `${P}/seed/mms-agave/720/900`,
		imageAlt: 'Agave plants',
		eyebrow: 'Agave heartlands',
		title: 'Mexico & the Caribbean',
		subtitle: 'Tequila, rum, and cane-spirit terroir.',
		logoText: 'MMS'
	},
	{
		href: '',
		image: `${P}/seed/mms-vineyard/640/520`,
		imageAlt: 'Vineyard at dusk',
		eyebrow: 'Old world',
		title: 'France & fine brandy',
		subtitle: 'Cognac, Armagnac, and craft eaux-de-vie.',
		logoText: 'MMS'
	}
];

export const MMS_MEGA_EDITORIAL_PROMOS: MmsMegaPromo[] = [
	{
		href: '',
		image: `${P}/seed/mms-distillery/720/900`,
		imageAlt: 'Distillery interior',
		eyebrow: 'Featured',
		title: 'Inside the cellar',
		subtitle: 'Long reads from our head curators.',
		logoText: 'MMS'
	},
	{
		href: '',
		image: `${P}/seed/mms-dining/720/900`,
		imageAlt: 'Dining with spirits',
		eyebrow: 'Pairing',
		title: 'Spirits at the table',
		subtitle: 'Guides, dinners, and collector notes.',
		logoText: 'MMS'
	},
	{
		href: '',
		image: `${P}/seed/mms-library/640/520`,
		imageAlt: 'Library archive mood',
		eyebrow: 'History',
		title: 'Stories behind the label',
		subtitle: 'Archives, houses, and legends.',
		logoText: 'MMS'
	}
];
