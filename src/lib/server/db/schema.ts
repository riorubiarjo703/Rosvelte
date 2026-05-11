import type { MmsProductDetailPayload } from '$lib/data/mms-product-detail';
import { sql } from 'drizzle-orm';
import { pgTable, serial, integer, text, timestamp, boolean, jsonb, unique } from 'drizzle-orm/pg-core';

/** One line item persisted on paid/pending checkout orders (`storefront_order.lines_payload`). */
export type StorefrontOrderLinePayload = {
	productId: number;
	sku: string;
	name: string;
	qty: number;
	unitPriceIdr: number;
	lineTotalIdr: number;
	country: string;
	region: string;
};

/** Storefront orders (admin list, export/import, Xendit checkout). */
export const storefrontOrder = pgTable('storefront_order', {
	id: serial('id').primaryKey(),
	orderCode: text('order_code').notNull().unique(),
	customerName: text('customer_name').notNull(),
	customerEmail: text('customer_email').notNull(),
	phone: text('phone'),
	productSummary: text('product_summary').notNull(),
	totalIdr: integer('total_idr').notNull(),
	subtotalIdr: integer('subtotal_idr').notNull().default(0),
	promoDiscountIdr: integer('promo_discount_idr').notNull().default(0),
	shippingIdr: integer('shipping_idr').notNull().default(0),
	taxIdr: integer('tax_idr').notNull().default(0),
	shippingLabel: text('shipping_label').notNull().default(''),
	addressLabel: text('address_label').notNull().default(''),
	linesPayload: jsonb('lines_payload')
		.$type<StorefrontOrderLinePayload[]>()
		.notNull()
		.default(sql`'[]'::jsonb`),
	xenditExternalId: text('xendit_external_id').unique(),
	xenditInvoiceId: text('xendit_invoice_id'),
	checkoutInvoiceUrl: text('checkout_invoice_url'),
	paymentStatus: text('payment_status').notNull().default('none'),
	currency: text('currency').notNull().default('IDR'),
	status: text('status').notNull().default('pending'),
	orderedAt: timestamp('ordered_at', { withTimezone: true }).notNull().defaultNow(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

/** Staff-editable secrets (Xendit API key, webhook token, checkout tax %). Not exposed to storefront JSON. */
export const superstoreSecret = pgTable('superstore_secret', {
	key: text('key').primaryKey(),
	value: text('value').notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

/** Staff uploads (disk + row; catalog PDP images reference via `catalog_product_image`) */
export const superstoreUpload = pgTable('superstore_upload', {
	id: serial('id').primaryKey(),
	originalName: text('original_name').notNull(),
	storedFilename: text('stored_filename').notNull(),
	mimeType: text('mime_type').notNull(),
	sizeBytes: integer('size_bytes').notNull(),
	uploadedByUserId: text('uploaded_by_user_id'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

/** Storefront catalogue (Superstore CRUD → collections + PDP). */
export const catalogProduct = pgTable('catalog_product', {
	id: serial('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	sku: text('sku').notNull().unique(),
	name: text('name').notNull(),
	country: text('country').notNull(),
	region: text('region').notNull(),
	cat: text('cat').notNull(),
	age: text('age').notNull(),
	abv: text('abv').notNull(),
	price: integer('price').notNull(),
	rating: integer('rating').notNull(),
	badge: text('badge').notNull().default(''),
	desc: text('desc').notNull(),
	stockQty: integer('stock_qty').notNull().default(0),
	published: boolean('published').notNull().default(true),
	heroImageUploadId: integer('hero_image_upload_id').references(() => superstoreUpload.id, {
		onDelete: 'set null'
	}),
	detailPayload: jsonb('detail_payload').$type<MmsProductDetailPayload | null>(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

/** Up to four storefront/admin images per product (`position` 0–3). `catalog_product.hero_image_upload_id` mirrors first non-null slot for list cards. */
export const catalogProductImage = pgTable(
	'catalog_product_image',
	{
		id: serial('id').primaryKey(),
		productId: integer('product_id')
			.notNull()
			.references(() => catalogProduct.id, { onDelete: 'cascade' }),
		position: integer('position').notNull(),
		uploadId: integer('upload_id')
			.notNull()
			.references(() => superstoreUpload.id, { onDelete: 'cascade' })
	},
	(t) => [unique('catalog_product_image_product_position_uidx').on(t.productId, t.position)]
);

/** Journal / editorial articles (seeded from `mms-journal.json`; editable in DB later). */
export const journalPost = pgTable('journal_post', {
	id: serial('id').primaryKey(),
	legacyArticleId: integer('legacy_article_id').notNull().unique(),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	cat: text('cat').notNull(),
	catLabel: text('cat_label').notNull(),
	author: text('author').notNull(),
	excerpt: text('excerpt').notNull(),
	adminDateDisplay: text('admin_date_display').notNull(),
	readTime: text('read_time').notNull(),
	tags: jsonb('tags').$type<string[]>().notNull(),
	featured: boolean('featured').notNull().default(false),
	wide: boolean('wide').notNull().default(false),
	viewsCount: integer('views_count').notNull().default(0),
	status: text('status').notNull().default('active'),
	publishedAt: timestamp('published_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export * from './auth.schema';
export * from './customer-auth.schema';
