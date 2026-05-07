export const ALLOWED_PREFERRED_LANGUAGES = ['English', 'Bahasa Indonesia', '日本語'] as const;

export const ALLOWED_SPIRIT_PREFERENCES = [
	'Scotch whisky — sherry cask',
	'Scotch whisky — bourbon cask',
	'Bourbon & rye',
	'Irish whiskey',
	'Japanese whisky',
	'World whisky'
] as const;

const PHONE_REGEX = /^[+0-9()\-. ]{8,20}$/;

export function isValidCustomerPhone(phone: string): boolean {
	if (!phone) return true;
	return PHONE_REGEX.test(phone);
}

export function isAllowedPreferredLanguage(value: string): boolean {
	if (!value) return true;
	return ALLOWED_PREFERRED_LANGUAGES.includes(value as (typeof ALLOWED_PREFERRED_LANGUAGES)[number]);
}

export function isAllowedSpiritPreference(value: string): boolean {
	if (!value) return true;
	return ALLOWED_SPIRIT_PREFERENCES.includes(value as (typeof ALLOWED_SPIRIT_PREFERENCES)[number]);
}
