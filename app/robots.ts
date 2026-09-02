import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/supabase/env";

/**
 * Rendered per request rather than at build time. `SITE_URL` is a Cloudflare
 * runtime variable, so a build-time render would bake in the localhost fallback
 * from `siteUrl()` and point every crawler at a sitemap that does not exist.
 */
export const dynamic = "force-dynamic";

/**
 * `Disallow` is prefix-matched, so a single `/admin` rule covers `/admin`,
 * `/admin/login` and everything below them.
 *
 * This is not a security control — it is a request that well-behaved crawlers
 * skip pages that would only ever redirect them to a login form. The actual gate
 * is `requireAdmin()` plus RLS (see the README).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
