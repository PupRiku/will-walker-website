# William L. Walker Montgomerie — Official Website

The personal and professional website for **William L. Walker Montgomerie**, playwright, director, and educator. Built as a commission for a real client and deployed to production on Vercel.

🔗 **Live site:** [willwalkermontgomeriewrites.com](https://www.willwalkermontgomeriewrites.com)

---

## Overview

A performant, accessible portfolio site that serves as Will's primary professional presence on the web. The site showcases his full catalog of published and produced plays, his CV, and provides a rights inquiry form for theatres and producers interested in licensing his work.

---

## Features

- **Selected Works catalog** — 50+ plays with cover art, genre tags, and publication status, sourced from a structured TypeScript data file
- **Full CV page** — professional history formatted for the theatre industry
- **Rights inquiry form** — contact form with reCAPTCHA protection to handle licensing and production requests
- **Featured plays carousel** — Embla-powered carousel on the home page highlighting selected works
- **Ko-fi support widget** — floating Ko-fi button for direct audience support
- **Fully responsive** — optimized for desktop and mobile
- **Next.js Image optimization** — fast load times across all devices

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

- [ ] **Search & filter on `/works`** — Frontend-only filtering by genre, cast size, runtime, and publication status. No backend required; the existing data model in `src/data/works.ts` already supports it.
- [ ] **Individual play pages** — Dedicated routes (e.g., `/works/hamlet-a-horatio-story`) for each play, making them linkable, shareable, and indexable by search engines. Replaces or supplements the current modal-only detail view.
- [ ] **Image optimization audit** — Audit and compress cover art source files in `/public/images/`, several of which are 3–4MB PNGs. Next.js handles resizing at runtime but large source files still impact load time, especially on `/works`.
- [ ] **Admin backend** — Authenticated dashboard for Will to add and manage plays without touching code. Will require a database or headless CMS integration (likely Postgres or Sanity). Defer until items 1 and 2 are complete.

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
