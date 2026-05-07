/** Same-origin path only — blocks protocol-relative and external URLs. */
export function safeInternalPath(raw: string | null | undefined): string | null {
	if (raw == null || raw === '') return null;
	if (!raw.startsWith('/') || raw.startsWith('//')) return null;
	return raw;
}
