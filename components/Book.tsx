"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { PostMeta } from "@/lib/format";
import { projects } from "@/content/site";
import ArcCarousel from "./ArcCarousel";
import Music from "./Music";
import {
  AboutPage,
  BackCover,
  ContactPage,
  Cover,
  Flyleaf,
  ProjectCard,
  ProjectsPage,
  SECTIONS,
  SignalsPage,
  SkillsPage,
  WorkPage,
  WritingCard,
  WritingPage,
} from "./pages";

type Leaf = {
  front: ReactNode;
  back: ReactNode;
  frontId?: string;
  backId?: string;
  frontDomId?: string;
  backDomId?: string;
  frontIsCover?: boolean;
  backIsCover?: boolean;
};

/* phone deck order — one screen per entry, swiped horizontally.
   The flyleaf is skipped on phones; the dock replaces it. */
const MOBILE_PAGES = [
  { id: "cover", label: "cover" },
  { id: "about", label: "about" },
  { id: "work", label: "work" },
  { id: "projects", label: "projects" },
  { id: "stack", label: "stack" },
  { id: "signals", label: "signals" },
  { id: "writing", label: "writing" },
  { id: "contact", label: "contact" },
  { id: "backcover", label: "✎ note" },
];

function useIsNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return narrow;
}

const projectItems = projects.map((p, i) => ({
  key: p.n,
  label: p.name,
  node: <ProjectCard p={p} i={i} />,
}));

