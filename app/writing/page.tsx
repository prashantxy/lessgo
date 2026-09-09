import type { Metadata } from "next";
import Link from "next/link";
import { getPosts, formatDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on graph systems, terminal tooling, and backends.",
};

export default function WritingIndex() {
  const posts = getPosts();
  return (
    <main className="sheet-page">
      <Link href="/" className="back-link">
        ← back to the notebook
      </Link>
      <div className="sheet">
        <h1 className="h-lg">Writing</h1>
        <p className="page-lead" style={{ marginTop: "0.6rem" }}>
          Notes on graph systems, terminal tooling, and backends I&apos;ve had to reason about
          carefully.
        </p>
        <div className="writing-grid" style={{ marginTop: "1.5rem" }}>
          {posts.map((p) => (
            <article className="writing-card" key={p.slug}>
              <Link href={`/writing/${p.slug}`} className="wc-body">
                <span className="wc-date">{formatDate(p.date)}</span>
                <h2 className="h-md">{p.title}</h2>
                <p className="wc-blurb">{p.excerpt}</p>
                {p.tags.length > 0 && (
                  <ul className="wc-tags">
                    {p.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
                <span className="wc-read">read →</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
