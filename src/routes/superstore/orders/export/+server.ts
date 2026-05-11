import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	buildOrderExportBundle,
	orderRowToExportRow,
	toCsvFromOrders,
	toXlsxBufferFromOrders
} from '$lib/server/orders/order-transfer';
import { listAllStorefrontOrders } from '$lib/server/orders/repo';
import { assertSuperstore } from '$lib/server/superstore/access';
import type { OrderExportRow } from '$lib/superstore/schemas';

type ExportFormat = 'json' | 'csv' | 'xlsx';

function parseFormat(raw: string | null): ExportFormat {
	const v = (raw ?? 'json').trim().toLowerCase();
	if (v === 'json' || v === 'csv' || v === 'xlsx') return v;
	throw error(400, 'Invalid export format');
}

export const GET: RequestHandler = async (event) => {
	assertSuperstore(event);
	const format = parseFormat(event.url.searchParams.get('format'));

	const rows = await listAllStorefrontOrders();
	const orders: OrderExportRow[] = rows.map((r) =>
		orderRowToExportRow({
			orderCode: r.orderCode,
			customerName: r.customerName,
			customerEmail: r.customerEmail,
			productSummary: r.productSummary,
			totalIdr: r.totalIdr,
			currency: r.currency,
			status: r.status,
			orderedAt: r.orderedAt
		})
	);

	const safe = new Date().toISOString().slice(0, 10);

	if (format === 'json') {
		const body = JSON.stringify(buildOrderExportBundle(orders), null, 2);
		return new Response(body, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Content-Disposition': `attachment; filename="rosvelte-orders-export-${safe}.json"`
			}
		});
	}

	if (format === 'csv') {
		return new Response(toCsvFromOrders(orders), {
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': `attachment; filename="rosvelte-orders-export-${safe}.csv"`
			}
		});
	}

	const xlsx = toXlsxBufferFromOrders(orders);
	return new Response(new Uint8Array(xlsx), {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="rosvelte-orders-export-${safe}.xlsx"`
		}
	});
};
