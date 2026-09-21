"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { memo, useEffect, useMemo } from "react";
import * as THREE from "three";
import { TIMING, boot, finishBoot, paintBoot } from "./boot";
import { ROOM_DIP, readRoom, restoreRoom } from "./room";
import { bookScroll } from "./state";

/**
 * The landing sequence's clock.
 *
 * Owns three things and nothing else: the phase the wait is in, the room's
 * light level, and the frames. It writes all of that to the `boot` singleton —
 * the DOM shell reads it through paintBoot() to fill in the rule and the
 * caption, and Lamps.tsx keeps burning through the whole of it.
 *
 * On the lighting: the answer to the Stack Overflow question this was built
 * from is that a GLB lit only by lamps comes out dark and flat, and what fixes
 * it is an environment map, ACESFilmic tone mapping and a little exposure. The
 * canvas already runs ACESFilmic (R3F's default) at 0.98 exposure and already
 * builds an environment out of lightformers rather than fetching an HDR, so
 * the desk is lit by all three for free. What this adds is the dark room to
 * light it *in*: the room is dipped to `ROOM_DIP` while the binding downloads,
 * so the only thing burning is the lamp, and it comes back up over the second
 * the book arrives in. The level itself is applied in room.ts, by the frame
 * loop in Lamps.tsx — this only says how far through the dawn it is.
 */

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smoothstep = (a: number, b: number, n: number) => {
  const t = clamp01((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** the colour the room is when nothing but the lamp is lit */
const NIGHT = new THREE.Color(0x0b0906);
/** the desk the page paints behind the canvas, which the room dawns into */
const DAY = new THREE.Color(0xd8c8a4);

/** the loading manager's percentage, kept out of the frame loop's way */
const Progress = memo(function Progress() {
  const { progress } = useProgress();
  useEffect(() => {
    boot.progress = Math.max(boot.progress, progress / 100);
  }, [progress]);
  return null;
});

function IntroImpl() {
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);

  const s = useMemo(() => ({ dawnAt: -1, bg: NIGHT.clone(), bgOn: false }), []);

  /* the dark room goes up before the first frame is drawn, not after it */
  useEffect(() => {
    if (!boot.active) return;
    boot.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    readRoom(scene);
    scene.background = s.bg;
    s.bgOn = true;
    invalidate();
    return () => {
      /* whatever happened, the page is not left in the dark */
      if (s.bgOn) scene.background = null;
      restoreRoom(scene);
    };
  }, [scene, invalidate, s]);

  useFrame((_, raw) => {
    if (!boot.active) return;
    /* A backgrounded tab hands back one enormous delta and the sequence must
       not jump a phase because someone changed windows. The ceiling is
       generous on purpose: clamp it near a frame's worth and a machine drawing
       four frames a second runs the whole thing in slow motion, which is
       exactly the machine that can least afford to be kept waiting. */
    boot.t += Math.min(raw, 0.25);
    const reduced = boot.reduced || bookScroll.reduced;

    if (boot.phase === "load") {
      const held = boot.t >= (reduced ? 0.3 : TIMING.minHold);
      if ((boot.bookIn && held) || boot.skipped || boot.t >= TIMING.maxWait) {
        boot.phase = "dawn";
        s.dawnAt = boot.t;
      }
    }

    if (boot.phase === "dawn") {
      const since = boot.t - s.dawnAt;
      const over = reduced ? 0.3 : TIMING.dawn;
      boot.dawn = smoothstep(0, over, since);
      if (since >= over) {
        if (s.bgOn) {
          scene.background = null;
          s.bgOn = false;
        }
        finishBoot();
        invalidate();
        return;
      }
    }

    if (s.bgOn) {
      if (boot.dawn > 0.82) {
        /* by four fifths of the dawn the night colour has been lerped most of
           the way to the page's own, so handing the backdrop back to <html>
           here is a swap between two nearly identical browns */
        scene.background = null;
        s.bgOn = false;
      } else {
        s.bg.copy(NIGHT).lerp(DAY, boot.dawn);
      }
    }

    paintBoot();
    invalidate();
  });

  return <Progress />;
}

/* Memoised for the same reason the canvas is: Stage re-rendering must not drag
   this through a reconcile. */
const Intro = memo(IntroImpl);
export default Intro;
