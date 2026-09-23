import type { Metadata } from "next";
import Link from "next/link";
import SheetPlate from "@/components/SheetPlate";
import { projects } from "@/content/site";

export const metadata: Metadata = {
  title: "Works",
  description: "Projects — graph systems, terminal tooling, real-time backends and security.",
  alternates: { canonical: "/works" },
  openGraph: {
    title: "Works — Prashant Dubey",
    description: "Projects — graph systems, terminal tooling, real-time backends and security.",
    type: "website",
    url: "/works",
  },
};

/**
 * Every project in one flat list — the same entries the book spreads across
 * two openings, unclamped, with the long account linked where there is one.
 */
export default function WorksIndex() {
  return (
    <main className="sheet-page">
      <Link href="/" className="back-link">
        ← back to the notebook
      </Link>
      <SheetPlate />
      <div className="sheet">
        <h1 className="h-lg">Of Works Wrought</h1>
        <p className="page-lead" style={{ marginTop: "0.6rem" }}>
          Things I have built, most recent first. The longer accounts go into how they work.
        </p>
        <ol className="works-list">
          {projects.map((p) => (
            <li key={p.n}>
              <p className="post-meta">
                {p.year} · {p.tag}
              </p>
              <h2 className="h-md">
                {p.study ? <Link href={`/works/${p.study}`}>{p.name}</Link> : p.name}
              </h2>
              <p>{p.blurb}</p>
              <p className="study-stack">{p.stack.join(" · ")}</p>
              <p className="study-links">
                {p.study && <Link href={`/works/${p.study}`}>the account →</Link>}
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label} ↗
                  </a>
                ))}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
