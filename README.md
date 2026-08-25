# Daman Virtual — Links

A link-in-bio page for Daman Virtual, plus a private dashboard for managing the
links without touching code.

- **`/links`** — the public page. Mobile-first; it mostly gets opened from
  Instagram on a phone.
- **`/admin`** — password-protected dashboard to add, edit, reorder, highlight
  and delete links.

Links live in MongoDB, so anything changed in the dashboard shows on the public
page immediately — both pages are rendered per request, never cached.

## Running it locally

Two terminal tabs, both from the project folder.

```bash
npm install
npm run db     # tab one: a real MongoDB on this machine. Leave running.
npm run dev    # tab two: the site. Leave running.
```

Then open <http://localhost:3000/links> and <http://localhost:3000/admin>.

`npm run db` exists so the site can be developed without depending on MongoDB
Atlas being reachable. It stores data in `.local-db/`, which is git-ignored, and
is completely separate from any hosted database.

Useful extras:

```bash
npm run seed    # put the starter links in. Safe to re-run; never overwrites edits.
npm run links   # print what is currently in the database
```

## Settings

All secrets live in `.env.local`, which is **not** committed. Recreate it on any
new machine:

| Name             | What it does                                              |
| ---------------- | --------------------------------------------------------- |
| `MONGODB_URI`    | Database connection string                                 |
| `MONGODB_DB`     | Database name — `damanvirtual`                             |
| `ADMIN_PASSWORD` | The `/admin` password                                      |
| `AUTH_SECRET`    | Random string that signs the login cookie                  |

In deployment the same four are set as Cloudflare secrets, not as files.

## Deploying

Currently hosted on **Cloudflare Workers** via `@opennextjs/cloudflare`. Not
Cloudflare Pages — Pages cannot run this app's server-side code.

```bash
npx wrangler login
npm run preview   # run the real Workers build locally first
npm run deploy    # build and publish
```

Secrets are set once per environment:

```bash
npx wrangler secret put MONGODB_URI
```

`wrangler.jsonc` sets `nodejs_compat` with a 2026 compatibility date. Both are
required — that is what allows the MongoDB driver to open a TCP/TLS connection
from the Workers runtime. The connection pool is deliberately capped at one per
isolate in `lib/mongodb.ts`, with a 5s server-selection timeout so database
problems fail fast instead of hanging the page.

**Atlas network access:** Workers have no fixed IP addresses, so Atlas must be
set to allow access from anywhere (`0.0.0.0/0`). That leaves the database
password as the protecting factor, so it should be strong and rotated if it has
ever been shared.

## How the data is shaped

One `links` collection. Each document:

| Field      | Notes                                                        |
| ---------- | ------------------------------------------------------------ |
| `title`    | Shown on the button                                           |
| `url`      | Normalised on save; only http, https, mailto and tel allowed  |
| `icon`     | Optional. One of the names in `components/link-icon.tsx`      |
| `image`    | Optional. An uploaded square image as a data URI              |
| `order`    | Ascending; reordering swaps this value with a neighbour       |
| `featured` | Only ever true on one link — setting it clears the others     |

`image` takes priority over `icon`. Uploads are cropped to a centred square and
resized to 128px **in the browser** before being sent, so nothing large reaches
the database (a typical one is ~2KB). The server independently re-checks that
what arrives is a real raster image data URI under a size cap.

## Auth

One password, held server-side in `ADMIN_PASSWORD` and never sent to the
browser. A correct password mints a week-long cookie containing an expiry plus
an HMAC of that expiry, signed with `AUTH_SECRET`, so it cannot be forged or
extended. Comparison is constant-time. See `lib/auth.ts`.

Deliberately simple: no user accounts, no password reset. Changing the password
means changing the environment variable. Suits a single administrator; would
need replacing if several people ever need their own logins.

## Brand assets

- `app/fonts/` — Codec Pro, the brand typeface. Licensed by Daman Virtual.
- `public/brand/dv-lockup.png` — the approved stacked logo, used in the page
  header. Cropped from the supplied artwork; nothing about it was recoloured.

The palette is defined once as tokens at the top of `app/globals.css`. Teal is
used sparingly and deliberately: the featured link, hover arrows, and focus
rings only.

## Tech

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · MongoDB · Cloudflare
Workers
