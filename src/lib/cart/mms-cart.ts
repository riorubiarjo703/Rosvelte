import { browser } from '$app/environment';
import { catalogHeroImagePublicPath } from '$lib/catalog/hero-image-path';
import type { MmsCollectionProduct } from '$lib/data/mms-collection-products';
import type { Pathname } from '$app/types';
import { resolvedLocalizedHref } from '$lib/paraglide-resolved-href';
import { derived, writable } from 'svelte/store';

const STORAGE_KEY = 'rosvelte-cart-v1';

export type MmsCartLine = {
	productId: number;
	qty: number;
	name: string;
	price: number;
	country: string;
	region: string;
	/** Cover image for bag UI; matches `catalog_product.hero_image_upload_id` when added from storefront. */
	heroImageUploadId?: number | null;
	/** Snapshot of storefront stock when line was added/synced; `0` means out of stock. */
	stockQty?: number;
};

function loadLines(): MmsCartLine[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(row): row is MmsCartLine =>
				row &&
				typeof row === 'object' &&
				typeof (row as MmsCartLine).productId === 'number' &&
				typeof (row as MmsCartLine).qty === 'number' &&
				typeof (row as MmsCartLine).name === 'string' &&
				typeof (row as MmsCartLine).price === 'number' &&
				typeof (row as MmsCartLine).country === 'string' &&
				typeof (row as MmsCartLine).region === 'string' &&
				((row as MmsCartLine).stockQty === undefined ||
					(typeof (row as MmsCartLine).stockQty === 'number' &&
						Number.isFinite((row as MmsCartLine).stockQty)))
		);
	} catch {
		return [];
	}
}

export const cartLines = writable<MmsCartLine[]>(loadLines());

if (browser) {
	cartLines.subscribe((value) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
	});
}

export const cartItemCount = derived(cartLines, (lines) =>
	lines.reduce((sum, line) => sum + line.qty, 0)
);

export const cartSubtotal = derived(cartLines, (lines) =>
	lines.reduce((sum, line) => sum + line.price * line.qty, 0)
);

export function formatIdr(amount: number): string {
	return `Rp ${amount.toLocaleString('id-ID')}`;
}

/** Resolved storefront URL for cart thumbnails (published catalogue images only). */
export function cartLineHeroImageHref(line: MmsCartLine): string | null {
	return resolveCartLineHeroImageHref(line, null);
}

/**
 * Uses `line.heroImageUploadId`, or falls back to layout `catalogHeroImages` (covers older bag rows in localStorage).
 */
export function resolveCartLineHeroImageHref(
	line: MmsCartLine,
	catalogHeroImages: Record<string, number | null> | null | undefined
): string | null {
	const fromLine = line.heroImageUploadId;
	const fromCatalog = catalogHeroImages?.[String(line.productId)];
	const uploadId =
		fromLine != null && Number.isFinite(fromLine) && fromLine > 0
			? fromLine
			: fromCatalog != null && Number.isFinite(fromCatalog) && fromCatalog > 0
				? fromCatalog
				: null;
	const rel = catalogHeroImagePublicPath(uploadId);
	return rel ? resolvedLocalizedHref(rel as Pathname) : null;
}

/** Back-fill `heroImageUploadId` on lines that are missing it (persists to localStorage). */
export function syncCartHeroIdsFromCatalog(catalogHeroImages: Record<string, number | null>): void {
	if (!browser) return;
	cartLines.update((lines) => {
		let changed = false;
		const next = lines.map((l) => {
			if (l.heroImageUploadId != null && l.heroImageUploadId > 0) return l;
			const hid = catalogHeroImages[String(l.productId)];
			if (hid == null || !Number.isFinite(hid) || hid < 1) return l;
			changed = true;
			return { ...l, heroImageUploadId: hid };
		});
		return changed ? next : lines;
	});
}

/** Back-fill `stockQty` on lines that are missing it (persists to localStorage). */
export function syncCartStockQtysFromCatalog(catalogStockQtys: Record<string, number>): void {
	if (!browser) return;
	cartLines.update((lines) => {
		let changed = false;
		const next = lines.map((l) => {
			const raw = catalogStockQtys[String(l.productId)];
			if (!Number.isFinite(raw)) return l;
			const normalized = Math.max(0, Math.trunc(raw));
			if (l.stockQty === normalized) return l;
			changed = true;
			return { ...l, stockQty: normalized };
		});
		return changed ? next : lines;
	});
}

function normalizeStockQty(value: number | undefined): number | null {
	if (value === undefined || !Number.isFinite(value)) return null;
	return Math.max(0, Math.trunc(value));
}

/** Set when `addToCart` succeeds; drives the global “added to bag” dialog. */
export type AddedToCartModalPayload = {
	productName: string;
	productId: number;
	unitPrice: number;
	qtyAdded: number;
	heroImageUploadId: number | null;
};

export const addedToCartModal = writable<AddedToCartModalPayload | null>(null);

export function closeAddedToCartModal(): void {
	addedToCartModal.set(null);
}

export function addToCart(
	product: MmsCollectionProduct,
	qty = 1,
	opts?: { unitPrice?: number }
): void {
	const unitPrice = opts?.unitPrice ?? product.price;
	const heroImageUploadId = product.heroImageUploadId ?? null;
	const stockQty = normalizeStockQty(product.stockQty);
	const requestQty = Math.max(1, Math.trunc(qty));
	if (stockQty === 0) return;
	let qtyAdded = 0;
	cartLines.update((lines) => {
		const i = lines.findIndex((l) => l.productId === product.id);
		if (i >= 0) {
			const next = [...lines];
			const currentQty = next[i].qty;
			const targetQty = stockQty == null ? currentQty + requestQty : Math.min(currentQty + requestQty, stockQty);
			if (targetQty <= currentQty) return lines;
			qtyAdded = targetQty - currentQty;
			next[i] = {
				...next[i],
				qty: targetQty,
				heroImageUploadId: heroImageUploadId ?? next[i].heroImageUploadId ?? null,
				stockQty: stockQty ?? next[i].stockQty
			};
			return next;
		}
		const initialQty = stockQty == null ? requestQty : Math.min(requestQty, stockQty);
		if (initialQty < 1) return lines;
		qtyAdded = initialQty;
		return [
			...lines,
			{
				productId: product.id,
				qty: initialQty,
				name: product.name,
				price: unitPrice,
				country: product.country,
				region: product.region,
				heroImageUploadId,
				stockQty: stockQty ?? undefined
			}
		];
	});
	if (qtyAdded < 1) return;
	addedToCartModal.set({
		productName: product.name,
		productId: product.id,
		unitPrice,
		qtyAdded,
		heroImageUploadId
	});
}

export function setLineQty(productId: number, qty: number, maxQty?: number | null): void {
	const normalizedMax =
		maxQty != null && Number.isFinite(maxQty) ? Math.max(0, Math.trunc(maxQty)) : null;
	const targetQty = normalizedMax == null ? qty : Math.min(qty, normalizedMax);
	if (targetQty <= 0) {
		removeFromCart(productId);
		return;
	}
	cartLines.update((lines) =>
		lines.map((l) => (l.productId === productId ? { ...l, qty: targetQty } : l))
	);
}

export function removeFromCart(productId: number): void {
	cartLines.update((lines) => lines.filter((l) => l.productId !== productId));
}

export function clearCart(): void {
	cartLines.set([]);
}
