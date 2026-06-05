# Attendance Tracker

A free, fast attendance tracker for students. Built with Astro 6 + Tailwind CSS v4 + Better Auth + SQLite + Drizzle.

See [DESIGN.md](../DESIGN.md) for the full product spec.

## Quick start

```bash
cd my-app
npm install
cp .env.example .env
# generate a secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# paste it as BETTER_AUTH_SECRET in .env

npm run dev
# open http://localhost:4321
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start dev server on `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run astro -- check` | Type-check (strict) |

## Project structure

See [DESIGN.md §14](../DESIGN.md) for the full file tree.
