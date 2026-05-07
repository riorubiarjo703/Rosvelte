import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { customerAuth } from '$lib/server/customer-auth';
import { authActionErrorMessage, isAuthClientError } from '$lib/server/auth-errors';
import { safeInternalPath } from '$lib/server/superstore/redirect';

export const load: PageServerLoad = (event) => {
	const redirectTo = safeInternalPath(event.url.searchParams.get('redirectTo'));
	if (event.locals.customer) {
		throw redirect(302, redirectTo ?? '/account');
	}
	const passwordResetOk = event.url.searchParams.get('reset') === '1';
	return { redirectTo, passwordResetOk };
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const next = safeInternalPath(formData.get('redirectTo')?.toString() ?? null);

		try {
			await customerAuth.api.signInEmail({
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

		throw redirect(302, next ?? '/account');
	}
};
