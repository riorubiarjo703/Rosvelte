/**
 * Seeds `journal_post` from `src/lib/data/mms-journal.json` (via `mmsJournal` module).
 * Idempotent per `legacy_article_id`. Run: npm run db:seed:journal
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema';
import { mmsJournal } from '../src/lib/data/mms-journal';
import {
	parseJournalDisplayDate,
	seededViewsFromArticleId,
	slugForJournalArticle
} from '../src/lib/server/journal/shared';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function main() {
	const now = new Date();
	let n = 0;
	for (const a of mmsJournal.articles) {
		const publishedAt = parseJournalDisplayDate(a.date);
		const slug = slugForJournalArticle(a.title, a.id);
		const row = {
			legacyArticleId: a.id,
			slug,
			title: a.title,
			cat: a.cat,
			catLabel: a.catLabel,
			author: a.author,
			excerpt: a.excerpt,
			adminDateDisplay: a.date,
			readTime: a.read,
			tags: a.tags ?? [],
			featured: a.featured ?? false,
			wide: a.wide ?? false,
			viewsCount: seededViewsFromArticleId(a.id),
			status: 'active',
			publishedAt,
			updatedAt: now
		};
		await db.insert(schema.journalPost).values(row).onConflictDoUpdate({
			target: schema.journalPost.legacyArticleId,
			set: {
				slug: row.slug,
				title: row.title,
				cat: row.cat,
				catLabel: row.catLabel,
				author: row.author,
				excerpt: row.excerpt,
				adminDateDisplay: row.adminDateDisplay,
				readTime: row.readTime,
				tags: row.tags,
				featured: row.featured,
				wide: row.wide,
				viewsCount: row.viewsCount,
				status: row.status,
				publishedAt: row.publishedAt,
				updatedAt: row.updatedAt
			}
		});
		n += 1;
	}
	console.log(`Upserted ${n} journal_post rows from mmsJournal.articles.`);
	await client.end({ timeout: 5 });
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
