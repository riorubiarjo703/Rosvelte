import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { assertSuperstore } from '$lib/server/superstore/access';
import { deleteJournalPostById, listJournalPostsForAdmin } from '$lib/server/journal/repo';
import { journalPostDeleteSchema } from '$lib/superstore/schemas';

export const load: PageServerLoad = async (event) => {
	assertSuperstore(event);
	try {
		const journalPosts = await listJournalPostsForAdmin();
		return { journalPosts };
	} catch (e) {
		console.error('[superstore/journal] load failed', e);
		throw error(
			503,
			'Could not load journal posts from the database. Confirm DATABASE_URL, run npm run db:push then npm run db:seed:journal, then retry.'
		);
	}
};

export const actions: Actions = {
	deleteJournalPost: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const parsed = journalPostDeleteSchema.safeParse({ id: fd.get('id') });
		if (!parsed.success) return fail(400, { message: 'Invalid id' });
		await deleteJournalPostById(parsed.data.id);
		throw redirect(303, event.url.pathname);
	}
};
