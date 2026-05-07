import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import {
	storefrontCustomerAccount,
	storefrontCustomerSession,
	storefrontCustomerUser,
	storefrontCustomerVerification
} from '$lib/server/db/customer-auth.schema';

const baseURL = env.ORIGIN?.trim() || env.BETTER_AUTH_URL?.trim() || undefined;

const trustedOrigins = [
	'http://rosvelte.test',
	'http://rosvelte.test:80',
	'http://127.0.0.1:5173',
	'http://localhost:5173',
	...(baseURL ? [baseURL] : [])
];

/** Storefront customers only — Postgres `customers` (+ `customer_*`); never use for Superstore. */
export const customerAuth = betterAuth({
	baseURL,
	basePath: '/api/customer-auth',
	secret:
		env.BETTER_AUTH_CUSTOMER_SECRET?.trim() || env.BETTER_AUTH_SECRET,
	trustedOrigins,
	advanced: {
		cookiePrefix: 'rosvelte-customer'
	},
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: storefrontCustomerUser,
			session: storefrontCustomerSession,
			account: storefrontCustomerAccount,
			verification: storefrontCustomerVerification
		}
	}),
	user: {
		additionalFields: {
			// Use camelCase only: Drizzle adapter matches keys to `storefrontCustomerUser` columns (`birthDate` → SQL `birth_date`).
			birthDate: {
				type: 'string',
				required: false,
				input: true
			},
			phone: {
				type: 'string',
				required: false,
				input: true
			},
			preferredLanguage: {
				type: 'string',
				required: false,
				input: true
			},
			spiritPreference: {
				type: 'string',
				required: false,
				input: true
			}
		}
	},
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user: u, url }) => {
			console.info(`[customer-auth] password reset for ${u.email}: ${url}`);
		}
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});
