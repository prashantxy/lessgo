import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SheetPlate from "@/components/SheetPlate";
import { SITE, profile } from "@/content/site";
import { getStudy, getStudySlugs } from "@/lib/works";

export function generateStaticParams() {
  return getStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getStudy(slug);
  if (!study) return {};
  return {
    title: study.title,
    description: study.excerpt,
    keywords: study.stack,
    authors: [{ name: profile.name, url: SITE }],
    alternates: { canonical: `/works/${slug}` },
    openGraph: {
      title: `${study.title} — ${profile.name}`,
      description: study.excerpt,
      type: "article",
      url: `${SITE}/works/${slug}`,
    },
    twitter: { card: "summary", title: study.title, description: study.excerpt },
  };
}

export default async function StudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getStudy(slug);
  if (!study) notFound();

  /* a creative work by the same Person node the home page declares */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: study.title,
    description: study.excerpt,
    programmingLanguage: study.stack,
    author: { "@id": `${SITE}#person` },
    codeRepository: study.project?.links.find((l) => l.label === "source")?.href,
    url: `${SITE}/works/${slug}`,
  };

  return (
    <main className="sheet-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/works" className="back-link">
        ← all works
      </Link>
      <SheetPlate />
      <article className="sheet">
        <p className="post-meta">
          {study.year} · {study.tag}
        </p>
        <h1 className="h-lg post-title">{study.title}</h1>
        <p className="study-lead">{study.excerpt}</p>
        <p className="study-stack">{study.stack.join(" · ")}</p>
        {study.project && study.project.links.length > 0 && (
          <p className="study-links">
            {study.project.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label} ↗
              </a>
            ))}
          </p>
        )}
        <div className="prose" dangerouslySetInnerHTML={{ __html: study.html }} />
      </article>
      <Link href="/" className="back-link" style={{ marginTop: "2rem" }}>
        ← back to the notebook
      </Link>
    </main>
  );
}
