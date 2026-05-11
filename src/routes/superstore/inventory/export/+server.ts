import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	buildInventoryExportBundle,
	toCsvFromInventoryRows,
	toXlsxBufferFromInventoryRows
} from '$lib/server/catalog/inventory-transfer';
import { listAllCatalogProducts } from '$lib/server/catalog/repo';
import { assertSuperstore } from '$lib/server/superstore/access';
import type { InventoryExportRow } from '$lib/superstore/schemas';

type ExportFormat = 'json' | 'csv' | 'xlsx';

function parseFormat(raw: string | null): ExportFormat {
	const v = (raw ?? 'json').trim().toLowerCase();
	if (v === 'json' || v === 'csv' || v === 'xlsx') return v;
	throw error(400, 'Invalid export format');
}

export const GET: RequestHandler = async (event) => {
	assertSuperstore(event);
	const format = parseFormat(event.url.searchParams.get('format'));

	const products = await listAllCatalogProducts();
	const rows: InventoryExportRow[] = products.map((p) => ({ sku: p.sku, stockQty: p.stockQty }));

	const safe = new Date().toISOString().slice(0, 10);

	if (format === 'json') {
		const body = JSON.stringify(buildInventoryExportBundle(rows), null, 2);
		return new Response(body, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Content-Disposition': `attachment; filename="rosvelte-inventory-export-${safe}.json"`
			}
		});
	}

	if (format === 'csv') {
		return new Response(toCsvFromInventoryRows(rows), {
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': `attachment; filename="rosvelte-inventory-export-${safe}.csv"`
			}
		});
	}

	const xlsx = toXlsxBufferFromInventoryRows(rows);
	return new Response(new Uint8Array(xlsx), {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="rosvelte-inventory-export-${safe}.xlsx"`
		}
	});
};
