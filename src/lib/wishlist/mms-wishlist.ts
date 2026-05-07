import { browser } from '$app/environment';
import type { MmsCollectionProduct } from '$lib/data/mms-collection-products';
import { derived, writable } from 'svelte/store';

const STORAGE_KEY = 'rosvelte-wishlist-v1';

export type MmsWishlistEntry = {
	productId: number;
	name: string;
	price: number;
	country: string;
	region: string;
	rating: number;
	heroImageUploadId?: number | null;
};

function loadEntries(): MmsWishlistEntry[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(row): row is MmsWishlistEntry =>
				row &&
				typeof row === 'object' &&
				typeof (row as MmsWishlistEntry).productId === 'number' &&
				typeof (row as MmsWishlistEntry).name === 'string' &&
				typeof (row as MmsWishlistEntry).price === 'number' &&
				typeof (row as MmsWishlistEntry).country === 'string' &&
				typeof (row as MmsWishlistEntry).region === 'string' &&
				typeof (row as MmsWishlistEntry).rating === 'number'
		);
	} catch {
		return [];
	}
}

export const wishlistEntries = writable<MmsWishlistEntry[]>(loadEntries());

if (browser) {
	wishlistEntries.subscribe((value) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		} catch {
			/* quota / private mode */
		}
	});
}

export const wishlistCount = derived(wishlistEntries, (e) => e.length);

export function removeWishlistProduct(productId: number): void {
	wishlistEntries.update((list) => list.filter((x) => x.productId !== productId));
}

let feedbackTimer: ReturnType<typeof setTimeout> | undefined;

/** Brief global message for add/remove confirmation (see `MmsWishlistToast`). */
export const wishlistFeedback = writable<{ message: string; tone: 'in' | 'out' } | null>(null);

function flashFeedback(action: 'in' | 'out', productName: string) {
	if (feedbackTimer !== undefined) clearTimeout(feedbackTimer);
	const message =
		action === 'in'
			? `${productName} — saved to your wishlist`
			: `${productName} — removed from your wishlist`;
	wishlistFeedback.set({ message, tone: action });
	feedbackTimer = setTimeout(() => {
		wishlistFeedback.set(null);
		feedbackTimer = undefined;
	}, 4000);
}

/**
 * Add or remove product from the persisted wishlist.
 * @returns true if the product is in the wishlist after this action
 */
export function toggleWishlistProduct(product: MmsCollectionProduct): boolean {
	let nowLoved = false;
	wishlistEntries.update((list) => {
		const i = list.findIndex((x) => x.productId === product.id);
		if (i >= 0) {
			const next = [...list];
			next.splice(i, 1);
			nowLoved = false;
			return next;
		}
		nowLoved = true;
		return [
			...list,
			{
				productId: product.id,
				name: product.name,
				price: product.price,
				country: product.country,
				region: product.region,
				rating: product.rating,
				heroImageUploadId: product.heroImageUploadId ?? null
			}
		];
	});
	flashFeedback(nowLoved ? 'in' : 'out', product.name);
	return nowLoved;
}
