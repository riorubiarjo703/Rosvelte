/** Maps Xendit SDK errors to storefront-safe checkout messages (no secrets). */
export function mapXenditCheckoutError(err: unknown): string {
	if (err !== null && typeof err === 'object') {
		const code =
			'errorCode' in err ? String((err as { errorCode?: unknown }).errorCode ?? '') : '';
		if (code === 'REQUEST_FORBIDDEN_ERROR') {
			return (
				'Xendit blocked creating an invoice: this secret key does not have permission to use the Invoice API. ' +
				'In the Xendit Dashboard, open your API key and enable Invoice (and any related permissions). ' +
				'Test vs production keys must both be granted access separately.'
			);
		}
		const msg =
			'errorMessage' in err ? String((err as { errorMessage?: unknown }).errorMessage ?? '') : '';
		if (msg && msg.length > 0 && msg.length < 500) {
			return msg;
		}
	}
	if (err instanceof Error && err.message.includes('not configured')) {
		return 'Payments are not configured on this environment.';
	}
	return 'Could not start payment. Try again.';
}
