import Script from "next/script";

import { adsClientId, adsScriptNeeded } from "@/lib/ads";

/**
 * The AdSense loader, included once per page that carries a slot.
 *
 * Deliberately *not* Auto ads: this loads the library only, and each unit is
 * placed explicitly by `AdSlot`. Auto ads would inject vignettes and
 * interstitials — the popup-style formats we do not want — and could place units
 * anywhere on the page, including inside the article body.
 */
export function AdsScript() {
  if (!adsScriptNeeded()) return null;

  return (
    <Script
      id="adsbygoogle-loader"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsClientId()}`}
    />
  );
}
