/**
 * Seeds `catalog_product` from legacy static demo data (+ Macallan rich JSON).
 * Run: npm run db:seed:catalog
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { mmsCollectionProducts } from '../src/lib/data/mms-collection-products';
import { mmsMacallan18DetailPayload } from '../src/lib/data/mms-product-detail';
import * as schema from '../src/lib/server/db/schema';
import { slugifyCatalog } from '../src/lib/server/catalog/slugify-catalog';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function main() {
	await db.delete(schema.catalogProduct);

	const now = new Date();
	await db.insert(schema.catalogProduct).values(
		mmsCollectionProducts.map((p) => ({
			slug: slugifyCatalog(`${p.name}-${p.id}`),
			sku: `MMS-SEED-${p.id}`,
			name: p.name,
			country: p.country,
			region: p.region,
			cat: p.cat,
			age: p.age,
			abv: p.abv,
			price: p.price,
			rating: p.rating,
			badge: p.badge ?? '',
			desc: p.desc,
			stockQty: 12 + (p.id % 9),
			published: true,
			heroImageUploadId: null,
			detailPayload: p.id === 6 ? mmsMacallan18DetailPayload() : null,
			updatedAt: now
		}))
	);

	console.log(`Seeded ${mmsCollectionProducts.length} catalog_product rows.`);
	await client.end({ timeout: 5 });
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
