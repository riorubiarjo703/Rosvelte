import { markStorefrontOrderPaidByExternalId, markStorefrontOrderPaymentStatus } from '$lib/server/orders/repo';
import { json } from '@sveltejs/kit';
import { timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

function safeEq(a: string, b: string): boolean {
	const ba = Buffer.from(a, 'utf8');
	const bb = Buffer.from(b, 'utf8');
	if (ba.length !== bb.length) return false;
	return timingSafeEqual(ba, bb);
}

export const POST: RequestHandler = async ({ request }) => {
	const expected = env.XENDIT_WEBHOOK_TOKEN?.trim();
	const token = request.headers.get('x-callback-token');
	if (!expected || !token || !safeEq(token, expected)) {
		return new Response('Unauthorized', { status: 401 });
	}

	let body: Record<string, unknown>;
	try {
		body = (await request.json()) as Record<string, unknown>;
	} catch {
		return new Response('Bad Request', { status: 400 });
	}

	const externalRaw = body.externalId ?? body.external_id;
	const statusRaw = body.status ?? body.Status;
	const externalId = typeof externalRaw === 'string' ? externalRaw : null;
	const status =
		typeof statusRaw === 'string' ? statusRaw.trim().toUpperCase() : '';

	if (!externalId) {
		return json({ ok: false }, { status: 400 });
	}

	if (status === 'PAID' || status === 'SETTLED') {
		await markStorefrontOrderPaidByExternalId(externalId);
		return json({ ok: true });
	}

	if (status === 'EXPIRED') {
		await markStorefrontOrderPaymentStatus(externalId, 'expired');
		return json({ ok: true });
	}

	return json({ ok: true });
};
