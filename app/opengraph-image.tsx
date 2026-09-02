import { ImageResponse } from "next/og";

import { OG_IMAGE } from "@/lib/seo/site";

/**
 * One Open Graph image for the whole site.
 *
 * File-convention metadata cascades, so this covers every route that does not
 * define its own. Per-page images are deliberately not generated: rendering one
 * per document would mean a Satori render on every crawl of every lesson, for a
 * picture that would only ever repeat the title already in the card.
 */
export const alt = OG_IMAGE.alt;

export const size = { width: OG_IMAGE.width, height: OG_IMAGE.height };

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0a0a0a",
        color: "#fafafa",
        padding: 80,
        // Satori supports no default font stack of its own.
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, color: "#a1a1aa" }}>
        md.infybuilds.com
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 84, letterSpacing: -2 }}>
          Markdown viewer
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 38,
            color: "#a1a1aa",
          }}
        >
          Paste it, drop a .md file, read it rendered.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          fontSize: 28,
          color: "#71717a",
        }}
      >
        <span># headings</span>
        <span>**bold**</span>
        <span>`code`</span>
        <span>| tables |</span>
      </div>
    </div>,
    size,
  );
}
