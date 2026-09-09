import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts, formatDate } from "@/lib/blog";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <main className="sheet-page">
      <Link href="/writing" className="back-link">
        ← writing
      </Link>
      <article className="sheet">
        <p className="post-meta">
          {formatDate(post.date)}
          {post.tags.length > 0 && <> · {post.tags.join(" · ")}</>}
        </p>
        <h1 className="h-lg post-title">{post.title}</h1>
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
      <Link href="/" className="back-link" style={{ marginTop: "2rem" }}>
        ← back to the notebook
      </Link>
    </main>
  );
}
