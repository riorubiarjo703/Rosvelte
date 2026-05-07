import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { User } from 'better-auth/types';
import { safeInternalPath } from './redirect';

function envFlagTrue(raw: string | undefined): boolean {
	const v = raw?.trim().toLowerCase();
	return v === 'true' || v === '1' || v === 'yes';
}

export function canAccessSuperstore(user: User | undefined): boolean {
	if (!user?.email) return false;
	if (envFlagTrue(env.SUPERSTORE_ALLOW_ANY_AUTHENTICATED_USER)) return true;
	const allowed = parseAllowedEmails();
	return allowed.includes(user.email.toLowerCase());
}

function parseAllowedEmails(): string[] {
	const raw = env.SUPERSTORE_ALLOWED_EMAILS ?? '';
	return raw
		.split(',')
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
}

/**
 * Require an authenticated user allowed for Superstore. Use in layouts and +server routes.
 */
export function assertSuperstore(event: RequestEvent): void {
	const user = event.locals.user;
	const next = safeInternalPath(event.url.pathname + event.url.search) ?? '/superstore';

	if (!user) {
		throw redirect(302, `/superstore/login?redirectTo=${encodeURIComponent(next)}`);
	}
	if (!canAccessSuperstore(user)) {
		throw error(403, 'Superstore access denied');
	}
}
