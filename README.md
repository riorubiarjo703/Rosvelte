# RoSvelte

**Maison MMS–style storefront** (“Maison de spiritueux”) built with **SvelteKit**, plus a **staff Superstore** area for catalogue, uploads, editorial journal, tasks, customer records, and export tooling.

## Framework & stack used to build this app

| Layer | What we use |
| --- | --- |
| **App framework** | [**SvelteKit**](https://kit.svelte.dev/) **2** — file-based routing, `load`/`actions`, layouts, `+server` endpoints, SSR, and `hooks.server` for auth/i18n middleware. |
| **UI framework** | [**Svelte**](https://svelte.dev/) **5** — components (runes API where applicable), client-side interactivity. |
| **Language** | **TypeScript** (strict tooling via `svelte-check` + ESLint). |
| **Build tool** | [**Vite**](https://vite.dev/) **8** — dev server, HMR, production bundling (`@sveltejs/vite-plugin-svelte`). |
| **Deployment adapter** | **`@sveltejs/adapter-auto`** — picks an environment-specific adapter at build time (see SvelteKit adapters docs for production targets). |
| **Runtime** | **Node.js** + **npm** (package manager); app code runs on the SvelteKit/Vite toolchain in dev and Node (or the adapter’s target) in production. |

Everything else (database, auth, CSS, tests) sits on top of that core; see the dependency table below.

## Implemented features

### Public storefront (`/`)

- **Landing page**: editorial layout (hero, stats, marquee, categories, featured products, tasting experience strip, newsletter) with intersection-based reveals.
- **Shop / collections**: listing and product detail routes (`/collections`, `/collections/[id]`). Loads **published products from Postgres** (`catalog_product`); falls back to bundled static demo data when the DB is empty or unavailable.
- **Origins & tasting**: dedicated experiences (`/origins`, `/tasting-notes`).
- **Journal**: `/journal` — prefers **database posts** (`journal_post` via `src/lib/server/journal/repo.ts`); falls back to `src/lib/data/mms-journal.json`.
- **Cart & wishlist**: client-side persistence (`cart/mms-cart.ts`, `wishlist/mms-wishlist.ts`), mini-cart, toast/modal UX.
- **Global layout data**: logged-in customer and `catalogHeroImages` map for thumbnails (`src/routes/+layout.server.ts`).
- **Document favicon sync** for PDP context (`src/lib/client/sync-document-favicon.ts`).
- **i18n (Paraglide)**: English / Spanish locales; `lang` / `dir` injected from middleware (`src/hooks.server.ts`, `messages/*.json`).
- **MDSvex**: available for markdown-in-Svelte where configured.

### Customer accounts (`/account/*`)

- **Separate Better Auth stack** bound to Postgres `customers` (+ `customer_*` tables): cookie prefix `rosvelte-customer`, API base **`/api/customer-auth`**.
- **Flows**: signup, login, forgot password / reset (`customerAuth` callbacks; reset link **logged to server console** until email is wired).
- **Dashboard**: richer profile/dashboard UI (`src/lib/components/account/MmsCustomerDashboard.svelte`).
- **Extra profile fields**: e.g. birth date, phone, preferred language — stored via Better Auth `additionalFields` on the customer adapter.

### Staff Superstore (`/superstore/*`)

- **Staff Better Auth**: `users`/session tables, cookie prefix `rosvelte-staff`, API base **`/api/auth`** (`src/lib/server/auth.ts`).
- **Access control**: `SUPERSTORE_ALLOWED_EMAILS` and optional `SUPERSTORE_ALLOW_ANY_AUTHENTICATED_USER`; enforced in `src/lib/server/superstore/access.ts` (403 if signed in but not allowlisted).
- **Login & sign-out**: `/superstore/login`; layout logout posts to `/superstore` server action (`signOut`).

#### Data-backed screens

- **Catalogue CRUD**: list, create, edit products; hero + up to **four image slots** linked to uploads; optional rich **detail payload** (`detail_payload` JSON) for PDP.
- **Exports**: `/superstore/products/export?format=json|csv|xlsx` (`src/routes/superstore/products/export/+server.ts`).
- **File uploads**: staff uploads persisted on disk (`SUPERSTORE_UPLOAD_DIR`) + `superstore_upload` rows; catalogue references uploads (hero + `catalog_product_image`).
- **Tasks**: CRUD task list backed by Drizzle **`task`** table, Zod (`src/lib/superstore/schemas.ts`) + TanStack-powered table UI.
- **Superstore journal**: list + edit wired to **`journal_post`** (admin-facing).
- **Customers (admin view)**: list + edit flows with validation (`customer-profile-validation`).

#### UI shell with static/demo content

Screens such as **Orders**, **Inventory**, **Analytics**, **Settings**, and parts of the **dashboard KPIs** use **`mms-admin-demo-data`** for labels and fixtures (placeholders until real backends exist).

### Demos (`/demo/*`)

- Paraglide sample, Better Auth demos, Playwright-backed demo page (`demo/playwright`).

---

## Dependencies & tooling (beyond the core framework)

| Area | Packages / services |
| --- | --- |
| Styling | **Tailwind CSS** v4 (`@tailwindcss/vite`), **@tailwindcss/forms**, **@tailwindcss/typography**, **tailwind-variants**, **clsx** |
| UI primitives | **bits-ui**, **@internationalized/date** |
| Data layer | **Drizzle ORM** + **drizzle-kit**; **postgres** (postgres.js client); **PostgreSQL** |
| Auth | **better-auth**, **@better-auth/cli**; Drizzle adapter + **sveltekitCookies** |
| Validation | **Zod** |
| Spreadsheets | **xlsx** (catalog export) |
| Data tables (admin) | **@tanstack/table-core** |
| i18n | **Paraglide** (**@inlang/paraglide-js**), messages in `messages/*.json` |
| Markdown in Svelte | **mdsvex** |
| Quality & formatting | **Prettier** (+ Svelte / Tailwind plugins), **ESLint** (TypeScript + Svelte + Storybook presets) |
| Testing | **Vitest**, **vitest-browser-svelte**, **@vitest/browser-playwright** / coverage; **Playwright**, **@playwright/test** |
| Component docs | **Storybook** 10 (**@storybook/sveltekit**, a11y, docs, Vitest addon) |
| Scripts / DX | **tsx**, **dotenv** |

---

## Database & migrations

Local Postgres via **`compose.yaml`** (optional `postgres` on `:5432`, DB `rosvelte`) or another connection string documented in `.env.example`.

Typical bootstrap:

```sh
npm install
# Set DATABASE_URL, ORIGIN, BETTER_AUTH_SECRET in .env (see .env.example)
docker compose up -d   # or use your existing Postgres

npm run db:push       # Drizzle pushes schema (Better Auth + app tables)

npm run db:seed:catalog   # seeds catalogue from bundled demo payloads
npm run db:seed:journal   # seeds journal_post from static journal data
```

Other scripts: `db:generate`, `db:migrate`, `db:studio`, `auth:schema` (regenerate Better Auth Drizzle stubs).

---

## Environment

Copy **`.env.example`** → `.env`. Important variables:

- **`DATABASE_URL`** — Postgres connection
- **`ORIGIN`** / **`BETTER_AUTH_URL`** — browser origin for CSRF / callbacks (e.g. `http://rosvelte.test`)
- **`BETTER_AUTH_SECRET`** (+ optional **`BETTER_AUTH_CUSTOMER_SECRET`**)
- **Superstore**: `SUPERSTORE_ALLOWED_EMAILS`, `SUPERSTORE_ALLOW_ANY_AUTHENTICATED_USER`, `SUPERSTORE_UPLOAD_DIR`, `SUPERSTORE_MAX_UPLOAD_MB`

---

## Development commands

```sh
npm run dev              # Vite dev server
npm run dev:host        # binds using VITE_DEV_HOST (e.g. rosvelte.test)
npm run build && npm run preview

npm run check           # svelte-check
npm run lint
npm run test            # Vitest --run + Playwright

npm run storybook       # port 6006
npm run db:start        # docker compose up (postgres from compose.yaml)
```

---

## Project pointers

| Topic | Location |
| --- | --- |
| Staff / customer auth & hooks sequence | `src/lib/server/auth.ts`, `customer-auth.ts`, `src/hooks.server.ts` |
| Drizzle tables (catalogue, uploads, journal, tasks) | `src/lib/server/db/schema.ts` (+ `auth.schema.ts`, `customer-auth.schema.ts`) |
| Catalogue repo & slugging | `src/lib/server/catalog/` |
| Journal repo | `src/lib/server/journal/` |
| Superstore ACL | `src/lib/server/superstore/access.ts` |
| Storefront data fallbacks | `src/lib/data/*` |

---

## Recreating the CLI scaffolding

Original `sv create` invocation (for reference only):

```sh
npx sv@0.15.2 create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" playwright tailwindcss="plugins:typography,forms" sveltekit-adapter="adapter:auto" drizzle="database:postgresql+postgresql:postgres.js+docker:yes" better-auth="demo:password" mdsvex paraglide="languageTags:en, es+demo:yes" storybook mcp="ide:cursor+setup:local" --install npm RoSvelte
```
