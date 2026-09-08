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
    <main className="prose-page">
      <Link href="/" className="mono back-link">
        ← index
      </Link>
      <h1 className="d2">Writing</h1>
      <p className="lede">Notes on graph systems, terminal tooling, and backends I've had to reason about carefully.</p>
      <ol className="writing-list writing-list--page">
        {posts.map((p) => (
          <li key={p.slug} className="writing-item">
            <Link href={`/writing/${p.slug}`}>
              <span className="mono writing-date">{formatDate(p.date)}</span>
              <h2 className="d3 writing-title">{p.title}</h2>
              <p className="writing-excerpt">{p.excerpt}</p>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
