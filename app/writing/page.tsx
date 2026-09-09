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
        <ul className="notes" style={{ marginTop: "1.5rem" }}>
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/writing/${p.slug}`}>
                <span className="n-date">{formatDate(p.date)}</span>
                <h2 className="h-md">{p.title}</h2>
                <p>{p.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
