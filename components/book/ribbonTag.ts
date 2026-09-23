/**
 * The paper tag tied to the end of the bookmark ribbon.
 *
 * The ribbon is a mesh (Ribbon.tsx); the tag is a real button, so it can be
 * focused, read out and tapped on a phone. The scene projects the ribbon's
 * end to the screen every frame and moves the tag there — through this
 * singleton rather than React, like the scroll (see state.ts).
 *
 * Its own module, free of three.js, because the DOM shell imports it.
 */
export const ribbonTag: { el: HTMLElement | null } = { el: null };
