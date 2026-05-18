import { shippingLabel, type ShippingOption } from '$lib/checkout/mms-checkout-pricing';
import { priceCheckoutCart } from '$lib/server/checkout/price-checkout-cart';
import {
	allocateLiveOrderCode,
	deleteStorefrontOrderById,
	insertPendingPaymentOrder,
	updateStorefrontOrderInvoiceMeta
} from '$lib/server/orders/repo';
import { createHostedCheckoutInvoice } from '$lib/server/xendit/create-checkout-invoice';
import { mapXenditCheckoutError } from '$lib/server/xendit/map-xendit-checkout-error';
import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import {
	resolveStoreTaxRatePercent,
	resolveXenditCheckoutMethodFlags,
	resolveXenditPaymentEnabled,
	xenditInvoicePaymentMethodsFromFlags
} from '$lib/server/superstore/payment-config';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';

const shippingOptions: ShippingOption[] = ['standard', 'express', 'same', 'free'];

const checkoutSchema = z.object({
	firstName: z.string().trim().min(1).max(120),
	lastName: z.string().trim().min(1).max(120),
	email: z.string().trim().email().max(320),
	phone: z.string().trim().max(40),
	promoCode: z.string().max(80),
	cartLines: z.string().min(2),
	addressDisplay: z.string().trim().min(10).max(2000)
});

export const load: PageServerLoad = async () => {
	const [taxRatePercent, xenditPaymentEnabled, xenditCheckoutMethods] = await Promise.all([
		resolveStoreTaxRatePercent(),
		resolveXenditPaymentEnabled(),
		resolveXenditCheckoutMethodFlags()
	]);
	return {
		taxRatePercent,
		xenditPaymentEnabled,
		xenditCheckoutMethods
	};
};

export const actions = {
	checkout: async ({ request, url }) => {
		const [taxRatePercent, xenditOk, checkoutMethodFlags] = await Promise.all([
			resolveStoreTaxRatePercent(),
			resolveXenditPaymentEnabled(),
			resolveXenditCheckoutMethodFlags()
		]);
		if (!xenditOk) {
			return fail(403, { error: 'Online payment is currently unavailable.' });
		}
		const invoicePaymentMethods = xenditInvoicePaymentMethodsFromFlags(checkoutMethodFlags);
		if (invoicePaymentMethods.length === 0) {
			return fail(403, { error: 'No payment methods are configured for checkout.' });
		}
		const fd = await request.formData();
		const parsed = checkoutSchema.safeParse({
			firstName: fd.get('firstName'),
			lastName: fd.get('lastName'),
			email: fd.get('email'),
			phone: fd.get('phone'),
			promoCode: fd.get('promoCode') ?? '',
			cartLines: fd.get('cartLines'),
			addressDisplay: fd.get('addressDisplay')
		});
		if (!parsed.success) {
			return fail(400, { error: 'Please check your contact details and delivery address.' });
		}

		const shippingRaw = fd.get('shipping');
		const ageConfirmed = fd.get('ageConfirmed') === 'on' || fd.get('ageConfirmed') === 'true';

		if (!ageConfirmed) {
			return fail(400, { error: 'Age verification is required.' });
		}

		if (typeof shippingRaw !== 'string' || !shippingOptions.includes(shippingRaw as ShippingOption)) {
			return fail(400, { error: 'Invalid shipping option.' });
		}

		const priced = await priceCheckoutCart({
			rawLines: parsed.data.cartLines,
			shippingOption: shippingRaw as ShippingOption,
			promoCodeTrimmed: parsed.data.promoCode.trim(),
			taxRatePercent
		});

		if (!priced.ok) {
			return fail(400, { error: priced.message });
		}

		const orderCode = allocateLiveOrderCode();
		const externalId = randomUUID();
		const customerName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();
		const phone = parsed.data.phone.trim() || null;

		let orderId: number;
		try {
			orderId = await insertPendingPaymentOrder({
				orderCode,
				customerName,
				customerEmail: parsed.data.email.trim(),
				phone,
				productSummary: priced.productSummary,
				totalIdr: priced.totalIdr,
				subtotalIdr: priced.subtotalIdr,
				promoDiscountIdr: priced.promoDiscountIdr,
				shippingIdr: priced.shippingIdr,
				taxIdr: priced.taxIdr,
				shippingLabel: shippingLabel(shippingRaw as ShippingOption),
				addressLabel: parsed.data.addressDisplay,
				linesPayload: priced.lines,
				xenditExternalId: externalId
			});
		} catch (e) {
			console.error('[checkout] insert order', e);
			return fail(500, { error: 'Could not save your order. Try again.' });
		}

		const origin = url.origin;
		const successRedirectUrl = `${origin}/checkout/success?code=${encodeURIComponent(orderCode)}`;
		const failureRedirectUrl = `${origin}/checkout/failed?code=${encodeURIComponent(orderCode)}`;

		try {
			const inv = await createHostedCheckoutInvoice({
				externalId,
				amountIdr: priced.totalIdr,
				payerEmail: parsed.data.email.trim(),
				description: priced.productSummary || `Order ${orderCode}`,
				successRedirectUrl,
				failureRedirectUrl,
				items: priced.lines,
				paymentMethods: invoicePaymentMethods
			});
			await updateStorefrontOrderInvoiceMeta(orderId, {
				xenditInvoiceId: inv.invoiceId,
				checkoutInvoiceUrl: inv.invoiceUrl
			});
			throw redirect(303, inv.invoiceUrl);
		} catch (e) {
			if (isRedirect(e)) throw e;
			console.error('[checkout] xendit', e);
			await deleteStorefrontOrderById(orderId).catch(() => {});
			return fail(500, { error: mapXenditCheckoutError(e) });
		}
	}
} satisfies Actions;
