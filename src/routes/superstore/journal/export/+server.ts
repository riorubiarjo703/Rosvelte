import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	buildJournalExportBundle,
	journalRowToExportPost,
	toCsvFromJournalPosts,
	toXlsxBufferFromJournalPosts
} from '$lib/server/journal/journal-transfer';
import { listAllJournalRowsForExport } from '$lib/server/journal/repo';
import { assertSuperstore } from '$lib/server/superstore/access';
import type { JournalExportPostRow } from '$lib/superstore/schemas';

type ExportFormat = 'json' | 'csv' | 'xlsx';

function parseFormat(raw: string | null): ExportFormat {
	const v = (raw ?? 'json').trim().toLowerCase();
	if (v === 'json' || v === 'csv' || v === 'xlsx') return v;
	throw error(400, 'Invalid export format');
}

export const GET: RequestHandler = async (event) => {
	assertSuperstore(event);
	const format = parseFormat(event.url.searchParams.get('format'));

	const dbRows = await listAllJournalRowsForExport();
	const posts: JournalExportPostRow[] = dbRows.map(journalRowToExportPost);

	const safe = new Date().toISOString().slice(0, 10);

	if (format === 'json') {
		const body = JSON.stringify(buildJournalExportBundle(posts), null, 2);
		return new Response(body, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Content-Disposition': `attachment; filename="rosvelte-journal-export-${safe}.json"`
			}
		});
	}

	if (format === 'csv') {
		return new Response(toCsvFromJournalPosts(posts), {
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': `attachment; filename="rosvelte-journal-export-${safe}.csv"`
			}
		});
	}

	const xlsx = toXlsxBufferFromJournalPosts(posts);
	return new Response(new Uint8Array(xlsx), {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="rosvelte-journal-export-${safe}.xlsx"`
		}
	});
};
