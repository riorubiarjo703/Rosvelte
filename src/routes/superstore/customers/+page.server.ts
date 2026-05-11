import { desc, gte } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { parseCustomerSpreadsheetFromFile, tabularRowToCustomerRow } from '$lib/server/customers/customer-transfer';
import { runCustomerProfileImport } from '$lib/server/customers/run-customer-profile-import';
import { db } from '$lib/server/db';
import { storefrontCustomerUser } from '$lib/server/db/customer-auth.schema';
import { assertSuperstore } from '$lib/server/superstore/access';
import { formatZodIssues } from '$lib/server/format-zod-issues';
import {
	customerExportRowSchema,
	type CustomerExportRow,
	customerImportFileSchema
} from '$lib/superstore/schemas';

const MAX_IMPORT_BYTES = 8 * 1024 * 1024;

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

export const actions: Actions = {
	importCustomers: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const file = fd.get('file');
		if (!(file instanceof File) || file.size === 0) {
			return fail(400, {
				importResult: null,
				message: 'Choose a JSON, CSV, or Excel file produced by Export.'
			});
		}
		if (file.size > MAX_IMPORT_BYTES) {
			return fail(400, {
				importResult: null,
				message: `File too large (max ${MAX_IMPORT_BYTES / 1024 / 1024} MB).`
			});
		}

		const lowerName = file.name.toLowerCase();
		const mime = file.type.toLowerCase();
		const errors: string[] = [];
		let customerRows: CustomerExportRow[] = [];

		if (lowerName.endsWith('.json') || mime.includes('json') || mime === '') {
			let parsedJson: unknown;
			try {
				parsedJson = JSON.parse(await file.text());
			} catch {
				return fail(400, { importResult: null, message: 'Could not parse JSON.' });
			}

			const parsedBundle = customerImportFileSchema.safeParse(parsedJson);
			if (parsedBundle.success) {
				customerRows = parsedBundle.data.customers;
			} else if (Array.isArray(parsedJson)) {
				let row = 0;
				for (const raw of parsedJson) {
					row += 1;
					const p = customerExportRowSchema.safeParse(raw);
					if (p.success) customerRows.push(p.data);
					else {
						errors.push(`#${row}: ${formatZodIssues(p.error)}`);
					}
				}
			} else {
				return fail(400, {
					importResult: null,
					message:
						parsedBundle.error.flatten().formErrors.join(' ') ||
						'Invalid JSON shape: expected version 1 bundle or array of rows.'
				});
			}
		} else if (
			lowerName.endsWith('.csv') ||
			lowerName.endsWith('.xlsx') ||
			lowerName.endsWith('.xls') ||
			mime.includes('csv') ||
			mime.includes('spreadsheet') ||
			mime.includes('excel')
		) {
			const sheetRows = await parseCustomerSpreadsheetFromFile(file);
			let row = 1;
			for (const raw of sheetRows) {
				row += 1;
				const parsed = tabularRowToCustomerRow(raw);
				if (parsed.value) customerRows.push(parsed.value);
				if (parsed.error) errors.push(`#${row}: ${parsed.error}`);
			}
		} else {
			return fail(400, {
				importResult: null,
				message: 'Unsupported file type. Use JSON, CSV, XLSX, or XLS.'
			});
		}

		if (customerRows.length === 0) {
			return fail(400, {
				importResult: null,
				message: `No valid rows found to import.${errors.length > 0 ? ` ${errors[0]}` : ''}`
			});
		}

		const result = await runCustomerProfileImport(customerRows);
		const mergedErrors = [...errors, ...result.errors];

		return {
			importResult: {
				updated: result.updated,
				skipped: result.skipped,
				errors: mergedErrors
			},
			message: ''
		};
	}
};
