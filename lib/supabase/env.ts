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

const FALLBACK_SITE_URL = "http://localhost:3000";

/**
 * Absolute origin for canonical and Open Graph URLs.
 *
 * Tolerant on purpose. The root layout feeds this to `new URL()` at module
 * evaluation time, so a malformed value used to throw before Next could catch
 * it — taking down every page render (route handlers kept working, which made it
 * look like a data problem) and returning a bare 500 with no error page.
 *
 * A bare host like `example.com` is treated as https, and anything unparseable
 * falls back to localhost with a loud log rather than breaking the site.
 */
export function siteUrl(): string {
  const raw = process.env.SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    // `.origin` also drops any trailing slash or path.
    return new URL(withScheme).origin;
  } catch {
    console.error(
      `Invalid SITE_URL (${JSON.stringify(raw)}); falling back to ${FALLBACK_SITE_URL}. Set an absolute origin such as https://md.infybuilds.com.`,
    );
    return FALLBACK_SITE_URL;
  }
}
