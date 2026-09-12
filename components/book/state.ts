/**
 * Scroll state shared between the DOM shell and the WebGL scene.
 *
 * Deliberately a mutable singleton rather than React state: the page emits
 * scroll at display rate, and routing that through `setState` would re-render
 * the <Canvas /> tree — and with it the camera, renderer and meshes — sixty
 * times a second. The shell writes here, the render loop reads here, and React
 * only ever hears about it when the *spread* changes, via subscribe().
 */

export type Layout = "wide" | "narrow";

export type Spread = { id: string; label: string };

/** One opening of the book per entry. Scrolling from one to the next turns a leaf. */
export const SPREADS: Spread[] = [
  { id: "title", label: "title" },
  { id: "author", label: "the author" },
  { id: "labours", label: "labours" },
  { id: "works", label: "works" },
  { id: "works-ii", label: "works ii" },
  { id: "instruments", label: "instruments" },
  { id: "honours", label: "honours" },
  { id: "correspondence", label: "correspondence" },
  { id: "colophon", label: "colophon" },
];

export const TURNS = SPREADS.length - 1;

/**
 * Scroll stops. Stop 0 is the book shut on the desk; from there a wide screen
 * reads a whole opening at a time, while a phone gets two stops per opening —
 * verso, then recto, then the leaf turns.
 */
export const STOPS = { wide: SPREADS.length + 1, narrow: SPREADS.length * 2 + 1 };

/**
 * Which page rigs turn on each spread-to-spread transition. The model carries
 * ten skinned leaves for eight transitions, so opening the book lifts a bundle
 * of three the way a real cover does; after that it is one leaf at a time.
 */
export const TURN_PLAN: number[][] = [[1, 2, 3], [4], [5], [6], [7], [8], [9], [10]];

export const bookScroll = {
  /** 0..1 across the whole scroll. */
  progress: 0,
  /** `progress * TURNS` — which leaf is mid-turn, and how far through it. */
  cursor: 0,
  /** how far the nearest leaf is from lying flat: 0 at rest, 1 mid-turn. */
  lift: 0,
  /** nearest snapped spread. */
  spread: 0,
  /** which leaf the camera is reading, -1 verso .. +1 recto (phones only). */
  pageFocus: 0,
  /** 1 shut on the desk, 0 lying open. */
  close: 1,
  layout: "wide" as Layout,
  reduced: false,
};

/* --- waking the render loop ------------------------------------------------
   The canvas runs on demand, not on a permanent rAF. Anything that changes
   what the frame should look like calls wake(); the scene keeps asking for
   frames on its own while the camera is still easing toward its mark. */

let invalidate: (() => void) | null = null;

export function setInvalidate(fn: (() => void) | null) {
  invalidate = fn;
}

export function wake() {
  invalidate?.();
}

/* --- spread subscription ---------------------------------------------------
   The only thing React is told about. useSyncExternalStore in the page layer
   means a spread change re-renders the page content and nothing else. */

const listeners = new Set<() => void>();

export function subscribeSpread(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getSpread() {
  return bookScroll.spread;
}

export function setSpread(i: number) {
  if (i === bookScroll.spread) return;
  bookScroll.spread = i;
  for (const fn of listeners) fn();
}
