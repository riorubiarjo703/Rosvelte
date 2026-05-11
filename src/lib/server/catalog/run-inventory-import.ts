import type { InventoryExportRow } from '$lib/superstore/schemas';
import { updateCatalogProductStockBySku } from '$lib/server/catalog/repo';

export async function runInventoryImport(
	rows: InventoryExportRow[]
): Promise<{ updated: number; errors: string[] }> {
	const errors: string[] = [];
	let updated = 0;

	let index = 0;
	for (const row of rows) {
		index += 1;
		const ok = await updateCatalogProductStockBySku(row.sku, row.stockQty);
		if (ok) updated += 1;
		else errors.push(`#${index} SKU ${row.sku}: not found`);
	}

	return { updated, errors };
}
