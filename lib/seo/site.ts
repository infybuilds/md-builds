/**
 * The site's own name and pitch, in one place.
 *
 * The title leads with what people search for rather than with the brand: "md
 * viewer", "markdown viewer" and "markdown online" are the queries this site
 * can plausibly answer, and the `<title>` is where that wording carries the most
 * weight. The brand still closes the string, so a search result is attributable.
 */
export const SITE_NAME = "InfyBuilds";

export const SITE_TITLE = "Markdown Viewer & Docs Online — InfyBuilds";

export const SITE_DESCRIPTION =
  "Free online Markdown viewer — paste Markdown or open a .md file and read it rendered instantly, with syntax-highlighted code. Plus developer guides, cheat sheets and workshop materials.";

/**
 * The site-wide Open Graph card. Declared here because two places have to agree
 * on it: `app/opengraph-image.tsx` renders the PNG at this path, and the
 * defaults below point every page at it.
 */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — Markdown viewer and developer docs`,
};

/**
 * Open Graph fields that every page shares.
 *
 * Spread into each page's `openGraph` rather than set once in the root layout,
 * because Next.js merges metadata *shallowly*: a page exporting `openGraph`
 * replaces the layout's object outright. That silently drops `og:site_name`,
 * `og:locale` and — less obviously — the image that
 * `app/opengraph-image.tsx` would otherwise contribute by file convention.
 * Spreading keeps each page's literal type intact, so `type` still narrows to
 * "article" or "website" where it matters.
 */
export const OG_DEFAULTS = {
  siteName: SITE_NAME,
  locale: "en_US",
  images: [OG_IMAGE],
};
