import type { StorefrontOrderRow } from '$lib/server/orders/repo';
import {
	getStorefrontOrderByCode,
	markStorefrontOrderPaidByExternalId
} from '$lib/server/orders/repo';
import { getXenditClient } from './xendit-client';

/**
 * When webhooks cannot reach the server (e.g. localhost), sync payment from Xendit after redirect to success URL.
 */
export async function reconcileStorefrontOrderPaymentFromXendit(
	order: StorefrontOrderRow
): Promise<StorefrontOrderRow> {
	if (order.paymentStatus === 'paid') return order;
	if (!order.xenditInvoiceId || !order.xenditExternalId) return order;

	const client = await getXenditClient();
	if (!client) return order;

	try {
		const inv = await client.Invoice.getInvoiceById({ invoiceId: order.xenditInvoiceId });
		const st = String(inv.status ?? '').toUpperCase();
		if (st === 'PAID' || st === 'SETTLED') {
			await markStorefrontOrderPaidByExternalId(order.xenditExternalId);
			const refreshed = await getStorefrontOrderByCode(order.orderCode);
			return refreshed ?? order;
		}
	} catch (e) {
		console.error('[xendit] reconcile invoice', order.orderCode, e);
	}
	return order;
}
