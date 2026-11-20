# Mecatronix Admin UI

React 19 + Vite admin app for the Mecatronix API (mec-api).

## Getting started

Start the backend on `http://localhost:5000`, then run either:

```sh
bun install && bun run dev
# or
npm install && npm run dev
```

Open `http://localhost:5174`. API requests default to `/mec-api`; Vite proxies
that path to `http://localhost:5000/mec-api` during development (and in `vite preview`).

## Scripts

| Script      | What it does                                                         |
| ----------- | -------------------------------------------------------------------- |
| `dev`       | Dev server on port 5174                                              |
| `build`     | Type-check and build to `dist/`                                      |
| `preview`   | Serve the production build on port 4174                              |
| `typecheck` | TypeScript in strict mode                                            |
| `lint`      | ESLint                                                               |
| `check`     | Lint, type-check and build in one go (run before deploying)          |
| `icons`     | Regenerate favicons, app icons, the share image and the in-app logo  |

## Configuration

Vite loads these files automatically (later ones win), and Vite must be restarted after editing them:

| File                    | Used by             | In git | Contents                                        |
| ----------------------- | ------------------- | ------ | ----------------------------------------------- |
| `.env`                  | `dev` and `build`   | no     | Local development values                        |
| `.env.production`       | `build`, `preview`  | yes    | Production values (public site, API path)       |
| `.env.*.local`          | matching mode       | no     | Personal overrides on one machine               |
| `.env.example`          | nobody (reference)  | yes    | Every variable, documented: copy it to `.env`   |

Every `VITE_` value ends up in the browser bundle, so never put secrets in these files.
Variable types live in `src/env.d.ts`.

| Variable                     | Purpose                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`          | API base including the prefix, e.g. `https://api.example.com/mec-api`. Defaults to `/mec-api`.          |
| `VITE_API_PROXY_TARGET`      | Where the dev/preview proxy sends `/mec-api`. Defaults to `http://localhost:5000`.                      |
| `VITE_API_CUSTOMER_BASE_URL` | Public website URL (locally `http://localhost:3000`). Used for previews and the work library.           |
| `VITE_ADMIN_URL`             | This admin app's public URL. Adds a canonical link and absolute link-preview image URLs at build time. |

A separate API host must allow the admin origin and credentials in its CORS configuration.
The work library uses the public website's `/api/portfolio` endpoint to include existing website projects.

## Deploying

Run `npm run build` (or `bun run build`) and serve `dist/`. Configure the host to:

- forward `/mec-api` to the backend, or set `VITE_API_BASE_URL` before building;
- fall back to `index.html` for every other path (client-side routing);
- cache `/assets/*` for a long time (file names are content-hashed) and **not** cache `index.html`.

Tabs left open across a deploy reload themselves once to pick up the new version.

## Logo, icons and SEO

`src/assets/logos/mecatronix-logo.png` is the master logo. After replacing it, run `bun run icons`
(or `npm run icons`) to regenerate:

- `public/favicon.ico` (16/32/48 px), `public/icons/*` (manifest, maskable and Apple touch icons)
- `public/og-image.png` (1200×630 link-preview card)
- `src/assets/logos/mecatronix-logo.webp` (the lightweight copy the UI shows)

This is a private console, so it is deliberately kept **out of search engines**: `robots.txt`
disallows everything and every page sends `noindex, nofollow`. The meta tags, Open Graph / Twitter
card and web manifest make shared links and home-screen installs look right without exposing it
to search. Each page sets its own document title.

## Error handling

- **404**: unknown URLs. Inside `/mec-admin` the page keeps the sidebar.
- **403**: superadmin-only areas (Admins) for regular admins.
- **500 / 503**: a page that crashes shows an error inside the shell; server outages offer a retry.
- **Offline**: a banner appears while the connection is down; the session check shows an offline
  screen instead of signing the admin out.
- **New version**: a missing page chunk after a deploy triggers one automatic reload.

In development, error screens include the stack trace.

## Website content

- **Works** and **Projects** manage project names, URLs, clients, publication and case-study sections.
- **Work details & media** at `/mec-admin/project-media` includes the public website's existing projects, backend projects and saved media. Upload screenshots or videos, change descriptions, reorder covers, remove entries, and click **Save media**. **Edit work details** updates the case-study sections, including for website projects without a backend Project record.
- **MECA robot board** at `/mec-admin/meca-board` controls visibility, message, highlight, destination and repeat interval (1–60 minutes), with a live message preview.

Media uploads go directly to mec-api using short-lived upload permissions. Allow the admin origin through the backend's `ADMIN_URL`; `API_URL` must be reachable from the browser. Screenshots support JPEG, PNG, WebP and GIF up to 10 MB (30/project); videos support MP4/WebM up to 100 MB (10/project).

Website content is stored by the existing backend. Configure its `SITE_REVALIDATE_URL` and `SITE_REVALIDATE_SECRET` to match the public website for immediate updates, with a 60-second cache fallback. Deploy the public website update before using the new catalog endpoint. The public website no longer hosts an admin login or `/api/admin` proxy.
