"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function SmoothScroller({ children }: { children: React.ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const smoother = ScrollSmoother.create({
        wrapper: wrapper.current!,
        content: content.current!,
        smooth: 1.1,
        effects: false,
        normalizeScroll: true,
        ignoreMobileResize: true,
      });
      (window as unknown as { __smoother?: unknown }).__smoother = smoother;
    }, wrapper);

    return () => {
      (window as unknown as { __smoother?: unknown }).__smoother = undefined;
      ctx.revert();
    };
  }, []);

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  );
}
