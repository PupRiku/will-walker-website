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
│   ├── images/          # All play cover art + site images (logo, headshots, icons)
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
│   │   └── works.ts                 # THE SOURCE OF TRUTH for all play content
│   ├── utils/
│   │   └── filterSort.ts            # Pure filter/sort logic extracted from WorksClient (testable)
│   └── test/
│       ├── setup.ts                 # @testing-library/jest-dom import
│       ├── data/works.test.ts       # Data integrity + generateStaticParams tests
│       ├── components/
│       │   ├── Modal.test.tsx
│       │   └── Header.test.tsx
│       ├── pages/
│       │   └── playPage.test.tsx    # Individual play page render tests
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

**All play content lives in `src/data/works.ts`.** This is the single source of truth — both the home page carousel and the `/works` full catalog read from `worksData`.

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

1. Add a new image to `/public/images/` following the existing naming convention (e.g., `My_New_Play_Cover_Art.png`)
2. Add a new entry to the `worksData` array in `src/data/works.ts`
3. Give it a unique `slug`: lowercase, hyphens, no punctuation (e.g., `'my-new-play'`). `&` → `and`, drop apostrophes.
4. Set `featured: true` to include it in the home page carousel
5. Leave `pdfSrc: ''` if no sample PDF is available

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

```bash
NEXT_PUBLIC_RECIPIENT_EMAIL=       # Email address FormSubmit delivers contact form submissions to
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=    # reCAPTCHA v2 site key
```

Both are `NEXT_PUBLIC_` and are exposed to the browser. Do not store secrets here. A `.env.local` file is required for local development and is not committed to the repo.

---

## Routing

| Route | File | Notes |
|---|---|---|
| `/` | `src/app/page.tsx` | Hero + About + Plays carousel + Contact |
| `/works` | `src/app/works/page.tsx` | Full play grid; cards link to individual play pages |
| `/works/[slug]` | `src/app/works/[slug]/page.tsx` | Individual play page; pre-rendered via `generateStaticParams` |
| `/cv` | `src/app/cv/page.tsx` | Full CV (hardcoded) |
| `/thank-you` | `src/app/thank-you/page.tsx` | Post-contact-form confirmation |
| `/api/form` POST | `src/app/api/form/route.ts` | Redirects to `/thank-you` (FormSubmit handles the actual email) |

Anchor sections on the home page: `#home`, `#about`, `#plays`, `#contact`

`/works/[slug]` uses `generateStaticParams()` to pre-render all play pages at build time. Unknown slugs call `notFound()`. The `params` object is typed as `Promise<{ slug: string }>` per Next.js 15 App Router convention.

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

## Roadmap (from README)

Planned future features — do not implement unless explicitly asked:

- [ ] **Admin backend** — authenticated dashboard for Will to manage plays without touching code (likely Postgres or headless CMS)
- [ ] **Pending data updates** — runtime/cast fields still marked TBD need values from Will
- [ ] **Image optimization audit** — verify all cover images are appropriately sized

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

**Mocking pattern:** `next/image` and `next/link` are mocked with simple HTML equivalents in each component/page test file. `SocialLinks` is mocked in `Header.test.tsx`. `next/navigation` is mocked in playPage.test.tsx (`notFound` throws to allow assertion).

---

## Common Tasks

**Add a new play**
1. Add cover image to `/public/images/`
2. Add entry to `worksData` in `src/data/works.ts`
3. Set `featured: true` to include in home carousel

**Mark a play as published**
Set `published: true` and add `purchase: 'https://...'` in `works.ts`

**Update bio / about text**
Edit `src/components/About.tsx` directly (hardcoded prose)

**Update CV**
Edit `src/app/cv/page.tsx` directly (hardcoded)

**Add or change a social link**
Edit `socialLinks` array in `SocialLinks.tsx` and update `sameAs` in `layout.tsx`

**Change Ko-fi button color or label**
Edit `src/components/KoFiWidget.tsx`

---

## What This Site Does NOT Have

- No Tailwind (CSS Modules only)
- No database or CMS — all content is in `works.ts` or hardcoded in TSX files
- No authentication
- No i18n / multilingual support
