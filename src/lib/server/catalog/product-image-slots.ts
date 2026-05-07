import {
	isValidHeroImageFile,
	persistSuperstoreUploadFile
} from '$lib/server/superstore/store-upload-file';

export const MAX_CATALOG_PRODUCT_IMAGES = 4;

export function padCatalogImageSlots(slots: (number | null)[]): (number | null)[] {
	const out = slots.slice(0, MAX_CATALOG_PRODUCT_IMAGES);
	while (out.length < MAX_CATALOG_PRODUCT_IMAGES) out.push(null);
	return out;
}

/** First non-null slot in order — used as list-card / legacy hero. */
export function firstCatalogImageUploadId(slots: (number | null)[]): number | null {
	for (const u of padCatalogImageSlots(slots)) {
		if (u != null) return u;
	}
	return null;
}

/**
 * Apply per-slot clears, then new file uploads (empty file = keep existing).
 * Returns updated slots or an error message.
 */
export async function mergeCatalogImageSlotsFromForm(
	fd: FormData,
	existingSlots: (number | null)[],
	userId: string | undefined
): Promise<{ slots: (number | null)[] } | { error: string }> {
	const slots = padCatalogImageSlots([...existingSlots]);
	for (let i = 0; i < MAX_CATALOG_PRODUCT_IMAGES; i++) {
		if (fd.get(`clearProductImage${i}`) === 'on') slots[i] = null;
		const f = fd.get(`productImage${i}`);
		if (f instanceof File && f.size > 0) {
			if (!isValidHeroImageFile(f)) {
				return {
					error: `Image slot ${i + 1} must be JPEG, PNG, or WebP under the max upload size.`
				};
			}
			slots[i] = await persistSuperstoreUploadFile(f, userId);
		}
	}
	return { slots };
}
