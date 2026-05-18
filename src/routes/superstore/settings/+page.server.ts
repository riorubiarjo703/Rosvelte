import type { Actions, PageServerLoad } from './$types';
import { assertSuperstore } from '$lib/server/superstore/access';
import {
	resolveStoreTaxRatePercent,
	resolveXenditCheckoutMethodFlags,
	resolveXenditMode,
	resolveXenditPaymentEnabled,
	type XenditCheckoutMethodFlags,
	type XenditPaymentMode
} from '$lib/server/superstore/payment-config';
import { SUPERSTORE_SECRET_KEYS } from '$lib/server/superstore/secret-keys';
import { deleteSecret, getSecret, upsertSecret } from '$lib/server/superstore/secrets-repo';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const keys = [
		SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY,
		SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY_TEST,
		SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY_LIVE,
		SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN,
		SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN_TEST,
		SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN_LIVE
	] as const;

	const [
		hasLegacySk,
		hasTestSk,
		hasLiveSk,
		hasLegacyWh,
		hasTestWh,
		hasLiveWh,
		serverTaxRatePercent,
		xenditPaymentEnabled,
		xenditMode,
		xenditCheckoutMethods
	] = await Promise.all([
		getSecret(keys[0]).then((v) => Boolean(v?.trim())),
		getSecret(keys[1]).then((v) => Boolean(v?.trim())),
		getSecret(keys[2]).then((v) => Boolean(v?.trim())),
		getSecret(keys[3]).then((v) => Boolean(v?.trim())),
		getSecret(keys[4]).then((v) => Boolean(v?.trim())),
		getSecret(keys[5]).then((v) => Boolean(v?.trim())),
		resolveStoreTaxRatePercent(),
		resolveXenditPaymentEnabled(),
		resolveXenditMode(),
		resolveXenditCheckoutMethodFlags()
	]);

	return {
		paymentSecrets: {
			hasLegacySecretKey: hasLegacySk,
			hasTestSecretKey: hasTestSk,
			hasLiveSecretKey: hasLiveSk,
			hasLegacyWebhook: hasLegacyWh,
			hasTestWebhook: hasTestWh,
			hasLiveWebhook: hasLiveWh
		},
		serverTaxRatePercent,
		xenditPaymentEnabled,
		xenditMode,
		xenditCheckoutMethods
	};
};

function parseMode(raw: FormDataEntryValue | null): XenditPaymentMode | null {
	if (raw !== 'test' && raw !== 'production') return null;
	return raw;
}

export const actions = {
	savePaymentSecrets: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();

		const skTest = fd.get('xenditSecretKeyTest');
		const skLive = fd.get('xenditSecretKeyLive');
		const whTest = fd.get('xenditWebhookTokenTest');
		const whLive = fd.get('xenditWebhookTokenLive');
		const taxRaw = fd.get('storeTaxRatePercent');
		const xenditEnabled = fd.get('xenditEnabled') === 'on';
		const mode = parseMode(fd.get('xenditMode'));

		const checkoutMethods: XenditCheckoutMethodFlags = {
			card: fd.get('xenditCheckoutCard') === 'on',
			va: fd.get('xenditCheckoutVa') === 'on',
			ewallet: fd.get('xenditCheckoutEwallet') === 'on'
		};

		if (mode === null) {
			return fail(400, { paymentError: 'Invalid payment environment.' });
		}

		if (xenditEnabled && !checkoutMethods.card && !checkoutMethods.va && !checkoutMethods.ewallet) {
			return fail(400, {
				paymentError: 'Enable at least one checkout payment type (card, bank transfer, or e-wallet).'
			});
		}

		try {
			await upsertSecret(
				SUPERSTORE_SECRET_KEYS.PAYMENT_XENDIT_ENABLED,
				xenditEnabled ? 'true' : 'false'
			);
			await upsertSecret(SUPERSTORE_SECRET_KEYS.PAYMENT_XENDIT_MODE, mode);
			await upsertSecret(
				SUPERSTORE_SECRET_KEYS.PAYMENT_XENDIT_CHECKOUT_METHODS,
				JSON.stringify(checkoutMethods)
			);

			if (typeof skTest === 'string' && skTest.trim()) {
				await upsertSecret(SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY_TEST, skTest.trim());
			}
			if (typeof skLive === 'string' && skLive.trim()) {
				await upsertSecret(SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY_LIVE, skLive.trim());
			}
			if (typeof whTest === 'string' && whTest.trim()) {
				await upsertSecret(SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN_TEST, whTest.trim());
			}
			if (typeof whLive === 'string' && whLive.trim()) {
				await upsertSecret(SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN_LIVE, whLive.trim());
			}
			if (typeof taxRaw === 'string' && taxRaw.trim()) {
				const n = Number(taxRaw.trim());
				if (!Number.isFinite(n) || n < 0 || n > 100) {
					return fail(400, { paymentError: 'Tax rate must be between 0 and 100.' });
				}
				await upsertSecret(SUPERSTORE_SECRET_KEYS.STORE_TAX_RATE_PERCENT, String(n));
			}

			return { paymentSaved: true as const };
		} catch (e) {
			console.error('[superstore settings] savePaymentSecrets', e);
			return fail(500, { paymentError: 'Could not save payment settings.' });
		}
	},

	clearPaymentSecrets: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		if (fd.get('confirmClear') !== 'true') {
			return fail(400, { paymentError: 'Confirmation missing.' });
		}
		try {
			const toClear = [
				SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY,
				SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY_TEST,
				SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY_LIVE,
				SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN,
				SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN_TEST,
				SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN_LIVE,
				SUPERSTORE_SECRET_KEYS.STORE_TAX_RATE_PERCENT,
				SUPERSTORE_SECRET_KEYS.PAYMENT_XENDIT_MODE,
				SUPERSTORE_SECRET_KEYS.PAYMENT_XENDIT_CHECKOUT_METHODS
			];
			for (const key of toClear) {
				await deleteSecret(key);
			}
			return { paymentCleared: true as const };
		} catch (e) {
			console.error('[superstore settings] clearPaymentSecrets', e);
			return fail(500, { paymentError: 'Could not clear stored secrets.' });
		}
	}
} satisfies Actions;
