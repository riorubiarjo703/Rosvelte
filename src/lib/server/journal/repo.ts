import { desc, eq, ne } from 'drizzle-orm';
import { db } from '$lib/server/db';
import type { JournalFeatured, JournalArticle, JournalArticleCat } from '$lib/data/mms-journal';
import type { JournalStatus } from '$lib/superstore/mms-admin-demo-data';
import type { JournalExportPostRow } from '$lib/superstore/schemas';
import { journalPost } from '$lib/server/db/schema';
import { authorInitials, formatJournalViews, parseJournalDisplayDate, slugForJournalArticle } from '$lib/server/journal/shared';

export type JournalRow = typeof journalPost.$inferSelect;

export type AdminJournalPostRow = {
	id: number;
	title: string;
	category: string;
	author: string;
	date: string;
	views: string;
	status: JournalStatus;
};

const JOURNAL_CATS: JournalArticleCat[] = [
	'tasting',
	'distillery',
	'guide',
	'history',
	'pairing',
	'howto'
];

function asArticleCat(cat: string): JournalArticleCat {
	return (JOURNAL_CATS.includes(cat as JournalArticleCat) ? cat : 'tasting') as JournalArticleCat;
}

export function journalRowToArticle(r: JournalRow): JournalArticle {
	const tags = Array.isArray(r.tags) ? r.tags : [];
	return {
		id: r.id,
		cat: asArticleCat(r.cat),
		catLabel: r.catLabel,
		title: r.title,
		excerpt: r.excerpt,
		author: r.author,
		initials: authorInitials(r.author),
		date: r.adminDateDisplay,
		read: r.readTime,
		tags,
		wide: r.wide,
		featured: r.featured
	};
}

export function journalRowToFeatured(r: JournalRow): JournalFeatured {
	return {
		catLabel: r.catLabel,
		title: r.title,
		excerpt: r.excerpt,
		author: r.author,
		initials: authorInitials(r.author),
		date: r.adminDateDisplay,
		read: r.readTime,
		cat: asArticleCat(r.cat)
	};
}

/** Active posts shown on `/journal`; excludes pending/draft workflow states (`pending` | `out`). */
export async function loadJournalPayloadForSite(): Promise<{
	articles: JournalArticle[];
	featured: JournalFeatured;
} | null> {
	const rows = await db
		.select()
		.from(journalPost)
		.where(eq(journalPost.status, 'active'))
		.orderBy(desc(journalPost.publishedAt), desc(journalPost.legacyArticleId));

	if (rows.length === 0) return null;

	const articles = rows.map(journalRowToArticle);
	const featuredRow = rows.find((r) => r.featured) ?? rows[0]!;
	const featured = journalRowToFeatured(featuredRow);
	return { articles, featured };
}

export async function listJournalPostsForAdmin(): Promise<AdminJournalPostRow[]> {
	const rows = await db
		.select()
		.from(journalPost)
		.orderBy(desc(journalPost.publishedAt), desc(journalPost.legacyArticleId));

	return rows.map((r) => ({
		id: r.id,
		title: r.title,
		category: r.catLabel,
		author: r.author,
		date:
			r.adminDateDisplay ||
			(r.publishedAt
				? r.publishedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
				: '—'),
		views: formatJournalViews(r.viewsCount),
		status: r.status as JournalStatus
	}));
}

export async function getJournalPostById(id: number): Promise<JournalRow | null> {
	const [row] = await db.select().from(journalPost).where(eq(journalPost.id, id)).limit(1);
	return row ?? null;
}

export async function getJournalPostByLegacyId(legacyArticleId: number): Promise<JournalRow | null> {
	const [row] = await db
		.select()
		.from(journalPost)
		.where(eq(journalPost.legacyArticleId, legacyArticleId))
		.limit(1);
	return row ?? null;
}

export async function listAllJournalRowsForExport(): Promise<JournalRow[]> {
	return db
		.select()
		.from(journalPost)
		.orderBy(desc(journalPost.publishedAt), desc(journalPost.legacyArticleId));
}

