import { getStorefrontOrderByCode } from '$lib/server/orders/repo';
import { reconcileStorefrontOrderPaymentFromXendit } from '$lib/server/xendit/reconcile-xendit-invoice';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const code = url.searchParams.get('code')?.trim();
	if (!code) error(404, 'Missing order');

	let order = await getStorefrontOrderByCode(code);
	if (!order) error(404, 'Order not found');

	order = await reconcileStorefrontOrderPaymentFromXendit(order);

	return { order };
};
