import Script from "next/script";

import { adsClientId, adsEnabled, adsSlotId, type AdPlacement } from "@/lib/ads";

/**
 * Reserved heights, so a slot does not shift the article when the ad fills in.
 * Sized to the standard units each placement will serve.
 */
const RESERVED: Record<AdPlacement, string> = {
  "article-bottom": "min-h-[280px]",
  sidebar: "min-h-[600px]",
};

/**
 * A single ad placement.
 *
 * Renders nothing at all unless configured, so an unconfigured site carries no
 * third-party script, no blank boxes and no layout reservation.
 *
 * Placements are always *outside* the `.prose` container, so an ad can never
 * land inside a code block or between paragraphs.
 */
export function AdSlot({
  placement,
  className,
}: {
  placement: AdPlacement;
  className?: string;
}) {
  if (!adsEnabled(placement)) return null;

  const client = adsClientId()!;
  const slot = adsSlotId(placement)!;

  return (
    <aside
      aria-label="Advertisement"
      className={`not-prose ${className ?? ""}`}
    >
      <p className="text-muted-foreground mb-1.5 text-[10px] tracking-wide uppercase">
        Advertisement
      </p>
      <div className={`overflow-hidden rounded-lg border ${RESERVED[placement]}`}>
        <ins
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
      {/* One push per unit. `id` keeps this from being duplicated if a placement
          is ever rendered twice on a page. */}
      <Script id={`ads-init-${placement}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </aside>
  );
}
