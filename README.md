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
- **Full CV page** — professional history formatted for the theatre industry
- **Rights inquiry form** — contact form with reCAPTCHA protection to handle licensing and production requests
- **Ko-fi support widget** — floating Ko-fi button for direct audience support
- **Fully responsive** — optimized for desktop and mobile
- **Next.js Image optimization** — fast load times across all devices
- **Source image optimization** — all 61 images batch-compressed via a Sharp script; 54.4 MB reduction (34.1%) across cover art, portraits, and UI assets
- **Admin dashboard** — password-protected dashboard at `/admin` for managing plays and production photos; add, edit, delete, and reorder plays and photos without touching code; cover art and production photo uploads via Vercel Blob; featured carousel order managed via drag-up/down interface
- **End-to-end test suite** — Playwright tests covering home, works, play pages, productions, CV, navigation, mobile layouts, and admin API across Chromium, Firefox, WebKit, iPhone 12, and Pixel 5

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
| ORM             | Prisma                                              |
| Database        | Supabase (Postgres)                                 |
| File Storage    | Vercel Blob                                         |
| Auth            | HTTP Basic Auth (Next.js middleware)                |
| E2E Testing     | Playwright                                          |
| Data            | Supabase (Postgres) via Prisma                      |
| Deployment      | Vercel                                              |

---

## Architecture Notes

Play catalog data is managed via **Supabase (Postgres)** using **Prisma ORM**. `src/data/works.ts` and `src/data/productions.ts` are archived reference files kept for historical context and as seed data sources. All pages use ISR (`revalidate = 60`) so content updates made in the admin dashboard appear within 60 seconds without a redeploy.

---

## Roadmap

- [ ] **Pending data updates** — Fill in remaining TBD entries, add Empty Spaces once details are received from client.
- [ ] **URL persistence for /works filters** — Store active filters and sort state in URL params so pages are shareable and survive refresh.
- [ ] **Individual production pages** — Dedicated pages per production with full photo gallery (currently the productions page shows all at once).

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
