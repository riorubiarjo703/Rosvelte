import { Xendit } from 'xendit-node';
import { resolveXenditSecretKey } from '$lib/server/superstore/payment-config';

export async function getXenditClient(): Promise<Xendit | null> {
	const secretKey = await resolveXenditSecretKey();
	if (!secretKey) return null;
	return new Xendit({ secretKey });
}
