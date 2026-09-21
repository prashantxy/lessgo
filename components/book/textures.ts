/**
 * The desk's textures, drawn onto canvases at mount rather than downloaded.
 *
 * Same trade the desk's own oak makes in Desk.tsx: the binding is already
 * 3.3 MB and a leather grain, a sheet of laid paper and a stoneware glaze
 * worth looking at would be another megabyte between the reader and the page.
 * These cost about 12 ms once, and because they are drawn rather than sampled
 * they can be exactly the size they need to be — the blotter's grain is 512px
 * over 44 cm, which is finer than any photograph at that scale would be.
 *
 * Every one of them returns a `roughnessMap` as well as a `map`. That is what
 * actually sells a material: a flat roughness makes a lit surface read as one
 * plastic sheet however well it is coloured, and under a lamp at this angle
 * the variation in the highlight is most of what the eye is reading.
 */

import * as THREE from "three";

type Painted = { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture };

function canvas(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return c;
}

function finish(c: HTMLCanvasElement, srgb: boolean, repeat = 1) {
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.setScalar(repeat);
  tex.anisotropy = 4;
  return tex;
}

/** add per-pixel grain to a canvas already painted with its base */
function speckle(g: CanvasRenderingContext2D, size: number, amount: number) {
  const img = g.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
}

/**
 * Morocco leather for the blotter: a pebbled grain, which is small closed
 * cells with the light catching their edges — so it is drawn as a scatter of
 * soft blobs with a lighter rim, not as noise.
 */
export function leather(base: string): Painted {
  const S = 512;
  const c = canvas(S);
  const g = c.getContext("2d")!;
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);

  const r = canvas(S);
  const rg = r.getContext("2d")!;
  rg.fillStyle = "#b4b4b4";
  rg.fillRect(0, 0, S, S);

  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const rad = 2 + Math.random() * 5;
    const lit = Math.random() < 0.5;
    g.fillStyle = lit ? `rgba(255,255,255,${0.02 + Math.random() * 0.05})` : `rgba(0,0,0,${0.03 + Math.random() * 0.07})`;
    g.beginPath();
    g.arc(x, y, rad, 0, Math.PI * 2);
    g.fill();
    /* the raised cells take the highlight; the creases between them do not */
    rg.fillStyle = lit ? `rgba(0,0,0,${0.05 + Math.random() * 0.1})` : `rgba(255,255,255,${0.04 + Math.random() * 0.08})`;
    rg.beginPath();
    rg.arc(x, y, rad, 0, Math.PI * 2);
    rg.fill();
  }
  speckle(g, S, 10);
  return { map: finish(c, true, 2), roughnessMap: finish(r, false, 2) };
}

/**
 * Laid paper — the rag stock the rest of the book is drawn on. `written` puts
 * a few lines of ink on it, which is what makes a stack of leaves read as
 * somebody's working notes rather than a ream.
 */
export function paper(written: boolean): Painted {
  const S = 512;
  const c = canvas(S);
  const g = c.getContext("2d")!;
  g.fillStyle = "#e9e0c6";
  g.fillRect(0, 0, S, S);

  /* the laid lines: the wire marks a hand mould leaves, every 9 px */
  g.strokeStyle = "rgba(255,255,255,0.09)";
  g.lineWidth = 1;
  for (let y = 0; y < S; y += 9) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(S, y);
    g.stroke();
  }
  /* and the chain lines across them, much further apart */
  g.strokeStyle = "rgba(120,100,60,0.07)";
  g.lineWidth = 2;
  for (let x = 20; x < S; x += 64) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, S);
    g.stroke();
  }

  /* foxing: the rust-coloured blooms old paper comes out in */
  for (let i = 0; i < 22; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const rad = 14 + Math.random() * 60;
    const blot = g.createRadialGradient(x, y, 0, x, y, rad);
    blot.addColorStop(0, `rgba(146,110,62,${0.05 + Math.random() * 0.07})`);
    blot.addColorStop(1, "rgba(146,110,62,0)");
    g.fillStyle = blot;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  if (written) {
    /* Writing, at the size this is seen from: not letters — at 12 cm across a
       frame a line of real text is four pixels tall and reads as noise. A
       wavering stroke with the pressure varying is what handwriting looks like
       from across a desk, and that is the distance this is being read at. */
    g.strokeStyle = "rgba(38,28,16,0.5)";
    g.lineCap = "round";
    for (let line = 0; line < 13; line++) {
      const y = 70 + line * 28;
      const end = S - 80 - Math.random() * (line % 4 === 3 ? 220 : 60);
      g.lineWidth = 1.6 + Math.random() * 0.8;
      g.beginPath();
      g.moveTo(74, y);
      for (let x = 74; x < end; x += 7) {
        g.lineTo(x, y + Math.sin(x * 0.55 + line) * 1.9 + (Math.random() - 0.5) * 1.1);
      }
      g.stroke();
    }
    /* a rule under the first line, the way a heading gets underscored */
    g.strokeStyle = "rgba(120,40,30,0.45)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(74, 88);
    g.lineTo(240, 88);
    g.stroke();
  }

  speckle(g, S, 12);

  const r = canvas(S);
  const rg = r.getContext("2d")!;
  rg.fillStyle = "#f0f0f0";
  rg.fillRect(0, 0, S, S);
  speckle(rg, S, 26);
  return { map: finish(c, true), roughnessMap: finish(r, false) };
}

