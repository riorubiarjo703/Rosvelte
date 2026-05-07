import { BetterAuthError } from '@better-auth/core/error';
import { APIError } from 'better-call';
import { DrizzleQueryError } from 'drizzle-orm/errors';

const DB_BOOTSTRAP_HINT =
	'\n\nDatabase: run `npm run db:push` with DATABASE_URL set, or `psql "$DATABASE_URL" -f drizzle/init-db.sql`. Confirm DATABASE_URL matches the Postgres instance your app uses.';

function messageFromUnknown(cause: unknown): string | undefined {
	if (cause instanceof Error && cause.message?.trim()) return cause.message.trim();
	if (
		cause &&
		typeof cause === 'object' &&
		'message' in cause &&
		typeof (cause as { message: unknown }).message === 'string'
	) {
		const m = (cause as { message: string }).message.trim();
		return m || undefined;
	}
	return undefined;
}

/** First matching value in the cause chain (includes the root). */
function findInCauseChain(err: unknown, test: (e: unknown) => boolean): unknown {
	let cursor: unknown = err;
	for (let i = 0; i < 12 && cursor != null; i++) {
		if (test(cursor)) return cursor;
		cursor =
			cursor instanceof Error && 'cause' in cursor
				? (cursor as Error & { cause?: unknown }).cause
				: undefined;
	}
	return undefined;
}

/** Expose Postgres (or driver) text and a fix hint when Drizzle failed a query. */
function enrichDatabaseErrors(err: unknown, composed: string): string {
	const dq = findInCauseChain(err, (e) => e instanceof DrizzleQueryError);
	if (!(dq instanceof DrizzleQueryError)) return composed;

	const driverMsg = messageFromUnknown(dq.cause);
	let out = composed;
	if (driverMsg && !out.includes(driverMsg)) {
		out = `${out}\n\n${driverMsg}`;
	}
	if (out.includes('Failed query:') && !out.includes('npm run db:push')) {
		out += DB_BOOTSTRAP_HINT;
	}
	return out;
}

/** Walk Error.cause chain (e.g. DrizzleQueryError → PostgresError) for a readable suffix. */
function formatErrorCauses(err: unknown, base: string): string {
	let parts = [base];
	let cursor: unknown =
		err instanceof Error && 'cause' in err ? (err as Error & { cause?: unknown }).cause : undefined;
	const seen = new Set<string>();
	let depth = 0;
	while (cursor instanceof Error && depth < 6) {
		const m = cursor.message?.trim();
		if (m && !seen.has(m)) {
			seen.add(m);
			parts.push(m);
		}
		cursor = 'cause' in cursor ? (cursor as Error & { cause?: unknown }).cause : undefined;
		depth++;
	}
	return parts.join('\n\n');
}

/** Map Better Auth / better-call errors to a safe message for form actions. */
export function authActionErrorMessage(err: unknown): string {
	if (err instanceof APIError) {
		const base = err.body?.message ?? err.message ?? 'Request failed';
		return enrichDatabaseErrors(err, formatErrorCauses(err, base));
	}
	if (err instanceof BetterAuthError) {
		return enrichDatabaseErrors(err, formatErrorCauses(err, err.message));
	}
	if (err instanceof Error) {
		return enrichDatabaseErrors(err, formatErrorCauses(err, err.message));
	}
	return 'Unexpected error';
}

export function isAuthClientError(err: unknown): boolean {
	if (err instanceof APIError) {
		return err.statusCode >= 400 && err.statusCode < 500;
	}
	return err instanceof BetterAuthError;
}
