import fs from "node:fs";
import path from "node:path";
import type { ReactElement } from "react";

/**
 * Shared furniture for the social cards.
 *
 * The cards are the only part of the site most people ever see — a link
 * pasted into Slack or X is rendered long before anyone reaches the book —
 * so they are set from the same press: Fell's English for display, Garamond
 * for reading, ink on unevenly aged vellum.
 *
 * Everything here runs at build time only. Each `opengraph-image` route
 * belongs to a statically generated page, so Next bakes the PNG during
 * `next build` and ships a plain file; the font reads below never happen
 * in a request.
 */

export const SIZE = { width: 1200, height: 630 };
export const CONTENT_TYPE = "image/png";

/* the palette, lifted from :root in globals.css so the card cannot drift */
export const INK = "#2b2114";
export const INK_2 = "#4d3c26";
export const INK_FAINT = "#85724f";
export const PAPER = "#e4d7b8";
export const RULE = "#c8b89a";
export const RUBRIC = "#8f2f22";

const FONT_DIR = path.join(process.cwd(), "assets/fonts");
const read = (file: string) => fs.readFileSync(path.join(FONT_DIR, file));

/**
 * Satori wants the raw font bytes; `next/font` only ever hands back CSS, so
 * the four faces are vendored under assets/ and read straight off disk.
 */
export function fonts() {
  return [
    { name: "Fell", data: read("IMFellEnglish-Regular.ttf"), weight: 400 as const, style: "normal" as const },
    { name: "Fell", data: read("IMFellEnglish-Italic.ttf"), weight: 400 as const, style: "italic" as const },
    { name: "Garamond", data: read("EBGaramond-Regular.ttf"), weight: 400 as const, style: "normal" as const },
    { name: "Garamond", data: read("EBGaramond-SemiBold.ttf"), weight: 600 as const, style: "normal" as const },
  ];
}

/**
 * The vellum ground. Satori has no background-attachment and no filters, so
 * the aging that CSS does with a fixed radial wash is baked here as three
 * overlaid gradients instead.
 */
export const ground: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  backgroundColor: PAPER,
  backgroundImage: [
    "radial-gradient(90% 70% at 50% 0%, rgba(255,246,222,0.85), rgba(255,246,222,0) 70%)",
    "radial-gradient(70% 60% at 8% 100%, rgba(90,62,30,0.20), rgba(90,62,30,0) 62%)",
    "radial-gradient(70% 60% at 96% 96%, rgba(90,62,30,0.18), rgba(90,62,30,0) 60%)",
  ].join(", "),
};

/**
 * The frame a scribe pricked out before writing: a firm outer rule, a hairline
 * inside it, and the rubric tick in the top margin that the book uses for its
 * marginal rule.
 */
export function Frame(): ReactElement {
  /* Satori does not stretch an absolutely positioned box between `right` and
     `bottom` the way CSS does — an inset-only box collapses to nothing — so
     both rules carry the measured width and height instead. */
  const outer = 30;
  const inner = 41;
  return (
    <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: SIZE.width, height: SIZE.height }}>
      <div
        style={{
          position: "absolute",
          top: outer,
          left: outer,
          width: SIZE.width - outer * 2,
          height: SIZE.height - outer * 2,
          border: `2px solid ${RULE}`,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: inner,
          left: inner,
          width: SIZE.width - inner * 2,
          height: SIZE.height - inner * 2,
          border: "1px solid rgba(200,184,154,0.6)",
          display: "flex",
        }}
      />
      {/* the rubric tick the book rules its margin with */}
      <div
        style={{
          position: "absolute",
          top: outer - 2,
          left: 96,
          width: 118,
          height: 5,
          backgroundColor: RUBRIC,
          display: "flex",
        }}
      />
    </div>
  );
}

/**
 * A fleuron, drawn rather than typed. The book prints ❦ (U+2766), but that
 * glyph is not in either Fell or Garamond — satori would drop it to tofu — so
 * the same ornament is built from paths that always render.
 */
export function Fleuron({ width = 300, tone = RULE }: { width?: number; tone?: string }): ReactElement {
  return (
    <div style={{ display: "flex", alignItems: "center", width, height: 22 }}>
      <div style={{ display: "flex", height: 1, flex: 1, backgroundColor: tone }} />
      <svg width="34" height="18" viewBox="0 0 34 18" style={{ margin: "0 12px" }}>
        <path d="M17 1 L23 9 L17 17 L11 9 Z" fill={tone} />
        <circle cx="3" cy="9" r="2.4" fill={tone} />
        <circle cx="31" cy="9" r="2.4" fill={tone} />
      </svg>
      <div style={{ display: "flex", height: 1, flex: 1, backgroundColor: tone }} />
    </div>
  );
}

/** the imprint line every card is signed off with */
export function Imprint({ left, right }: { left: string; right: string }): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        width: "100%",
        fontFamily: "Garamond",
        fontSize: 24,
        color: INK_FAINT,
        letterSpacing: "0.06em",
      }}
    >
      <div style={{ display: "flex" }}>{left}</div>
      <div style={{ display: "flex" }}>{right}</div>
    </div>
  );
}