/**
 * The note left on the desk: a card inviting the reader to the writing.
 *
 * Real words rather than the wavering strokes `paper(true)` draws, because
 * this one is meant to be read and clicked. Which fixes the type size for us:
 * the sheet is 12 cm across and lands about 180 px wide on a laptop, so a
 * 1024px texture gives roughly a fifth of a screen pixel per texel — anything
 * under about 60px here is unreadable, and that is only room for five or six
 * words. So it says the five or six words and nothing else.
 */
export function noteCard(): Painted {
  const S = 1024;
  const c = canvas(S);
  const g = c.getContext("2d")!;
  g.fillStyle = "#e9e0c6";
  g.fillRect(0, 0, S, S);

  /* the same laid lines and foxing as the rest of the stock */
  g.strokeStyle = "rgba(255,255,255,0.08)";
  g.lineWidth = 1;
  for (let y = 0; y < S; y += 18) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(S, y);
    g.stroke();
  }
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const rad = 30 + Math.random() * 120;
    const blot = g.createRadialGradient(x, y, 0, x, y, rad);
    blot.addColorStop(0, `rgba(146,110,62,${0.04 + Math.random() * 0.06})`);
    blot.addColorStop(1, "rgba(146,110,62,0)");
    g.fillStyle = blot;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  const ink = "#2b2114";
  const rubric = "#8f2f22";
  g.textAlign = "center";

  g.fillStyle = rubric;
  g.font = "600 52px Georgia, 'Times New Roman', serif";
  g.fillText("N.B.", S / 2, 200);

  g.fillStyle = ink;
  g.font = "italic 600 118px Georgia, 'Times New Roman', serif";
  g.fillText("The Writing", S / 2, 360);

  g.strokeStyle = "rgba(43,33,20,0.45)";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(S / 2 - 210, 410);
  g.lineTo(S / 2 + 210, 410);
  g.stroke();

  g.fillStyle = "rgba(43,33,20,0.78)";
  g.font = "66px Georgia, 'Times New Roman', serif";
  g.fillText("graphs · lockfiles", S / 2, 510);
  g.fillText("· terminals ·", S / 2, 596);

  g.fillStyle = rubric;
  g.font = "italic 72px Georgia, 'Times New Roman', serif";
  g.fillText("read them →", S / 2, 760);

  speckle(g, S, 10);

  const r = canvas(S);
  const rg = r.getContext("2d")!;
  rg.fillStyle = "#f0f0f0";
  rg.fillRect(0, 0, S, S);
  speckle(rg, S, 26);
  return { map: finish(c, true), roughnessMap: finish(r, false) };
}

/** glazed stoneware: an uneven glaze over a speckled body */
export function glaze(base: string): Painted {
  const S = 256;
  const c = canvas(S);
  const g = c.getContext("2d")!;
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);
  /* the iron specks that burn through a pale glaze in the kiln */
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(70,52,30,${0.1 + Math.random() * 0.35})`;
    g.beginPath();
    g.arc(Math.random() * S, Math.random() * S, 0.4 + Math.random() * 1.1, 0, Math.PI * 2);
    g.fill();
  }
  speckle(g, S, 8);

  const r = canvas(S);
  const rg = r.getContext("2d")!;
  rg.fillStyle = "#4a4a4a";
  rg.fillRect(0, 0, S, S);
  /* glaze pools thicker in some places and comes out glossier there */
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const rad = 10 + Math.random() * 46;
    const pool = rg.createRadialGradient(x, y, 0, x, y, rad);
    pool.addColorStop(0, `rgba(0,0,0,${0.1 + Math.random() * 0.2})`);
    pool.addColorStop(1, "rgba(0,0,0,0)");
    rg.fillStyle = pool;
    rg.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  return { map: finish(c, true), roughnessMap: finish(r, false) };
}

/** a roughness map alone: fine lengthwise streaks, for turned or drawn metal */
export function brushed(): THREE.CanvasTexture {
  const S = 256;
  const c = canvas(S);
  const g = c.getContext("2d")!;
  g.fillStyle = "#6e6e6e";
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 900; i++) {
    const y = Math.random() * S;
    g.strokeStyle = `rgba(${Math.random() < 0.5 ? "0,0,0" : "255,255,255"},${0.02 + Math.random() * 0.06})`;
    g.lineWidth = 0.5 + Math.random() * 1.5;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(S, y + (Math.random() - 0.5) * 2);
    g.stroke();
  }
  return finish(c, false, 1);
}

/** disposes a painted pair */
export function dropPainted(p: Painted) {
  p.map.dispose();
  p.roughnessMap.dispose();
}
