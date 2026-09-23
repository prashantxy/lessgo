/**
 * Bake the view through the study window.
 *
 * Source: Matthäus Merian, "Heidelberg" (1620), copper engraving — public
 * domain, via Wikimedia Commons
 * (File:Heidelberg-Panorama_von_Matthaeus_Merian_1620.jpg). The scan is kept
 * in assets/ so this is reproducible.
 *
 * The engraving is black ink on white paper, which through a window at dusk
 * reads as a photocopy. So it is re-inked as a duotone: the ink becomes the
 * deep umber of a town in shadow, the paper becomes a low amber sky. The
 * colophon strip along the bottom edge (a cartouche and the engraver's
 * foreground brush) is cropped off — through a sill you would not see it.
 *
 *   node scripts/make-town.mjs
 */
import sharp from "sharp";

const SRC = "assets/merian-heidelberg-1620-source.jpg";
const OUT = "public/town-heidelberg-1620.jpg";
/** the top row's colour, for the sky beyond the plate's edge — see Window.tsx */

/* ink → shadow; paper → a dusk sky that deepens toward the top of the plate
   and warms to the horizon, then the lit ground below it */
const INK = [30, 20, 14];
const SKY_TOP = [70, 66, 92];
const HORIZON = [246, 198, 128];
const GROUND = [214, 168, 108];
/** where the horizon sits, as a fraction of the plate's height */
const HORIZON_AT = 0.36;
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

const meta = await sharp(SRC).metadata();
/* keep the skyline and the river; drop the bottom ~8% of foreground scrub */
const crop = { left: 0, top: 0, width: meta.width, height: Math.round(meta.height * 0.92) };

const { data, info } = await sharp(SRC)
  .extract(crop)
  .greyscale()
  /* lift the paper and deepen the ink before mapping: old scans are grey on grey */
  .linear(1.18, -18)
  .resize({ width: 2048 })
  .raw()
  .toBuffer({ resolveWithObject: true });

const out = Buffer.alloc(info.width * info.height * 3);
/* one paper colour per row */
const rows = Array.from({ length: info.height }, (_, y) => {
  const v = y / info.height;
  if (v < HORIZON_AT) return mix(SKY_TOP, HORIZON, Math.pow(v / HORIZON_AT, 0.8));
  return mix(HORIZON, GROUND, Math.min(1, (v - HORIZON_AT) / 0.12));
});
for (let i = 0, j = 0; i < data.length; i += info.channels, j += 3) {
  const paper = rows[Math.floor(j / 3 / info.width)];
  const t = Math.min(1, Math.max(0, data[i] / 255));
  /* a slight gamma so the midtones — the hatching — stay in the shadow colour */
  const k = Math.pow(t, 1.35);
  out[j] = INK[0] + (paper[0] - INK[0]) * k;
  out[j + 1] = INK[1] + (paper[1] - INK[1]) * k;
  out[j + 2] = INK[2] + (paper[2] - INK[2]) * k;
}

await sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } })
  .jpeg({ quality: 76, progressive: true, mozjpeg: true, chromaSubsampling: "4:2:0" })
  .toFile(OUT);

const { size } = await import("node:fs").then((fs) => fs.statSync(OUT));
console.log(`${OUT} ${info.width}x${info.height} ${(size / 1024).toFixed(0)} kB`);
