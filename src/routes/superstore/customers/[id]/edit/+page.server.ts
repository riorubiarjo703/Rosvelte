import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { storefrontCustomerUser } from '$lib/server/db/customer-auth.schema';
import { assertSuperstore } from '$lib/server/superstore/access';
import { customerAdminUpdateSchema } from '$lib/superstore/schemas';

function readCustomerForm(fd: FormData) {
	return {
		id: fd.get('id'),
		name: fd.get('name'),
		phone: fd.get('phone') ?? '',
		birthDate: fd.get('birthDate') ?? '',
		preferredLanguage: fd.get('preferredLanguage') ?? '',
		spiritPreference: fd.get('spiritPreference') ?? '',
		emailVerified: fd.get('emailVerified')
	};
}

function isIsoDate(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const d = new Date(value);
	return !Number.isNaN(d.getTime());
}

export const load: PageServerLoad = async (event) => {
	assertSuperstore(event);
	const id = event.params.id?.trim();
	if (!id) error(404, 'Not found');

	const rows = await db.select().from(storefrontCustomerUser).where(eq(storefrontCustomerUser.id, id)).limit(1);
	const customer = rows[0];
	if (!customer) error(404, 'Not found');

	return {
		customer: {
			id: customer.id,
			name: customer.name,
			email: customer.email,
			phone: customer.phone ?? '',
			birthDate: customer.birthDate ?? '',
			preferredLanguage: customer.preferredLanguage ?? '',
			spiritPreference: customer.spiritPreference ?? '',
			emailVerified: customer.emailVerified
		}
	};
};

export const actions: Actions = {
	updateCustomer: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const parsed = customerAdminUpdateSchema.safeParse(readCustomerForm(fd));
		if (!parsed.success) {
			return fail(400, {
				errors: parsed.error.flatten().fieldErrors,
				message: 'Check the form fields.'
			});
		}

		if (parsed.data.id !== event.params.id) {
			return fail(400, { errors: {}, message: 'Customer id mismatch.' });
		}
		if (parsed.data.birthDate && !isIsoDate(parsed.data.birthDate)) {
			return fail(400, { errors: { birthDate: ['Use YYYY-MM-DD format.'] }, message: 'Invalid birth date.' });
		}

		const existing = await db
			.select({ id: storefrontCustomerUser.id })
			.from(storefrontCustomerUser)
			.where(eq(storefrontCustomerUser.id, parsed.data.id))
			.limit(1);
		if (!existing[0]) {
			return fail(404, { errors: {}, message: 'Customer not found.' });
		}

		await db
			.update(storefrontCustomerUser)
			.set({
				name: parsed.data.name,
				phone: parsed.data.phone || null,
				birthDate: parsed.data.birthDate || null,
				preferredLanguage: parsed.data.preferredLanguage || null,
				spiritPreference: parsed.data.spiritPreference || null,
				emailVerified: parsed.data.emailVerified,
				updatedAt: new Date()
			})
			.where(eq(storefrontCustomerUser.id, parsed.data.id));

		throw redirect(303, event.url.pathname);
	}
};
