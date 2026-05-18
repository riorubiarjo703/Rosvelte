import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { safeInternalPath } from '$lib/server/superstore/redirect';
import { getStorefrontOrderByCode } from '$lib/server/orders/repo';
import { reconcileStorefrontOrderPaymentFromXendit } from '$lib/server/xendit/reconcile-xendit-invoice';

export const load: PageServerLoad = async (event) => {
	const customer = event.locals.customer;
	if (!customer) {
		const next = safeInternalPath(event.url.pathname + event.url.search) ?? '/account/orders';
		throw redirect(302, `/account/login?redirectTo=${encodeURIComponent(next)}`);
	}

	const raw = event.params.orderCode?.trim();
	if (!raw) error(404, 'Order not found');

	let order = await getStorefrontOrderByCode(raw);
	if (!order) error(404, 'Order not found');

	if (order.customerEmail.trim().toLowerCase() !== customer.email.trim().toLowerCase()) {
		error(404, 'Order not found');
	}

	order = await reconcileStorefrontOrderPaymentFromXendit(order);

	return { order };
};
