/**
 * Bake the gallery's prints.
 *
 * Sources live in assets/gallery/ (anything sharp can read). For each one this
 * writes two files into public/gallery/:
 *
 * - `<name>.webp` — the photograph in full colour, long edge 1600px. This is
 *   what /gallery shows (next/image resizes it per device); the sepia there is
 *   a CSS filter, so hover and the lightbox can lift it for free.
 * - `<name>-print.jpg` — a small sepia albumen print, 640px, for the frames
 *   hung on the study wall in the 3D scene, where a filter is not an option.
 *
 * Transparent sources (the repo artwork) are laid on the warm mat colour
 * first, so they read as prints and not as cut-outs.
 *
 * Prints the dimensions to paste into content/gallery.ts.
 *
 *   node scripts/make-gallery.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets/gallery";
const OUT = "public/gallery";
/** the passe-partout colour in globals.css (.gw-mat) */
const MAT = { r: 236, g: 226, b: 204 };

fs.mkdirSync(OUT, { recursive: true });

for (const file of fs.readdirSync(SRC).sort()) {
  if (!/\.(jpe?g|png|webp|tiff?)$/i.test(file)) continue;
  const name = path.parse(file).name;
  const base = sharp(path.join(SRC, file)).rotate().flatten({ background: MAT });

  const full = await base
    .clone()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 })
    .toFile(path.join(OUT, `${name}.webp`));

  /* albumen: desaturate, warm the mids, soften the blacks a touch */
  await base
    .clone()
    .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
    .greyscale()
    .linear(0.9, 14)
    .tint({ r: 176, g: 136, b: 88 })
    .jpeg({ quality: 78, progressive: true, mozjpeg: true })
    .toFile(path.join(OUT, `${name}-print.jpg`));

  const kb = (fs.statSync(path.join(OUT, `${name}.webp`)).size / 1024).toFixed(0);
  console.log(`${name.padEnd(24)} ${full.width}x${full.height}  ${kb} kB`);
}
