"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { audio, sound } from "./sound";

/**
 * A quiet ambient pad, synthesised in the browser (no audio file, no
 * copyright). Three detuned voices through a low-pass with a slow tremolo.
 * Off by default; only ever starts on a user click.
 *
 * The same switch lets the book make its own noise — the paper as a leaf
 * turns, the board landing (see sound.ts). One tab for all of it: a reader
 * who wants the room quiet wants the pages quiet too.
 */
export default function Music() {
  const [on, setOn] = useState(false);
  const ref = useRef<{
    ctx: AudioContext;
    master: GainNode;
    nodes: OscillatorNode[];
    lfo: OscillatorNode;
  } | null>(null);

  const stop = useCallback(() => {
    const r = ref.current;
    if (!r) return;
    ref.current = null;
    sound.on = false;
    r.master.gain.cancelScheduledValues(r.ctx.currentTime);
    r.master.gain.linearRampToValueAtTime(0.0001, r.ctx.currentTime + 0.6);
    setTimeout(() => {
      r.nodes.forEach((n) => {
        try {
          n.stop();
        } catch {}
      });
      try {
        r.lfo.stop();
      } catch {}
      /* the context is shared with the paper, and stays open for next time */
    }, 700);
  }, []);

  const start = useCallback(() => {
    const ctx = audio();

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 620;
    filter.Q.value = 0.6;
    filter.connect(master);

    // A minor 9th-ish drone
    const freqs = [110, 164.81, 220, 246.94];
    const nodes = freqs.map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 ? "sine" : "triangle";
      o.frequency.value = f;
      o.detune.value = (i - 1.5) * 5;
      const g = ctx.createGain();
      g.gain.value = 0.16 / freqs.length;
      o.connect(g).connect(filter);
      o.start();
      return o;
    });

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 90;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2.5);
    ref.current = { ctx, master, nodes, lfo };
    sound.on = true;
  }, []);

  /* Side effects stay out of the state updater: React may call an updater
     twice (StrictMode does, deliberately), which would open two contexts. The
     ref is the source of truth for whether the pad is sounding. */
  const toggle = useCallback(() => {
    if (ref.current) stop();
    else start();
    setOn(ref.current !== null);
  }, [start, stop]);

  useEffect(() => () => stop(), [stop]);

  return (
    <button
      type="button"
      className="edge-music"
      data-on={on}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute the room" : "Play ambient music and page sounds"}
      title={on ? "mute" : "ambient music & page sounds"}
    >
      <span className="eq" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="edge-music-label">{on ? "playing" : "sound"}</span>
    </button>
  );
}
