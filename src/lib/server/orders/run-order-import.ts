import type { OrderExportRow } from '$lib/superstore/schemas';
import { getStorefrontOrderByCode, normalizeOrderCode, upsertStorefrontOrderFromImport } from '$lib/server/orders/repo';

export async function runOrderImport(
	orders: OrderExportRow[]
): Promise<{ created: number; updated: number; errors: string[] }> {
	const errors: string[] = [];
	let created = 0;
	let updated = 0;

	let index = 0;
	for (const row of orders) {
		index += 1;
		try {
			const code = normalizeOrderCode(row.orderCode);
			const existed = await getStorefrontOrderByCode(code);
			await upsertStorefrontOrderFromImport(row);
			if (existed) updated += 1;
			else created += 1;
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			errors.push(`#${index} ${row.orderCode}: ${msg}`);
		}
	}

	return { created, updated, errors };
}
