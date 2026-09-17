import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts, formatDate } from "@/lib/blog";
import { SITE, profile } from "@/content/site";

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
    keywords: post.tags,
    authors: [{ name: profile.name, url: SITE }],
    alternates: { canonical: `/writing/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `${SITE}/writing/${slug}`,
      publishedTime: post.date,
      authors: [profile.name],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
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

  /* The post as an Article, pinned to the same Person node the home page
     declares — that @id is what ties the writing to the author rather than
     leaving two unrelated entities. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    keywords: post.tags.join(", "),
    inLanguage: "en",
    author: { "@id": `${SITE}#person` },
    publisher: { "@id": `${SITE}#person` },
    image: `${SITE}/writing/${slug}/opengraph-image`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/writing/${slug}` },
  };

  return (
    <main className="sheet-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
