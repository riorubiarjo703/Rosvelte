import { DEFAULT_STORE_TAX_RATE_PERCENT } from '$lib/checkout/mms-checkout-pricing';
import { env } from '$env/dynamic/private';
import { SUPERSTORE_SECRET_KEYS } from './secret-keys';
import { getSecret } from './secrets-repo';

function parseEnabledFlag(raw: string | undefined): boolean | undefined {
	if (raw === undefined || raw === '') return undefined;
	const v = raw.trim().toLowerCase();
	if (['false', '0', 'off', 'no'].includes(v)) return false;
	if (['true', '1', 'on', 'yes'].includes(v)) return true;
	return undefined;
}

/** Hosted Xendit checkout — DB `payment.xendit_enabled`, then `XENDIT_PAYMENT_ENABLED`, default true. */
export async function resolveXenditPaymentEnabled(): Promise<boolean> {
	const fromDb = (await getSecret(SUPERSTORE_SECRET_KEYS.PAYMENT_XENDIT_ENABLED))?.trim();
	const dbParsed = parseEnabledFlag(fromDb);
	if (dbParsed !== undefined) return dbParsed;

	const envParsed = parseEnabledFlag(env.XENDIT_PAYMENT_ENABLED?.trim());
	if (envParsed !== undefined) return envParsed;

	return true;
}

export async function resolveXenditSecretKey(): Promise<string | undefined> {
	const fromDb = (await getSecret(SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY))?.trim();
	if (fromDb) return fromDb;
	return env.XENDIT_SECRET_KEY?.trim() || undefined;
}

export async function resolveXenditWebhookToken(): Promise<string | undefined> {
	const fromDb = (await getSecret(SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN))?.trim();
	if (fromDb) return fromDb;
	return env.XENDIT_WEBHOOK_TOKEN?.trim() || undefined;
}

/** Server checkout tax % — admin DB value, then `STORE_TAX_RATE`, then default 11. */
export async function resolveStoreTaxRatePercent(): Promise<number> {
	const fromDb = (await getSecret(SUPERSTORE_SECRET_KEYS.STORE_TAX_RATE_PERCENT))?.trim();
	if (fromDb) {
		const n = Number(fromDb);
		if (Number.isFinite(n)) return Math.min(100, Math.max(0, n));
	}
	const raw = env.STORE_TAX_RATE?.trim();
	if (raw) {
		const n = Number(raw);
		if (Number.isFinite(n)) return Math.min(100, Math.max(0, n));
	}
	return DEFAULT_STORE_TAX_RATE_PERCENT;
}
