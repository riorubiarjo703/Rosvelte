import { Xendit } from 'xendit-node';
import { env } from '$env/dynamic/private';

export function getXenditSecretKey(): string | undefined {
	const key = env.XENDIT_SECRET_KEY?.trim();
	return key || undefined;
}

export function getXenditClient(): Xendit | null {
	const secretKey = getXenditSecretKey();
	if (!secretKey) return null;
	return new Xendit({ secretKey });
}
