import { desc, gte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { storefrontCustomerUser } from '$lib/server/db/customer-auth.schema';
import { assertSuperstore } from '$lib/server/superstore/access';

type CustomerStatus = 'active' | 'pending';

type SuperstoreCustomerRow = {
	id: string;
	name: string;
	email: string;
	location: string;
	orders: number;
	spent: string;
	last: string;
	status: CustomerStatus;
};

function daysAgo(days: number): Date {
	return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function formatLastSeen(date: Date): string {
	const today = new Date();
	const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const dayDiff = Math.round((todayMidnight.getTime() - dateMidnight.getTime()) / (24 * 60 * 60 * 1000));

	if (dayDiff <= 0) return 'Today';
	if (dayDiff === 1) return 'Yesterday';
	return `${dayDiff}d ago`;
}

function toCustomerRow(
	row: typeof storefrontCustomerUser.$inferSelect
): SuperstoreCustomerRow {
	const lastActivity = row.updatedAt ?? row.createdAt;
	return {
		id: row.id,
		name: row.name,
		email: row.email,
		// Until address/order tables exist, surface the only profile preference we have.
		location: row.preferredLanguage?.trim() || '-',
		orders: 0,
		spent: 'Rp 0',
		last: formatLastSeen(lastActivity),
		status: row.emailVerified ? 'active' : 'pending'
	};
}

export const load: PageServerLoad = async (event) => {
	assertSuperstore(event);

	const activeSince = daysAgo(30);
	const [customers, activeRows] = await Promise.all([
		db.select().from(storefrontCustomerUser).orderBy(desc(storefrontCustomerUser.createdAt)),
		db
			.select({ id: storefrontCustomerUser.id })
			.from(storefrontCustomerUser)
			.where(gte(storefrontCustomerUser.updatedAt, activeSince))
	]);

	return {
		customers: customers.map(toCustomerRow),
		kpis: {
			totalCustomers: customers.length,
			activeCustomers30d: activeRows.length,
			averageOrderValue: 'Rp 0'
		}
	};
};
