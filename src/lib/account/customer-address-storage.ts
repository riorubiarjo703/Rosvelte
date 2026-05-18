/** Saved delivery addresses — same shape and storage key as account dashboard (`MmsCustomerDashboard`). */

export type CustomerSavedAddress = {
	id: string;
	label: string;
	recipient: string;
	phone: string;
	addressLine: string;
	city: string;
	postalCode: string;
	isDefault: boolean;
};

export function customerAddressesStorageKey(customerId: string): string {
	return `rosvelte-customer-addresses-${customerId}`;
}

export function parseCustomerAddressesFromStorageJson(
	raw: string | null
): CustomerSavedAddress[] {
	if (raw == null || raw === '') return [];
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter((entry) => entry && typeof entry === 'object')
			.map((entry) => {
				const e = entry as Record<string, unknown>;
				return {
					id: String(e.id || ''),
					label: String(e.label || 'Address'),
					recipient: String(e.recipient || ''),
					phone: String(e.phone || ''),
					addressLine: String(e.addressLine || ''),
					city: String(e.city || ''),
					postalCode: String(e.postalCode || ''),
					isDefault: Boolean(e.isDefault)
				} satisfies CustomerSavedAddress;
			})
			.filter(
				(entry) =>
					entry.id &&
					entry.recipient &&
					entry.addressLine &&
					entry.city &&
					entry.postalCode
			);
	} catch {
		return [];
	}
}

export function normalizeAddressBookDefaults(book: CustomerSavedAddress[]): CustomerSavedAddress[] {
	if (book.length === 0 || book.some((e) => e.isDefault)) return book;
	return book.map((entry, index) => ({ ...entry, isDefault: index === 0 }));
}

/** Single-line summary for orders / checkout submit. */
export function formatSavedAddressForCheckout(a: CustomerSavedAddress): string {
	const labelNote = a.isDefault ? `${a.label} (default)` : a.label;
	const cityLine = [a.city, a.postalCode].filter(Boolean).join(' ');
	const bits = [labelNote, a.recipient, a.addressLine, cityLine];
	if (a.phone.trim()) bits.push(`Tel. ${a.phone.trim()}`);
	return bits.join(' | ');
}
