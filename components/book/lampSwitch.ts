import { wake } from "./state";

/**
 * Whether the lamp is burning. A mutable singleton and not React state, like
 * the scroll: the switch is DOM, the lamp is meshes, and putting the two on
 * the same `useState` would reconcile the whole canvas to turn a light off.
 *
 * Its own module, and not beside the lamp in Lamps.tsx, because the DOM shell
 * imports it: anything the shell imports lands in the page's first-load
 * bundle, and Lamps.tsx pulls in three.js and R3F — which is exactly what the
 * dynamic import of <BookScene /> exists to keep out of it.
 */
export const lampSwitch = { on: true };

export function toggleLamp() {
  lampSwitch.on = !lampSwitch.on;
  wake();
  return lampSwitch.on;
}
