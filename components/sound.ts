/**
 * The page's one audio context, shared by the ambient pad (Music.tsx) and the
 * paper — a leaf turning, the board coming down on the block.
 *
 * Nothing sounds until the reader asks for it: the context is only ever made
 * inside the click on the music tab, which is also the only thing browsers
 * allow to start audio. A wheel or a touch-scroll is not a user activation,
 * so a turn can never be the first sound; it just stays silent until then.
 *
 * All of it is synthesised — filtered noise for paper, a damped sine for the
 * board — so there is no file to fetch and nothing to license.
 *
 * Deliberately free of three.js and React: the DOM shell imports this, and
 * anything the shell imports lands in first-load JS.
 */

type Sound = {
  on: boolean;
  ctx: AudioContext | null;
  noise: AudioBuffer | null;
};

export const sound: Sound = { on: false, ctx: null, noise: null };

/** the shared context, made on first call — only ever call this from a click */
export function audio(): AudioContext {
  if (sound.ctx) {
    if (sound.ctx.state === "suspended") void sound.ctx.resume();
    return sound.ctx;
  }
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  /* one second of white noise, reused by every rustle at a random offset */
  const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  sound.ctx = ctx;
  sound.noise = buf;
  return ctx;
}

function live() {
  const ctx = sound.ctx;
  if (!sound.on || !ctx || !sound.noise || ctx.state !== "running") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  return ctx;
}

/**
 * A leaf turning: a band of noise sweeping down as the sheet goes over, with
 * a second, softer crackle where it lands. Never quite the same twice.
 */
export function rustle(strength = 1) {
  const ctx = live();
  if (!ctx) return;
  const now = ctx.currentTime;
  const jitter = () => 0.85 + Math.random() * 0.3;

  const src = ctx.createBufferSource();
  src.buffer = sound.noise;
  src.playbackRate.value = jitter();

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 380;

  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.8;
  band.frequency.setValueAtTime(2600 * jitter(), now);
  band.frequency.exponentialRampToValueAtTime(900, now + 0.38);

  const g = ctx.createGain();
  const peak = 0.075 * strength;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(peak, now + 0.05);
  g.gain.exponentialRampToValueAtTime(peak * 0.35, now + 0.2);
  /* the landing */
  g.gain.exponentialRampToValueAtTime(peak * 0.7, now + 0.27);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

  src.connect(hp).connect(band).connect(g).connect(ctx.destination);
  src.start(now, Math.random() * 0.4, 0.55);
}

/** the board coming down on the block, or lifting off it: low, short, muffled */
export function thud(strength = 1) {
  const ctx = live();
  if (!ctx) return;
  const now = ctx.currentTime;

  const body = ctx.createOscillator();
  body.type = "sine";
  body.frequency.setValueAtTime(92, now);
  body.frequency.exponentialRampToValueAtTime(48, now + 0.18);
  const bg = ctx.createGain();
  bg.gain.setValueAtTime(0.0001, now);
  bg.gain.exponentialRampToValueAtTime(0.16 * strength, now + 0.012);
  bg.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
  body.connect(bg).connect(ctx.destination);
  body.start(now);
  body.stop(now + 0.26);

  /* and the leather: a puff of low noise on top of the knock */
  const src = ctx.createBufferSource();
  src.buffer = sound.noise;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 420;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.0001, now);
  ng.gain.exponentialRampToValueAtTime(0.12 * strength, now + 0.01);
  ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  src.connect(lp).connect(ng).connect(ctx.destination);
  src.start(now, Math.random() * 0.5, 0.2);
}
