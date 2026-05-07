import type { PageServerLoad } from './$types';
import { loadJournalPayloadForSite } from '$lib/server/journal/repo';
import { mmsJournal } from '$lib/data/mms-journal';

export const load: PageServerLoad = async () => {
	try {
		const fromDb = await loadJournalPayloadForSite();
		if (fromDb) {
			const featuredId = fromDb.articles.find((a) => a.title === fromDb.featured.title)?.id ?? null;
			return {
				articles: fromDb.articles,
				featured: fromDb.featured,
				featuredId,
				source: 'db' as const
			};
		}
	} catch (e) {
		console.warn('[journal] Falling back to static JSON:', e);
	}
	const featuredId = mmsJournal.articles.find((a) => a.title === mmsJournal.featured.title)?.id ?? null;
	return {
		articles: mmsJournal.articles,
		featured: mmsJournal.featured,
		featuredId,
		source: 'static' as const
	};
};
