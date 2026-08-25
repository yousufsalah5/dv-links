# Daman Virtual — Links

A link-in-bio page for Daman Virtual, plus a private dashboard for managing the
links without touching code.

- **`/links`** — the public page. Mobile-first; it mostly gets opened from
  Instagram on a phone.
- **`/admin`** — password-protected dashboard to add, edit, reorder, highlight
  and delete links.

Links live in a Cloudflare D1 database, so anything changed in the dashboard
shows on the public page immediately — both pages are rendered per request,
never cached.

## Running it locally

First time only:

```bash
npm install
npm run db:migrate   # create the tables in the local database
npm run db:seed      # put the starter links in
```

Then, to work on it:

```bash
npm run dev
```

Open <http://localhost:3000/links> and <http://localhost:3000/admin>.

There is no database server to start. D1 runs locally inside Wrangler, keeping
its data in `.wrangler/state/`, which is git-ignored and entirely separate from
the deployed database.

Useful:

```bash
npm run links          # what is in the local database
npm run links:remote   # what is in the live database
```

## Settings

All secrets live in `.env.local`, which is **not** committed. Recreate it on any
new machine:

| Name             | What it does                                              |
| ---------------- | --------------------------------------------------------- |
| `ADMIN_PASSWORD` | The `/admin` password                                      |
| `AUTH_SECRET`    | Random string that signs the login cookie                  |

The database needs no settings at all — D1 is attached as a binding in
`wrangler.jsonc`, so there is no connection string or password to manage.

In deployment both values are set as Cloudflare secrets rather than files:

```bash
npx wrangler secret put ADMIN_PASSWORD
```

## Deploying

Currently hosted on **Cloudflare Workers** via `@opennextjs/cloudflare`. Not
Cloudflare Pages — Pages cannot run this app's server-side code.

```bash
npx wrangler login
npm run preview   # run the real Workers build locally first
npm run deploy    # build and publish
```

Schema changes go in `migrations/` and are applied with:

```bash
npm run db:migrate:remote
```

### Why D1, and what it costs you

The project originally used MongoDB Atlas. It was replaced because Atlas is
reached over the network, which means a connection string, a database password
and an approved-IP list — and Workers have no fixed IP addresses, so that list
has to be opened to the world. D1 is attached directly to the Worker as a
binding, so none of that exists: no credentials to leak, no network path to
secure, and lower latency.

The tradeoff is that **D1 only runs on Cloudflare**. If this is ever moved to
Vercel or elsewhere, the database has to move too. That is contained work rather
than a rewrite: every query lives in `lib/links.ts` and nothing else touches the
database.

## How the data is shaped

One `links` table, defined in `migrations/0001_create_links.sql`:

| Field      | Notes                                                        |
| ---------- | ------------------------------------------------------------ |
| `title`    | Shown on the button                                           |
| `url`      | Normalised on save; only http, https, mailto and tel allowed  |
| `icon`     | Optional. One of the names in `components/link-icon.tsx`      |
| `image`    | Optional. An uploaded square image as a data URI              |
| `sort_order` | Ascending; reordering swaps this value with a neighbour     |
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

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Cloudflare D1 ·
Cloudflare Workers
