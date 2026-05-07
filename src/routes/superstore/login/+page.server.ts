import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { authActionErrorMessage, isAuthClientError } from '$lib/server/auth-errors';
import { canAccessSuperstore } from '$lib/server/superstore/access';
import { safeInternalPath } from '$lib/server/superstore/redirect';

export const load: PageServerLoad = (event) => {
	const redirectTo = safeInternalPath(event.url.searchParams.get('redirectTo'));
	if (event.locals.user) {
		const dest = redirectTo ?? '/superstore';
		if (!canAccessSuperstore(event.locals.user)) {
			throw redirect(302, '/');
		}
		throw redirect(302, dest);
	}
	return { redirectTo };
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const next = safeInternalPath(formData.get('redirectTo')?.toString() ?? null);

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: '/auth/verification-success'
				},
				headers: event.request.headers
			});
		} catch (err) {
			const status = isAuthClientError(err) ? 400 : 500;
			return fail(status, { message: authActionErrorMessage(err) });
		}

		throw redirect(302, next ?? '/superstore');
	},
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';
		const next = safeInternalPath(formData.get('redirectTo')?.toString() ?? null);

		try {
			await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					callbackURL: '/auth/verification-success'
				},
				headers: event.request.headers
			});
		} catch (err) {
			const status = isAuthClientError(err) ? 400 : 500;
			return fail(status, { message: authActionErrorMessage(err) });
		}

		throw redirect(302, next ?? '/superstore');
	}
};
