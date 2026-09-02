/**
 * Configuration and connectivity check.
 *
 * Reports only whether each value is *present* and whether Supabase answers —
 * never the values themselves. Excluded from the proxy matcher so it keeps
 * answering even when configuration is broken and every page is failing.
 */
export const dynamic = "force-dynamic";

/**
 * Reads a variable without letting Next inline it at build time.
 *
 * Next replaces literal `process.env.NEXT_PUBLIC_FOO` with a build-time string,
 * so a literal lookup could never observe a runtime value. A computed key is not
 * statically analysable, so this sees what the worker actually has — which is
 * how we can tell whether the old NEXT_PUBLIC_ names are still configured.
 */
function runtimeEnv(name: string): string | undefined {
  return process.env[name];
}

const REQUIRED = ["SUPABASE_URL", "SUPABASE_ANON_KEY"] as const;
const OPTIONAL = ["SITE_URL"] as const;
const LEGACY = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SITE_URL",
] as const;

export async function GET() {
  const present = (name: string) => Boolean(runtimeEnv(name));

  const config = {
    required: Object.fromEntries(REQUIRED.map((n) => [n, present(n)])),
    optional: Object.fromEntries(OPTIONAL.map((n) => [n, present(n)])),
    // If any of these are set, the variables were never renamed. Values prefixed
    // with NEXT_PUBLIC_ are baked in at build time and cannot be supplied at
    // runtime, so the app does not read them.
    legacyNamesStillSet: LEGACY.filter(present),
  };

  const missing = REQUIRED.filter((n) => !present(n));

  // SITE_URL must be an absolute origin: the root layout passes it to `new URL()`
  // during module evaluation, so a bare host once broke every page render.
  const rawSiteUrl = runtimeEnv("SITE_URL")?.trim();
  const siteUrlValid =
    !rawSiteUrl ||
    (/^https?:\/\//i.test(rawSiteUrl) &&
      URL.canParse?.(rawSiteUrl) !== false);

  let supabase: { reachable: boolean; status?: number; error?: string } = {
    reachable: false,
    error: "not attempted: configuration missing",
  };

  if (missing.length === 0) {
    const url = runtimeEnv("SUPABASE_URL")!.replace(/\/$/, "");
    const key = runtimeEnv("SUPABASE_ANON_KEY")!;
    try {
      // Cheap, RLS-respecting probe: an empty page of published documents.
      const response = await fetch(
        `${url}/rest/v1/documents?select=id&limit=0`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` } },
      );
      supabase = { reachable: response.ok, status: response.status };
      if (!response.ok) supabase.error = await response.text();
    } catch (error) {
      supabase = {
        reachable: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Advertising is optional, so it never affects `ok` — but reporting it makes a
  // mistyped publisher id visible instead of silently breaking the loader.
  const rawAdsId = runtimeEnv("ADS_CLIENT_ID")?.trim();
  const ads = {
    configured: Boolean(rawAdsId),
    // The publisher id is public (it appears in every page's HTML), so echoing
    // the normalised value is safe and is the whole point of the check.
    clientId: rawAdsId
      ? rawAdsId.startsWith("ca-pub-")
        ? rawAdsId
        : rawAdsId.startsWith("pub-")
          ? `ca-${rawAdsId}`
          : rawAdsId
      : null,
    slots: {
      sidebar: Boolean(runtimeEnv("ADS_SLOT_SIDEBAR")),
      articleBottom: Boolean(runtimeEnv("ADS_SLOT_ARTICLE_BOTTOM")),
    },
  };

  const ok = missing.length === 0 && supabase.reachable && siteUrlValid;

  return Response.json(
    { ok, missing, config, ads, siteUrl: { valid: siteUrlValid, hasScheme: Boolean(rawSiteUrl && /^https?:\/\//i.test(rawSiteUrl)) }, supabase },
    { status: ok ? 200 : 503 },
  );
}
