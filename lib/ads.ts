/**
 * Advertising configuration.
 *
 * Server-only names, deliberately. The publisher and slot ids do reach the
 * browser, but as part of server-rendered HTML — so they never need the
 * `NEXT_PUBLIC_` prefix, which would bake them in at build time and make them
 * unconfigurable as runtime variables.
 *
 * Ads render only when both the publisher id and that slot's id are set, so an
 * unconfigured deployment ships no third-party script and no empty containers.
 */

export type AdPlacement = "article-bottom" | "sidebar";

const SLOT_ENV: Record<AdPlacement, string> = {
  "article-bottom": "ADS_SLOT_ARTICLE_BOTTOM",
  sidebar: "ADS_SLOT_SIDEBAR",
};

/**
 * AdSense publisher id, normalised to the `ca-pub-…` form the script tag needs.
 *
 * Google uses two spellings of the same id: ads.txt takes the bare
 * `pub-0000000000000000`, while the loader URL needs `ca-pub-0000000000000000`.
 * Copying the value from the wrong place silently produces a loader that AdSense
 * does not recognise, so both forms (and the bare digits) are accepted here.
 */
export function adsClientId(): string | undefined {
  const raw = process.env.ADS_CLIENT_ID?.trim();
  if (!raw) return undefined;

  if (raw.startsWith("ca-pub-")) return raw;
  if (raw.startsWith("pub-")) return `ca-${raw}`;
  if (/^\d+$/.test(raw)) return `ca-pub-${raw}`;
  return raw;
}

export function adsSlotId(placement: AdPlacement): string | undefined {
  return process.env[SLOT_ENV[placement]]?.trim() || undefined;
}

/** True when this specific placement is fully configured. */
export function adsEnabled(placement: AdPlacement): boolean {
  return Boolean(adsClientId() && adsSlotId(placement));
}

/**
 * True when the AdSense loader should be included.
 *
 * Only the publisher id is required, deliberately: AdSense site review checks
 * that its code is present on the site, and that has to be satisfiable before
 * any ad unit exists. Setting ADS_CLIENT_ID alone puts the code on every public
 * page and shows no ads; units appear only where a slot id is also set.
 */
export function adsScriptNeeded(): boolean {
  return Boolean(adsClientId());
}
