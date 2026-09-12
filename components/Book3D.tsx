"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "@/content/site";
import type { PostMeta } from "@/lib/format";
import Music from "./Music";
import { SPREADS, STOPS, TURNS, bookScroll, setSpread, wake } from "./book/state";
import { buildSpreads, roman } from "./book/spreads";

/* WebGL never runs on the server, and the model is fetched lazily either way */
const BookScene = dynamic(() => import("./book/BookScene"), { ssr: false });

export default function Book3D({ posts }: { posts: PostMeta[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const folioRef = useRef<HTMLSpanElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const spreadRef = useRef(-1);
  /* the one piece of React state here: opening the reading sheet is a real UI
     change, and <BookScene /> is memoised so the canvas sits it out */
  const [expanded, setExpanded] = useState(false);

  /** scroll to a spread — the only way the book is ever turned */
  const goSpread = useCallback((i: number) => {
    const track = scrollRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(TURNS, i));
    const stops = STOPS[bookScroll.layout] - 1;
    /* stop 0 is the shut book; a phone then stops twice per opening */
    const stop = 1 + (bookScroll.layout === "narrow" ? clamped * 2 : clamped);
    const span = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: track.offsetTop + (span * stop) / stops, behavior: "smooth" });
  }, []);

  /* ---- scroll → book. Writes to the DOM and to the shared store directly;
          putting any of this in state would re-render the canvas tree. ---- */
  useEffect(() => {
    const track = scrollRef.current;
    if (!track) return;

    gsap.registerPlugin(ScrollTrigger);

    const narrow = window.matchMedia("(max-width: 900px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncEnv = () => {
      bookScroll.layout = narrow.matches ? "narrow" : "wide";
      bookScroll.reduced = reduce.matches;
      wake();
    };
    syncEnv();
    narrow.addEventListener("change", syncEnv);
    reduce.addEventListener("change", syncEnv);

    /* paint everything that follows the scroll: index, folio, progress rule.
       `q` is the position in scroll stops, which on a phone runs at two per
       opening — verso, recto, then the turn. */
    const paint = (raw: number) => {
      if (barRef.current) barRef.current.style.transform = `scaleY(${raw})`;

      const narrowNow = bookScroll.layout === "narrow";
      const stops = STOPS[bookScroll.layout] - 1;
      /* the first stop is spent opening the covers; the book proper starts at 1 */
      const q0 = raw * stops;
      bookScroll.close = 1 - Math.max(0, Math.min(1, q0));
      const q = Math.max(0, q0 - 1);

      let i: number;
      if (narrowNow) {
        const k = Math.floor(q / 2);
        bookScroll.cursor = k + Math.max(0, Math.min(1, q - (2 * k + 1)));
        /* a triangle wave: left leaf, right leaf, and back to the left as the
           turned leaf lands and becomes the next verso */
        bookScroll.pageFocus = 1 - 2 * Math.abs((q % 2) - 1);
        i = Math.max(0, Math.min(TURNS, Math.floor(q / 2 + 0.25)));
      } else {
        bookScroll.cursor = q;
        bookScroll.pageFocus = 0;
        i = Math.max(0, Math.min(TURNS, Math.round(q)));
      }
      wake();

      if (i === spreadRef.current) return;
      spreadRef.current = i;
      setSpread(i);
      for (const chip of navRef.current?.querySelectorAll<HTMLElement>("[data-spread]") ?? []) {
        chip.dataset.on = String(chip.dataset.spread === SPREADS[i].id);
      }
      if (folioRef.current) {
        folioRef.current.textContent = i === 0 ? "title page" : `${SPREADS[i].label} · fol. ${roman(i * 2)}`;
      }
    };

    /* A scrubbed tween, not a raw scroll handler: the proxy keeps easing for a
       beat after the wheel stops, which is what gives the leaves their weight. */
    const proxy = { p: 0 };
    const commit = () => {
      bookScroll.progress = proxy.p;
      paint(proxy.p);
    };

    const tween = gsap.to(proxy, {
      p: 1,
      ease: "none",
      duration: 1,
      onUpdate: commit,
      scrollTrigger: {
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: reduce.matches ? true : 0.55,
        invalidateOnRefresh: true,
        /* land on an opening rather than between two — the book has no
           half-turned resting state */
        /* SNAP-DISABLED-PROBE */
        onUpdate: (self) => paint(self.progress),
        onRefresh: (self) => paint(self.progress),
      },
    });

    paint(0);
    /* fonts settle a frame late; re-measure once they have */
    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refresh);
      narrow.removeEventListener("change", syncEnv);
      reduce.removeEventListener("change", syncEnv);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  /* ---- keyboard: one opening at a time ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (expanded) {
        if (e.key === "Escape") setExpanded(false);
        return;
      }
      const t = e.target as HTMLElement;
      if (t.closest("a, button, input, textarea")) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") goSpread(spreadRef.current + 1);
      else if (e.key === "ArrowLeft" || e.key === "PageUp") goSpread(spreadRef.current - 1);
      else if (e.key === "Home") goSpread(0);
      else if (e.key === "End") goSpread(TURNS);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goSpread, expanded]);

  /* every word of the book, flat, for search engines and screen readers —
     the CSS3D copy on the leaves only ever holds the open spread */
  const allSpreads = useMemo(() => buildSpreads(posts), [posts]);

  return (
    <div className="codex">
      {/* the binding — decorative chrome; the text on it is real DOM */}
      <div className="stage">
        <BookScene posts={posts} />
      </div>

      {/* the scroll this whole thing is driven by */}
      <div className="scroll-track" ref={scrollRef} aria-hidden="true">
        {Array.from({ length: STOPS.narrow }, (_, i) => (
          /* stop 0 opens the covers; on a wide screen the odd stops after it
             collapse, because a desktop reads a whole opening at once */
          <div className="scroll-leaf" key={i} data-half={i > 0 && i % 2 === 0 ? true : undefined} />
        ))}
      </div>

      <nav className="index" aria-label="Contents" ref={navRef}>
        <span className="index-title">Contents</span>
        <ol>
          {SPREADS.map((s, i) => (
            <li key={s.id}>
              <button type="button" data-spread={s.id} onClick={() => goSpread(i)}>
                <span className="index-label">{s.label}</span>
                <span className="index-folio">{roman(i * 2)}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="quire" aria-hidden="true">
        <span ref={barRef} />
      </div>

      <p className="running-head" aria-live="polite">
        <span ref={folioRef} />
      </p>

      {/* read the open leaves as one plain sheet — the ⤢ from the old notebook */}
      <button
        type="button"
        className="expand-btn"
        onClick={() => setExpanded(true)}
        title="Read this opening as a sheet"
      >
        <span aria-hidden="true">⤢</span> expand
      </button>

      {expanded && (
        <div
          className="expand-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="This opening, enlarged"
          onClick={(e) => {
            if (e.target === e.currentTarget) setExpanded(false);
          }}
        >
          <div className="expand-sheet">
            <button type="button" className="expand-back" onClick={() => setExpanded(false)}>
              ← back to the book
            </button>
            <div className="expand-cols">
              {allSpreads[spreadRef.current]?.verso}
              {allSpreads[spreadRef.current]?.recto}
            </div>
          </div>
        </div>
      )}

      <div className="tabs" aria-label="Links">
        <a className="edge-tab" href={profile.resume} target="_blank" rel="noopener">
          résumé
        </a>
        <a className="edge-tab" href={profile.links.github} target="_blank" rel="noopener">
          github
        </a>
        <a className="edge-tab" href={`mailto:${profile.email}`}>
          email
        </a>
        <Music />
      </div>

      {/* The CSS3D copy on the leaves only ever holds the open spread, so this
          flat duplicate is what a crawler reads. inert + aria-hidden keeps it
          out of the tab order and off the accessibility tree, where the live
          spread already is. */}
      <div className="reader-copy" aria-hidden="true" inert>
        {allSpreads.map((s, i) => (
          <section key={SPREADS[i].id} aria-label={SPREADS[i].label}>
            {s.verso}
            {s.recto}
          </section>
        ))}
      </div>
    </div>
  );
}
