"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { profile } from "@/content/site";

const Globe = dynamic(() => import("./Globe"), { ssr: false });

const PROMPT = `${profile.shell} ~ %`;

export default function Hero() {
  const cmdRef = useRef<HTMLSpanElement>(null);
  const [stage, setStage] = useState<0 | 1 | 2>(0); // 0 typing, 1 output, 2 settled

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cmd = "whoami --verbose";

    if (reduced) {
      if (cmdRef.current) cmdRef.current.textContent = cmd;
      setStage(2);
      return;
    }

    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const type = () => {
      i += 1;
      if (cmdRef.current) cmdRef.current.textContent = cmd.slice(0, i);
      if (i < cmd.length) {
        timers.push(setTimeout(type, 42 + Math.random() * 55));
      } else {
        timers.push(setTimeout(() => setStage(1), 380));
        timers.push(setTimeout(() => setStage(2), 1150));
      }
    };
    timers.push(setTimeout(type, 650));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <header className="hero" id="index">
      <div className="hero-globe">
        <Globe />
      </div>

      <div className="hero-inner">
        <div className="term" data-stage={stage}>
          <p className="term-line">
            <span className="term-prompt">{PROMPT}</span>{" "}
            <span className="term-cmd" ref={cmdRef} />
            <span className="term-caret" aria-hidden="true" />
          </p>

          <div className="term-out" aria-live="polite">
            <p className="label">
              <span className="sig">→</span> identity resolved · {profile.location}
            </p>

            <h1 className="d1 hero-name">
              {profile.name}
            </h1>

            <p className="hero-role mono">{profile.role}</p>

            <p className="hero-focus">
              {profile.focus.map((f, idx) => (
                <span key={f}>
                  {idx > 0 && <span className="hero-sep"> · </span>}
                  {f}
                </span>
              ))}
            </p>

            <p className="hero-status label">{profile.status}</p>
          </div>
        </div>
      </div>

      <a className="hero-scroll label" href="#about" aria-label="Scroll to about">
        scroll <span aria-hidden="true">↓</span>
      </a>
    </header>
  );
}
