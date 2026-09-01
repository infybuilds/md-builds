# InfyBuilds Markdown Hub

Markdown content platform for workshop materials, tutorials, guides and
developer references — the app behind `md.infybuilds.com`.

- **Public visitors** read published documents and workshops. No account, ever.
- **Admins** sign in at `/admin` to write Markdown, organise it into workshops
  and categories, and publish it.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
(Radix primitives) and Supabase (Postgres + Auth).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the two Supabase values
npm run dev
```

Database setup, including how to create the first admin, is in
[`supabase/README.md`](supabase/README.md). The app throws a clear error on
startup if `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is
missing, so configure those before running `npm run dev` or `npm run build`.

| Script          | Purpose                          |
| --------------- | -------------------------------- |
| `npm run dev`   | Dev server (Turbopack)           |
| `npm run build` | Production build                 |
| `npm run lint`  | ESLint                           |
| `npx tsc --noEmit` | Type check                    |

## How authorization works

Four independent layers, so no single mistake exposes admin data:

1. **`proxy.ts`** refreshes the Supabase session and redirects `/admin/*`
   requests with no session to `/admin/login`. Optimistic only — a cookie check,
   not an authorization decision. (Next.js 16 renamed Middleware to Proxy.)
2. **`app/admin/(protected)/layout.tsx`** calls `requireAdmin()` on every render,
   which verifies the JWT with `auth.getUser()` and reads `profiles.role` from
   the database.
3. **Every server action** calls `requireAdmin()` before it looks at form data.
4. **Row Level Security** in Postgres allows writes only when
   `public.is_admin()`, and allows anonymous reads only of published rows.

`profiles.role` can only be changed from the Supabase SQL editor, so no user can
grant themselves admin. `SUPABASE_SERVICE_ROLE_KEY` is deliberately unused: the
anon key plus RLS covers every operation.

Public pages read through `lib/supabase/public.ts`, a session-free client. Unpublished
content is invisible to it at the database level, and because it never touches
cookies those pages stay cacheable — admin mutations call `revalidatePath`.

## UI

shadcn/ui components live in `components/ui/` and are owned by this repo — edit
them directly rather than reaching for wrappers. `components.json` records the
style (`radix-nova`), the `neutral` base colour and the import aliases the CLI
uses when you run `npx shadcn@latest add <component>`.

Theming is class-based via `next-themes`: `app/globals.css` holds the light
tokens on `:root` and the dark ones under `.dark`, and the header's toggle offers
light / dark / system. The Markdown, code-block and Shiki styles at the bottom of
that file are written against the same tokens, so they follow the theme without a
second palette to maintain.

Two things to know about the forms. Radix `Select` rejects an empty-string item
value, so "no category" submits the sentinel `"none"`, which
`lib/validation/schemas.ts` maps to `NULL`. And Radix `Select` and `Checkbox`
render hidden native controls, which is why plain `FormData` server actions keep
working without any client-side serialisation.

## Markdown rendering

`lib/markdown/render.ts` is the single pipeline for published output:

```
remark-parse → remark-gfm → remark-rehype → rehype-sanitize → rehype-slug → shiki → rehype-stringify
```

Raw HTML never enters the tree (`allowDangerousHtml` is off) and
`rehype-sanitize` runs before highlighting, so Shiki's own markup needs no
sanitizer allowances. `lib/markdown/toc.ts` slugs headings with the same
algorithm rehype-slug uses, so the table of contents anchors always match.

The admin editor's live preview uses `react-markdown` with the same sanitizer but
without Shiki, to keep a syntax highlighter out of the browser bundle. Fenced
code is styled there but not colour-highlighted; published pages are.

## Layout

```
app/
  (public)/           homepage, /docs, /docs/[slug], /workshops, /workshops/[slug]
  admin/
    login/            the one unprotected /admin route
    (protected)/      dashboard, documents, workshops, categories
    _actions/         server actions (all call requireAdmin() first)
components/           markdown/, navigation/, admin/, ui/
lib/
  supabase/           server, proxy and public clients + env access
  auth/               requireAdmin()
  content/            queries (public and admin), kept out of components
  markdown/           render pipeline, Shiki transformer, TOC
  validation/         zod schemas shared by the server actions
supabase/migrations/  schema and RLS
proxy.ts              session refresh + optimistic /admin redirect
```

## Not built yet

Search, `sitemap.xml`, `robots.txt`, analytics and ad placements are planned but
not in this pass.
