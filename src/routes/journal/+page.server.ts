import type { PageServerLoad } from './$types';
import { loadJournalPayloadForSite } from '$lib/server/journal/repo';
import { mmsJournal } from '$lib/data/mms-journal';

export const load: PageServerLoad = async () => {
	try {
		const fromDb = await loadJournalPayloadForSite();
		if (fromDb) {
			return { articles: fromDb.articles, featured: fromDb.featured, source: 'db' as const };
		}
	} catch (e) {
		console.warn('[journal] Falling back to static JSON:', e);
	}
	return {
		articles: mmsJournal.articles,
		featured: mmsJournal.featured,
		source: 'static' as const
	};
};
