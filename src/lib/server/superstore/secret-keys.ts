/** Stable keys for `superstore_secret.key` (never rename once deployed — migrate rows instead). */
export const SUPERSTORE_SECRET_KEYS = {
	XENDIT_SECRET_KEY: 'xendit.secret_key',
	XENDIT_WEBHOOK_TOKEN: 'xendit.webhook_token',
	/** When `'false'`, hosted Xendit checkout is hidden and blocked (admin toggle). */
	PAYMENT_XENDIT_ENABLED: 'payment.xendit_enabled',
	/** Canonical checkout VAT % (same semantics as `STORE_TAX_RATE` env). */
	STORE_TAX_RATE_PERCENT: 'store.tax_rate_percent'
} as const;
