import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { customerAuth } from '$lib/server/customer-auth';
import { authActionErrorMessage, isAuthClientError } from '$lib/server/auth-errors';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.customer) {
		return { alreadySignedIn: true as const };
	}
	return { alreadySignedIn: false as const };
};

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.customer) {
			return fail(400, { message: 'You are already signed in.' });
		}

		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';

		const origin =
			env.ORIGIN?.trim() || env.BETTER_AUTH_URL?.trim() || new URL(event.request.url).origin;
		const redirectTo = `${origin}/account/reset-password`;

		try {
			await customerAuth.api.requestPasswordReset({
				body: { email, redirectTo },
				headers: event.request.headers
			});
		} catch (err) {
			const status = isAuthClientError(err) ? 400 : 500;
			return fail(status, { message: authActionErrorMessage(err) });
		}

		return { ok: true as const };
	}
};
