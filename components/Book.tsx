"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { PostMeta } from "@/lib/format";
import Music from "./Music";
import {
  AboutPage,
  BackCover,
  ContactPage,
  Cover,
  Flyleaf,
  ProjectsPage,
  SECTIONS,
  SignalsPage,
  SkillsPage,
  WorkPage,
  WritingPage,
} from "./pages";

type Leaf = {
  front: ReactNode;
  back: ReactNode;
  frontIsCover?: boolean;
  backIsCover?: boolean;
};

export default function Book({ posts }: { posts: PostMeta[] }) {
  const [flipped, setFlipped] = useState(0);
  const [turning, setTurning] = useState<0 | 1 | -1>(0);
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);
  const [picked, setPicked] = useState(false);

  const pickUp = useCallback(() => setPicked(true), []);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  const openExpand = useCallback(() => setExpanded(true), []);

  const leaves: Leaf[] = useMemo(
    () => [
      { front: <Cover />, back: <Flyleaf onGo={setFlipped} />, frontIsCover: true },
      { front: <AboutPage onExpand={openExpand} />, back: <WorkPage onExpand={openExpand} /> },
      {
        front: <ProjectsPage onExpand={openExpand} />,
        back: <SkillsPage onExpand={openExpand} />,
      },
      {
        front: <SignalsPage onExpand={openExpand} />,
        back: <WritingPage posts={posts} onExpand={openExpand} />,
      },
      { front: <ContactPage onExpand={openExpand} />, back: <BackCover />, backIsCover: true },
    ],
    [posts, openExpand],
  );
  const N = leaves.length;

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
      if (expanded) {
        if (e.key === "Escape") setExpanded(false);
        return;
      }
      const t = e.target as HTMLElement;
      if (t.closest("a, button, input, textarea")) return;
      if (!picked) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
          e.preventDefault();
          setPicked(true);
        }
        return;
      }
      if (e.key === "ArrowRight") go(flipped + 1);
      if (e.key === "ArrowLeft") go(flipped - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, go, expanded, picked]);

  const activeSection = useMemo(() => {
    // last section whose target <= flipped
    const reachable = SECTIONS.filter((s) => s.target <= flipped);
    return reachable.length ? reachable[reachable.length - 1].label : "home";
  }, [flipped]);

  const folio =
    flipped === 0 ? "cover" : flipped >= N ? "back cover" : `spread ${flipped} of ${N - 1}`;

  // current spread content for the expand overlay
  const spread = useMemo(() => {
    if (flipped === 0) return { left: null, right: <Cover /> };
    const left = leaves[flipped - 1]?.back ?? null;
    const right = leaves[flipped]?.front ?? null;
    return { left, right };
  }, [flipped, leaves]);

  return (
    <div className="book-scene" data-ready={ready} data-open={flipped > 0} data-picked={picked}>
      {/* landing: the notebook sitting on the desk */}
      {!picked && <div className="desk" aria-hidden={picked} />}

      {/* top section tabs — hidden on the cover */}
      <div className="book-topbar" role="tablist" aria-label="Notebook sections" aria-hidden={flipped === 0}>
        <button
          type="button"
          className="tb-arrow"
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
          className="tb-arrow"
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
          onClick={!picked ? pickUp : flipped === 0 ? () => go(1) : undefined}
          role={!picked || flipped === 0 ? "button" : undefined}
          tabIndex={!picked || flipped === 0 ? 0 : undefined}
          onKeyDown={
            !picked || flipped === 0
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!picked) pickUp();
                    else go(1);
                  }
                }
              : undefined
          }
          aria-label={!picked ? "Pick up the notebook" : flipped === 0 ? "Open the notebook" : undefined}
        >
          <div className="book-block" aria-hidden="true" />
          {leaves.map((lf, i) => {
            const isFlipped = i < flipped;
            const z = isFlipped ? i + 1 : N - i;
            return (
              <div className="leaf" key={i} data-flipped={isFlipped} style={{ zIndex: z }}>
                <div className={`leaf-face leaf-front${lf.frontIsCover ? " is-cover" : ""}`}>
                  {lf.front}
                </div>
                <div className={`leaf-face leaf-back${lf.backIsCover ? " is-cover" : ""}`}>
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

      {!picked && (
        <>
          <svg className="desk-doodle" viewBox="0 0 220 150" role="img" aria-label="" aria-hidden="true">
            <path
              d="M14 120 C 70 96 150 92 198 40 M198 40 L172 44 M198 40 L192 66"
              fill="none"
              stroke="#17150f"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.55"
            />
          </svg>
          <button type="button" className="desk-pickup hand" onClick={pickUp}>
            pick up the notebook →
          </button>
        </>
      )}

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
        {flipped > 0 && flipped < N && (
          <button type="button" className="turn turn-expand" onClick={openExpand}>
            ⤢ expand
          </button>
        )}
        <button
          type="button"
          className="turn"
          onClick={() => go(flipped + 1)}
          disabled={flipped >= N}
        >
          next →
        </button>
      </div>

      {expanded && (
        <div
          className="expand-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded page"
          onClick={(e) => {
            if (e.target === e.currentTarget) setExpanded(false);
          }}
        >
          <div className="expand-sheet">
            <button
              type="button"
              className="btn btn-plain expand-back"
              onClick={() => setExpanded(false)}
            >
              ← back to the notebook
            </button>
            <div className="expand-cols">
              {spread.left && <div className="expand-col">{spread.left}</div>}
              {spread.right && <div className="expand-col">{spread.right}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
