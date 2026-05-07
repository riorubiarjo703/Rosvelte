import { error } from '@sveltejs/kit';
import type { JournalArticle } from '$lib/data/mms-journal';
import { mmsJournal } from '$lib/data/mms-journal';
import {
	getActiveJournalPostById,
	journalRowToArticle,
	loadJournalPayloadForSite
} from '$lib/server/journal/repo';
import type { PageServerLoad } from './$types';

function buildRelatedArticles(pool: JournalArticle[], article: JournalArticle): JournalArticle[] {
	return pool
		.filter((item) => item.id !== article.id)
		.sort((a, b) => {
			const aSameCat = a.cat === article.cat ? 1 : 0;
			const bSameCat = b.cat === article.cat ? 1 : 0;
			return bSameCat - aSameCat;
		})
		.slice(0, 3);
}

export const load: PageServerLoad = async ({ params }) => {
	const id = Number.parseInt(params.id, 10);
	if (!Number.isFinite(id) || id < 1) error(404, 'Journal article not found');

	let article: JournalArticle | null = null;
	let source: 'db' | 'static' = 'static';
	let relatedPool: JournalArticle[] = [];

	try {
		const row = await getActiveJournalPostById(id);
		if (row) {
			article = journalRowToArticle(row);
			source = 'db';
			const payload = await loadJournalPayloadForSite();
			relatedPool = payload?.articles ?? [];
		}
	} catch (e) {
		console.warn('[journal-detail] Falling back to static JSON:', e);
	}

	if (!article) {
		article = mmsJournal.articles.find((entry) => entry.id === id) ?? null;
		relatedPool = mmsJournal.articles;
	}

	if (!article) error(404, 'Journal article not found');

	return {
		article,
		related: buildRelatedArticles(relatedPool, article),
		source
	};
};
