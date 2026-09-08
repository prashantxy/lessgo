"use client";

import { useEffect, useRef, useState } from "react";
import { SECTIONS, scrollToId } from "./Nav";

export default function Spine() {
  const [active, setActive] = useState<string>("index");
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (e): e is HTMLElement => !!e,
    );

    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((e) => io.observe(e));

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <aside className="spine" aria-hidden="true">
      <div className="spine-track">
        <div className="spine-fill" ref={fillRef} />
      </div>
      <ul className="spine-nodes">
        {SECTIONS.map((s) => (
          <li key={s.id} className={active === s.id ? "on" : ""}>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => scrollToId(s.id)}
              aria-label={s.label}
            >
              <span className="spine-dot" />
              <span className="spine-label mono">{s.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
