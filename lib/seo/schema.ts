import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";
import { siteUrl } from "@/lib/supabase/env";

/**
 * Schema.org payloads for the public pages.
 *
 * Every builder returns a `@graph` that carries the `Organization` and `WebSite`
 * nodes alongside the page's own node, rather than pointing at them by `@id` and
 * defining them only on the homepage. A crawler reads one page at a time, so a
 * cross-page `@id` reference is a dangling one — the node has to be in the same
 * document for `author`, `publisher` and `isPartOf` to resolve.
 *
 * Deliberately absent: `SearchAction` on the `WebSite` (there is no /search
 * route yet — advertising one that 404s is worse than omitting it) and
 * `FAQPage` on the viewer. Google retired FAQ rich results for most sites in
 * 2023, so that markup earns nothing; the visible FAQ copy is the part that
 * still does work.
 */

/** Stable `@id`s, so nodes in a graph can refer to each other. */
function ids(base: string) {
  return {
    website: `${base}/#website`,
    organization: `${base}/#organization`,
  };
}

function organizationNode(base: string) {
  return {
    "@type": "Organization",
    "@id": ids(base).organization,
    name: SITE_NAME,
    url: base,
  };
}

function websiteNode(base: string) {
  const { website, organization } = ids(base);

  return {
    "@type": "WebSite",
    "@id": website,
    name: `${SITE_NAME} Markdown Hub`,
    url: base,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": organization },
  };
}

/** The site identity, plus whatever this particular page is. */
function graph(...nodes: Array<Record<string, unknown>>) {
  const base = siteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(base), websiteNode(base), ...nodes],
  };
}

/** The homepage carries the site identity and nothing more specific. */
export function siteSchema() {
  return graph();
}

/**
 * The viewer is a tool, not a document, so it is marked up as a
 * `WebApplication`. `offers` with a zero price is what states "free" in a form
 * search engines read; `isAccessibleForFree` says the same thing for the
 * content-oriented types.
 */
export function webApplicationSchema({
  name,
  description,
  path,
  featureList,
}: {
  name: string;
  description: string;
  path: string;
  featureList: string[];
}) {
  const base = siteUrl();
  const { website, organization } = ids(base);

  return graph({
    "@type": "WebApplication",
    name,
    description,
    url: `${base}${path}`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript.",
    isAccessibleForFree: true,
    featureList,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: { "@id": organization },
    isPartOf: { "@id": website },
  });
}

/**
 * `TechArticle` rather than plain `Article`: it is the schema.org type for
 * technical documentation, and it inherits everything `Article` offers.
 */
export function techArticleSchema({
  title,
  description,
  path,
  datePublished,
  dateModified,
}: {
  title: string;
  description?: string;
  path: string;
  datePublished: string;
  dateModified: string;
}) {
  const base = siteUrl();
  const { website, organization } = ids(base);

  return graph({
    "@type": "TechArticle",
    headline: title,
    ...(description ? { description } : {}),
    url: `${base}${path}`,
    datePublished,
    dateModified,
    inLanguage: "en",
    isAccessibleForFree: true,
    author: { "@id": organization },
    publisher: { "@id": organization },
    isPartOf: { "@id": website },
  });
}

export function courseSchema({
  title,
  description,
  path,
}: {
  title: string;
  description?: string;
  path: string;
}) {
  const base = siteUrl();
  const { website, organization } = ids(base);

  return graph({
    "@type": "Course",
    name: title,
    ...(description ? { description } : {}),
    url: `${base}${path}`,
    inLanguage: "en",
    isAccessibleForFree: true,
    provider: { "@id": organization },
    isPartOf: { "@id": website },
  });
}

/**
 * Breadcrumbs are the one structured-data type here with a visible payoff: they
 * replace the bare URL in a search result with the page's position in the site.
 * Self-contained, so it stays a separate block rather than joining the graph.
 */
export function breadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  const base = siteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      // `base` has no trailing slash, so "/" would otherwise produce a URL that
      // does not match the homepage's own canonical.
      item: crumb.path === "/" ? base : `${base}${crumb.path}`,
    })),
  };
}
