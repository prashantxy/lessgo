"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { about, highlights, now, profile } from "@/content/site";
import type { PostMeta } from "@/lib/format";
import Music from "./Music";
import { SPREADS, STOPS, TURNS, bookScroll, setSpread, wake } from "./book/state";
import { boot, finishBoot, onBootDone, setBootPaint, skipBoot } from "./book/boot";
import { lampSwitch, toggleLamp } from "./book/lampSwitch";
import { buildSpreads, roman } from "./book/spreads";

/* WebGL never runs on the server, and the model is fetched lazily either way */
const BookScene = dynamic(() => import("./book/BookScene"), { ssr: false });

/* Dust in the lamp light.

   Fixed values, not Math.random(): this component is rendered on the server
   too, and random positions would differ between the server pass and
   hydration — React would warn and repaint every mote. Generated once with a
   seed and frozen here instead. Negative delays start each mote partway
   through its drift, so the air is already alive on the first frame rather
   than every speck setting off together. */
const MOTES = [
  { left: 52.0, top: 75.8, s: 4.1, dur: 21.9, delay: -6.1, dx: 29, dy: -84, peak: 0.22 },
  { left: 6.5, top: 40.3, s: 3.5, dur: 21.3, delay: -13.0, dx: -26, dy: -65, peak: 0.48 },
  { left: 40.9, top: 91.9, s: 1.8, dur: 30.8, delay: -3.2, dx: -49, dy: -79, peak: 0.36 },
  { left: 91.9, top: 25.6, s: 3.0, dur: 32.0, delay: -9.4, dx: -27, dy: -142, peak: 0.48 },
  { left: 47.6, top: 91.7, s: 2.0, dur: 30.8, delay: -4.9, dx: 59, dy: -148, peak: 0.3 },
  { left: 8.8, top: 71.2, s: 2.5, dur: 33.3, delay: -16.3, dx: 38, dy: -63, peak: 0.26 },
  { left: 55.2, top: 88.4, s: 3.0, dur: 23.1, delay: -19.1, dx: 40, dy: -131, peak: 0.37 },
  { left: 55.1, top: 54.5, s: 1.9, dur: 28.2, delay: -2.2, dx: -25, dy: -117, peak: 0.47 },
  { left: 57.2, top: 30.9, s: 1.6, dur: 29.8, delay: -17.0, dx: -5, dy: -123, peak: 0.38 },
  { left: 71.1, top: 34.0, s: 1.8, dur: 33.8, delay: -2.3, dx: -67, dy: -94, peak: 0.4 },
  { left: 41.1, top: 69.5, s: 4.1, dur: 27.0, delay: -15.8, dx: -43, dy: -125, peak: 0.23 },
  { left: 14.2, top: 25.8, s: 3.8, dur: 26.1, delay: -5.1, dx: 59, dy: -69, peak: 0.2 },
  { left: 89.2, top: 15.8, s: 3.6, dur: 31.3, delay: -8.9, dx: -13, dy: -142, peak: 0.21 },
  { left: 62.6, top: 28.3, s: 3.0, dur: 21.5, delay: -21.8, dx: -29, dy: -78, peak: 0.34 },
  { left: 40.1, top: 48.9, s: 3.0, dur: 25.8, delay: -14.4, dx: 65, dy: -75, peak: 0.25 },
  { left: 33.3, top: 23.9, s: 2.5, dur: 17.5, delay: -6.6, dx: 10, dy: -108, peak: 0.47 },
  { left: 34.2, top: 56.6, s: 4.0, dur: 26.4, delay: -10.1, dx: -18, dy: -50, peak: 0.42 },
  { left: 31.9, top: 37.9, s: 3.1, dur: 25.8, delay: -12.4, dx: -43, dy: -92, peak: 0.41 },
  { left: 74.4, top: 45.7, s: 2.8, dur: 25.6, delay: -12.1, dx: -4, dy: -149, peak: 0.26 },
  { left: 94.9, top: 77.4, s: 2.8, dur: 29.8, delay: -20.5, dx: -33, dy: -98, peak: 0.4 },
  { left: 6.5, top: 47.6, s: 4.0, dur: 27.4, delay: -0.2, dx: -56, dy: -59, peak: 0.45 },
  { left: 6.4, top: 53.1, s: 3.6, dur: 20.8, delay: -9.1, dx: 49, dy: -71, peak: 0.32 },
] as const;

