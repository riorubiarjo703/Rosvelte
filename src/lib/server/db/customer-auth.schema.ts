import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';

/**
 * Better Auth Drizzle adapter keys these as user/session/account/verification in code;
 * physical tables are `customers` (+ `customer_*`) so staff (`users`) and storefront never share rows.
 */
export const storefrontCustomerUser = pgTable('customers', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	image: text('image'),
	birthDate: text('birth_date'),
	phone: text('phone'),
	preferredLanguage: text('preferred_language'),
	spiritPreference: text('spirit_preference'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const storefrontCustomerSession = pgTable(
	'customer_session',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expires_at').notNull(),
		token: text('token').notNull().unique(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => storefrontCustomerUser.id, { onDelete: 'cascade' })
	},
	(table) => [index('customer_session_userId_idx').on(table.userId)]
);

export const storefrontCustomerAccount = pgTable(
	'customer_account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => storefrontCustomerUser.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at'),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('customer_account_userId_idx').on(table.userId)]
);

export const storefrontCustomerVerification = pgTable(
	'customer_verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('customer_verification_identifier_idx').on(table.identifier)]
);

export const storefrontCustomerUserRelations = relations(storefrontCustomerUser, ({ many }) => ({
	sessions: many(storefrontCustomerSession),
	accounts: many(storefrontCustomerAccount)
}));

export const storefrontCustomerSessionRelations = relations(storefrontCustomerSession, ({ one }) => ({
	user: one(storefrontCustomerUser, {
		fields: [storefrontCustomerSession.userId],
		references: [storefrontCustomerUser.id]
	})
}));

export const storefrontCustomerAccountRelations = relations(storefrontCustomerAccount, ({ one }) => ({
	user: one(storefrontCustomerUser, {
		fields: [storefrontCustomerAccount.userId],
		references: [storefrontCustomerUser.id]
	})
}));
