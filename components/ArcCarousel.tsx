"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

export type ArcItem = { key: string; node: ReactNode; label?: string };

/**
 * Curved-arc carousel: cards are laid out along a wide circular arc and swing
 * around a pivot far below the stage. Scroll / drag / arrows rotate the arc;
 * the centred card sits upright and full-strength, neighbours tilt away,
 * shrink and fade. Used for the expanded Projects / Writing views and on mobile.
 */
export default function ArcCarousel({
  items,
  ariaLabel,
}: {
  items: ArcItem[];
  ariaLabel?: string;
}) {
  const n = items.length;
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);

  const clamp = useCallback((v: number) => Math.max(0, Math.min(n - 1, v)), [n]);
  const step = useCallback(
    (d: number) => setActive((a) => clamp(Math.round(a) + d)),
    [clamp],
  );

  // wheel / trackpad — throttled so one gesture = one card
  const wheelAt = useRef(0);
  const onWheel = (e: React.WheelEvent) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 12) return;
    e.preventDefault();
    const now = Date.now();
    // one gesture = one card, with a calm cooldown so it doesn't race
    if (now - wheelAt.current < 620) return;
    wheelAt.current = now;
    step(d > 0 ? 1 : -1);
  };

  // pointer drag
  const dragRef = useRef<{ x: number; base: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, base: active };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    setDrag(clamp(dragRef.current.base - dx / 340));
  };
  const endDrag = () => {
    if (drag != null) setActive(clamp(Math.round(drag)));
    setDrag(null);
    dragRef.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Home") {
      setActive(0);
    } else if (e.key === "End") {
      setActive(n - 1);
    }
  };

  const pos = drag ?? active;
  const current = Math.round(pos);

  return (
    <div
      className="arc"
      role="group"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="arc-stage">
        {items.map((it, i) => {
          const off = i - pos;
          const a = Math.abs(off);
          const angle = off * 23;
          const isCurrent = current === i;
          return (
            <div
              key={it.key}
              className="arc-card"
              data-active={isCurrent || undefined}
              aria-hidden={isCurrent ? undefined : true}
              style={{
                transform: `rotate(${angle}deg)`,
                opacity: a > 2.2 ? 0 : Math.max(0.16, 1 - a * 0.42),
                zIndex: 200 - Math.round(a * 10),
                pointerEvents: a > 1.6 ? "none" : undefined,
              }}
              onClick={() => !isCurrent && setActive(i)}
            >
              <div
                className="arc-card-inner"
                style={{
                  transform: `scale(${a < 0.4 ? 1 : Math.max(0.82, 1 - a * 0.09)})`,
                }}
              >
                {it.node}
              </div>
            </div>
          );
        })}
      </div>

      <div className="arc-ctl">
        <button
          type="button"
          className="arc-btn"
          onClick={() => step(-1)}
          disabled={current <= 0}
          aria-label="Previous"
        >
          ←
        </button>
        <span className="arc-count hand">
          {current + 1} / {n}
        </span>
        <div className="arc-dots" role="tablist">
          {items.map((it, i) => (
            <button
              key={it.key}
              type="button"
              className="arc-dot"
              data-on={current === i || undefined}
              aria-label={it.label ?? `Item ${i + 1}`}
              aria-selected={current === i}
              role="tab"
              onClick={() => setActive(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="arc-btn"
          onClick={() => step(1)}
          disabled={current >= n - 1}
          aria-label="Next"
        >
          →
        </button>
      </div>
    </div>
  );
}
