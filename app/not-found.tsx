import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "No such leaf",
  /* Next already emits `noindex` for not-found, so robots is left alone here
     rather than adding a second, conflicting <meta name="robots">. */
};

/* Set on the same parchment as /writing — .sheet-page and the .writing-card
   family, whose type scale is built for a full sheet. (The .folio-* classes
   look like the obvious reuse but are sized in fixed px for the leaves inside
   the WebGL page portal, and render tiny out here.) */
export default function NotFound() {
  const posts = getPosts().slice(0, 3);

  return (
    <main className="sheet-page">
      <Link href="/" className="back-link">
        ← back to the notebook
      </Link>
      <div className="sheet">
        <p className="post-meta">fol. non est</p>
        <h1 className="h-lg">No such leaf</h1>
        <p className="page-lead" style={{ marginTop: "0.6rem" }}>
          This page was never bound into the volume — or it was, and the binding has since been
          re-sewn. Either way, nothing is here.
        </p>

        {posts.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h2 className="h-md">Lately in the margins</h2>
            <div className="writing-grid" style={{ marginTop: "1rem" }}>
              {posts.map((p) => (
                <article className="writing-card" key={p.slug}>
                  <Link href={`/writing/${p.slug}`} className="wc-body">
                    <span className="wc-date">{formatDate(p.date)}</span>
                    <h3 className="h-md">{p.title}</h3>
                    <p className="wc-blurb">{p.excerpt}</p>
                    <span className="wc-read">read →</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
