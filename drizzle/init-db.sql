-- One-shot bootstrap if `npm run db:push` fails to connect to .env from the CLI.
-- Usage: psql "$DATABASE_URL" -f drizzle/init-db.sql

CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"birth_date" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE ("email")
);

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birth_date" text;

CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE ("token"),
	CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" USING btree ("user_id");

CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "account_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" USING btree ("user_id");

CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" USING btree ("identifier");

-- Storefront customers (Better Auth `customerAuth`; staff remains in `users` / `session` above)
CREATE TABLE IF NOT EXISTS "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"birth_date" text,
	"phone" text,
	"preferred_language" text,
	"spirit_preference" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE ("email")
);

ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "preferred_language" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "spirit_preference" text;

CREATE TABLE IF NOT EXISTS "customer_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "customer_session_token_unique" UNIQUE ("token"),
	CONSTRAINT "customer_session_user_id_customers_id_fk" FOREIGN KEY ("user_id") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "customer_session_userId_idx" ON "customer_session" USING btree ("user_id");

CREATE TABLE IF NOT EXISTS "customer_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_account_user_id_customers_id_fk" FOREIGN KEY ("user_id") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "customer_account_userId_idx" ON "customer_account" USING btree ("user_id");

CREATE TABLE IF NOT EXISTS "customer_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "customer_verification_identifier_idx" ON "customer_verification" USING btree ("identifier");

CREATE TABLE IF NOT EXISTS "task" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "superstore_upload" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_name" text NOT NULL,
	"stored_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"uploaded_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "catalog_product" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"region" text NOT NULL,
	"cat" text NOT NULL,
	"age" text NOT NULL,
	"abv" text NOT NULL,
	"price" integer NOT NULL,
	"rating" integer NOT NULL,
	"badge" text DEFAULT '' NOT NULL,
	"desc" text NOT NULL,
	"stock_qty" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"hero_image_upload_id" integer REFERENCES "superstore_upload" ("id") ON DELETE SET NULL,
	"detail_payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_product_slug_unique" UNIQUE ("slug"),
	CONSTRAINT "catalog_product_sku_unique" UNIQUE ("sku")
);

CREATE TABLE IF NOT EXISTS "catalog_product_image" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL REFERENCES "catalog_product" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
	"position" integer NOT NULL,
	"upload_id" integer NOT NULL REFERENCES "superstore_upload" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
	CONSTRAINT "catalog_product_image_product_position_uidx" UNIQUE ("product_id", "position")
);

-- One-time: copy legacy single-hero rows into slot 0 (safe if table already populated).
INSERT INTO "catalog_product_image" ("product_id", "position", "upload_id")
SELECT cp.id, 0, cp.hero_image_upload_id
FROM "catalog_product" cp
WHERE cp.hero_image_upload_id IS NOT NULL
  AND NOT EXISTS (
	SELECT 1 FROM "catalog_product_image" i WHERE i.product_id = cp.id
  );

-- Staff secrets (Superstore → Settings → Payment). Required for Xendit keys stored in DB.
CREATE TABLE IF NOT EXISTS "superstore_secret" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Storefront checkout orders (Xendit, admin list). Matches `src/lib/server/db/schema.ts`.
CREATE TABLE IF NOT EXISTS "storefront_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_code" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"phone" text,
	"product_summary" text NOT NULL,
	"total_idr" integer NOT NULL,
	"subtotal_idr" integer DEFAULT 0 NOT NULL,
	"promo_discount_idr" integer DEFAULT 0 NOT NULL,
	"shipping_idr" integer DEFAULT 0 NOT NULL,
	"tax_idr" integer DEFAULT 0 NOT NULL,
	"shipping_label" text DEFAULT '' NOT NULL,
	"address_label" text DEFAULT '' NOT NULL,
	"lines_payload" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"xendit_external_id" text,
	"xendit_invoice_id" text,
	"checkout_invoice_url" text,
	"payment_status" text DEFAULT 'none' NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"ordered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "storefront_order_order_code_unique" UNIQUE ("order_code"),
	CONSTRAINT "storefront_order_xendit_external_id_unique" UNIQUE ("xendit_external_id")
);

CREATE TABLE IF NOT EXISTS "journal_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"legacy_article_id" integer NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"cat" text NOT NULL,
	"cat_label" text NOT NULL,
	"author" text NOT NULL,
	"excerpt" text NOT NULL,
	"admin_date_display" text NOT NULL,
	"read_time" text NOT NULL,
	"tags" jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"wide" boolean DEFAULT false NOT NULL,
	"views_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_post_legacy_article_id_unique" UNIQUE ("legacy_article_id"),
	CONSTRAINT "journal_post_slug_unique" UNIQUE ("slug")
);