export async function getActiveJournalPostById(id: number): Promise<JournalRow | null> {
	const [row] = await db
		.select()
		.from(journalPost)
		.where(eq(journalPost.id, id))
		.limit(1);

	if (!row || row.status !== 'active') return null;
	return row;
}

export async function updateJournalPostById(
	postId: number,
	fields: {
		slug: string;
		title: string;
		cat: JournalArticleCat;
		catLabel: string;
		author: string;
		excerpt: string;
		adminDateDisplay: string;
		readTime: string;
		tags: string[];
		featured: boolean;
		wide: boolean;
		viewsCount: number;
		status: JournalStatus;
		publishedAt: Date | null;
	}
): Promise<void> {
	await db.transaction(async (tx) => {
		if (fields.featured) {
			await tx.update(journalPost).set({ featured: false }).where(ne(journalPost.id, postId));
		}
		await tx
			.update(journalPost)
			.set({
				slug: fields.slug,
				title: fields.title,
				cat: fields.cat,
				catLabel: fields.catLabel,
				author: fields.author,
				excerpt: fields.excerpt,
				adminDateDisplay: fields.adminDateDisplay,
				readTime: fields.readTime,
				tags: fields.tags,
				featured: fields.featured,
				wide: fields.wide,
				viewsCount: fields.viewsCount,
				status: fields.status,
				publishedAt: fields.publishedAt,
				updatedAt: new Date()
			})
			.where(eq(journalPost.id, postId));
	});
}

export async function deleteJournalPostById(id: number): Promise<void> {
	await db.delete(journalPost).where(eq(journalPost.id, id));
}

/** Create or update by `legacyArticleId` (staff export/import). */
export async function saveJournalPostFromImport(row: JournalExportPostRow): Promise<void> {
	const publishedAtRaw =
		row.publishedAtIso && row.publishedAtIso.length > 0
			? new Date(row.publishedAtIso)
			: parseJournalDisplayDate(row.adminDateDisplay);
	const publishedAt =
		publishedAtRaw && !Number.isNaN(publishedAtRaw.getTime()) ? publishedAtRaw : null;

	const tags = Array.isArray(row.tags) ? row.tags : [];
	const status = row.status as JournalStatus;

	const existing = await getJournalPostByLegacyId(row.legacyArticleId);

	if (existing) {
		await updateJournalPostById(existing.id, {
			slug: row.slug,
			title: row.title,
			cat: row.cat as JournalArticleCat,
			catLabel: row.catLabel,
			author: row.author,
			excerpt: row.excerpt,
			adminDateDisplay: row.adminDateDisplay,
			readTime: row.readTime,
			tags,
			featured: row.featured,
			wide: row.wide,
			viewsCount: row.viewsCount,
			status,
			publishedAt
		});
		return;
	}

	await db.transaction(async (tx) => {
		const [ins] = await tx
			.insert(journalPost)
			.values({
				legacyArticleId: row.legacyArticleId,
				slug: row.slug,
				title: row.title,
				cat: row.cat,
				catLabel: row.catLabel,
				author: row.author,
				excerpt: row.excerpt,
				adminDateDisplay: row.adminDateDisplay,
				readTime: row.readTime,
				tags,
				featured: row.featured,
				wide: row.wide,
				viewsCount: row.viewsCount,
				status: row.status,
				publishedAt,
				updatedAt: new Date()
			})
			.returning({ id: journalPost.id });

		if (!ins) throw new Error('Journal insert failed');

		if (row.featured) {
			await tx.update(journalPost).set({ featured: false }).where(ne(journalPost.id, ins.id));
			await tx.update(journalPost).set({ featured: true }).where(eq(journalPost.id, ins.id));
		}
	});
}

export function slugAndPublishedFromForm(
	title: string,
	legacyArticleId: number,
	adminDateDisplay: string
): { slug: string; publishedAt: Date | null } {
	const publishedAt = parseJournalDisplayDate(adminDateDisplay);
	return { slug: slugForJournalArticle(title, legacyArticleId), publishedAt };
}
