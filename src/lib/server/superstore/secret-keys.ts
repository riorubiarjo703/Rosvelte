/** Stable keys for `superstore_secret.key` (never rename once deployed — migrate rows instead). */
export const SUPERSTORE_SECRET_KEYS = {
	/** Legacy single key — used if mode-specific key is unset (migration / simple setups). */
	XENDIT_SECRET_KEY: 'xendit.secret_key',
	XENDIT_SECRET_KEY_TEST: 'xendit.secret_key.test',
	XENDIT_SECRET_KEY_LIVE: 'xendit.secret_key.live',
	XENDIT_WEBHOOK_TOKEN: 'xendit.webhook_token',
	XENDIT_WEBHOOK_TOKEN_TEST: 'xendit.webhook_token.test',
	XENDIT_WEBHOOK_TOKEN_LIVE: 'xendit.webhook_token.live',
	/** When `'false'`, hosted Xendit checkout is hidden and blocked (admin toggle). */
	PAYMENT_XENDIT_ENABLED: 'payment.xendit_enabled',
	/** `test` | `production` — picks which secret row checkout + webhook verification use. */
	PAYMENT_XENDIT_MODE: 'payment.xendit_mode',
	/** JSON `{ "card": boolean, "va": boolean, "ewallet": boolean }` — checkout UI + Invoice `paymentMethods`. */
	PAYMENT_XENDIT_CHECKOUT_METHODS: 'payment.xendit_checkout_methods',
	/** Canonical checkout VAT % (same semantics as `STORE_TAX_RATE` env). */
	STORE_TAX_RATE_PERCENT: 'store.tax_rate_percent'
} as const;
