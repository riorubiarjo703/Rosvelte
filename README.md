# RoSvelte

## 1. Module Overview
- Module Name & Version: RoSvelte v0.0.1 (SvelteKit 2.x)
- Core Purpose: Premium "Maison de spiritueux" storefront plus a staff Superstore admin for product, upload, journal, customer, and task operations.
- Main Features:
* Public storefront with curated brand pages and conversion flows (`/`, `/collections` with live filters and sticky facet sidebar, `/journal`, `/origins`, `/tasting-notes`, `/about`)
* Customer account flows (signup/login/password reset) and dashboard via Better Auth customer stack
* Site header account entry: hover/focus desktop menu (guest: Sign in / Sign up; signed-in: My Account, My Orders, My Wishlist, Sign out) plus matching links in the mobile drawer
* **Header product search:** two-column autocomplete (suggestions + product previews with hero image and IDR price) on desktop and mobile; matches name, country, region, category, and description; “See all” preserves collections filters when applicable
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
- `src/routes/collections/+page.svelte`: collections grid; category tabs, sort, search-aware list; sidebar filters (country checkboxes with facet counts, max-price range slider with visible track, age buckets, availability); `lg:sticky` sidebar with internal scroll; `filtered` pipeline combines category/region/search with client filters; URL `?country=` syncs into sidebar selection when present
- `src/lib/data/mms-site-nav.ts`: `mmsNavCollectionCountries`, `mmsBuildCollectionsUrl`, `mmsParseCollectionCategory` / `Country` / `Region` for collections query params and nav
- `src/lib/data/mms-collection-products.ts`: `MmsCollectionProduct` type and seed/static catalog entries used by collections and cards
- `src/routes/about/+page.svelte`: route entry for the new About page
- `src/lib/components/about/MmsAboutPage.svelte`: full About experience migrated from provided HTML
- `src/lib/components/site/MmsSiteCursor.svelte`: global custom cursor component mounted for all app pages (pointer-aware, interaction-scale states)
- `src/lib/components/site/MmsSiteFooter.svelte`: footer links; `About MMS` now routes to `/about`
- `src/lib/components/site/MmsSiteHeader.svelte`: shared public header/navigation, mega-menus, mini-cart trigger, site search (via `MmsSiteSearchField`), and account hover menu (icons + links; sign-out posts to `/account?/signOut`)
- `src/lib/components/site/MmsSiteSearchField.svelte`: collections search form with suggestion panel (combobox UX, clear control, outside-click / Escape dismiss, links to PDP and filtered `/collections?q=`)
- `src/lib/data/mms-catalog-search.ts`: `MmsCatalogSearchItem` payload shape and `mmsCatalogSearchHaystack()` for client-side matching
- `src/lib/components/account/MmsCustomerDashboard.svelte`: customer dashboard panels; honors `?section=overview|orders|wishlist` for deep links from the header
- `src/routes/+layout.svelte`: shared root layout mounting cross-page UX elements (favicon sync, toasts/modals, site cursor)
- `src/lib/paraglide-resolved-href.ts`: route/base helpers used by localized/internal link resolution
- `src/routes/+layout.server.ts`: shared storefront/customer layout data; loads `catalogHeroImages`, `catalogStockQtys`, and **`catalogSearchItems`** (published DB rows or seed fallback, same source rule as `/collections`)
- `src/app.d.ts`: extends `App.PageData` with optional `catalogSearchItems` for header autocomplete
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

```ts
export function mmsNavCollectionCountries(): string[]
```
- Ordered country list for collections filters and mega-nav; merges priority list with countries present in catalog data.

```ts
export function mmsCatalogSearchHaystack(p: MmsCatalogSearchItem): string
```
- Lowercased concatenation of fields used for header autocomplete substring matching (aligned with collections page search behavior).

```ts
// src/routes/+layout.server.ts (conceptual)
catalogSearchItems: MmsCatalogSearchItem[]
```
- Minimal product rows hydrated once per layout load for header search; avoids per-keystroke API calls.

**Customer account URL contract**
- `GET /account?section=overview` — dashboard overview panel.
- `GET /account?section=orders` — orders panel.
- `GET /account?section=wishlist` — wishlist panel.
- Omitting `section` leaves the current panel unchanged when navigating inside the account area.

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
- **Header search autocomplete** (`MmsSiteSearchField` + `page.data.catalogSearchItems`):
  - Panel opens after **two or more** typed characters when there is at least one match.
  - **Suggestions:** distinct matching product names (cap 6); clicking fills the input.
  - **Products:** up to four rows with hero image URL from `catalogHeroImagePublicPath(heroImageUploadId)` when present.
  - **See all:** navigates to `/collections` with `q` and, when the current route is collections, preserves `cat`, `country`, and `region` query params.
  - **Dismiss:** pointer down outside the field root, Escape, or blur after Escape; refocus reopens when the query still matches.
- **Collections** (`src/routes/collections/+page.svelte`):
  - **Grid data:** `productsForCountryCounts` narrows by category tab, URL `region`, and `q` search; `filtered` further applies sidebar state (selected countries, `priceSlider` max vs fixed min, age bucket checkboxes, availability radio: all / in stock / limited+rare badges).
  - **Country facets:** counts from `productsForCountryCounts`; `mmsNavCollectionCountries()` defines order and allowlist; all countries checked means “no country filter.”
  - **Sticky sidebar:** sticky + `self-start` on the `aside` at large breakpoints; reveal animation classes live on an inner wrapper so `position: sticky` is not broken by `translate` transforms; page root uses `overflow-x-clip` instead of `overflow-x-hidden` so sticky works.
  - **Price UI:** custom track + fill under a transparent `range` input for a clear “slider” affordance.
  - **Reset:** “Reset filters” restores countries, age selection, max price, and availability.
- **Header account menu** (`src/lib/components/site/MmsSiteHeader.svelte`):
  - **Guest (desktop):** `group/account` hover/focus-within reveals a dropdown with Sign in (`/account/login`), Sign up (`/account/signup`), and inline SVG icons per row.
  - **Signed-in (desktop):** Same interaction on the profile pill; links target `/account?section=overview`, `orders`, `wishlist`; Sign out uses `method="post"` + `use:enhance` to `resolve('/account') + '?/signOut'` (same server action as the dashboard).
  - **Mobile:** Hamburger nav repeats the same destinations with icons (no hover reliance).
- **Account dashboard sections** (`src/lib/components/account/MmsCustomerDashboard.svelte`): a client `$effect` reads `page.url.searchParams.get('section')` and sets the active sidebar panel when `section` is `overview`, `orders`, or `wishlist`, so header links land on the correct tab without separate routes.
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
- Header search suggestions use the same published-catalog vs seed fallback as `/collections` (`+layout.server.ts`); only published products appear when the database has rows.
- Staff superstore access is restricted by configured email allowlist unless explicit override is enabled.
- Upload metadata persists in DB while physical files are stored on disk path configured by environment.
- About page is treated as a dedicated brand route (`/about`) and no longer relies on home-page section anchors for footer navigation.
- Custom cursor UX is global (not page-scoped), with pointer-aware fallback for mobile/touch.
- On serverless platforms (including Netlify Functions), local filesystem uploads are not durable across deployments; production upload strategy should move to object storage for persistence.
