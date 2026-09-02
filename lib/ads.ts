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

/** AdSense publisher id, e.g. ca-pub-0000000000000000. */
export function adsClientId(): string | undefined {
  return process.env.ADS_CLIENT_ID?.trim() || undefined;
}

export function adsSlotId(placement: AdPlacement): string | undefined {
  return process.env[SLOT_ENV[placement]]?.trim() || undefined;
}

/** True when this specific placement is fully configured. */
export function adsEnabled(placement: AdPlacement): boolean {
  return Boolean(adsClientId() && adsSlotId(placement));
}

/** True when any placement is configured, i.e. the loader script is needed. */
export function adsScriptNeeded(): boolean {
  return Boolean(
    adsClientId() &&
      (Object.keys(SLOT_ENV) as AdPlacement[]).some((p) => adsSlotId(p)),
  );
}
