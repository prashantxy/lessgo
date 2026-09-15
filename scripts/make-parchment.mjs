/**
 * Bake the aged-parchment plate the reading sheet is set on.
 *
 * The desk under the book is an SVG `feTurbulence` painted by the browser, and
 * that is the right call for something covering the whole viewport at any size
 * with nothing to download. It is the wrong call here: this sheet holds body
 * copy, so it wants a single stable grain that does not resample as the plate
 * scales through the dive, and it wants blotching with structure — pooled
 * stain, burnt edges, laid lines — which stacked turbulence does not give you.
 *
 * So it is a real file, generated rather than photographed: no stock image to
 * license, no CDN, deterministic, and small enough to inline in a cache.
 *
 *   node scripts/make-parchment.mjs [out.jpg] [width] [height]
 */
import sharp from "sharp";

const OUT = process.argv[2] ?? "public/parchment.jpg";
const W = Number(process.argv[3] ?? 1600);
const H = Number(process.argv[4] ?? 1100);

/* ---- deterministic value noise ----------------------------------------- */

/** integer hash → [0,1), so the sheet is identical on every machine */
function hash2(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const fade = (t) => t * t * (3 - 2 * t);

/** one octave of smoothed value noise at `freq` cells across the long edge */
function value(x, y, freq, seed) {
  const fx = x * freq;
  const fy = y * freq;
  const ix = Math.floor(fx);
  const iy = Math.floor(fy);
  const tx = fade(fx - ix);
  const ty = fade(fy - iy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
}

/** fractal Brownian motion — the blotching of a hide tanned unevenly */
function fbm(x, y, freq, octaves, seed) {
  let sum = 0;
  let amp = 1;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * value(x, y, freq * 2 ** o, seed + o * 101);
    norm += amp;
    amp *= 0.5;
  }
  return sum / norm;
}

/* ---- the sheet ---------------------------------------------------------- */

/* vellum, and the browner tone the blotches and the burnt edges pull toward */
const PALE = [0xef, 0xe4, 0xc6];
const DEEP = [0x8d, 0x6f, 0x42];

/* A few places the damp got in. `r` is the reach, `a` the depth, `w` how far
   the rim wanders off a circle and `s` its own noise seed — without the last
   two every stain rims at the same radius and the sheet reads as five printed
   cup rings rather than as staining. */
const STAINS = [
  { x: 0.14, y: 0.21, r: 0.29, a: 0.3, w: 0.62, s: 11 },
  { x: 0.86, y: 0.14, r: 0.22, a: 0.22, w: 0.5, s: 57 },
  { x: 0.74, y: 0.82, r: 0.34, a: 0.26, w: 0.7, s: 131 },
  { x: 0.33, y: 0.95, r: 0.24, a: 0.18, w: 0.44, s: 199 },
  { x: 0.02, y: 0.66, r: 0.2, a: 0.2, w: 0.55, s: 263 },
];

const px = Buffer.alloc(W * H * 3);

for (let j = 0; j < H; j++) {
  /* normalise on the long edge so the grain stays square, not stretched */
  const v = j / H;
  const ny = j / W;
  for (let i = 0; i < W; i++) {
    const u = i / W;

    /* how far toward the brown this pixel sits, 0..1 */
    let age = 0;

    /* broad unevenness in the skin itself — this is most of the character */
    age += 0.3 * fbm(u, ny, 1.6, 3, 41);
    age += 0.34 * fbm(u, ny, 4, 5, 7);
    /* finer mottling on top of it */
    age += 0.16 * fbm(u, ny, 15, 4, 23);

    /* stains: a soft pool with a darker tideline at the rim, the way a liquid
       edge dries heavier than its middle */
    for (const s of STAINS) {
      const dx = u - s.x;
      const dy = v - s.y;
      const d = Math.sqrt(dx * dx + dy * dy) / s.r;
      if (d > 1.6) continue;
      /* pull the rim about with the stain's own noise, so no two stains rim at
         the same radius and none of them closes into a circle */
      const wob = 1 + s.w * (fbm(u, ny, 3.5, 4, s.s) - 0.45);
      const t = d / wob;
      if (t > 1.4) continue;
      const body = Math.max(0, 1 - t) ** 1.7;
      /* a tideline, because a drying edge pools heavier than its middle — but
         barely there: it is a hint of a rim, not a drawn one */
      const tide = Math.exp(-(((t - 0.9) / 0.3) ** 2));
      age += s.a * (body * 0.85 + tide * 0.22);
    }

    /* burnt edges: every margin darkens, the corners most of all */
    const edge = Math.min(u, 1 - u, v, 1 - v);
    age += 0.42 * Math.exp(-edge / 0.055);
    /* and the sheet is cupped, so the middle catches the light */
    age -= 0.1 * Math.exp(-(((u - 0.5) ** 2 + (v - 0.5) ** 2) / 0.18));

    /* laid lines — the mould's wire, faint and only in the paper's body */
    age += 0.011 * Math.sin(v * H * 0.42) * (1 - Math.exp(-edge / 0.09));

    /* fibre: one pixel of tooth, so it reads as a surface and not a gradient */
    const grain = (hash2(i, j, 313) - 0.5) * 0.055;

    const t = Math.min(1, Math.max(0, age)) ** 1.15;
    const o = (j * W + i) * 3;
    for (let c = 0; c < 3; c++) {
      const mix = PALE[c] + (DEEP[c] - PALE[c]) * t;
      px[o + c] = Math.min(255, Math.max(0, Math.round(mix * (1 + grain))));
    }
  }
}

const info = await sharp(px, { raw: { width: W, height: H, channels: 3 } })
  .jpeg({ quality: 82, chromaSubsampling: "4:4:4", mozjpeg: true })
  .toFile(OUT);

console.log(`${OUT} — ${W}×${H}, ${(info.size / 1024).toFixed(0)} KB`);
