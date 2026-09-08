"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "@/content/site";

gsap.registerPlugin(ScrollTrigger);

const SPREAD = 13; // degrees between adjacent cards along the arc

export default function ArcCarousel() {
  const wrapper = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLDivElement>(null);
  const cardsWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !wrapper.current || !section.current || !cardsWrap.current) return;

    const cards = gsap.utils.toArray<HTMLElement>(".arc-card", cardsWrap.current);
    const inners = cards.map((c) => c.querySelector<HTMLElement>(".arc-card-inner")!);
    const n = cards.length;

    const ctx = gsap.context(() => {
      const radius = () => Math.max(window.innerHeight * 2.4, 1400);

      const layout = () => {
        const r = radius();
        cards.forEach((c) => gsap.set(c, { transformOrigin: `50% ${r}px` }));
      };
      layout();

      const apply = (p: number) => {
        const base = -p * (n - 1) * SPREAD;
        cards.forEach((c, i) => {
          const a = i * SPREAD + base; // 0 = focus apex
          const focus = Math.max(0, 1 - Math.abs(a) / (SPREAD * 1.35));
          gsap.set(c, { rotation: a });
          gsap.set(inners[i], {
            rotation: -a,
            opacity: 0.12 + focus * 0.88,
            scale: 0.9 + focus * 0.1,
          });
          const isFocus = focus > 0.62;
          c.classList.toggle("is-focus", isFocus);
          c.style.pointerEvents = isFocus ? "auto" : "none";
        });
      };
      apply(0);

      const st = ScrollTrigger.create({
        trigger: wrapper.current!,
        start: "top top",
        end: () => "+=" + n * Math.max(window.innerHeight * 0.62, 380),
        pin: section.current!,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => apply(self.progress),
        onRefreshInit: layout,
      });

      return () => st.kill();
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <div className="arc-wrap" ref={wrapper}>
      <div className="arc-section" ref={section}>
        <div className="arc-grid" aria-hidden="true" />

        <div className="arc-ring" aria-hidden="true" />

        <p className="arc-caption label">
          <span className="sig">◆</span> selected work — scroll to rotate the arc
        </p>

        <div className="arc-cards" ref={cardsWrap}>
          {projects.map((p) => (
            <article className="arc-card" key={p.n} data-n={p.n}>
              <div className="arc-card-inner">
                <span className="arc-num" aria-hidden="true">
                  {p.n}
                </span>
                <h3 className="arc-name d3">{p.name}</h3>
                <p className="arc-tag mono">{p.tag}</p>
                <p className="arc-blurb">{p.blurb}</p>
                <ul className="arc-stack">
                  {p.stack.map((s) => (
                    <li key={s} className="mono">
                      {s}
                    </li>
                  ))}
                </ul>
                <p className="arc-links">
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label} <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                  <span className="arc-year mono">{p.year}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Static fallback list for reduced-motion / no-JS */}
      <ol className="arc-fallback">
        {projects.map((p) => (
          <li key={p.n}>
            <span className="mono arc-fallback-n">{p.n}</span>
            <div>
              <h3 className="d3">{p.name}</h3>
              <p className="mono arc-tag">{p.tag}</p>
              <p>{p.blurb}</p>
              <p className="arc-links">
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label} ↗
                  </a>
                ))}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
