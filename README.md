# William L. Walker Montgomerie — Official Website

The personal and professional website for **William L. Walker Montgomerie**, playwright, director, and educator. Built as a commission for a real client and deployed to production on Vercel.

🔗 **Live site:** [willwalkermontgomeriewrites.com](https://www.willwalkermontgomeriewrites.com)

---

## Overview

A performant, accessible portfolio site that serves as Will's primary professional presence on the web. The site showcases his full catalog of published and produced plays, his CV, and provides a rights inquiry form for theatres and producers interested in licensing his work.

---

## Features

- **Selected Works catalog** — 20+ plays with cover art, genre tags, and publication status, sourced from a structured JSON data file
- **Full CV page** — professional history formatted for the theatre industry
- **Rights inquiry form** — contact form with reCAPTCHA protection to handle licensing and production requests
- **Fully responsive** — optimized for desktop and mobile
- **Next.js Image optimization** — fast load times across all devices

---

## Tech Stack

| Layer           | Technology                 |
| --------------- | -------------------------- |
| Framework       | Next.js (App Router)       |
| Language        | TypeScript                 |
| Styling         | CSS Modules / Tailwind CSS |
| Form Protection | reCAPTCHA                  |
| Data            | JSON (static content file) |
| Deployment      | Vercel                     |

---

## Architecture Notes

Play catalog data is currently managed via a static JSON file, which keeps the site simple and fast with no database dependency. This was an intentional MVP decision — the data changes infrequently and the JSON approach allows Will to understand and review the data directly.

---

## Roadmap

- [ ] **Search & filter** — Allow visitors to filter plays by genre, length, cast size, or publication status
- [ ] **Admin backend** — A simple authenticated dashboard for Will to add, edit, and manage plays without touching code or JSON files directly; will require a database integration (likely Postgres or a headless CMS)
- [ ] **Individual play pages** — Dedicated pages per play with full synopsis, production history, and licensing details

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
