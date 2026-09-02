import type { MetadataRoute } from "next";

import {
  getPublishedDocuments,
  getPublishedWorkshops,
} from "@/lib/content/public";
import { siteUrl } from "@/lib/supabase/env";

/**
 * Rendered per request rather than at build time, for two reasons: the queries
 * below need Supabase credentials, which are Cloudflare runtime variables, and
 * the URL set changes whenever an admin publishes something. A build-time
 * sitemap would need database access during `next build` and then go stale.
 */
export const dynamic = "force-dynamic";

/**
 * Only published content reaches this list — the queries read through the
 * session-free client, so RLS hides drafts at the database level. `/admin` is
 * absent for the same reason it is in robots.txt: those URLs only ever redirect
 * an anonymous visitor to a login form.
 *
 * Locked lessons are left out on purpose. Their body is withheld server-side, so
 * the page is a "this is locked" placeholder with nothing to index; the same
 * documents are marked `noindex` in `app/(public)/docs/[slug]/page.tsx`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const [workshops, documents] = await Promise.all([
    getPublishedWorkshops(),
    getPublishedDocuments(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/viewer`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/docs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${base}/workshops`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  return [
    ...staticRoutes,
    ...workshops.map((workshop) => ({
      url: `${base}/workshops/${workshop.slug}`,
      lastModified: new Date(workshop.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...documents
      .filter((document) => !document.locked)
      .map((document) => ({
        url: `${base}/docs/${document.slug}`,
        lastModified: new Date(document.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
  ];
}
