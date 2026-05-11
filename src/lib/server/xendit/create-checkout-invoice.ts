import type { StorefrontOrderLinePayload } from '$lib/server/db/schema';
import { getXenditClient } from './xendit-client';

export async function createHostedCheckoutInvoice(args: {
	externalId: string;
	amountIdr: number;
	payerEmail: string;
	description: string;
	successRedirectUrl: string;
	failureRedirectUrl: string;
	items?: StorefrontOrderLinePayload[];
}): Promise<{ invoiceUrl: string; invoiceId: string }> {
	const client = await getXenditClient();
	if (!client) throw new Error('Xendit is not configured (no secret API key)');

	const items =
		args.items?.map((line) => ({
			name: line.name.slice(0, 80),
			quantity: line.qty,
			price: line.unitPriceIdr,
			category: 'Liquor'
		})) ?? undefined;

	const invoice = await client.Invoice.createInvoice({
		data: {
			externalId: args.externalId,
			amount: args.amountIdr,
			payerEmail: args.payerEmail,
			description: args.description.slice(0, 500),
			currency: 'IDR',
			successRedirectUrl: args.successRedirectUrl,
			failureRedirectUrl: args.failureRedirectUrl,
			items,
			invoiceDuration: 86400
		}
	});

	const invoiceUrl = invoice.invoiceUrl;
	const invoiceId = invoice.id;
	if (!invoiceUrl || !invoiceId) {
		throw new Error('Xendit invoice response missing invoiceUrl or id');
	}
	return { invoiceUrl, invoiceId };
}
