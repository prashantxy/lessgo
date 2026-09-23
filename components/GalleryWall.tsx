"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryItem } from "@/content/gallery";
import { roman } from "@/lib/roman";

/**
 * The photo wall: a salon hang of framed prints, each on its own wire from its
 * own nail, and a lightbox that takes one down to look at properly.
 *
 * The lightbox is a native <dialog> opened with showModal(): that is what
 * gives it a real focus trap, Esc to close, an inert page behind it and a
 * ::backdrop, none of which have to be rebuilt by hand. Each print also has a
 * URL (`/gallery#terrek`), so a single picture can be linked to.
 */

/* a salon hang is never quite level — fixed, so server and client agree */
const TILT = [-1.1, 0.7, -0.4, 1.2, -0.8, 0.5, -1.3, 0.9];
/* …nor quite in line */
const DROP = [0, 18, 6, 26, 2, 14, 10, 22];
/* and the frames are not all from the same joiner */
const FRAMES = ["walnut", "gilt", "ebony", "gilt", "walnut", "ebony", "gilt", "walnut"];

export default function GalleryWall({ items }: { items: GalleryItem[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState(0);
  const item = items[index];

  const show = useCallback(
    (i: number, opener?: HTMLElement | null) => {
      const next = (i + items.length) % items.length;
      setIndex(next);
      if (opener) openerRef.current = opener;
      const d = dialogRef.current;
      if (d && !d.open) d.showModal();
      history.replaceState(null, "", `#${items[next].id}`);
    },
    [items],
  );

  const close = useCallback(() => dialogRef.current?.close(), []);

  /* a deep link opens straight onto its print — on arrival, and when a
     `#print` link is followed from this page without a reload */
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const i = items.findIndex((g) => g.id === id);
      if (i >= 0) show(i, document.getElementById(`gw-${id}`));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [items, show]);

  /* however it closes — button, Esc, backdrop — the URL and focus go back */
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => {
      history.replaceState(null, "", location.pathname + location.search);
      openerRef.current?.focus();
    };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  return (
    <>
      <ul className="gw-wall">
        {items.map((g, i) => (
          <li
            key={g.id}
            className="gw-item"
            data-hang={g.hang}
            style={
              {
                "--tilt": `${TILT[i % TILT.length]}deg`,
                "--drop": `${DROP[i % DROP.length]}px`,
              } as React.CSSProperties
            }
          >
            <button
              type="button"
              id={`gw-${g.id}`}
              className="gw-frame"
              data-frame={FRAMES[i % FRAMES.length]}
              onClick={(e) => show(i, e.currentTarget)}
              aria-haspopup="dialog"
              aria-label={`${g.title} — ${g.place}, ${g.year}. Open`}
            >
              <svg className="gw-wire" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
                <path d="M6 24 L50 2 L94 24" />
              </svg>
              <span className="gw-nail" aria-hidden="true" />
              <span className="gw-moulding">
                <span className="gw-mat">
                  <Image
                    src={`/gallery/${g.id}.webp`}
                    width={g.width}
                    height={g.height}
                    alt=""
                    sizes="(max-width: 700px) 92vw, (max-width: 1200px) 44vw, 520px"
                    className="gw-print"
                    /* the first print is the largest thing on the page when it
                       arrives — the LCP — so it is not left to lazy-load */
                    priority={i === 0}
                  />
                </span>
              </span>
            </button>
            <p className="gw-plate">
              <span className="gw-plate-title">{g.title}</span>
              <span className="gw-plate-meta">
                {g.place} · {g.year}
              </span>
            </p>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className="gw-lightbox"
        aria-labelledby="gw-lb-title"
        onClick={(e) => {
          /* a click on the backdrop lands on the dialog element itself */
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") show(index + 1);
          else if (e.key === "ArrowLeft") show(index - 1);
          else return;
          e.preventDefault();
        }}
      >
        {item && (
          <div className="gw-lb">
            <figure className="gw-lb-figure" data-frame="gilt">
              <span className="gw-moulding">
                <span className="gw-mat">
                  <Image
                    key={item.id}
                    src={`/gallery/${item.id}.webp`}
                    width={item.width}
                    height={item.height}
                    alt={`${item.title} — ${item.place}`}
                    sizes="(max-width: 900px) 92vw, 62vw"
                    className="gw-lb-img"
                  />
                </span>
              </span>
            </figure>

            <div className="gw-lb-card">
              <p className="gw-lb-count">
                plate {roman(index + 1)} of {roman(items.length)}
              </p>
              <h2 id="gw-lb-title" className="gw-lb-title">
                {item.title}
              </h2>
              <p className="gw-lb-meta">
                {item.place} · {item.year}
              </p>
              <p className="gw-lb-story">{item.story}</p>
              <ul className="gw-lb-links">
                {item.links.map((l) => {
                  const external = l.href.startsWith("http");
                  return (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {l.label} {external ? "↗" : "→"}
                      </a>
                    </li>
                  );
                })}
              </ul>
              <p className="gw-lb-credit">
                Image: {item.credit.by} ·{" "}
                <a href={item.credit.href} target="_blank" rel="noopener noreferrer">
                  {item.credit.license}
                </a>
              </p>

              <div className="gw-lb-nav">
                <button type="button" onClick={() => show(index - 1)} aria-label="Previous plate">
                  ← prev
                </button>
                <button type="button" onClick={close} className="gw-lb-close" autoFocus>
                  close
                </button>
                <button type="button" onClick={() => show(index + 1)} aria-label="Next plate">
                  next →
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
