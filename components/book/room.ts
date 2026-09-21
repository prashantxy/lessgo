/**
 * The room's light level.
 *
 * One owner for something two different parts of the page have an opinion
 * about: the landing sequence dips the whole room to a tenth while the binding
 * downloads, and the desk lamp wants it down to about a third for as long as
 * the book is shut under it — because a lamp in a room already lit is a
 * decoration, and the difference between its switch being on and off has to be
 * the difference between seeing the desk and not.
 *
 * The two combine by `min`, not by multiplication: they are both statements
 * about how dark the room is, and the darker one is the one in force.
 *
 * Kept out of React for the usual reason (see state.ts): this is read and
 * written inside the frame loop, and the lights it mutates are the scene's.
 */

import * as THREE from "three";

/** while the binding is still downloading */
export const ROOM_DIP = 0.1;
/** while the book is shut and the lamp is what it is lit by */
export const ROOM_NIGHT = 0.3;

const room = {
  lights: [] as { light: THREE.Light; base: number }[],
  env: 1,
  read: false,
  /** what was last applied, so a steady frame costs nothing */
  at: -1,
};

/**
 * Take the room's authored intensities down once, and once only.
 *
 * Guarded because this reads values it then overwrites: a second pass would
 * take an already-dipped intensity for the authored one and dim the room by a
 * tenth of a tenth, and would push every light into the list twice. R3F
 * attaches a light to the scene when the tree commits, so this must not run
 * before every sibling of the caller has mounted.
 */
export function readRoom(scene: THREE.Scene) {
  if (room.read) return;
  room.read = true;
  room.env = scene.environmentIntensity ?? 1;
  scene.traverse((o) => {
    const light = o as THREE.Light;
    /* the lamp's own spot and halo are the light the room is read by; they are
       not part of what gets dipped */
    if (light.isLight && !light.userData.boot) {
      room.lights.push({ light, base: light.intensity });
    }
  });
}

export function applyRoom(scene: THREE.Scene, level: number) {
  if (Math.abs(level - room.at) < 1e-4) return;
  room.at = level;
  for (const { light, base } of room.lights) light.intensity = base * level;
  scene.environmentIntensity = room.env * level;
}

/** put it back exactly as it was authored */
export function restoreRoom(scene: THREE.Scene) {
  applyRoom(scene, 1);
}
