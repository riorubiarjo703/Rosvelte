import { z } from 'zod';
import {
	ALLOWED_PREFERRED_LANGUAGES,
	ALLOWED_SPIRIT_PREFERENCES,
	isValidCustomerPhone
} from '$lib/server/customer-profile-validation';

function queryInt(min: number, max: number, fallback: number) {
	return z.preprocess((v) => {
		if (v === undefined || v === null || v === '') return fallback;
		const n = typeof v === 'number' ? v : Number(v);
		if (!Number.isFinite(n)) return fallback;
		const i = Math.trunc(n);
		return Math.min(max, Math.max(min, i));
	}, z.int().min(min).max(max));
}

export const taskSortFieldSchema = z.enum(['id', 'title', 'priority']);

export const taskListQuerySchema = z.object({
	page: queryInt(1, 10_000, 1),
	pageSize: queryInt(5, 100, 20),
	q: z.preprocess((v) => (v == null ? '' : String(v).trim().slice(0, 200)), z.string()),
	sort: z.preprocess(
		(v) => (v === undefined || v === null || v === '' ? 'id' : v),
		taskSortFieldSchema
	),
	order: z.preprocess(
		(v) => (v === undefined || v === null || v === '' ? 'desc' : v),
		z.enum(['asc', 'desc'])
	)
});

export const taskCreateSchema = z.object({
	title: z.string().trim().min(1, 'Title required').max(500),
	priority: z.preprocess(
		(v) => (v === undefined || v === null || v === '' ? 1 : Number(v)),
		z.int().min(1).max(5)
	)
});

export const taskUpdateSchema = taskCreateSchema.extend({
	id: z.preprocess((v) => Number(v), z.int().positive())
});

export const taskDeleteSchema = z.object({
	id: z.preprocess((v) => Number(v), z.int().positive())
});

const uploadMime = z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

export const uploadFormSchema = z.object({
	file: z
		.instanceof(File)
		.refine((f) => f.size > 0, 'Choose a file')
		.refine((f) => uploadMime.safeParse(f.type).success, 'Allowed: JPEG, PNG, WebP, PDF')
});

export type TaskListQuery = z.infer<typeof taskListQuerySchema>;

const catalogCatSchema = z.enum(['scotch', 'cognac', 'japanese', 'tequila', 'rum', 'other']);

const catalogBadgeSchema = z.enum(['', 'rare', 'new', 'limited', 'exclusive']);

function coalesceInt(min: number, max: number, fallback: number) {
	return z.preprocess((v) => {
		if (v === undefined || v === null || v === '') return fallback;
		const n = typeof v === 'number' ? v : Number(v);
		if (!Number.isFinite(n)) return fallback;
		const i = Math.trunc(n);
		return Math.min(max, Math.max(min, i));
	}, z.int().min(min).max(max));
}

/** Superstore catalogue form (shared create/update fields). */
export const catalogProductFormSchema = z.object({
	name: z.string().trim().min(1, 'Name required').max(300),
	slug: z.preprocess((v) => (v == null ? '' : String(v).trim()), z.string().max(200)),
	sku: z.string().trim().min(1, 'SKU required').max(120),
	country: z.string().trim().min(1).max(120),
	region: z.string().trim().min(1).max(120),
	cat: catalogCatSchema,
	age: z.string().trim().max(32),
	abv: z.string().trim().max(16),
	price: coalesceInt(0, 2_000_000_000, 0),
	rating: coalesceInt(0, 100, 0),
	badge: z.preprocess((v) => (v === '' || v == null ? '' : v), catalogBadgeSchema),
	desc: z.string().trim().min(1, 'Description required').max(8000),
	stockQty: coalesceInt(0, 1_000_000, 0),
	published: z.preprocess((v) => v === 'on' || v === true || v === 'true' || v === '1', z.boolean()),
	detailJson: z.preprocess((v) => (v == null ? '' : String(v)), z.string())
});

export const catalogProductCreateSchema = catalogProductFormSchema;

export const catalogProductUpdateSchema = catalogProductFormSchema.extend({
	id: z.preprocess((v) => Number(v), z.int().positive())
});

