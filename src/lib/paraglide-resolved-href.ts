import type { Pathname } from '$app/types';
import { resolve } from '$app/paths';
import { localizeHref } from '$lib/paraglide/runtime.js';

/**
 * Delocalized app route to localized URL (base + locale prefix).
 */
export function resolvedLocalizedHref(path: Pathname): string {
	const resolvePath = resolve as unknown as (route: string) => string;
	return localizeHref(resolvePath(path));
}

/**
 * Apply only SvelteKit base to an already-localized/internal pathname.
 */
export function resolvedPath(path: string): string {
	const resolvePath = resolve as unknown as (route: string) => string;
	return resolvePath(path);
}
