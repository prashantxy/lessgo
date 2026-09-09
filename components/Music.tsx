"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A quiet ambient pad, synthesised in the browser (no audio file, no
 * copyright). Three detuned voices through a low-pass with a slow tremolo.
 * Off by default; only ever starts on a user click.
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
      r.ctx.close();
      ref.current = null;
    }, 700);
  }, []);

  const start = useCallback(() => {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();

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
  }, []);

  const toggle = useCallback(() => {
    setOn((v) => {
      if (v) stop();
      else start();
      return !v;
    });
  }, [start, stop]);

  useEffect(() => () => stop(), [stop]);

  return (
    <button
      type="button"
      className="edge-music"
      data-on={on}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute ambient music" : "Play ambient music"}
      title={on ? "mute" : "ambient music"}
    >
      <span className="eq" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="edge-music-label">{on ? "playing" : "music"}</span>
    </button>
  );
}