export const catalogProductDeleteSchema = z.object({
	id: z.preprocess((v) => Number(v), z.int().positive())
});

/** One row in exported `catalog-export-v1.json` (import uses the same shape). */
export const catalogExportProductSchema = z.object({
	slug: z.string().trim().max(200),
	sku: z.string().trim().min(1).max(120),
	name: z.string().trim().min(1).max(300),
	country: z.string().trim().min(1).max(120),
	region: z.string().trim().min(1).max(120),
	cat: catalogCatSchema,
	age: z.preprocess((v) => String(v ?? '').trim().slice(0, 32), z.string().max(32)),
	abv: z.preprocess((v) => String(v ?? '').trim().slice(0, 16), z.string().max(16)),
	price: coalesceInt(0, 2_000_000_000, 0),
	rating: coalesceInt(0, 100, 0),
	badge: z.preprocess((v) => (v === '' || v == null ? '' : v), catalogBadgeSchema),
	desc: z.string().trim().min(1).max(8000),
	stockQty: coalesceInt(0, 1_000_000, 0),
	published: z.boolean(),
	/** Optional in imports; when omitted or null, PDP detail falls back to generated content. */
	detailPayload: z.unknown().nullable().optional().default(null),
	imageSlots: z.array(z.union([z.number().int().positive(), z.null()])).optional()
});

export const catalogImportFileSchema = z.object({
	version: z.literal(1),
	exportedAt: z.string().optional(),
	products: z.array(catalogExportProductSchema)
});

export type CatalogExportProductRow = z.infer<typeof catalogExportProductSchema>;
export type CatalogProductFormInput = z.infer<typeof catalogProductFormSchema>;

export const customerAdminUpdateSchema = z.object({
	id: z.string().trim().min(1).max(120),
	name: z.string().trim().min(1, 'Name required').max(300),
	phone: z
		.preprocess((v) => (v == null ? '' : String(v).trim()), z.string().max(60))
		.refine((v) => isValidCustomerPhone(v), 'Phone must contain only numbers and +()-.'),
	birthDate: z.preprocess((v) => (v == null ? '' : String(v).trim()), z.string().max(20)),
	preferredLanguage: z
		.preprocess((v) => (v == null ? '' : String(v).trim()), z.string().max(60))
		.refine(
			(v) =>
				v === '' ||
				ALLOWED_PREFERRED_LANGUAGES.includes(
					v as (typeof ALLOWED_PREFERRED_LANGUAGES)[number]
				),
			'Choose a valid language option.'
		),
	spiritPreference: z
		.preprocess((v) => (v == null ? '' : String(v).trim()), z.string().max(120))
		.refine(
			(v) =>
				v === '' ||
				ALLOWED_SPIRIT_PREFERENCES.includes(
					v as (typeof ALLOWED_SPIRIT_PREFERENCES)[number]
				),
			'Choose a valid spirit preference option.'
		),
	emailVerified: z.preprocess((v) => v === 'on' || v === true || v === 'true' || v === '1', z.boolean())
});

export const journalArticleCatSchema = z.enum([
	'tasting',
	'distillery',
	'guide',
	'history',
	'pairing',
	'howto'
]);

export const journalStatusSchema = z.enum(['active', 'pending', 'out']);

export const journalPostDeleteSchema = z.object({
	id: z.preprocess((v) => Number(v), z.number().int().positive())
});

export const journalPostUpdateSchema = z.object({
	id: z.preprocess((v) => Number(v), z.number().int().positive()),
	title: z.string().trim().min(1).max(500),
	cat: journalArticleCatSchema,
	author: z.string().trim().min(1).max(200),
	excerpt: z.string().trim().min(1).max(12000),
	adminDateDisplay: z.string().trim().min(1).max(120),
	readTime: z.string().trim().min(1).max(48),
	tags: z.preprocess((v) => (v == null ? '' : String(v)), z.string()),
	featured: z.preprocess((v) => v === 'on' || v === true || v === 'true', z.boolean()),
	wide: z.preprocess((v) => v === 'on' || v === true || v === 'true', z.boolean()),
	viewsCount: z.preprocess((v) => Number(v), z.number().int().min(0).max(99_999_999)),
	status: journalStatusSchema
});
