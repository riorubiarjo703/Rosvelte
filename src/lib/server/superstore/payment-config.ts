import { DEFAULT_STORE_TAX_RATE_PERCENT } from '$lib/checkout/mms-checkout-pricing';
import { env } from '$env/dynamic/private';
import { SUPERSTORE_SECRET_KEYS } from './secret-keys';
import { getSecret } from './secrets-repo';

/** Checkout tabs + Xendit Invoice `paymentMethods` (VA = callback virtual account). */
export type XenditCheckoutMethodFlags = {
	card: boolean;
	va: boolean;
	ewallet: boolean;
};

const DEFAULT_CHECKOUT_METHODS: XenditCheckoutMethodFlags = {
	card: true,
	va: true,
	ewallet: true
};

export type XenditPaymentMode = 'test' | 'production';

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

/**
 * Which Xendit environment checkout uses (`xnd_development_…` vs `xnd_production_…` keys).
 * DB → env → infer from legacy single key prefix → default test (local dev).
 */
export async function resolveXenditMode(): Promise<XenditPaymentMode> {
	const row = (await getSecret(SUPERSTORE_SECRET_KEYS.PAYMENT_XENDIT_MODE))?.trim().toLowerCase();
	if (row === 'production' || row === 'live') return 'production';
	if (row === 'test' || row === 'development' || row === 'sandbox') return 'test';

	const envRow = env.XENDIT_MODE?.trim().toLowerCase();
	if (envRow === 'production' || envRow === 'live') return 'production';
	if (envRow === 'test' || envRow === 'development' || envRow === 'sandbox') return 'test';

	const legacySk = (await getSecret(SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY))?.trim();
	if (legacySk?.startsWith('xnd_development_')) return 'test';
	if (legacySk?.startsWith('xnd_production_')) return 'production';

	return 'test';
}

async function pickSecretChain(
	specificKey: string,
	legacyKey: string,
	envSpecific: string | undefined,
	envFallback: string | undefined
): Promise<string | undefined> {
	const specific = (await getSecret(specificKey))?.trim();
	if (specific) return specific;
	const legacy = (await getSecret(legacyKey))?.trim();
	if (legacy) return legacy;
	return envSpecific?.trim() || envFallback?.trim() || undefined;
}

/** Secret key for the active mode (test/live development vs production). */
export async function resolveXenditSecretKey(): Promise<string | undefined> {
	const mode = await resolveXenditMode();
	if (mode === 'test') {
		return pickSecretChain(
			SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY_TEST,
			SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY,
			env.XENDIT_SECRET_KEY_TEST,
			env.XENDIT_SECRET_KEY
		);
	}
	return pickSecretChain(
		SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY_LIVE,
		SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY,
		env.XENDIT_SECRET_KEY_LIVE,
		env.XENDIT_SECRET_KEY
	);
}

/** Webhook callback token for the active mode, then legacy single token. */
export async function resolveXenditWebhookToken(): Promise<string | undefined> {
	const mode = await resolveXenditMode();
	if (mode === 'test') {
		return pickSecretChain(
			SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN_TEST,
			SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN,
			env.XENDIT_WEBHOOK_TOKEN_TEST,
			env.XENDIT_WEBHOOK_TOKEN
		);
	}
	return pickSecretChain(
		SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN_LIVE,
		SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN,
		env.XENDIT_WEBHOOK_TOKEN_LIVE,
		env.XENDIT_WEBHOOK_TOKEN
	);
}

/**
 * Which payment categories appear on checkout and are passed to Xendit Invoice (`paymentMethods`).
 * DB JSON → defaults all true when unset or invalid.
 */
export async function resolveXenditCheckoutMethodFlags(): Promise<XenditCheckoutMethodFlags> {
	const raw = (await getSecret(SUPERSTORE_SECRET_KEYS.PAYMENT_XENDIT_CHECKOUT_METHODS))?.trim();
	if (!raw) return { ...DEFAULT_CHECKOUT_METHODS };
	try {
		const j = JSON.parse(raw) as Record<string, unknown>;
		return {
			card: typeof j.card === 'boolean' ? j.card : DEFAULT_CHECKOUT_METHODS.card,
			va: typeof j.va === 'boolean' ? j.va : DEFAULT_CHECKOUT_METHODS.va,
			ewallet: typeof j.ewallet === 'boolean' ? j.ewallet : DEFAULT_CHECKOUT_METHODS.ewallet
		};
	} catch {
		return { ...DEFAULT_CHECKOUT_METHODS };
	}
}

/** Maps flags to Xendit Invoice API `paymentMethods` strings (see `InvoicePaymentMethod`). */
export function xenditInvoicePaymentMethodsFromFlags(
	flags: XenditCheckoutMethodFlags
): string[] {
	const methods: string[] = [];
	if (flags.card) methods.push('CREDIT_CARD');
	if (flags.va) methods.push('CALLBACK_VIRTUAL_ACCOUNT');
	if (flags.ewallet) methods.push('EWALLET');
	return methods;
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
