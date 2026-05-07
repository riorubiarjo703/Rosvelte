/** Birth date as calendar day only (YYYY-MM-DD from `<input type="date">`). */
export function parseBirthDateInput(raw: string): Date | null {
	const t = raw?.trim();
	if (!t) return null;
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
	if (!m) return null;
	const y = Number(m[1]);
	const mo = Number(m[2]) - 1;
	const d = Number(m[3]);
	const dt = new Date(y, mo, d);
	if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
	return dt;
}

/** True if the person has reached `minAge` full calendar years by `asOf` (local calendar). */
export function isAtLeastAge(birthDate: Date, minAge: number, asOf = new Date()): boolean {
	const threshold = new Date(
		birthDate.getFullYear() + minAge,
		birthDate.getMonth(),
		birthDate.getDate()
	);
	return asOf >= threshold;
}

export const MIN_CUSTOMER_AGE = 21;
