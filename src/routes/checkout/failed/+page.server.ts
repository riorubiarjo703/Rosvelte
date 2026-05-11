import { getStorefrontOrderByCode } from '$lib/server/orders/repo';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const code = url.searchParams.get('code')?.trim();
	if (!code) error(404, 'Missing order');

	const order = await getStorefrontOrderByCode(code);
	if (!order) error(404, 'Order not found');

	return { order };
};
