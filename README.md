# RoSvelte

## 1. Module Overview
- Module Name & Version: RoSvelte v0.0.1 (SvelteKit 2.x)
- Core Purpose: Premium "Maison de spiritueux" storefront plus a staff Superstore admin for product, upload, journal, customer, and task operations.
- Main Features:
* Public storefront with curated brand pages and conversion flows (`/`, `/collections`, `/journal`, `/origins`, `/tasting-notes`, `/about`)
* Customer account flows (signup/login/password reset) and dashboard via Better Auth customer stack
* Staff Superstore with auth-gated CRUD, uploads, journal management, exports, and admin utilities

## 2. Technical Structure
### Dependencies
- App/Core: `@sveltejs/kit`, `svelte`, `vite`, `typescript`
- Styling/UI: `tailwindcss`, `@tailwindcss/forms`, `@tailwindcss/typography`, `bits-ui`, `tailwind-variants`, `clsx`
- Data/Auth: `drizzle-orm`, `drizzle-kit`, `postgres`, `better-auth`, `zod`
- Tooling: `eslint`, `prettier`, `vitest`, `playwright`, `storybook`, `mdsvex`, `@inlang/paraglide-js`

### Configuration
- Environment setup: copy `.env.example` to `.env`
- Key settings:
  - `DATABASE_URL`
  - `ORIGIN`, `BETTER_AUTH_URL`
  - `BETTER_AUTH_SECRET`, optional `BETTER_AUTH_CUSTOMER_SECRET`
  - `SUPERSTORE_ALLOWED_EMAILS`, `SUPERSTORE_ALLOW_ANY_AUTHENTICATED_USER`
  - `SUPERSTORE_UPLOAD_DIR`, `SUPERSTORE_MAX_UPLOAD_MB`
- Core config files:
  - `svelte.config.js`
  - `vite.config.ts`
  - `drizzle.config.ts`
  - `netlify.toml`
  - `.nvmrc`

### Core Files
- `src/routes/about/+page.svelte`: route entry for the new About page
- `src/lib/components/about/MmsAboutPage.svelte`: full About experience migrated from provided HTML
- `src/lib/components/site/MmsSiteCursor.svelte`: global custom cursor component mounted for all app pages (pointer-aware, interaction-scale states)
- `src/lib/components/site/MmsSiteFooter.svelte`: footer links; `About MMS` now routes to `/about`
- `src/lib/components/site/MmsSiteHeader.svelte`: shared public header/navigation
- `src/routes/+layout.svelte`: shared root layout mounting cross-page UX elements (favicon sync, toasts/modals, site cursor)
- `src/lib/paraglide-resolved-href.ts`: route/base helpers used by localized/internal link resolution
- `src/routes/+layout.server.ts`: shared storefront/customer layout data
- `src/lib/server/db/schema.ts`: app data model (catalog, journal, uploads, tasks, customer-related tables)

### Core Methods
```ts
export function resolvedLocalizedHref(path: Pathname): string
```
- Converts a route pathname into a localized URL with app base and active locale.

```ts
export function resolvedPath(path: string): string
```
- Applies app base path for internal links that are already localized or normalized.

```ts
function sectionHref(hash: string): string
```
- Shared footer behavior for section links on home vs non-home routes.

### Integration Instructions
- Install dependencies and run dev server:
  - `npm install`
  - `npm run dev`
- Bootstrap database (local Docker optional):
  - `docker compose up -d`
  - `npm run db:push`
  - `npm run db:seed:catalog`
  - `npm run db:seed:journal`
- Validate app quality gates:
  - `npm run check`
  - `npm run lint`
  - `npm run test`
- Netlify deployment baseline:
  - Adapter: `@sveltejs/adapter-netlify` (`svelte.config.js`)
  - Build config: `netlify.toml` with `command = "npm run build"` and `publish = "build"`
  - Runtime: Node `22` (`.nvmrc` and `NODE_VERSION` in `netlify.toml`)
  - Required production env vars in Netlify UI:
    - `DATABASE_URL`
    - `ORIGIN` and/or `BETTER_AUTH_URL` (must match deployed HTTPS origin)
    - `BETTER_AUTH_SECRET`
    - `BETTER_AUTH_CUSTOMER_SECRET` (or fallback to `BETTER_AUTH_SECRET`)
    - `SUPERSTORE_ALLOWED_EMAILS`
    - `SUPERSTORE_ALLOW_ANY_AUTHENTICATED_USER` (`false` for production)
    - `SUPERSTORE_UPLOAD_DIR`, `SUPERSTORE_MAX_UPLOAD_MB`

## 3. Implementation Details
### Frontend
- Public routes use SvelteKit file-based routing and shared `MmsSiteHeader` / `MmsSiteFooter` layout patterns.
- About page implementation details:
  - New page route: `src/routes/about/+page.svelte`
  - Main content component: `src/lib/components/about/MmsAboutPage.svelte`
  - Includes reveal animation observer, responsive sections, and CTA actions.
- Global cursor interaction:
  - Shared implementation: `src/lib/components/site/MmsSiteCursor.svelte`
  - Mounted at root in `src/routes/+layout.svelte` so cursor behavior is consistent across all pages.
  - Auto-disables on coarse pointers (touch devices) and scales on interactive elements.
- Footer update:
  - `About MMS` now links to `resolve('/about')` instead of in-page home anchor navigation.
- Localized/internal route helper:
  - `src/lib/paraglide-resolved-href.ts` is outside generated Paraglide output and should be used for stable imports (`resolvedLocalizedHref`, `resolvedPath`).

### Admin
- Superstore routes under `src/routes/superstore/*` are protected by staff auth and allowlist rules.
- Primary admin capabilities:
  - Product CRUD and detail payload editing
  - Upload management and product image linking
  - Journal edit flows
  - Task management
  - Product export (`json`, `csv`, `xlsx`)

### Events/Plugins
- SvelteKit integrations used as extension points:
  - `src/hooks.server.ts`: request lifecycle middleware (auth/i18n/session context)
  - `+layout.server.ts` and route `load` functions: data hydration boundaries
  - route `actions` and `+server.ts`: write operations and API responses
- Better Auth integrates through dedicated server modules for staff and customers.

### Business Rules
- Public storefront prioritizes DB-backed content with static fallback datasets where applicable.
- Staff superstore access is restricted by configured email allowlist unless explicit override is enabled.
- Upload metadata persists in DB while physical files are stored on disk path configured by environment.
- About page is treated as a dedicated brand route (`/about`) and no longer relies on home-page section anchors for footer navigation.
- Custom cursor UX is global (not page-scoped), with pointer-aware fallback for mobile/touch.
- On serverless platforms (including Netlify Functions), local filesystem uploads are not durable across deployments; production upload strategy should move to object storage for persistence.
