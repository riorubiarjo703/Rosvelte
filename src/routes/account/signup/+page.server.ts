import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { customerAuth } from '$lib/server/customer-auth';
import { authActionErrorMessage, isAuthClientError } from '$lib/server/auth-errors';
import { MIN_CUSTOMER_AGE, isAtLeastAge, parseBirthDateInput } from '$lib/server/account-age';
import { safeInternalPath } from '$lib/server/superstore/redirect';

export const load: PageServerLoad = (event) => {
	const redirectTo = safeInternalPath(event.url.searchParams.get('redirectTo'));
	if (event.locals.customer) {
		throw redirect(302, redirectTo ?? '/account');
	}
	return { redirectTo };
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';
		const birthRaw = formData.get('birthDate')?.toString() ?? '';
		const next = safeInternalPath(formData.get('redirectTo')?.toString() ?? null);

		const birth = parseBirthDateInput(birthRaw);
		if (!birth) {
			return fail(400, { message: 'Please enter a valid date of birth.' });
		}
		if (!isAtLeastAge(birth, MIN_CUSTOMER_AGE)) {
			return fail(400, {
				message: `You must be at least ${MIN_CUSTOMER_AGE} years old to create an account.`
			});
		}

		const birthDate = birthRaw.trim();

		try {
			await customerAuth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					birthDate,
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
