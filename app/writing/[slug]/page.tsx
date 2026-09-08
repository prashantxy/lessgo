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
    <main className="prose-page">
      <Link href="/writing" className="mono back-link">
        ← writing
      </Link>
      <article>
        <p className="mono post-date">
          {formatDate(post.date)}
          {post.tags.length > 0 && <> · {post.tags.join(" · ")}</>}
        </p>
        <h1 className="d2 post-title">{post.title}</h1>
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
      <Link href="/" className="mono back-link back-link--foot">
        ← back to index
      </Link>
    </main>
  );
}
