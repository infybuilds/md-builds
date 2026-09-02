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
[`supabase/README.md`](supabase/README.md). `npm run build` needs no environment
configuration at all — the variables are read per request, not at build time.

| Script                | Purpose                                       |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | Dev server (Turbopack)                        |
| `npm run build`       | Production build **for Cloudflare** (OpenNext) |
| `npm run build:next`  | Plain `next build`, for a quick check          |
| `npm run preview`     | Build + serve on the real Workers runtime      |
| `npm run deploy`      | Deploy the built worker                       |
| `npm run lint`        | ESLint                                        |
| `npx tsc --noEmit`    | Type check                                    |

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

## Deploying to Cloudflare

The app deploys to **Cloudflare Workers** (with static assets) via
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare), not to Pages.
That is forced, not preference: `@cloudflare/next-on-pages` declares support only
for `next <= 15.5.2`, and Next.js 16's Proxy has no edge runtime option, so the
Pages adapter cannot run this app.

```bash
npm run preview   # build + run the real Workers runtime locally
npm run deploy    # deploy the built worker
```

`npm run build` *is* the Cloudflare build, so Cloudflare's default build command
(`npm run build`) works with no dashboard configuration. Two things make that
safe, and both matter if you ever touch them:

- `open-next.config.ts` pins `buildCommand` to `npx next build`. OpenNext
  otherwise runs `npm run build`, which here runs OpenNext — infinite recursion.
- `npm run build:next` remains available for a plain Next build.

The deploy step needs `.open-next/.build/open-next.config.mjs`, which only the
OpenNext build produces. If the deploy fails with "Could not find compiled Open
Next config", the build command ran plain `next build`.

No Cloudflare resources need provisioning — the worker binds only its static
assets.

### Page caching

There is deliberately no incremental (page) cache, so rendered pages are not
persisted between requests. R2 requires a paid subscription, and once the index
pages became `force-dynamic` the only routes a cache could serve were
`/docs/[slug]` and `/workshops/[slug]`, each costing one Supabase query plus a
Markdown render.

D1 does not fit this role: in OpenNext, D1 backs the *tag* cache, not the page
cache, and a tag cache only helps alongside a page cache with `revalidateTag`,
which this app does not use.

To add caching without an R2 subscription, use Workers KV. Create a namespace,
add the returned id to `wrangler.jsonc` as `NEXT_INC_CACHE_KV` along with a
`WORKER_SELF_REFERENCE` service binding, and pass the adapter's
`kv-incremental-cache` override to `defineCloudflareConfig` in
`open-next.config.ts`. The exact snippets are in the comments at the bottom of
`wrangler.jsonc`.

### Environment variables

Set these as **runtime** variables and secrets on the Worker. No build variables
are needed:

```
SUPABASE_URL
SUPABASE_ANON_KEY        # the publishable key; mark it as a secret
SITE_URL                 # https://md.infybuilds.com in production
```

The missing `NEXT_PUBLIC_` prefix is deliberate and load-bearing. Next.js
replaces `process.env.NEXT_PUBLIC_*` with string literals at build time, so a
prefixed variable is baked in during the build and a runtime variable for it is
simply ignored — the built code no longer reads `process.env`. Unprefixed names
are read per request. Renaming these back to `NEXT_PUBLIC_*` would reintroduce
build-time configuration and break runtime-only setups.

**`keep_vars: true` in `wrangler.jsonc` is load-bearing.** By default wrangler
treats that file as the only source of truth for environment configuration and
deletes dashboard-set variables on every deploy. Without the flag, each CI deploy
silently wiped these three variables, and the site returned 500 on every route.
Do not remove it unless you move the values into a `vars` block instead.

`SITE_URL` falls back to `http://localhost:3000`, so leaving it unset in
production silently produces wrong canonical and Open Graph URLs.

The public index pages (`/`, `/docs`, `/workshops`) set
`export const dynamic = "force-dynamic"` so the build performs no database
access. That is what lets a build succeed with no configuration; it also means
publishing is visible immediately, with no revalidation step.

### Diagnosing a deployed instance

`GET /api/health` reports which configuration values the worker can actually see,
whether the old `NEXT_PUBLIC_*` names are still set, and whether Supabase
answers. It returns 200 when healthy and 503 otherwise, reports presence as
booleans only (never values), and is excluded from the proxy matcher so it keeps
answering when every page is failing.

`proxy.ts` also degrades rather than failing closed on configuration: without
Supabase config it skips the session refresh and passes the request through, so a
missing variable no longer turns every route into a 500. It grants nothing —
`requireAdmin()` still gates `/admin` and needs the same configuration.

One thing to know about builds: OpenNext captures the build-time environment into
`.open-next/cloudflare/next-env.mjs` and injects it at runtime as a *fallback*.
Runtime variables take precedence (verified). But it does mean a local
`npm run deploy` bakes your `.env.local` values into the artifact, so prefer
building in CI where no `.env.local` exists.

### Workers-specific constraints

Two things about this runtime are load-bearing, and both are easy to undo by
accident:

- **No runtime WebAssembly.** Workers reject `WebAssembly.instantiate` on raw
  bytes ("Wasm code generation disallowed by embedder"). Shiki's default
  Oniguruma engine does exactly that, so `lib/markdown/shiki.ts` uses
  `createJavaScriptRegexEngine` instead. Do not switch back to the default
  engine or import from `shiki` root/`shiki/bundle/full`.
- **Fine-grained grammar imports.** Only the languages imported explicitly in
  `lib/markdown/shiki.ts` are available; anything else in a fence renders as
  plain text. Adding a language means adding an import, which keeps the worker
  small.

## Advertising

Two placements on document pages only (`/docs/[slug]`): a sticky slot in the
right rail below the table of contents, and one after the article body before the
previous/next navigation. Nothing on the homepage, the listings, or anywhere
under `/admin`.

Both slots sit **outside** the `.prose` container, so an ad can never land inside
a code block or between paragraphs, and each reserves its height to avoid layout
shift.

Off by default. A placement renders only when `ADS_CLIENT_ID` *and* that slot's
id are both set, so an unconfigured deployment ships no third-party script at
all:

```
ADS_CLIENT_ID=ca-pub-...
ADS_SLOT_SIDEBAR=...
ADS_SLOT_ARTICLE_BOTTOM=...
```

Server-only names, like the rest: the values reach the browser inside
server-rendered HTML, so they work as runtime variables.

This loads the AdSense library and places each unit explicitly. It does **not**
use Auto ads, which would inject vignettes and interstitials — the popup formats
we do not want — and could place units anywhere on the page, including inside the
article body. Do not switch it on in the AdSense dashboard.

Note that phones see only the article-bottom slot: the right rail does not exist
below the `xl` breakpoint.

## Not built yet

Search, `sitemap.xml`, `robots.txt`, analytics and ad placements are planned but
not in this pass.
