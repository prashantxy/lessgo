/**
 * The landing sequence.
 *
 * A dark desk with the two lamps burning on it while the binding streams in,
 * a caption and a rule that fills with the real fetch, and then the room comes
 * up to its own light and the book is the page. After that this file costs
 * nothing.
 *
 * Same contract as `state.ts`, for the same reason: a mutable singleton the
 * render loop reads and writes, never React state. A percentage arriving
 * through `setState` would reconcile the renderer, the camera and every mesh
 * a hundred times before the book appeared. React is told exactly one thing —
 * that it is over — through `onBootDone`, and the DOM chrome is painted
 * through a callback the shell registers.
 */

export type BootPhase = "load" | "dawn" | "done";

export const TIMING = {
  /** never flash past a reader on a warm cache … */
  minHold: 1.4,
  /** … and never hold one hostage to a stalled fetch */
  maxWait: 12,
  /** the room coming up from the lamps' light to its own */
  dawn: 0.9,
};

export const boot = {
  /** true while any of this is still costing a frame */
  active: true,
  /** seconds since the scene took its first frame */
  t: 0,
  phase: "load" as BootPhase,

  /** 0..1 of the binding fetched, per the loading manager */
  progress: 0,
  /** the only honest "loaded": the model is mounted in the scene graph */
  bookIn: false,

  /** 0 the dark room the lamps make, 1 the room's own light */
  dawn: 0,

  reduced: false,
  /** a keypress or a click during the wait goes straight to the end */
  skipped: false,
};

/** let the reader out of the wait — anything they do means "get on with it" */
export function skipBoot() {
  if (boot.active) boot.skipped = true;
}

/* --- painting the DOM chrome ----------------------------------------------
   The shell owns the caption and the filling rule; the scene owns the clock.
   One callback, called from inside the frame loop, keeps the two in step
   without a single render. */

let paint: ((b: typeof boot) => void) | null = null;

export function setBootPaint(fn: ((b: typeof boot) => void) | null) {
  paint = fn;
}

export function paintBoot() {
  paint?.(boot);
}

/* --- the one moment React hears about ------------------------------------- */

const listeners = new Set<() => void>();

export function onBootDone(fn: () => void) {
  if (!boot.active) {
    fn();
    return () => {};
  }
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function finishBoot() {
  if (!boot.active) return;
  boot.active = false;
  boot.phase = "done";
  boot.dawn = 1;
  paintBoot();
  for (const fn of listeners) fn();
  listeners.clear();
}
