# The Geriatrician's Guide — Astro Site

Production Astro static site for **The Geriatrician's Guide**, a physician-led education
brand for families facing senior living decisions. Deploys to Netlify.

## Stack
- **Astro** (static output)
- **Plain CSS** with custom properties — `src/styles/global.css` (all brand tokens live here; never hardcode hex elsewhere)
- **Google Fonts** — Lora + Source Sans 3, loaded in `BaseLayout.astro`
- **Netlify Forms** — native, used by the contact form
- **Plausible** — placeholder comment in `<head>`

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # → dist/
npm run preview  # preview the production build
```

## Deploy (Netlify)
Connect this repo to Netlify. `netlify.toml` sets `command = "npm run build"` and
`publish = "dist"`. The contact form is picked up automatically by Netlify Forms (it has
`data-netlify="true"`, a hidden `form-name`, and a honeypot field).

## Structure
```
src/
  components/   Header, Footer, LeadMagnetForm
  content/blog/ Markdown posts (content collection)
  layouts/      BaseLayout, BlogPostLayout
  pages/        index, about, products, contact, blog/, + legal stubs
  styles/       global.css (brand tokens + all styles)
public/
  images/author-placeholder.jpg
  admin/        Decap CMS writing dashboard (index.html + config.yml) → /admin
  favicon.ico
```

## Add a blog post

You have two ways to publish. **Most of the time, use the dashboard (option A).**

### A. The writing dashboard (no code) — recommended
Once the site is deployed and Identity is turned on (see below), go to
**`geriatriciansguide.com/admin`**, log in, and click **New Article**. Fill in the
title, URL slug, date, description, optional lead paragraph, and body, then hit
**Publish**. It commits the markdown to this repo and Netlify rebuilds within a minute
or two. No GitHub, no markdown, no install.

The dashboard is **Decap CMS**, configured in `public/admin/config.yml`. The two files
that make it work — `public/admin/index.html` and `public/admin/config.yml` — ship in
this repo and are served at `/admin`.

#### One-time Netlify setup to enable the dashboard
1. Deploy this repo to Netlify (see Deploy below).
2. In the Netlify site dashboard: **Identity → Enable Identity**.
3. **Identity → Services → Git Gateway → Enable Git Gateway.**
4. **Identity → Registration → set to “Invite only”** (so only invited people can log in).
5. **Identity → Invite users →** invite your own email (and Dr. Genualdi’s). Click the
   emailed link, set a password — it drops you into `/admin`. Done.

> If you ever push this project as a repo whose root is **not** this `astro-project`
> folder, prefix the `folder:` and `media_folder:` paths in `public/admin/config.yml`
> with `astro-project/`.

### B. By hand (raw markdown)
Drop a new `.md` file in `src/content/blog/` with this frontmatter:

```yaml
---
title: "Your title"
pubDate: 2026-07-07
description: "One-sentence dek."
slug: "url-slug"
lead: "Optional italic intro paragraph."
---
```

Use `##` for section headings. The lead paragraph and the medical disclaimer are added
automatically by `BlogPostLayout.astro` — you no longer hand-write `<p class="lead">`.

## Placeholders to wire before launch
Search the codebase for these comments:
- `<!-- BEEHIIV EMBED CODE HERE -->` — `src/components/LeadMagnetForm.astro`
- `<!-- LEMON SQUEEZY PRODUCT URL HERE -->` — `src/pages/products.astro` (the buy button `href`)
- `<!-- FREE CHAPTER LINK HERE -->` — `src/pages/products.astro`
- `<!-- PLAUSIBLE SCRIPT TAG HERE -->` — `src/layouts/BaseLayout.astro`
- `<!-- REPLACE author-placeholder.jpg WITH BLUE BLAZER PORTRAIT -->` — `src/pages/about.astro`

## Note on the lead magnet form
Per the brief, `LeadMagnetForm.astro` ships with the Beehiiv embed slot only (no live form).
Paste the Beehiiv embed where marked. The static HTML preview at the project root shows a
styled stand-in input so reviewers can see the intended block; it is not wired to anything.
"# geriatricians-guide" 
