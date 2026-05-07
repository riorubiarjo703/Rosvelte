import type { LayoutServerLoad } from './$types';
import { assertSuperstore } from '$lib/server/superstore/access';

function isSuperstoreLoginPath(pathname: string): boolean {
	return pathname.includes('/superstore/login');
}

export const load: LayoutServerLoad = (event) => {
	if (isSuperstoreLoginPath(event.url.pathname)) {
		return { guestMode: true as const };
	}
	assertSuperstore(event);
	return { guestMode: false as const, user: event.locals.user! };
};
