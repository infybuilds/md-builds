import { adsClientId, adsScriptNeeded } from "@/lib/ads";

/**
 * The AdSense loader, included once on every public page.
 *
 * A plain `<script async>` rather than `next/script`: with `afterInteractive`
 * the tag is only injected after hydration, so it never appears in the HTML
 * source — and AdSense's verification crawler does not necessarily execute
 * JavaScript. React 19 hoists this into <head> on its own.
 *
 * Deliberately *not* Auto ads: this loads the library only, and each unit is
 * placed explicitly by `AdSlot`. Auto ads would inject vignettes and
 * interstitials — the popup-style formats we do not want — and could place units
 * anywhere on the page, including inside the article body.
 */
export function AdsScript() {
  if (!adsScriptNeeded()) return null;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsClientId()}`}
      crossOrigin="anonymous"
    />
  );
}
