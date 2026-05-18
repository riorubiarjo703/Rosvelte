import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { assertSuperstore } from '$lib/server/superstore/access';
import { getStorefrontOrderById } from '$lib/server/orders/repo';
import { reconcileStorefrontOrderPaymentFromXendit } from '$lib/server/xendit/reconcile-xendit-invoice';

export const load: PageServerLoad = async (event) => {
	assertSuperstore(event);
	const raw = event.params.id;
	const id = Number.parseInt(raw ?? '', 10);
	if (!Number.isFinite(id) || id < 1) error(404, 'Invalid order');

	let order = await getStorefrontOrderById(id);
	if (!order) error(404, 'Order not found');

	order = await reconcileStorefrontOrderPaymentFromXendit(order);

	return { order };
};
