# CLAUDE.md — will-walker-website

This file gives Claude Code context about the Will Walker Montgomerie portfolio website so it can assist effectively without needing to explore the project blind.

---

## Project Overview

**Site:** [willwalkermontgomeriewrites.com](https://www.willwalkermontgomeriewrites.com)
**Owner / Subject:** William L. Walker Montgomerie — Playwright, Director, Educator based in Paris, Texas
**Developer:** Chris Diorio (commission project)
**Purpose:** Professional portfolio site showcasing Will's plays, directing history, and CV. Serves as the primary hub for licensing inquiries (performance rights requests, royalties scale PDF).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | CSS Modules (per-component `.module.css` files) — **not Tailwind** |
| Fonts | Google Fonts via `next/font`: Lora (headings), Lato (body), Special Elite (accent) |
| Images | `next/image` — always use `<Image />`, never raw `<img>` |
| Carousel | `embla-carousel-react` |
| Icons | `react-icons` (fa, si prefixes) |
| Form service | FormSubmit.co (no backend email logic needed) |
| Form protection | `react-google-recaptcha` (reCAPTCHA v2) |
| Analytics | `@vercel/analytics` (injected in layout, no config needed) |
| Ko-fi widget | Floating chat widget via `KoFiWidget.tsx` (loaded via `next/script`) |
| Deployment | Vercel |
| Node | npm (`npm install`, `npm run dev`, `npm run build`) |

> WARNING: CSS Modules, not Tailwind. The README mentions Tailwind but the codebase uses CSS Modules exclusively. Do not introduce Tailwind utility classes.

---

## Project Structure

```
will-walker-website/
├── public/
│   ├── images/
│   │   ├── covers/      # All play cover art — all pre-optimized via Sharp; run optimize-images before committing new files
│   │   ├── assets/      # Site UI images: logo.png, Will_Walker.jpg, about_will.jpg, casting_note_icon.png, script_placeholder.png
│   │   └── photos/      # Production photos (empty — will receive photos later)
│   └── pdfs/
│       ├── royalties_scale.pdf       # Downloadable — do not modify
│       └── Placeholder-PDF.pdf       # Dev placeholder only
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout: fonts, metadata, Header, Footer, KoFiWidget, Analytics
│   │   ├── globals.css              # Global CSS variables + base styles (see Design Tokens below)
│   │   ├── page.tsx                 # Home page: Hero, About, Plays (carousel), Contact
│   │   ├── page.module.css
│   │   ├── cv/
│   │   │   ├── page.tsx             # Full CV page (hardcoded content)
│   │   │   └── page.module.css
│   │   ├── works/
│   │   │   ├── page.tsx             # Thin server wrapper — exports metadata, renders WorksClient
│   │   │   ├── WorksClient.tsx      # 'use client' — all filter/sort/modal state lives here
│   │   │   ├── page.module.css
│   │   │   └── [slug]/
│   │   │       ├── page.tsx         # Individual play page (server component, generateStaticParams)
│   │   │       └── page.module.css
│   │   ├── productions/
│   │   │   ├── page.tsx             # Production photo gallery (server component)
│   │   │   └── page.module.css
│   │   ├── thank-you/
│   │   │   ├── page.tsx             # Post-contact-form success page
│   │   │   └── page.module.css
│   │   └── api/
│   │       └── form/
│   │           └── route.ts         # POST handler — redirects to /thank-you (FormSubmit handles actual email)
│   ├── components/
│   │   ├── About.tsx / .module.css
│   │   ├── Contact.tsx / .module.css   # FormSubmit form + reCAPTCHA
│   │   ├── Footer.tsx / .module.css
│   │   ├── Header.tsx / .module.css    # Responsive nav + mobile hamburger menu
│   │   ├── KoFiWidget.tsx              # Ko-fi floating chat (no CSS module)
│   │   ├── Modal.tsx / .module.css     # Play detail modal (used in carousel on home page)
│   │   ├── Plays.tsx / .module.css     # Embla carousel of featured plays (home page)
│   │   └── SocialLinks.tsx / .module.css
│   ├── data/
│   │   ├── works.ts                 # THE SOURCE OF TRUTH for all play content
│   │   └── productions.ts           # Production photos data (Production + ProductionPhoto types)
│   ├── utils/
│   │   └── filterSort.ts            # Pure filter/sort logic extracted from WorksClient (testable)
│   └── test/
│       ├── setup.ts                 # @testing-library/jest-dom import
│       ├── data/works.test.ts       # Data integrity + generateStaticParams tests
│       ├── components/
│       │   ├── Modal.test.tsx
│       │   └── Header.test.tsx
│       ├── pages/
│       │   ├── playPage.test.tsx    # Individual play page render tests
│       │   └── productions.test.tsx # ProductionsPage: empty state, headings, photos, captions
│       └── utils/filterSort.test.ts
├── next.config.ts
├── tsconfig.json                    # strict: true, paths: @/* -> ./src/*
├── eslint.config.mjs
└── package.json
```

---

## Design Tokens (globals.css)

All colors and fonts are defined as CSS custom properties on `:root`. Use these variables in CSS Modules — do not hardcode color values.

```css
--color-background: #f9f6f1;       /* Warm off-white page background */
--color-text: #33373d;             /* Near-black body text */
--color-accent-primary: #795548;   /* Brown — buttons, links, focus rings */
--color-accent-subtle: #eae5e0;    /* Light warm gray — subtle backgrounds */

--font-family-heading: var(--font-lora);          /* h1-h6 */
--font-family-body: var(--font-lato);             /* body text */
--font-family-accent: var(--font-special-elite);  /* theatrical accent text */
```

Font variables (`--font-lora`, `--font-lato`, `--font-special-elite`) are injected on `<html>` by `layout.tsx` via `next/font/google`.

---

## The `Work` Type and Data File

**Play content is stored in Supabase and managed via the admin dashboard at `/admin/plays`.** `src/data/works.ts` is an archived reference file — do not import from it. The canonical type is in `src/types/play.ts` and API helpers are in `src/lib/api.ts`.

```typescript
// src/data/works.ts

export type Work = {
  slug: string;           // URL-safe identifier (e.g., 'hamlet-a-horatio-story') — unique, lowercase, hyphens only
  title: string;
  category: string;       // Genre label (e.g., 'Drama', 'Comedy', 'Historical Drama')
  imageSrc: string;       // Path relative to /public (e.g., '/images/Hamlet-A-Horatio-Story.jpg')
  pdfSrc: string;         // Sample PDF URL (external) — use '' if none
  cast: string;           // Cast breakdown string (e.g., '3M/3F', '2M/2F/Flexible Ensemble') — slash-separated, F not W
  synopsis: string;       // 2-4 sentence description in Will's voice
  featured?: boolean;     // true = appears in home page carousel
  published?: boolean;    // true = shows "Published" ribbon badge
  purchase?: string;      // External purchase/rights URL (only used when published: true)
  runtime?: string;       // e.g., '90+ Minutes', 'Full Length', '25-30 minutes'
};

export const worksData: Work[] = [ ... ];
```

### How `featured` and `published` work

- `featured: true` — play appears in the Embla carousel on the home page (`Plays.tsx` filters by this)
- `published: true` — shows a "Published" ribbon badge on the card and modal; enables the "Purchase Rights" button if `purchase` URL is also set
- A play can be `featured: true` and `published: false` simultaneously

### Adding a new play

1. Go to `/admin/plays` in the browser
2. Click "Add New Play", fill in the form, upload cover art via the upload zone
3. Toggle "Featured" on to include it in the home page carousel
4. Save — the page will live within 60 seconds (ISR revalidation)

---

## Production Photos

Production photos are stored in Supabase and managed via the admin dashboard at `/admin/productions`. `src/data/productions.ts` is an archived reference file — do not import from it. Type definitions live in `src/types/production.ts`.

```typescript
// src/types/production.ts

export type ProductionPhoto = {
  id: string;
  productionId: string | null;
  playTitle: string;
  productionYear: number;
  venue: string;
  src: string;           // Vercel Blob URL or /public path
  alt: string;
  caption?: string | null;
  displayOrder: number;
};

export type Production = {
  id: string;
  playTitle: string;
  productionYear: number;
  venue: string;
  displayOrder: number;
  photos: ProductionPhoto[];
};
```

### Adding production photos

1. Go to `/admin/productions` in the browser
2. Click "+ Add New Production Photo", fill in the form, upload the photo
3. The photo is grouped by playTitle + venue + productionYear automatically
4. Use the ▲/▼ buttons to reorder photos within a group, or reorder groups in the Production Order section

---

## Key Components

### `Plays.tsx` (Home Page Carousel)
- Uses `embla-carousel-react` with `loop: true, align: 'start'`
- Renders only plays where `work.featured === true`
- Clicking a play card opens `Modal.tsx` with full play details
- `'use client'` directive — uses `useState`, `useEffect`, `useCallback`

### `Modal.tsx` (Play Detail Modal)
- Receives a `Work | null` prop plus `isOpen` boolean
- Shows cover image, synopsis, cast breakdown, runtime
- Buttons: "Read Sample" (if `pdfSrc` is set), "Purchase Rights" (if `published && purchase`), or "Apply for Rights" (Google Form fallback for unpublished works)
- "View Full Page →" link below buttons navigates to `/works/{slug}`
- Imports `Work` directly from `@/data/works` — no local type copy

### `WorksClient.tsx` (Works Page — Client Logic)
- `'use client'` component rendered by the server wrapper `works/page.tsx`
- All filter state (`searchQuery`, `selectedGenre`, `publishedOnly`, `runtimeBucket`, `castBucket`) and sort state (`sortOrder`) live here
- Calls `filterWorks` and `sortWorks` from `src/utils/filterSort.ts` — no inline filter logic
- Types `RuntimeBucket`, `CastBucket`, `SortOrder` are imported from `filterSort.ts`
- Each work card is a `<Link href={/works/${work.slug}}>` — no nested buttons inside cards

### `Contact.tsx` (Contact Form)
- Uses **FormSubmit.co** — no backend email logic; form POSTs directly to FormSubmit
- `action` is set to `https://formsubmit.co/${recipientEmail}` where `recipientEmail` comes from `process.env.NEXT_PUBLIC_RECIPIENT_EMAIL`
- On success, redirects to `/thank-you` via hidden `_next` field
- reCAPTCHA v2 via `react-google-recaptcha` — submit button is disabled until captcha is verified
- `_captcha: false` hidden field disables FormSubmit's own captcha (we use our own)

### `Header.tsx`
- Responsive nav with desktop links and mobile hamburger toggle
- Mobile menu uses `isOpen` state and CSS class toggling (`.isOpen`)
- `SocialLinks` appears in both the desktop `.actions` area and the mobile menu

### `SocialLinks.tsx`
- Hardcoded array of 5 social links: Facebook, Instagram, Ko-fi, New Play Exchange, Dramatists Guild
- Uses `react-icons`: `FaFacebook`, `FaInstagram`, `SiKofi`, `FaFeatherAlt`, `FaTheaterMasks`
- To add or update a social link, edit the `socialLinks` array in this file

### `KoFiWidget.tsx`
- Loads Ko-fi floating chat via external script using `next/script` with `strategy="afterInteractive"`
- Accent color is `#795548` to match the site palette
- Ko-fi username: `williamlwalkermontgomerie`

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values. `.env.local` is gitignored and must never be committed.

```bash
# Contact form
NEXT_PUBLIC_RECIPIENT_EMAIL=       # Email address FormSubmit delivers contact form submissions to
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=    # reCAPTCHA v2 site key

# Database
DATABASE_URL=                      # Supabase Session Pooler connection string (port 5432)

# Admin Auth
ADMIN_USER=                        # Username for admin dashboard Basic Auth
ADMIN_PASSWORD=                    # Password for admin dashboard Basic Auth
NEXT_PUBLIC_ADMIN_USER=            # Same as ADMIN_USER — exposed to client for fetch() API calls
NEXT_PUBLIC_ADMIN_PASSWORD=        # Same as ADMIN_PASSWORD — exposed to client for fetch() API calls

# Vercel Blob
BLOB_READ_WRITE_TOKEN=             # Vercel Blob store token for image uploads

# App
NEXT_PUBLIC_BASE_URL=              # Full URL of the site (http://localhost:3000 locally)
```

---

## Routing

### Public routes

| Route | File | Notes |
|---|---|---|
| `/` | `src/app/(public)/page.tsx` | Hero + About + Plays carousel + Contact |
| `/works` | `src/app/(public)/works/page.tsx` | Full play grid; cards link to individual play pages |
| `/works/[slug]` | `src/app/(public)/works/[slug]/page.tsx` | Individual play page; pre-rendered via `generateStaticParams` |
| `/cv` | `src/app/(public)/cv/page.tsx` | Full CV (hardcoded) |
| `/productions` | `src/app/(public)/productions/page.tsx` | Photo gallery of production history; grouped by play |
| `/thank-you` | `src/app/(public)/thank-you/page.tsx` | Post-contact-form confirmation |
| `/api/form` POST | `src/app/api/form/route.ts` | Redirects to `/thank-you` (FormSubmit handles the actual email) |

### Admin routes (Basic Auth protected)

| Route | File | Notes |
|---|---|---|
| `/admin` | `src/app/admin/page.tsx` | Redirects to `/admin/plays` |
| `/admin/plays` | `src/app/admin/plays/page.tsx` | Plays management dashboard |
| `/admin/productions` | `src/app/admin/productions/page.tsx` | Productions management dashboard |
| `/admin/settings` | `src/app/admin/settings/page.tsx` | Placeholder settings page |
| `/api/admin/logout` | `src/app/api/admin/logout/route.ts` | Clears Basic Auth credentials |
| `/api/admin/upload` | `src/app/api/admin/upload/route.ts` | Uploads image to Vercel Blob |

### Data API routes (write operations require Basic Auth)

| Route | File | Notes |
|---|---|---|
| `/api/plays` | `src/app/api/plays/route.ts` | GET all plays, POST new play |
| `/api/plays/[slug]` | `src/app/api/plays/[slug]/route.ts` | GET, PUT, DELETE single play |
| `/api/plays/[slug]/feature-order` | `src/app/api/plays/[slug]/feature-order/route.ts` | PUT — reorder featured carousel |
| `/api/productions` | `src/app/api/productions/route.ts` | GET all productions (with nested photos), POST new photo |
| `/api/productions/[id]` | `src/app/api/productions/[id]/route.ts` | GET, PUT, DELETE single photo |
| `/api/productions/[id]/display-order` | `src/app/api/productions/[id]/display-order/route.ts` | PUT — reorder photo within its production group |
| `/api/productions/groups/[id]/display-order` | `src/app/api/productions/groups/[id]/display-order/route.ts` | PUT — reorder production group |

Anchor sections on the home page: `#home`, `#about`, `#plays`, `#contact`

`/works/[slug]` uses `generateStaticParams()` to pre-render all play pages at build time. Unknown slugs call `notFound()`. The `params` object is typed as `Promise<{ slug: string }>` per Next.js 15 App Router convention.

Public routes live inside the `(public)` route group (`src/app/(public)/`) which applies the public layout (Header, Footer, KoFiWidget). Admin routes live under `src/app/admin/` with their own layout (fixed sidebar). The route group is transparent — URLs are unchanged.

---

## Scripts

| Command | File | Description |
|---|---|---|
| `npm run optimize-images` | `scripts/optimize-images.js` | Batch compresses all images in `/public/images/covers/`, `/public/images/assets/`, and `/public/images/photos/` using Sharp. Run this whenever new images are added. Covers/photos resize to max 800px/1200px wide; assets use per-file rules (logo 400px, casting icon 256px, portrait JPEGs 600px at 85% quality). Overwrites files in place. |

---

## Database

- **ORM:** Prisma 7
- **Provider:** Supabase (Postgres) — use the **Session Pooler** connection string (IPv4, port 5432); the direct connection is IPv6-only and won't work from most dev machines
- **Schema:** `prisma/schema.prisma`
- **Config:** `prisma.config.ts` — reads `DATABASE_URL` from `.env`; datasource URL is set here, not in `schema.prisma` (Prisma v7 requirement)
- **Client:** generated to `src/generated/prisma/` — import from `src/generated/prisma/client`
- **Singleton:** `src/lib/prisma.ts` — use this everywhere in the app; uses `@prisma/adapter-pg` (required in Prisma v7)
- **Seed script:** `prisma/seed.ts` — run with `npx prisma db seed`; uses `tsx` (not `ts-node`) due to ESM/CJS conflicts with the generated client
- **Migrations:** `npx prisma migrate dev --name [description]`
- **Studio:** `npx prisma studio` — opens a visual browser UI at a local port

---

## SEO and Structured Data

Defined in `src/app/layout.tsx`:

- **Page title:** "William L. Walker Montgomerie | Playwright, Director, Educator"
- **Meta description:** "Explore the selected works and portfolio of William L. Walker Montgomerie, a playwright and director based in Paris, Texas."
- **Schema.org `Person` JSON-LD** in `<head>` — includes `name`, `jobTitle`, `url`, and `sameAs` array of social profile URLs

When updating social profiles, update **both** `SocialLinks.tsx` (UI icons) and the `sameAs` array in `layout.tsx` (SEO).

---

## Accessibility

This site has solid accessibility practices — maintain them on any changes:

- All `<Image />` components have descriptive `alt` text
- The casting note icon on `/works` uses `alt=""` intentionally (decorative; button has its own `aria-label`)
- Global focus styles: `3px solid var(--color-accent-primary)` with `outline-offset: 3px`
- `Modal.tsx` uses `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`
- Mobile menu button has `aria-label="Open navigation menu"`

---

## Roadmap

Planned future features — do not implement unless explicitly asked:

- [ ] **Pending data updates** — Fill in remaining TBD entries, add Empty Spaces once details are received from client
- [ ] **URL persistence for /works filters** — Store active filters and sort state in URL params so pages are shareable and survive refresh
- [ ] **Individual production pages** — Dedicated pages per production with full photo gallery (currently the productions page shows all at once)

---

## Per-page Metadata Pattern

`export const metadata` only works in **server components**. Pages that need client-side state (`'use client'`) must be split:

1. **`page.tsx`** — server component; exports `metadata`, renders the client component
2. **`ClientName.tsx`** — `'use client'`; all hooks and interactivity

The `/works` route follows this pattern: `works/page.tsx` → `works/WorksClient.tsx`.

---

## Testing

**Stack:** Vitest + React Testing Library + jsdom

```bash
npm test          # run all tests once
npm run test:ui   # Vitest UI (browser-based watcher)
```

**Config:** `vitest.config.ts` at project root — jsdom environment, setup file at `src/test/setup.ts`, `@/*` alias wired to `./src/`.

**Test locations:**

| File | What it covers |
|---|---|
| `src/test/data/works.test.ts` | Data integrity: required fields, imageSrc paths, cast notation, slugs, `generateStaticParams` |
| `src/test/utils/filterSort.test.ts` | All exported functions: `classifyRuntime`, `parseCastSize`, `parseRuntimeForSort`, `parseCastForSort`, `filterWorks`, `sortWorks` |
| `src/test/components/Modal.test.tsx` | Render, conditional buttons, "View Full Page" link, overlay click, aria attributes |
| `src/test/components/Header.test.tsx` | Nav links, hamburger toggle, aria-label, logo alt text |
| `src/test/pages/playPage.test.tsx` | Title, synopsis, ribbon badge, conditional buttons, notFound for unknown slug |
| `src/test/pages/productions.test.tsx` | Empty state, section headings per production, photo src/alt, captions present/absent |

**Mocking pattern:** `next/image` and `next/link` are mocked with simple HTML equivalents in each component/page test file. `SocialLinks` is mocked in `Header.test.tsx`. `next/navigation` is mocked in playPage.test.tsx (`notFound` throws to allow assertion).

### E2E Tests (Playwright)

- **Framework:** Playwright with `@playwright/test`
- **Run:** `npm run test:e2e` (headless) · `npm run test:e2e:ui` (UI mode) · `npm run test:e2e:report` (open HTML report)
- **Config:** `playwright.config.ts` at project root — runs against `http://localhost:3000` (dev server auto-starts if not already running)
- **Browsers:** Chromium, Firefox, WebKit (desktop) + iPhone 12 and Pixel 5 (mobile viewports)
- **Coverage:** 355 tests, 24 skipped (mobile-only tests on desktop projects), 1 known flaky (WebKit genre filter — passes on retry, timing issue)
- **Manual only** — not wired to CI
- Do not use `page.waitForTimeout()` — use proper Playwright `waitFor` assertions
- Admin write operations (add/edit/delete) are intentionally excluded from E2E — covered by manual test plan

| File | What it covers |
|---|---|
| `tests/e2e/home.spec.ts` | Title, hero, about, carousel, modal open/close, contact form, footer |
| `tests/e2e/works.spec.ts` | Title, play count, search, filters, sort, card navigation, casting modal |
| `tests/e2e/play-page.spec.ts` | Hamlet (published), Echoes of Valor (unpublished), 404 for unknown slug |
| `tests/e2e/productions.spec.ts` | Title, production groups, photo counts, captions |
| `tests/e2e/cv.spec.ts` | Title, Artist Statement, Education, Playwriting, Directing Portfolio sections |
| `tests/e2e/navigation.spec.ts` | All nav links, footer CV link, logo click |
| `tests/e2e/mobile.spec.ts` | iPhone 12 + Pixel 5 only: hamburger, mobile menu, nav links, responsive layout |
| `tests/e2e/admin.spec.ts` | API read checks (plays, productions), auth rejection (no creds, wrong creds, /admin) |

**Helpers:** `tests/e2e/helpers/auth.ts` — `getAuthHeader()` for API auth. `tests/e2e/fixtures/plays.ts` — known slugs/titles.

---

## Deployment

**Platform:** Vercel (auto-deploys on push to `main`)

**Build requirements:**
- Prisma client is generated automatically via `postinstall` script (`prisma generate`) — no manual step needed on Vercel
- `DATABASE_URL` must use the Supabase **Session Pooler** connection string (port **6543**) with these query parameters: `?pgbouncer=true&connection_limit=1&connect_timeout=30`
- The direct connection (port 5432) causes `ENETUNREACH` errors on Vercel's build servers
- All 9 environment variables must be set in Vercel before deploying (see Environment Variables section)

**ISR (Incremental Static Regeneration):**
- Play pages (`/works/[slug]`) and `/productions` revalidate every 60 seconds
- Content changes made via the admin dashboard appear on the live site within 60 seconds without a manual redeploy
- `generateStaticParams` pre-renders all play pages at build time via a direct Prisma query (not the API)

---

## Common Tasks

**Add a new play**
Use the admin dashboard at `/admin/plays` — click "Add New Play", fill in the form, upload cover art

**Add production photos**
Use the admin dashboard at `/admin/productions` — click "+ Add New Production Photo", fill in the form, upload the photo

**Mark a play as published**
In `/admin/plays`, open the play, toggle "Published" on and paste the purchase URL in the Purchase URL field

**Update bio / about text**
Edit `src/components/About.tsx` directly (hardcoded prose)

**Update CV**
Edit `src/app/cv/page.tsx` directly (hardcoded)

**Add or change a social link**
Edit `socialLinks` array in `SocialLinks.tsx` and update `sameAs` in `layout.tsx`

**Change Ko-fi button color or label**
Edit `src/components/KoFiWidget.tsx`

---

## Admin Authentication

- **Method:** HTTP Basic Auth via Next.js middleware (`src/middleware.ts`)
- **Protects:** all `/admin/*` routes
- **API write routes** also check auth individually via `src/lib/auth.ts` (`requireAuth` helper reads the `Authorization` header)
- **Credentials:** `ADMIN_USER` / `ADMIN_PASSWORD` env vars (server-only); `NEXT_PUBLIC_ADMIN_USER` / `NEXT_PUBLIC_ADMIN_PASSWORD` are the same values prefixed for client-side `fetch()` calls
- **Logout:** POST to `/api/admin/logout` returns 401 + `WWW-Authenticate` header, which causes the browser to drop the cached Basic Auth credentials; page then redirects to `/admin` to re-prompt

---

## Image Uploads

- **Service:** Vercel Blob (store: `will-walker-images`)
- **Upload endpoint:** POST `/api/admin/upload` (auth protected)
- **Used for:** play cover art and production photos via the admin dashboard
- **Token:** `BLOB_READ_WRITE_TOKEN` env var
- **Served from:** `*.public.blob.vercel-storage.com` — this domain is allowlisted in `next.config.ts` for `next/image`
- **Constraints:** max 4 MB per file; accepted types: JPG, PNG, WEBP

---

## Data Architecture

- Play catalog and production photos are stored in **Supabase (Postgres)** via **Prisma ORM**
- `src/data/works.ts` and `src/data/productions.ts` are **archived reference files** — they are no longer imported by the app; kept for historical context and as the source for `prisma/seed.ts`
- **Type definitions** live in `src/types/play.ts` and `src/types/production.ts`
- **API fetch helpers** live in `src/lib/api.ts` — all public pages call these to fetch data server-side
- **ISR:** all play/production pages use `revalidate = 60` — pages rebuild automatically within 60 seconds of a data change; no manual redeploy needed
- The `Production` model in `prisma/schema.prisma` stores group-level metadata (playTitle, venue, productionYear, displayOrder); `ProductionPhoto` rows link to their parent via `productionId`

---

## What This Site Does NOT Have

- No Tailwind (CSS Modules only)
- Play and production data is managed via Supabase (Postgres) + Prisma — `src/data/works.ts` and `src/data/productions.ts` are archived
- Admin authentication via HTTP Basic Auth (middleware + per-route checks)
- No i18n / multilingual support
