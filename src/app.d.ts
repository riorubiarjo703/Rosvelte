import type { User, Session } from 'better-auth/types';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			/** Staff / Superstore (`users` table, Better Auth staff instance). */
			user?: User;
			session?: Session;
			/** Storefront customer (`customers` table). */
			customer?: User;
			customerSession?: Session;
		}

		// interface Error {}
		interface PageData {
			/** Storefront session for public nav (never staff). */
			customer?: User | null;
			/** Published catalogue product id → cover upload id (for cart thumbnails when localStorage lines omit `heroImageUploadId`). */
			catalogHeroImages?: Record<string, number | null>;
			/** Published catalogue product id → stock quantity snapshot. */
			catalogStockQtys?: Record<string, number>;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
