/**
 * Cut the book's engraved plates out of Merian's Heidelberg (1620).
 *
 * The same public-domain engraving the study window looks out on
 * (scripts/make-town.mjs), so the book and the room agree about where they
 * are. Each plate is printed ink-only: iron-gall brown with the paper keyed
 * out to alpha, so it sits *on* whatever parchment the page is — WebGL leaf,
 * CSS sheet or the dive plate — with no rectangle of white around it.
 *
 *   node scripts/make-plates.mjs
 */
import sharp from "sharp";

const SRC = "assets/merian-heidelberg-1620-source.jpg";
/** --ink in globals.css */
const INK = [43, 33, 20];

/** fractions of the source: [left, top, right, bottom], and output width */
const PLATES = {
  town: { box: [0.3, 0.4, 0.74, 0.8], width: 720 },
  castle: { box: [0.07, 0.2, 0.31, 0.53], width: 600 },
  bridge: { box: [0.2, 0.64, 0.46, 0.93], width: 600 },
  panorama: { box: [0, 0.04, 1, 0.86], width: 1000 },
};

const meta = await sharp(SRC).metadata();

for (const [name, { box, width }] of Object.entries(PLATES)) {
  const [l, t, r, b] = box;
  const { data, info } = await sharp(SRC)
    .extract({
      left: Math.round(l * meta.width),
      top: Math.round(t * meta.height),
      width: Math.round((r - l) * meta.width),
      height: Math.round((b - t) * meta.height),
    })
    .greyscale()
    .resize({ width })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
    /* the paper of an old scan is grey and grainy, not white: key it out from
       ~74% up, which also drops the grain that would otherwise cost bytes */
    const ink = Math.min(1, Math.max(0, (188 - data[i]) / 150));
    out[j] = INK[0];
    out[j + 1] = INK[1];
    out[j + 2] = INK[2];
    out[j + 3] = Math.round(Math.pow(ink, 0.85) * 255);
  }
  const file = `public/plates/${name}.webp`;
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 60, alphaQuality: 60, effort: 6 })
    .toFile(file);
  const { size } = (await import("node:fs")).statSync(file);
  console.log(`${file} ${info.width}x${info.height} ${(size / 1024).toFixed(0)} kB`);
}
