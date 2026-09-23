import type { Metadata } from "next";
import Link from "next/link";
import GalleryWall from "@/components/GalleryWall";
import { gallery } from "@/content/gallery";
import { SITE, profile } from "@/content/site";

const DESCRIPTION =
  "Likenesses and prospects from Prashant Dubey's notebook: the places in the story and the work itself, each tied to a project, a post or a win.";

export const metadata: Metadata = {
  title: "The Cabinet",
  description: DESCRIPTION,
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "The Cabinet — Prashant Dubey",
    description: DESCRIPTION,
    type: "website",
    url: "/gallery",
    images: [{ url: "/gallery/lucknow-rumi-darwaza.webp", width: 1600, height: 1176 }],
  },
};

/**
 * The study wall, hung salon-style. Server-rendered: the frames, captions and
 * credits are all in the HTML; only the lightbox needs the client.
 */
export default function GalleryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "The Cabinet — Prashant Dubey",
    url: `${SITE}/gallery`,
    author: { "@id": `${SITE}#person` },
    image: gallery.map((g) => ({
      "@type": "ImageObject",
      contentUrl: `${SITE}/gallery/${g.id}.webp`,
      name: g.title,
      description: g.story,
      creditText: g.credit.by,
      license: g.credit.href,
    })),
  };

  return (
    <main className="gw-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="gw-head">
        <Link href="/" className="gw-back">
          ← back to the notebook
        </Link>
        <p className="gw-kicker">likenesses &amp; prospects</p>
        <h1 className="gw-title">The Cabinet</h1>
        <p className="gw-lead">
          The wall beside the study window. Every print on it belongs to the story — a place the
          work was done, or the work itself. Take one down to read what it has to do with{" "}
          {profile.name.split(" ")[0]}.
        </p>
      </header>

      <GalleryWall items={gallery} />

      <footer className="gw-foot">
        <p>
          Photographs of places are openly licensed from Wikimedia Commons and credited on each
          plate; the rest are from {profile.name}&rsquo;s own repositories.
        </p>
        <Link href="/" className="gw-back">
          ← back to the notebook
        </Link>
      </footer>
    </main>
  );
}