export default function Book3D({ posts }: { posts: PostMeta[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const folioRef = useRef<HTMLSpanElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const spreadRef = useRef(-1);
  /* the dive: the plate, and the screen of scroll that drives it */
  const plateRef = useRef<HTMLDivElement>(null);
  const diveRef = useRef<HTMLDivElement>(null);
  /* the one piece of React state here: opening the reading sheet is a real UI
     change, and <BookScene /> is memoised so the canvas sits it out */
  const [expanded, setExpanded] = useState(false);
  /* ... and the landing sequence, which is three renders in its whole life:
     on, fading, gone. Everything it does in between is painted through refs. */
  const [boots, setBoots] = useState<"on" | "out" | "off">("on");
  const capRef = useRef<HTMLSpanElement>(null);
  /* the lamp's switch. React state for the button's own pressed look only —
     the scene reads `lampSwitch`, so a click never reaches the canvas tree */
  const [lampOn, setLampOn] = useState(lampSwitch.on);
  const lampsRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

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

  /* ---- the landing sequence ----
          The lamp is lit inside the canvas (components/book/Intro.tsx); what
          lives out here is the chrome over it — the caption, the rule filling
          as the binding arrives, and the white-out at the burst, which has to
          be DOM because it covers the page and the index as well as the scene.

          Painted straight to the nodes on the scene's own frame, for the same
          reason the scroll is: a percentage arriving through setState would
          re-render the canvas tree a hundred times before the book appeared.

          The document is held at the top for the duration. The whole page is a
          scroll position, so a reader who arrives mid-sequence with a restored
          scroll offset would be looking at an opening of a book that has not
          finished loading, lit by a lamp that is about to explode. ---- */
  useEffect(() => {
    if (!boot.active) {
      setBoots("off");
      return;
    }

    const html = document.documentElement;
    const prevRestore = history.scrollRestoration;
    const prevOverflow = html.style.overflow;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    html.style.overflow = "hidden";

    const CAPTION: Record<string, string> = {
      load: "gathering the quires",
      dawn: "",
      done: "",
    };
    let shown = "";

    setBootPaint((b) => {
      /* the rule is the fetch until the fetch is done, then it is full */
      const fill = b.phase === "load" ? Math.max(b.progress, b.bookIn ? 1 : 0) : 1;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${fill})`;
      if (pctRef.current) {
        const pct = `${Math.round(fill * 100)}`;
        if (pctRef.current.textContent !== pct) pctRef.current.textContent = pct;
      }
      if (capRef.current && CAPTION[b.phase] !== shown) {
        shown = CAPTION[b.phase];
        capRef.current.textContent = shown;
      }
    });

    /* anything the reader does means "get on with it" */
    const skip = () => skipBoot();
    const keys = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.metaKey || e.ctrlKey || e.altKey) return;
      skip();
    };
    window.addEventListener("keydown", keys);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchstart", skip, { passive: true });

    /* The sequence's clock lives in the render loop, so if the canvas never
       gets one — WebGL refused, the chunk failed to load, a driver crash —
       nothing would ever unlock the document and the page would be a caption
       over a dark desk for good. This is the only thing here that does not
       depend on the scene running. */
    const bail = window.setTimeout(finishBoot, 15000);

    let fade: number | undefined;
    const off = onBootDone(() => {
      clearTimeout(bail);
      html.style.overflow = prevOverflow;
      /* the track was never measurable while the document could not scroll */
      ScrollTrigger.refresh();
      setBoots("out");
      fade = window.setTimeout(() => setBoots("off"), 700);
    });

    return () => {
      off();
      setBootPaint(null);
      clearTimeout(bail);
      clearTimeout(fade);
      html.style.overflow = prevOverflow;
      history.scrollRestoration = prevRestore;
      window.removeEventListener("keydown", keys);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
    };
  }, []);

  /* ---- scroll → book. Writes to the DOM and to the shared store directly;
          putting any of this in state would re-render the canvas tree. ---- */
  useEffect(() => {
    const track = scrollRef.current;
    if (!track) return;

    gsap.registerPlugin(ScrollTrigger);

    const narrow = window.matchMedia("(max-width: 900px)");
    /* the desk's own question: is there width beside the board for the things
       that live on it — see `bookScroll.roomy` */
    const roomy = window.matchMedia("(min-width: 700px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncEnv = () => {
      bookScroll.layout = narrow.matches ? "narrow" : "wide";
      bookScroll.roomy = roomy.matches;
      bookScroll.reduced = reduce.matches;
      wake();
    };
    syncEnv();
    narrow.addEventListener("change", syncEnv);
    roomy.addEventListener("change", syncEnv);
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
      /* Eased, not linear: a cover resists at first, swings through, and eases
         onto the desk. The scene springs this as well, but the spring only
         adds weight around wherever the scroll puts the board — the shape of
         the fold against the scroll itself has to come from here. */
      const lift = Math.max(0, Math.min(1, q0));
      bookScroll.close = 1 - lift * lift * (3 - 2 * lift);
      const q = Math.max(0, q0 - 1);
      /* the switches belong to the lamps, and the lamps belong to the shut
         book — both are gone by the time the covers are half up */
      if (lampsRef.current) {
        const on = bookScroll.close > 0.45;
        const flag = on ? "true" : "false";
        if (lampsRef.current.dataset.lit !== flag) lampsRef.current.dataset.lit = flag;
      }

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
        /* resting on an opening is native scroll-snap — see `.scroll-leaf`
           in globals.css for why it is not ScrollTrigger's own snap */
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
      roomy.removeEventListener("change", syncEnv);
      reduce.removeEventListener("change", syncEnv);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  /* ---- the dive ----
          Past the last opening the reading surface comes off the book and
          comes at you: the plate starts raked back at the angle the camera
          holds the leaves at, small and out of focus, and one screen of scroll
          brings it flat, sharp and full-frame. A scrubbed GSAP timeline rather
          than a CSS transition, because it has to be a position in the scroll
          and not an event — scroll back up and it goes back into the book.

          Deliberately its own ScrollTrigger: the book's one runs the length of
          `.scroll-track` and this begins exactly where that ends. ---- */
  useEffect(() => {
    /* Not while the lamp is burning, for two separate reasons. The timeline
       measures a document that cannot scroll yet, and — the one that actually
       showed — `fromTo` renders its start values immediately, which writes
       `opacity: 1` inline onto the index, the folio and the dust. An inline
       style beats any stylesheet rule, so the chrome the loader had hidden
       came straight back on top of the dark room. */
    if (boots === "on") return;

    const plate = plateRef.current;
    const dive = diveRef.current;
    if (!plate || !dive) return;

    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lines = plate.querySelectorAll<HTMLElement>("[data-line]");
    /* the binding, and the book's own furniture, both give way to the plate */
    const behind = document.querySelectorAll<HTMLElement>(
      ".stage, .motes, .index, .quire, .running-head, .expand-btn",
    );

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: dive,
        start: "top bottom",
        end: "top top",
        scrub: reduce.matches ? true : 0.5,
      },
    });

    if (reduce.matches) {
      tl.fromTo(plate, { autoAlpha: 0 }, { autoAlpha: 1 }, 0).fromTo(
        behind,
        { opacity: 1 },
        { opacity: 0.12 },
        0,
      );
    } else {
      tl.fromTo(
        plate,
        { autoAlpha: 0, scale: 0.36, yPercent: 13, rotateX: 44, filter: "blur(9px)" },
        {
          autoAlpha: 1,
          scale: 1,
          yPercent: 0,
          rotateX: 0,
          filter: "blur(0px)",
          ease: "power2.out",
          duration: 1,
        },
        0,
      )
        .fromTo(behind, { opacity: 1 }, { opacity: 0.1, duration: 0.72 }, 0)
        /* the writing settles onto the sheet after the sheet has arrived */
        .fromTo(
          lines,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.42, stagger: 0.045, ease: "power2.out" },
          0.42,
        );
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set([plate, ...behind, ...lines], { clearProps: "all" });
    };
  }, [boots]);

  /* ---- keyboard: one opening at a time ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (boot.active) return;
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
    <div className="codex" data-boot={boots === "off" ? undefined : boots}>
      {/* The landing sequence's chrome. Rendered on the server as well, so the
          page arrives already in its loading state rather than showing a book
          for one frame and then covering it up. */}
      {boots !== "off" && (
        <div className="boot" data-state={boots}>
          <p className="boot-line" aria-hidden="true">
            <span className="boot-caption" ref={capRef}>
              striking a light
            </span>
            <span className="boot-rule">
              <span ref={fillRef} />
            </span>
            <span className="boot-pct">
              <span ref={pctRef}>0</span>
              <i>%</i>
            </span>
          </p>
          <p className="boot-hint" aria-hidden="true">
            press any key
          </p>
          <p className="boot-status" role="status">
            Loading the notebook
          </p>
        </div>
      )}

      {/* the binding — decorative chrome; the text on it is real DOM */}
      <div className="stage">
        <BookScene posts={posts} />
      </div>

      {/* the air above the desk — see .motes in globals.css for why this is
          DOM and not a points cloud in the scene */}
      <div className="motes" aria-hidden="true">
        {MOTES.map((m, i) => (
          <i
            key={i}
            style={
              {
                left: `${m.left}%`,
                top: `${m.top}%`,
                "--s": `${m.s}px`,
                "--dur": `${m.dur}s`,
                "--delay": `${m.delay}s`,
                "--dx": `${m.dx}px`,
                "--dy": `${m.dy}px`,
                "--peak": m.peak,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* the scroll this whole thing is driven by */}
      <div className="scroll-track" ref={scrollRef} aria-hidden="true">
        {Array.from({ length: STOPS.narrow }, (_, i) => (
          /* stop 0 opens the covers; on a wide screen the odd stops after it
             collapse, because a desktop reads a whole opening at once */
          <div className="scroll-leaf" key={i} data-half={i > 0 && i % 2 === 0 ? true : undefined} />
        ))}
      </div>

      {/* one more screen of scroll, which is what the dive is scrubbed against */}
      <div className="dive-track" ref={diveRef} aria-hidden="true">
        <div className="scroll-leaf" />
      </div>

      {/* The reading plate. Set on a baked sheet of parchment rather than the
          flat paper colour — at full frame a solid fill reads as a modal, and
          the whole point is that this is the page you were just looking at.
          `pointer-events` stays off the plate itself so the wheel keeps
          reaching the document, which is the only scroller here. */}
      <section className="plate" ref={plateRef} aria-label={`${profile.name} — in full`}>
        <div className="plate-sheet">
          <span className="plate-frame" aria-hidden="true" />

          <header className="plate-head">
            <span className="plate-device" aria-hidden="true" data-line>
              ❦
            </span>
            <span className="plate-kicker" data-line>
              the field notebook of
            </span>
            <h2 className="plate-name" data-line>
              {profile.name}
            </h2>
            <span className="plate-rule" aria-hidden="true" data-line />
            <p className="plate-role" data-line>
              {profile.role}
            </p>
            <p className="plate-focus" data-line>
              being an account of {profile.focus.join(", ")}
            </p>
          </header>

          <div className="plate-cols">
            <div className="plate-col" data-line>
              {about.map((para) => (
                <p key={para.slice(0, 24)} className="plate-prose">
                  {para}
                </p>
              ))}
            </div>

            <div className="plate-col plate-col-aside">
              <div data-line>
                <h3 className="plate-sub">Presently</h3>
                <ul className="plate-list">
                  {now.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
              <div data-line>
                <h3 className="plate-sub">Of Honours</h3>
                <ul className="plate-list">
                  {highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <footer className="plate-foot" data-line>
            <p className="plate-links">
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <a href={profile.links.github} target="_blank" rel="noopener noreferrer">
                github
              </a>
              <a href={profile.resume} target="_blank" rel="noopener">
                résumé
              </a>
            </p>
            <p className="plate-imprint">
              {profile.location} · Anno MMXXVI · vol. i
            </p>
          </footer>
        </div>
      </section>

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

      {/* The lamp's switch. It only exists while the book is shut, which is the
          only time the lamp is on the desk. */}
      <div className="lamp-switches" ref={lampsRef} data-lit="true">
        <button
          type="button"
          className="lamp-switch"
          aria-pressed={lampOn}
          onClick={() => setLampOn(toggleLamp())}
        >
          <span className="lamp-bulb" aria-hidden="true" />
          desk lamp
        </button>
      </div>

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
