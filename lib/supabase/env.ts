/**
 * Server-only configuration.
 *
 * These names deliberately have **no `NEXT_PUBLIC_` prefix**. Next.js inlines
 * `process.env.NEXT_PUBLIC_*` into the bundle as string literals at build time,
 * so a prefixed variable can only ever come from the build environment — setting
 * it as a runtime variable has no effect, because the built code no longer reads
 * `process.env` at all.
 *
 * Unprefixed names are read from `process.env` at request time, which is what
 * lets these be configured as Cloudflare runtime variables and secrets.
 *
 * Nothing here is exposed to the browser: every Supabase call in this app is
 * server-side (see lib/supabase/{server,public,proxy}.ts). The anon/publishable
 * key would be safe in a browser, but it never needs to go there.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in .env.local for development, or as a runtime variable in production (see supabase/README.md).`,
    );
  }
  return value;
}

export function supabaseUrl(): string {
  return required("SUPABASE_URL", process.env.SUPABASE_URL);
}

export function supabaseAnonKey(): string {
  return required("SUPABASE_ANON_KEY", process.env.SUPABASE_ANON_KEY);
}

/** Absolute origin for canonical and Open Graph URLs. */
export function siteUrl(): string {
  return process.env.SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}
