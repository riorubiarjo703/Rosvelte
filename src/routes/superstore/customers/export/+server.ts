import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { storefrontCustomerUser } from '$lib/server/db/customer-auth.schema';
import {
	buildCustomerExportBundle,
	dbCustomerToExportRow,
	toCsvFromCustomers,
	toXlsxBufferFromCustomers
} from '$lib/server/customers/customer-transfer';
import { assertSuperstore } from '$lib/server/superstore/access';
import type { CustomerExportRow } from '$lib/superstore/schemas';

type ExportFormat = 'json' | 'csv' | 'xlsx';

function parseFormat(raw: string | null): ExportFormat {
	const v = (raw ?? 'json').trim().toLowerCase();
	if (v === 'json' || v === 'csv' || v === 'xlsx') return v;
	throw error(400, 'Invalid export format');
}

export const GET: RequestHandler = async (event) => {
	assertSuperstore(event);
	const format = parseFormat(event.url.searchParams.get('format'));

	const dbRows = await db
		.select()
		.from(storefrontCustomerUser)
		.orderBy(desc(storefrontCustomerUser.createdAt));
	const customers: CustomerExportRow[] = dbRows.map(dbCustomerToExportRow);

	const safe = new Date().toISOString().slice(0, 10);

	if (format === 'json') {
		const body = JSON.stringify(buildCustomerExportBundle(customers), null, 2);
		return new Response(body, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Content-Disposition': `attachment; filename="rosvelte-customers-export-${safe}.json"`
			}
		});
	}

	if (format === 'csv') {
		return new Response(toCsvFromCustomers(customers), {
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': `attachment; filename="rosvelte-customers-export-${safe}.csv"`
			}
		});
	}

	const xlsx = toXlsxBufferFromCustomers(customers);
	return new Response(new Uint8Array(xlsx), {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="rosvelte-customers-export-${safe}.xlsx"`
		}
	});
};
