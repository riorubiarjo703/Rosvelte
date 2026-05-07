import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	buildCatalogExportBundle,
	toCsvFromProducts,
	toXlsxBufferFromProducts
} from '$lib/server/catalog/catalog-transfer';
import { getCatalogProductImageSlots, listAllCatalogProducts } from '$lib/server/catalog/repo';
import { assertSuperstore } from '$lib/server/superstore/access';
import type { CatalogExportProductRow } from '$lib/superstore/schemas';

type ExportFormat = 'json' | 'csv' | 'xlsx';

function parseFormat(raw: string | null): ExportFormat {
	const v = (raw ?? 'json').trim().toLowerCase();
	if (v === 'json' || v === 'csv' || v === 'xlsx') return v;
	throw error(400, 'Invalid export format');
}

export const GET: RequestHandler = async (event) => {
	assertSuperstore(event);
	const format = parseFormat(event.url.searchParams.get('format'));

	const rows = await listAllCatalogProducts();
	const products: CatalogExportProductRow[] = [];
	for (const r of rows) {
		const imageSlots = await getCatalogProductImageSlots(r.id);
		products.push({
			slug: r.slug,
			sku: r.sku,
			name: r.name,
			country: r.country,
			region: r.region,
			cat: r.cat as CatalogExportProductRow['cat'],
			age: r.age,
			abv: r.abv,
			price: r.price,
			rating: r.rating,
			badge: (r.badge ?? '') as CatalogExportProductRow['badge'],
			desc: r.desc,
			stockQty: r.stockQty,
			published: r.published,
			detailPayload: r.detailPayload ?? null,
			imageSlots
		});
	}

	const safe = new Date().toISOString().slice(0, 10);

	if (format === 'json') {
		const body = JSON.stringify(buildCatalogExportBundle(products), null, 2);
		return new Response(body, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Content-Disposition': `attachment; filename="rosvelte-catalog-export-${safe}.json"`
			}
		});
	}

	if (format === 'csv') {
		const csv = toCsvFromProducts(products);
		return new Response(csv, {
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': `attachment; filename="rosvelte-catalog-export-${safe}.csv"`
			}
		});
	}

	const xlsx = toXlsxBufferFromProducts(products);
	return new Response(new Uint8Array(xlsx), {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="rosvelte-catalog-export-${safe}.xlsx"`
		}
	});
};
