# Daman Virtual — Links

A link-in-bio page for Daman Virtual, plus a private dashboard for managing the
links without touching code.

- **`/links`** — the public page people see. Mobile-first, brand-styled.
- **`/admin`** — password-protected dashboard to add, edit, reorder and
  delete links.

Links live in MongoDB, so anything changed in the dashboard shows up on the
public page on the next load.

## Running it on your Mac

```bash
npm install
npm run dev
```

Then open <http://localhost:3000/links>.

## Filling the database with starter links

```bash
npm run seed
```

Safe to run more than once — it never overwrites links you have edited.

## Settings and passwords

All secrets live in `.env.local`, which is deliberately **not** committed to
GitHub. It holds:

| Name             | What it does                                          |
| ---------------- | ----------------------------------------------------- |
| `MONGODB_URI`    | Connection to the MongoDB Atlas database               |
| `MONGODB_DB`     | Database name (`damanvirtual`)                         |
| `ADMIN_PASSWORD` | The password for `/admin` — change this to your own    |
| `AUTH_SECRET`    | Random value that signs the login cookie; leave alone  |

If you set this project up on another machine, recreate `.env.local` there.

## Brand assets

- `app/fonts/` — Codec Pro, the Daman Virtual brand typeface.
  This is a commercial typeface; Daman Virtual holds the licence covering its
  use here.
- `public/brand/dv-mark.png` — the logo mark, taken from the approved
  white-on-dark logo artwork.

## Tech

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · MongoDB Atlas
