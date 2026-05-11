import type { ZodError } from 'zod';

/** Single-line validation errors for import/export row feedback. */
export function formatZodIssues(err: ZodError): string {
	return err.issues.map((issue) => `${issue.path.map(String).join('.') || 'row'}: ${issue.message}`).join('; ');
}
