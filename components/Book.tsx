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

  const writingItems = useMemo(
    () =>
      posts.map((p, i) => ({
        key: p.slug,
        label: p.title,
        node: <WritingCard p={p} n={i + 1} />,
      })),
    [posts],
  );

  // on phones, Projects & Writing browse as an arc carousel inline
  const projectsPanel = useMemo(
    () =>
      narrow ? (
        <div className="page arc-panel">
          <h2 className="h-md">projects</h2>
          <p className="page-note">Backend, systems, and real-time work — swipe through.</p>
          <ArcCarousel ariaLabel="Projects" items={projectItems} />
        </div>
      ) : (
        <ProjectsPage onExpand={openExpand} />
      ),
    [narrow, openExpand],
  );

  const writingPanel = useMemo(
    () =>
      narrow ? (
        <div className="page arc-panel">
          <h2 className="h-md">writing</h2>
          <p className="page-note">
            Notes on graph systems and backends. <a href="/writing">Full archive →</a>
          </p>
          <ArcCarousel ariaLabel="Writing" items={writingItems} />
        </div>
      ) : (
        <WritingPage posts={posts} onExpand={openExpand} />
      ),
    [narrow, openExpand, posts, writingItems],
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
          data-open={flipped > 0}
          data-turning={turning}
          onClick={flipped === 0 ? () => go(1) : undefined}
          role={flipped === 0 ? "button" : undefined}
          tabIndex={flipped === 0 ? 0 : undefined}
          onKeyDown={
            flipped === 0
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    go(1);
                  }
                }
              : undefined
          }
          aria-label={flipped === 0 ? "Open the notebook" : undefined}
        >
          <div className="book-block" aria-hidden="true" />
          {leaves.map((lf, i) => {
            const isFlipped = i < flipped;
            const z = isFlipped ? i + 1 : N - i;
            return (
              <div className="leaf" key={i} data-flipped={isFlipped} style={{ zIndex: z }}>
                <div
                  className={`leaf-face leaf-front${lf.frontIsCover ? " is-cover" : ""}`}
                  id={lf.frontDomId ? `sec-${lf.frontDomId}` : lf.frontId ? `sec-${lf.frontId}` : undefined}
                >
                  {lf.front}
                </div>
                <div
                  className={`leaf-face leaf-back${lf.backIsCover ? " is-cover" : ""}`}
                  id={lf.backDomId ? `sec-${lf.backDomId}` : lf.backId ? `sec-${lf.backId}` : undefined}
                >
                  {lf.back}
                </div>
              </div>
            );
          })}
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

      {/* phone-only section dock */}
      <nav className="mnav" aria-label="Jump to a section">
        {SECTIONS.filter((s) => s.target > 0).map((s) => (
          <a key={s.label} className="mnav-chip" href={`#sec-${s.label}`}>
            {s.label}
          </a>
        ))}
        <a className="mnav-chip mnav-note" href="#sec-backcover">
          ✎ note
        </a>
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
