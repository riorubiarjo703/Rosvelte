import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	deleteJournalPostById,
	getJournalPostById,
	slugAndPublishedFromForm,
	updateJournalPostById
} from '$lib/server/journal/repo';
import { assertSuperstore } from '$lib/server/superstore/access';
import { JOURNAL_CATEGORY_TABS, type JournalArticleCat } from '$lib/data/mms-journal';
import { journalPostDeleteSchema, journalPostUpdateSchema } from '$lib/superstore/schemas';
import { tagsFromCommaList } from '$lib/server/journal/shared';

function catLabelFromId(catId: string) {
	const label = JOURNAL_CATEGORY_TABS.find((t) => t.id === catId)?.label;
	return typeof label === 'string' ? label : '';
}

export const load: PageServerLoad = async (event) => {
	assertSuperstore(event);
	const id = Number.parseInt(event.params.id, 10);
	if (!Number.isFinite(id) || id < 1) error(404, 'Not found');

	const row = await getJournalPostById(id);
	if (!row) error(404, 'Not found');

	return {
		fields: {
			id: row.id,
			legacyArticleId: row.legacyArticleId,
			title: row.title,
			cat: row.cat as JournalArticleCat,
			author: row.author,
			excerpt: row.excerpt,
			adminDateDisplay: row.adminDateDisplay,
			readTime: row.readTime,
			tags: Array.isArray(row.tags) ? row.tags.join(', ') : '',
			featured: row.featured,
			wide: row.wide,
			viewsCount: row.viewsCount,
			status: row.status as 'active' | 'pending' | 'out',
			slug: row.slug
		}
	};
};

export const actions: Actions = {
	updatePost: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const parsed = journalPostUpdateSchema.safeParse(Object.fromEntries(fd.entries()));
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors, message: 'Check the form fields.' });
		}

		const existing = await getJournalPostById(parsed.data.id);
		if (!existing) return fail(404, { errors: {}, message: 'Journal post was not found.' });

		const catLabel = catLabelFromId(parsed.data.cat);
		if (!catLabel) {
			return fail(400, { errors: {}, message: 'Pick a category from the supplied list.' });
		}

		const tags = tagsFromCommaList(parsed.data.tags);
		const { slug, publishedAt } = slugAndPublishedFromForm(
			parsed.data.title,
			existing.legacyArticleId,
			parsed.data.adminDateDisplay
		);

		await updateJournalPostById(existing.id, {
			slug,
			title: parsed.data.title,
			cat: parsed.data.cat,
			catLabel,
			author: parsed.data.author,
			excerpt: parsed.data.excerpt,
			adminDateDisplay: parsed.data.adminDateDisplay,
			readTime: parsed.data.readTime,
			tags,
			featured: parsed.data.featured,
			wide: parsed.data.wide,
			viewsCount: parsed.data.viewsCount,
			status: parsed.data.status,
			publishedAt
		});

		throw redirect(303, event.url.pathname);
	},

	deletePost: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const parsed = journalPostDeleteSchema.safeParse({ id: fd.get('id') });
		if (!parsed.success) return fail(400, { errors: {}, message: 'Invalid id' });

		await deleteJournalPostById(parsed.data.id);
		throw redirect(303, '/superstore/journal');
	}
};
