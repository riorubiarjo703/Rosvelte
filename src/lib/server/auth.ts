import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as authSchema from '$lib/server/db/schema';

const baseURL = env.ORIGIN?.trim() || env.BETTER_AUTH_URL?.trim() || undefined;

/** Origins allowed for CSRF / callback checks when cookies or Sec-Fetch-* are involved. */
const trustedOrigins = [
	'http://rosvelte.test',
	'http://rosvelte.test:80',
	'http://127.0.0.1:5173',
	'http://localhost:5173',
	...(baseURL ? [baseURL] : [])
];

export const auth = betterAuth({
	baseURL,
	secret: env.BETTER_AUTH_SECRET,
	trustedOrigins,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: authSchema.user,
			session: authSchema.session,
			account: authSchema.account,
			verification: authSchema.verification
		}
	}),
	/** Staff / Superstore only — separate cookie prefix from storefront `customerAuth`. */
	advanced: {
		cookiePrefix: 'rosvelte-staff'
	},
	basePath: '/api/auth',
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user: u, url }) => {
			// No transactional email integration yet — log the link in dev; configure SMTP later.
			console.info(`[better-auth] password reset for ${u.email}: ${url}`);
		}
	},
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
