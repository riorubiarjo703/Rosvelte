import {
	addressLabel,
	DEFAULT_STORE_TAX_RATE_PERCENT,
	shippingLabel,
	type AddressOption,
	type ShippingOption
} from '$lib/checkout/mms-checkout-pricing';
import { priceCheckoutCart } from '$lib/server/checkout/price-checkout-cart';
import {
	allocateLiveOrderCode,
	deleteStorefrontOrderById,
	insertPendingPaymentOrder,
	updateStorefrontOrderInvoiceMeta
} from '$lib/server/orders/repo';
import { createHostedCheckoutInvoice } from '$lib/server/xendit/create-checkout-invoice';
import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';

function parseTaxRatePercent(): number {
	const raw = env.STORE_TAX_RATE?.trim();
	if (!raw) return DEFAULT_STORE_TAX_RATE_PERCENT;
	const n = Number(raw);
	return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : DEFAULT_STORE_TAX_RATE_PERCENT;
}

const shippingOptions: ShippingOption[] = ['standard', 'express', 'same', 'free'];
const addressOptions: AddressOption[] = ['home', 'office', 'new'];

const checkoutSchema = z.object({
	firstName: z.string().trim().min(1).max(120),
	lastName: z.string().trim().min(1).max(120),
	email: z.string().trim().email().max(320),
	phone: z.string().trim().max(40),
	promoCode: z.string().max(80),
	cartLines: z.string().min(2)
});

export const load: PageServerLoad = async () => ({
	taxRatePercent: parseTaxRatePercent()
});

export const actions = {
	checkout: async ({ request, url }) => {
		const taxRatePercent = parseTaxRatePercent();
		const fd = await request.formData();
		const parsed = checkoutSchema.safeParse({
			firstName: fd.get('firstName'),
			lastName: fd.get('lastName'),
			email: fd.get('email'),
			phone: fd.get('phone'),
			promoCode: fd.get('promoCode') ?? '',
			cartLines: fd.get('cartLines')
		});
		if (!parsed.success) {
			return fail(400, { error: 'Please check your contact details.' });
		}

		const shippingRaw = fd.get('shipping');
		const addressRaw = fd.get('address');
		const ageConfirmed = fd.get('ageConfirmed') === 'on' || fd.get('ageConfirmed') === 'true';

		if (!ageConfirmed) {
			return fail(400, { error: 'Age verification is required.' });
		}

		if (typeof shippingRaw !== 'string' || !shippingOptions.includes(shippingRaw as ShippingOption)) {
			return fail(400, { error: 'Invalid shipping option.' });
		}
		if (typeof addressRaw !== 'string' || !addressOptions.includes(addressRaw as AddressOption)) {
			return fail(400, { error: 'Invalid address option.' });
		}

		const priced = await priceCheckoutCart({
			rawLines: parsed.data.cartLines,
			shippingOption: shippingRaw as ShippingOption,
			addressOption: addressRaw as AddressOption,
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
				addressLabel: addressLabel(addressRaw as AddressOption),
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
				items: priced.lines
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
			const msg =
				e instanceof Error && e.message.includes('XENDIT_SECRET_KEY')
					? 'Payments are not configured on this environment.'
					: 'Could not start payment. Try again.';
			return fail(500, { error: msg });
		}
	}
} satisfies Actions;
