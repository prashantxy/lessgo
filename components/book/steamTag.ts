/**
 * The steam off the coffee.
 *
 * DOM, like the motes and for the same reason: it never stops moving, and
 * anything that never stops moving inside the canvas pins the render loop
 * awake. The scene projects the mug's rim to the screen whenever it draws a
 * frame and writes the position and scale here; the rising itself is a CSS
 * animation the compositor runs on its own.
 *
 * Its own module, free of three.js, because the DOM shell imports it.
 */
export const steamTag: { el: HTMLElement | null } = { el: null };
