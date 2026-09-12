import Book3D from "@/components/Book3D";
import { getPosts } from "@/lib/blog";
import { profile } from "@/content/site";

export default function Home() {
  const posts = getPosts().slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: "Keizer",
    url: profile.links.site,
    email: `mailto:${profile.email}`,
    jobTitle: "Full-Stack & Systems Engineer",
    sameAs: [profile.links.github, profile.links.site, profile.links.linkedin, profile.links.codeforces].filter(
      Boolean,
    ),
  };

  return (
    <>
      <a className="skip-link" href="#notebook">
        Skip to content
      </a>
      <main id="notebook">
        <Book3D posts={posts} />
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
