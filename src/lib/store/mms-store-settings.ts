import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';

const STORAGE_KEY = 'rosvelte-store-settings-v1';
const DEFAULT_TAX_RATE = 11;
const MIN_TAX_RATE = 0;
const MAX_TAX_RATE = 100;
const MAX_ASSET_DATA_URL_LENGTH = 2_000_000;

type StoredSettings = {
	taxRate: number;
	headerLogo: string | null;
	favicon: string | null;
};

function normalizeTaxRate(value: number): number {
	if (!Number.isFinite(value)) return DEFAULT_TAX_RATE;
	return Math.min(MAX_TAX_RATE, Math.max(MIN_TAX_RATE, value));
}

function normalizeAssetDataUrl(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed.startsWith('data:image/')) return null;
	if (trimmed.length > MAX_ASSET_DATA_URL_LENGTH) return null;
	return trimmed;
}

/** ICO files sometimes serialize as octet-stream; still valid for `rel="icon"`. */
function normalizeFaviconDataUrl(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (
		!trimmed.startsWith('data:image/') &&
		!trimmed.startsWith('data:application/octet-stream')
	) {
		return null;
	}
	if (trimmed.length > MAX_ASSET_DATA_URL_LENGTH) return null;
	return trimmed;
}

const DEFAULT_SETTINGS: StoredSettings = {
	taxRate: DEFAULT_TAX_RATE,
	headerLogo: null,
	favicon: null
};

function loadSettings(): StoredSettings {
	if (!browser) return DEFAULT_SETTINGS;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_SETTINGS;
		const parsed = JSON.parse(raw) as Partial<StoredSettings>;
		return {
			taxRate: normalizeTaxRate(Number(parsed.taxRate)),
			headerLogo: normalizeAssetDataUrl(parsed.headerLogo),
			favicon: normalizeFaviconDataUrl(parsed.favicon)
		};
	} catch {
		return DEFAULT_SETTINGS;
	}
}

const storeSettings = writable<StoredSettings>(loadSettings());
export const storeTaxRate = derived(storeSettings, (settings) => settings.taxRate);
export const storeHeaderLogo = derived(storeSettings, (settings) => settings.headerLogo);
export const storeFavicon = derived(storeSettings, (settings) => settings.favicon);

if (browser) {
	storeSettings.subscribe((settings) => {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				taxRate: normalizeTaxRate(settings.taxRate),
				headerLogo: normalizeAssetDataUrl(settings.headerLogo),
				favicon: normalizeFaviconDataUrl(settings.favicon)
			} satisfies StoredSettings)
		);
	});
}

export function setStoreTaxRate(nextTaxRate: number): void {
	storeSettings.update((settings) => ({
		...settings,
		taxRate: normalizeTaxRate(nextTaxRate)
	}));
}

export function setStoreHeaderLogo(nextHeaderLogo: string | null): void {
	storeSettings.update((settings) => ({
		...settings,
		headerLogo: normalizeAssetDataUrl(nextHeaderLogo)
	}));
}

export function setStoreFavicon(nextFavicon: string | null): void {
	storeSettings.update((settings) => ({
		...settings,
		favicon: normalizeFaviconDataUrl(nextFavicon)
	}));
}
