"use client";

import { useCallback } from "react";
import { profile } from "@/content/site";

export const SECTIONS = [
  { id: "index", label: "index" },
  { id: "about", label: "about" },
  { id: "work", label: "work" },
  { id: "projects", label: "projects" },
  { id: "skills", label: "skills" },
  { id: "signals", label: "signals" },
  { id: "writing", label: "writing" },
  { id: "contact", label: "contact" },
] as const;

type Smoother = { scrollTo: (t: HTMLElement | string, smooth?: boolean, position?: string) => void };

export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const inst = (window as unknown as { __smoother?: Smoother }).__smoother;
  if (inst) inst.scrollTo(target, true, "top top");
  else target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Nav() {
  const jump = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    scrollToId(id);
  }, []);

  return (
    <nav className="topnav" aria-label="Primary">
      <a href="#index" className="wordmark" onClick={(e) => jump(e, "index")}>
        <span className="wordmark-k">{profile.alias}</span>
        <span className="wordmark-sub">/ the laboratory</span>
      </a>
      <ul className="topnav-list">
        {SECTIONS.filter((s) => ["work", "projects", "writing", "contact"].includes(s.id)).map(
          (s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={(e) => jump(e, s.id)}>
                {s.label}
              </a>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
