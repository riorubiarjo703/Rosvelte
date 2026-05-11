import type { Actions, PageServerLoad } from './$types';
import { assertSuperstore } from '$lib/server/superstore/access';
import {
	resolveStoreTaxRatePercent,
	resolveXenditPaymentEnabled
} from '$lib/server/superstore/payment-config';
import { SUPERSTORE_SECRET_KEYS } from '$lib/server/superstore/secret-keys';
import { deleteSecret, getSecret, upsertSecret } from '$lib/server/superstore/secrets-repo';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const [hasSk, hasWh, serverTaxRatePercent, xenditPaymentEnabled] = await Promise.all([
		getSecret(SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY).then((v) => Boolean(v?.trim())),
		getSecret(SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN).then((v) => Boolean(v?.trim())),
		resolveStoreTaxRatePercent(),
		resolveXenditPaymentEnabled()
	]);

	return {
		paymentSecrets: {
			hasXenditSecretKey: hasSk,
			hasWebhookToken: hasWh
		},
		serverTaxRatePercent,
		xenditPaymentEnabled
	};
};

export const actions = {
	savePaymentSecrets: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();

		const sk = fd.get('xenditSecretKey');
		const wh = fd.get('xenditWebhookToken');
		const taxRaw = fd.get('storeTaxRatePercent');
		const xenditEnabled = fd.get('xenditEnabled') === 'on';

		try {
			await upsertSecret(
				SUPERSTORE_SECRET_KEYS.PAYMENT_XENDIT_ENABLED,
				xenditEnabled ? 'true' : 'false'
			);
			if (typeof sk === 'string' && sk.trim()) {
				await upsertSecret(SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY, sk.trim());
			}
			if (typeof wh === 'string' && wh.trim()) {
				await upsertSecret(SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN, wh.trim());
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
			await deleteSecret(SUPERSTORE_SECRET_KEYS.XENDIT_SECRET_KEY);
			await deleteSecret(SUPERSTORE_SECRET_KEYS.XENDIT_WEBHOOK_TOKEN);
			await deleteSecret(SUPERSTORE_SECRET_KEYS.STORE_TAX_RATE_PERCENT);
			return { paymentCleared: true as const };
		} catch (e) {
			console.error('[superstore settings] clearPaymentSecrets', e);
			return fail(500, { paymentError: 'Could not clear stored secrets.' });
		}
	}
} satisfies Actions;
