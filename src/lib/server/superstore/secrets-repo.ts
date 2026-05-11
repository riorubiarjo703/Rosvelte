import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { superstoreSecret } from '$lib/server/db/schema';

export async function getSecret(key: string): Promise<string | undefined> {
	try {
		const [row] = await db
			.select({ value: superstoreSecret.value })
			.from(superstoreSecret)
			.where(eq(superstoreSecret.key, key))
			.limit(1);
		return row?.value ?? undefined;
	} catch (e) {
		const cause = e instanceof Error && 'cause' in e ? (e as Error & { cause?: unknown }).cause : undefined;
		console.error('[superstore_secret] getSecret failed', key, cause ?? e);
		throw e;
	}
}

export async function upsertSecret(key: string, value: string): Promise<void> {
	const now = new Date();
	await db
		.insert(superstoreSecret)
		.values({ key, value, updatedAt: now })
		.onConflictDoUpdate({
			target: superstoreSecret.key,
			set: { value, updatedAt: now }
		});
}

export async function deleteSecret(key: string): Promise<void> {
	await db.delete(superstoreSecret).where(eq(superstoreSecret.key, key));
}
