# Supabase setup

## 1. Run the migrations

The Supabase CLI is a dev dependency, so `npx supabase` works without a global
install. Log in and link the project once:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
```

`link` asks for the database password (Project Settings -> Database). Then apply
everything in `migrations/`:

```bash
npx supabase db push
```

Migrations are applied in filename order and recorded in
`supabase_migrations.schema_migrations`, so re-running `db push` is a no-op once
they are applied. Create new ones with `npx supabase migration new <name>` so they
get a correctly ordered timestamp.

Two alternatives, if the CLI is not an option:

- **psql** - `psql "<connection string>" -v ON_ERROR_STOP=1 -f migrations/<file>.sql`,
  once per file in filename order. Leave the password out of the connection string
  and psql will prompt for it.
- **SQL editor** - paste each file in the dashboard, in filename order.

Both of those bypass the CLI bookkeeping, so a later `db push` will try to
re-apply them. `npx supabase migration repair --status applied <version>` tells the
CLI they are already in place.

## 2. Local environment

Copy `.env.example` to `.env.local` in the repo root and fill in the two values
from **Project Settings → API Keys**:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Use the **publishable** key. It replaces the legacy `anon` key and is meant to
be exposed in a browser; the variable name is kept for continuity with the
Supabase docs. Never put a **secret** key (`sb_secret_...`) in a `NEXT_PUBLIC_`
variable — it bypasses RLS and would be shipped to every visitor.

`SUPABASE_SERVICE_ROLE_KEY` is intentionally unused by this app — every read and
write goes through RLS with the anon key plus the user's session. Do not add it.

## 3. Create the first admin

Admin cannot be self-assigned, so bootstrap it manually:

1. **Authentication → Users → Add user**, with "Auto Confirm User" checked.
   The `on_auth_user_created` trigger creates the matching `profiles` row with
   role `user`.
2. In the SQL Editor, promote it:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

3. Sign in at `/admin/login`.

To revoke admin, set the role back to `'user'`. The change takes effect on the
next request — there is no cached role.

## 4. Auth configuration

Under **Authentication → URL Configuration**, set:

- **Site URL** — `http://localhost:3000` in development, `https://md.infybuilds.com` in production
- **Redirect URLs** — add both origins

Email signups can be disabled entirely (**Authentication → Providers → Email →
Enable sign ups: off**); public visitors never need accounts, and admins are
created by hand.

## Verifying the policies

From the SQL Editor these queries run as `postgres`, which bypasses RLS — they
prove nothing. Test as `anon` instead, e.g. against the REST API:

```bash
# Should return only published documents
curl "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/documents?select=slug,published" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Should be rejected by RLS
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/documents" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"nope","slug":"nope"}'
```
