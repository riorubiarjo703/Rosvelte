import type { JournalExportPostRow } from '$lib/superstore/schemas';
import { getJournalPostByLegacyId, saveJournalPostFromImport } from '$lib/server/journal/repo';

export async function runJournalImport(
	posts: JournalExportPostRow[]
): Promise<{ created: number; updated: number; errors: string[] }> {
	const errors: string[] = [];
	let created = 0;
	let updated = 0;

	let index = 0;
	for (const row of posts) {
		index += 1;
		try {
			const existed = await getJournalPostByLegacyId(row.legacyArticleId);
			await saveJournalPostFromImport(row);
			if (existed) updated += 1;
			else created += 1;
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			errors.push(`#${index} legacy ${row.legacyArticleId}: ${msg}`);
		}
	}

	return { created, updated, errors };
}
