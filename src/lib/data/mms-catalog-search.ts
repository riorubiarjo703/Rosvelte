/** Minimal product fields for header search autocomplete (layout payload). */
export type MmsCatalogSearchItem = {
	id: number;
	name: string;
	country: string;
	region: string;
	cat: string;
	price: number;
	desc: string;
	heroImageUploadId: number | null;
};

export function mmsCatalogSearchHaystack(p: MmsCatalogSearchItem): string {
	return `${p.name} ${p.country} ${p.region} ${p.cat} ${p.desc}`.toLocaleLowerCase();
}
