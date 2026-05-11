/**
 * Seeds `storefront_order` from legacy admin demo order rows.
 * Run: npm run db:seed:orders
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema';
import { demoOrders } from '../src/lib/superstore/mms-admin-demo-data';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

const TOTAL_IDR: Record<string, number> = {
	'#ORD-2842': 5_800_000,
	'#ORD-2841': 7_200_000,
	'#ORD-2840': 2_200_000,
	'#ORD-2839': 4_200_000,
	'#ORD-2838': 1_800_000,
	'#ORD-2837': 850_000
};

function orderCodeFromDemoId(id: string): string {
	return id.replace(/^#/, '').trim().toUpperCase();
}

function parseRelativeDate(label: string, index: number): Date {
	const now = new Date();
	const dayMs = 24 * 60 * 60 * 1000;
	if (label.startsWith('Today')) {
		return new Date(now.getTime() - index * 60 * 60 * 1000);
	}
	if (label.startsWith('Yesterday')) {
		return new Date(now.getTime() - dayMs - index * 30 * 60 * 1000);
	}
	if (label.includes('2 days')) {
		return new Date(now.getTime() - 2 * dayMs);
	}
	return new Date(now.getTime() - (3 + index) * dayMs);
}

async function main() {
	await db.delete(schema.storefrontOrder);

	const now = new Date();
	let i = 0;
	for (const o of demoOrders) {
		const orderCode = orderCodeFromDemoId(o.id);
		const totalIdr = TOTAL_IDR[o.id] ?? 0;
		await db.insert(schema.storefrontOrder).values({
			orderCode,
			customerName: o.customer,
			customerEmail: `${o.customer.toLowerCase().replace(/\s+/g, '.')}@example.com`,
			productSummary: o.product,
			totalIdr,
			currency: 'IDR',
			status: o.status,
			orderedAt: parseRelativeDate(o.date, i),
			updatedAt: now
		});
		i += 1;
	}

	console.log(`Seeded ${demoOrders.length} storefront_order rows.`);
	await client.end({ timeout: 5 });
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
