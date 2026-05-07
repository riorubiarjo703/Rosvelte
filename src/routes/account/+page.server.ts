import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { mmsCollectionProducts } from '$lib/data/mms-collection-products';
import { customerAuth } from '$lib/server/customer-auth';
import { catalogRowToProduct, listPublishedCatalogProducts } from '$lib/server/catalog/repo';
import { safeInternalPath } from '$lib/server/superstore/redirect';
import { authActionErrorMessage, isAuthClientError } from '$lib/server/auth-errors';
import { MIN_CUSTOMER_AGE, isAtLeastAge, parseBirthDateInput } from '$lib/server/account-age';
import {
	isAllowedPreferredLanguage,
	isAllowedSpiritPreference,
	isValidCustomerPhone
} from '$lib/server/customer-profile-validation';

export const load: PageServerLoad = async (event) => {
	const customer = event.locals.customer;
	if (!customer) {
		const next = safeInternalPath(event.url.pathname + event.url.search) ?? '/account';
		throw redirect(302, `/account/login?redirectTo=${encodeURIComponent(next)}`);
	}

	let curated = mmsCollectionProducts.slice(0, 3);
	try {
		const rows = await listPublishedCatalogProducts();
		if (rows.length > 0) curated = rows.map(catalogRowToProduct).slice(0, 3);
	} catch {
		/* keep seed curated */
	}

	return { customer, curated };
};

export const actions: Actions = {
	signOut: async (event) => {
		await customerAuth.api.signOut({ headers: event.request.headers });
		throw redirect(302, '/account/login');
	},

	updateProfile: async (event) => {
		if (!event.locals.customer) {
			return fail(401, { message: 'You need to be signed in.', profileMessage: '' });
		}
		const fd = await event.request.formData();
		const firstName = fd.get('firstName')?.toString() ?? '';
		const lastName = fd.get('lastName')?.toString() ?? '';
		const name = `${firstName.trim()} ${lastName.trim()}`.trim();
		if (!name) {
			return fail(400, { message: 'Please enter your name.', profileMessage: 'Please enter your name.' });
		}
		const birthRaw = fd.get('birthDate')?.toString()?.trim() ?? '';
		let birthDate: string | undefined;
		if (birthRaw) {
			const birth = parseBirthDateInput(birthRaw);
			if (!birth) {
				return fail(400, {
					message: 'Please enter a valid date of birth.',
					profileMessage: 'Please enter a valid date of birth.'
				});
			}
			if (!isAtLeastAge(birth, MIN_CUSTOMER_AGE)) {
				return fail(400, {
					message: `You must be at least ${MIN_CUSTOMER_AGE} years old.`,
					profileMessage: `You must be at least ${MIN_CUSTOMER_AGE} years old.`
				});
			}
			birthDate = birthRaw;
		}
		const phone = fd.get('phone')?.toString()?.trim() ?? '';
		const preferredLanguage = fd.get('preferredLanguage')?.toString()?.trim() ?? '';
		const spiritPreference = fd.get('spiritPreference')?.toString()?.trim() ?? '';
		if (!isValidCustomerPhone(phone)) {
			return fail(400, {
				message: 'Phone format is invalid. Use numbers and +()-. only.',
				profileMessage: 'Phone format is invalid. Use numbers and +()-. only.'
			});
		}
		if (!isAllowedPreferredLanguage(preferredLanguage)) {
			return fail(400, {
				message: 'Please choose a valid preferred language.',
				profileMessage: 'Please choose a valid preferred language.'
			});
		}
		if (!isAllowedSpiritPreference(spiritPreference)) {
			return fail(400, {
				message: 'Please choose a valid spirit preference.',
				profileMessage: 'Please choose a valid spirit preference.'
			});
		}

		const body: Record<string, string | undefined> = { name };
		if (birthDate !== undefined) body.birthDate = birthDate;
		body.phone = phone || undefined;
		body.preferredLanguage = preferredLanguage || undefined;
		body.spiritPreference = spiritPreference || undefined;

		try {
			await customerAuth.api.updateUser({
				body,
				headers: event.request.headers
			});
		} catch (err) {
			const status = isAuthClientError(err) ? 400 : 500;
			const msg = authActionErrorMessage(err);
			return fail(status, { message: msg, profileMessage: msg });
		}

		return { profileOk: true as const };
	},

	changeCustomerPassword: async (event) => {
		if (!event.locals.customer) {
			return fail(401, { message: 'You need to be signed in.', passwordMessage: '' });
		}
		const fd = await event.request.formData();
		const currentPassword = fd.get('currentPassword')?.toString() ?? '';
		const newPassword = fd.get('newPassword')?.toString() ?? '';
		const confirmPassword = fd.get('confirmPassword')?.toString() ?? '';
		if (!currentPassword || !newPassword) {
			return fail(400, {
				message: 'Current and new password are required.',
				passwordMessage: 'Current and new password are required.'
			});
		}
		if (newPassword.length < 8) {
			return fail(400, {
				message: 'New password must be at least 8 characters.',
				passwordMessage: 'New password must be at least 8 characters.'
			});
		}
		if (newPassword !== confirmPassword) {
			return fail(400, {
				message: 'New password and confirmation do not match.',
				passwordMessage: 'New password and confirmation do not match.'
			});
		}
		try {
			await customerAuth.api.changePassword({
				body: { currentPassword, newPassword, revokeOtherSessions: false },
				headers: event.request.headers
			});
		} catch (err) {
			const status = isAuthClientError(err) ? 400 : 500;
			const msg = authActionErrorMessage(err);
			return fail(status, { message: msg, passwordMessage: msg });
		}
		return { passwordOk: true as const };
	}
};
