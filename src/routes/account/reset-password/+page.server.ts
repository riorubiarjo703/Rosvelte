import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { customerAuth } from '$lib/server/customer-auth';
import { authActionErrorMessage, isAuthClientError } from '$lib/server/auth-errors';

export const load: PageServerLoad = ({ url, locals }) => {
	if (locals.customer) {
		throw redirect(302, '/account');
	}
	const token = url.searchParams.get('token');
	const err = url.searchParams.get('error');
	return {
		token,
		invalid: err === 'INVALID_TOKEN'
	};
};

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.customer) {
			return fail(400, { message: 'You are already signed in.' });
		}

		const formData = await event.request.formData();
		const token = formData.get('token')?.toString() ?? '';
		const newPassword = formData.get('newPassword')?.toString() ?? '';

		if (!token) {
			return fail(400, { message: 'Reset link is missing or expired. Request a new one.' });
		}

		try {
			await customerAuth.api.resetPassword({
				body: { token, newPassword },
				headers: event.request.headers
			});
		} catch (err) {
			const status = isAuthClientError(err) ? 400 : 500;
			return fail(status, { message: authActionErrorMessage(err) });
		}

		throw redirect(302, '/account/login?reset=1');
	}
};
