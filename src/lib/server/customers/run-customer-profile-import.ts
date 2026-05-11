import { eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { storefrontCustomerUser } from '$lib/server/db/customer-auth.schema';
import type { CustomerExportRow } from '$lib/superstore/schemas';
import {
	isAllowedPreferredLanguage,
	isAllowedSpiritPreference,
	isValidCustomerPhone
} from '$lib/server/customer-profile-validation';

function validateProfileRow(row: CustomerExportRow, index: number): string | null {
	if (row.phone && !isValidCustomerPhone(row.phone)) return `#${index}: invalid phone`;
	if (row.preferredLanguage && !isAllowedPreferredLanguage(row.preferredLanguage)) {
		return `#${index}: invalid preferred language`;
	}
	if (row.spiritPreference && !isAllowedSpiritPreference(row.spiritPreference)) {
		return `#${index}: invalid spirit preference`;
	}
	return null;
}

/** Updates existing storefront customers matched by email (case-insensitive). Does not create accounts. */
export async function runCustomerProfileImport(
	rows: CustomerExportRow[]
): Promise<{ updated: number; skipped: number; errors: string[] }> {
	const errors: string[] = [];
	let updated = 0;
	let skipped = 0;

	let index = 0;
	for (const row of rows) {
		index += 1;
		const v = validateProfileRow(row, index);
		if (v) {
			errors.push(v);
			continue;
		}

		const emailLower = row.email.trim().toLowerCase();

		const [existing] = await db
			.select({ id: storefrontCustomerUser.id })
			.from(storefrontCustomerUser)
			.where(sql`lower(${storefrontCustomerUser.email}) = ${emailLower}`)
			.limit(1);

		if (!existing) {
			skipped += 1;
			continue;
		}

		await db
			.update(storefrontCustomerUser)
			.set({
				name: row.name,
				emailVerified: row.emailVerified,
				phone: row.phone || null,
				birthDate: row.birthDate || null,
				preferredLanguage: row.preferredLanguage || null,
				spiritPreference: row.spiritPreference || null,
				image: row.image,
				updatedAt: new Date()
			})
			.where(eq(storefrontCustomerUser.id, existing.id));

		updated += 1;
	}

	return { updated, skipped, errors };
}
