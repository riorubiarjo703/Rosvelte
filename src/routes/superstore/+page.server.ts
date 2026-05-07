import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async () => {
	return {};
};

/** Layout cannot export `actions`; sign-out posts here from every Superstore page. */
export const actions: Actions = {
	signOut: async (event) => {
		if (event.locals.user) {
			await auth.api.signOut({ headers: event.request.headers });
		}
		throw redirect(302, '/superstore/login');
	}
};
