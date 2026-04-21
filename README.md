# William L. Walker Montgomerie — Official Website

The personal and professional website for **William L. Walker Montgomerie**, playwright, director, and educator. Built as a commission for a real client and deployed to production on Vercel.

🔗 **Live site:** [willwalkermontgomeriewrites.com](https://www.willwalkermontgomeriewrites.com)

---

## Overview

A performant, accessible portfolio site that serves as Will's primary professional presence on the web. The site showcases his full catalog of published and produced plays, his CV, and provides a rights inquiry form for theatres and producers interested in licensing his work.

---

## Features

- **Selected Works catalog** — 57 plays with cover art, genre tags, and publication status, sourced from a structured TypeScript data file
- **Standardized play data** — all 57 plays normalized to a consistent 13-category genre taxonomy; runtime values unified to range format (e.g. `45–55 minutes`); cast notation standardized to M/F/NB/Flexible across all entries
- **Individual play pages** — dedicated page for every play at `/works/[slug]` (e.g. `/works/hamlet-a-horatio-story`); all 57 pages statically pre-rendered at build time via `generateStaticParams`; per-page SEO metadata generated from play data; two-column layout (cover image + details) with full mobile responsiveness; action buttons for reading samples, purchasing rights, and downloading the royalties scale; "← Back to All Works" navigation link on every page
- **Search & filter** — real-time text search by title and synopsis; filter by genre, runtime, cast size, and published status simultaneously; sticky filter bar, result count, and a friendly empty state when no results match — all client-side, no API calls; play cards link directly to individual play pages
- **Featured plays carousel** — Embla-powered carousel on the home page highlighting selected works, with a modal preview and "View Full Page →" link to each play's dedicated page
- **Productions page** — dedicated `/productions` page showcasing production photos organized by play and venue; 3-column desktop grid, 2-column tablet, 1-column mobile; optional per-photo captions; production data managed via `src/data/productions.ts` and easily extensible as new productions are added; photos stored in `/public/images/photos/` and processed through the optimize-images script
- **Full CV page** — professional history formatted for the theatre industry
- **Rights inquiry form** — contact form with reCAPTCHA protection to handle licensing and production requests
- **Ko-fi support widget** — floating Ko-fi button for direct audience support
- **Fully responsive** — optimized for desktop and mobile
- **Next.js Image optimization** — fast load times across all devices
- **Source image optimization** — all 61 images batch-compressed via a Sharp script; 54.4 MB reduction (34.1%) across cover art, portraits, and UI assets; `/public/images/` organized into three subfolders — `covers/` (play cover art), `photos/` (production photos), `assets/` (site UI images) — with the optimize-images script updated to handle each subfolder independently

---

## Tech Stack

| Layer           | Technology                                          |
| --------------- | --------------------------------------------------- |
| Framework       | Next.js 15 (App Router)                             |
| Language        | TypeScript 5 (strict mode)                          |
| Styling         | CSS Modules (per-component `.module.css` files)     |
| Fonts           | Google Fonts via `next/font` (Lora, Lato, Special Elite) |
| Carousel        | Embla Carousel                                      |
| Icons           | React Icons                                         |
| Form Service    | FormSubmit.co                                       |
| Form Protection | reCAPTCHA v2                                        |
| Analytics       | Vercel Analytics                                    |
| Data            | TypeScript (static content file)                    |
| Deployment      | Vercel                                              |

---

## Architecture Notes

Play catalog data is currently managed via a static TypeScript file (`src/data/works.ts`), which keeps the site simple and fast with no database dependency. This was an intentional MVP decision — the data changes infrequently and the TypeScript approach allows the data to be reviewed directly while benefiting from type safety.

---

## Roadmap

- [ ] **Admin backend** — Authenticated dashboard for Will and Chris to manage plays without touching code. Stack: Supabase (Postgres), Prisma ORM, Vercel Blob (image uploads), HTTP Basic Auth via Next.js middleware. Currently in active development on the `feature/admin-backend` branch.
- [ ] **Pending data updates** — Fill in remaining TBD entries (runtimes, cast sizes), add Empty Spaces once details are received from client.
- [ ] **URL persistence for `/works` filters** — Store active filters and sort order in URL params so pages are shareable and survive refresh.

---

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view locally.

---

## About the Project

This was built as a commission for a working playwright who needed a professional web presence to support licensing inquiries and showcase his catalog. The goal was a site that felt personal and theatrical — not a generic portfolio template — while remaining easy to maintain and extend over time.