export default function Book({ posts }: { posts: PostMeta[] }) {
  const [flipped, setFlipped] = useState(0);
  const [turning, setTurning] = useState<0 | 1 | -1>(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const narrow = useIsNarrow();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  const openExpand = useCallback((id: string) => setExpandedId(id), []);
  const closeExpand = useCallback(() => setExpandedId(null), []);

  /* ---- phone: the notebook is a horizontal, snap-paged deck ---- */
  const pagerRef = useRef<HTMLDivElement | null>(null);
  const [mCur, setMCur] = useState("cover");
  const mIndex = Math.max(0, MOBILE_PAGES.findIndex((p) => p.id === mCur));

  const goMobile = useCallback((id: string) => {
    const pager = pagerRef.current;
    const el = document.getElementById(`sec-${id}`);
    if (!pager || !el) return;
    pager.scrollTo({ left: el.offsetLeft, behavior: "smooth" });
  }, []);

  // track which page is centred so the dock + animations can follow along
  useEffect(() => {
    if (!narrow) return;
    const pager = pagerRef.current;
    if (!pager) return;
    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = pager.scrollLeft + pager.clientWidth / 2;
        let best = "";
        let bestDist = Infinity;
        for (const face of pager.querySelectorAll<HTMLElement>(".leaf-face")) {
          // offsetParent is null for the flyleaf, which phones don't show
          if (!face.id || face.offsetParent === null) continue;
          const dist = Math.abs(face.offsetLeft + face.offsetWidth / 2 - mid);
          if (dist < bestDist) {
            bestDist = dist;
            best = face.id.slice(4); // strip "sec-"
          }
        }
        if (best) setMCur(best);
      });
    };
    pager.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
    return () => {
      pager.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      cancelAnimationFrame(raf);
    };
  }, [narrow]);

  // keep the live chip visible — scroll the dock only, never its ancestors
  useEffect(() => {
    if (!narrow) return;
    const dock = document.querySelector<HTMLElement>(".mnav");
    const chip = dock?.querySelector<HTMLElement>('.mnav-chip[data-on="true"]');
    if (!dock || !chip) return;
    dock.scrollTo({
      left: chip.offsetLeft - dock.clientWidth / 2 + chip.offsetWidth / 2,
      behavior: "smooth",
    });
  }, [narrow, mCur]);

  const writingItems = useMemo(
    () =>
      posts.map((p, i) => ({
        key: p.slug,
        label: p.title,
        node: <WritingCard p={p} n={i + 1} />,
      })),
    [posts],
  );

  /* Phones page horizontally, so Projects/Writing stay vertical card lists —
     a nested horizontal carousel would fight the deck swipe. */
  const projectsPanel = useMemo(
    () => <ProjectsPage onExpand={narrow ? undefined : openExpand} />,
    [narrow, openExpand],
  );

  const writingPanel = useMemo(
    () => <WritingPage posts={posts} onExpand={narrow ? undefined : openExpand} />,
    [narrow, openExpand, posts],
  );

  const leaves: Leaf[] = useMemo(
    () => [
      {
        front: <Cover />,
        back: <Flyleaf onGo={setFlipped} />,
        frontDomId: "cover",
        backDomId: "flyleaf",
        frontIsCover: true,
      },
      {
        front: <AboutPage onExpand={openExpand} />,
        frontId: "about",
        back: <WorkPage onExpand={openExpand} />,
        backId: "work",
      },
      {
        front: projectsPanel,
        frontId: "projects",
        back: <SkillsPage onExpand={openExpand} />,
        backId: "stack",
      },
      {
        front: <SignalsPage onExpand={openExpand} />,
        frontId: "signals",
        back: writingPanel,
        backId: "writing",
      },
      {
        front: <ContactPage onExpand={openExpand} />,
        frontId: "contact",
        back: <BackCover />,
        backDomId: "backcover",
        backIsCover: true,
      },
    ],
    [posts, openExpand, projectsPanel, writingPanel],
  );
  const N = leaves.length;

  // single-page content for the expand overlay, keyed by id
  const pageById: Record<string, ReactNode> = useMemo(
    () => ({
      about: <AboutPage />,
      work: <WorkPage stacked />,
      stack: <SkillsPage />,
      signals: <SignalsPage />,
      contact: <ContactPage />,
    }),
    [],
  );

  const isArcExpand = expandedId === "projects" || expandedId === "writing";
  const expandContent = useMemo(() => {
    if (!expandedId) return null;
    if (expandedId === "projects")
      return <ArcCarousel ariaLabel="Projects" items={projectItems} />;
    if (expandedId === "writing")
      return <ArcCarousel ariaLabel="Writing" items={writingItems} />;
    return pageById[expandedId] ?? null;
  }, [expandedId, writingItems, pageById]);

  const prev = useRef(0);

  const go = useCallback(
    (next: number) => setFlipped(Math.max(0, Math.min(N, Math.round(next)))),
    [N],
  );

  useEffect(() => {
    if (prev.current === flipped) return;
    setTurning(flipped > prev.current ? 1 : -1);
    prev.current = flipped;
    const t = setTimeout(() => setTurning(0), 1050);
    return () => clearTimeout(t);
  }, [flipped]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (expandedId !== null) {
        if (e.key === "Escape") setExpandedId(null);
        return;
      }
      const t = e.target as HTMLElement;
      if (t.closest("a, button, input, textarea, .arc")) return;
      if (e.key === "ArrowRight") go(flipped + 1);
      if (e.key === "ArrowLeft") go(flipped - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, go, expandedId]);

  const activeSection = useMemo(() => {
    const reachable = SECTIONS.filter((s) => s.target <= flipped);
    return reachable.length ? reachable[reachable.length - 1].label : "home";
  }, [flipped]);

  const folio =
    flipped === 0 ? "cover" : flipped >= N ? "back cover" : `spread ${flipped} of ${N - 1}`;

  return (
    <div className="book-scene" data-ready={ready} data-open={flipped > 0}>
      {/* landing: sticky notes around the book, one per section */}
      {flipped === 0 && (
        <ul className="tab-stickies" aria-label="Jump to a section">
          {SECTIONS.filter((s) => s.target > 0).map((s, i) => (
            <li key={s.label} className="tab-sticky" data-pos={i}>
              <button type="button" onClick={() => go(s.target)}>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* top section tabs — hidden on the cover */}
      <div className="book-topbar" role="tablist" aria-label="Notebook sections" aria-hidden={flipped === 0}>
        <button
          type="button"
          className="tb-arrow tb-arrow-prev"
          onClick={() => go(flipped - 1)}
          disabled={flipped === 0}
          aria-label="Previous page"
        >
          ←
        </button>
        <div className="tb-tabs">
          {SECTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              role="tab"
              className="tb-tab"
              data-active={activeSection === s.label}
              aria-selected={activeSection === s.label}
              onClick={() => go(s.target)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="tb-arrow tb-arrow-next"
          onClick={() => go(flipped + 1)}
          disabled={flipped >= N}
          aria-label="Next page"
        >
          →
        </button>
      </div>

      <div className="book-frame">
        <div
          className="book"
          ref={pagerRef}
          data-open={flipped > 0}
          data-turning={turning}
          onClick={
            narrow ? undefined : flipped === 0 ? () => go(1) : undefined
          }
          role={!narrow && flipped === 0 ? "button" : undefined}
          tabIndex={!narrow && flipped === 0 ? 0 : undefined}
          onKeyDown={
            !narrow && flipped === 0
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    go(1);
                  }
                }
              : undefined
          }
          aria-label={!narrow && flipped === 0 ? "Open the notebook" : undefined}
        >
          <div className="book-block" aria-hidden="true" />
          {leaves.map((lf, i) => {
            const isFlipped = i < flipped;
            const z = isFlipped ? i + 1 : N - i;
            const frontSec = lf.frontDomId ?? lf.frontId;
            const backSec = lf.backDomId ?? lf.backId;
            return (
              <div className="leaf" key={i} data-flipped={isFlipped} style={{ zIndex: z }}>
                <div
                  className={`leaf-face leaf-front${lf.frontIsCover ? " is-cover" : ""}`}
                  id={frontSec ? `sec-${frontSec}` : undefined}
                  data-cur={narrow && frontSec ? frontSec === mCur : undefined}
                  onClick={narrow && lf.frontIsCover ? () => goMobile("about") : undefined}
                >
                  {lf.front}
                </div>
                <div
                  className={`leaf-face leaf-back${lf.backIsCover ? " is-cover" : ""}`}
                  id={backSec ? `sec-${backSec}` : undefined}
                  data-cur={narrow && backSec ? backSec === mCur : undefined}
                >
                  {lf.back}
                </div>
              </div>
            );
          })}
        </div>

        {/* phone: where you are in the deck */}
        <div className="mprogress" aria-hidden="true">
          <span style={{ width: `${((mIndex + 1) / MOBILE_PAGES.length) * 100}%` }} />
        </div>

        {/* right-edge sticky rail — hidden on the cover */}
        <div className="edge-rail" aria-label="Links" aria-hidden={flipped === 0}>
          <a className="edge-tab" href="/Prashant-SDE-Resume.pdf" target="_blank" rel="noopener">
            résumé
          </a>
          <a className="edge-tab" href="https://github.com/prashantxy" target="_blank" rel="noopener">
            github
          </a>
          <a className="edge-tab" href="mailto:pdubey1924@gmail.com">
            email
          </a>
          <Music />
        </div>
      </div>

      <div className="book-controls">
        <button
          type="button"
          className="turn"
          onClick={() => go(flipped - 1)}
          disabled={flipped === 0}
        >
          ← prev
        </button>
        <span className="folio-now hand">{folio}</span>
        <button
          type="button"
          className="turn"
          onClick={() => go(flipped + 1)}
          disabled={flipped >= N}
        >
          next →
        </button>
      </div>

      {/* phone-only section dock — drives the deck, hidden on the cover */}
      <nav className="mnav" aria-label="Notebook sections" data-lit={mIndex > 0}>
        {MOBILE_PAGES.slice(1).map((p) => (
          <button
            key={p.id}
            type="button"
            className={`mnav-chip${p.id === "backcover" ? " mnav-note" : ""}`}
            data-on={p.id === mCur}
            aria-current={p.id === mCur ? "true" : undefined}
            onClick={() => goMobile(p.id)}
          >
            {p.label}
          </button>
        ))}
      </nav>

      {expandedId && expandContent && (
        <div
          className="expand-overlay"
          data-arc={isArcExpand || undefined}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded page"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeExpand();
          }}
        >
          <div className="expand-sheet" data-arc={isArcExpand || undefined}>
            <button
              type="button"
              className="btn btn-plain expand-back"
              onClick={closeExpand}
            >
              ← back to the notebook
            </button>
            {isArcExpand && <h2 className="h-md expand-title">{expandedId}</h2>}
            <div className="expand-cols">
              <div className="expand-col">{expandContent}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
