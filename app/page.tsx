import Book3D from "@/components/Book3D";
import { getPosts } from "@/lib/blog";
import { SITE, profile, skills, work } from "@/content/site";

export default function Home() {
  const posts = getPosts().slice(0, 4);

  /* Two graphs, one script. The Person is what a knowledge panel is built
     from; the WebSite is what carries the name of the site itself. Both are
     emitted even where a field is empty upstream — see the note on
     profile.links below. */
  const person = {
    "@type": "Person",
    "@id": `${SITE}#person`,
    name: profile.name,
    alternateName: profile.alias,
    url: SITE,
    email: `mailto:${profile.email}`,
    image: `${SITE}/opengraph-image`,
    jobTitle: "Full-Stack & Systems Engineer",
    description:
      "Full-stack and systems engineer working on graph-structured knowledge systems, terminal-native tooling and software supply-chain security.",
    address: { "@type": "PostalAddress", addressCountry: "IN" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Chandigarh University" },
    worksFor: { "@type": "Organization", name: work[0].org },
    knowsAbout: [...profile.focus, ...skills.flatMap((g) => g.items)],
    /* TODO(prashant): profile.links.linkedin and .codeforces are still empty,
       so sameAs currently carries GitHub and X alone. Those two are the strongest
       identity signals Google has for an engineer — filling them in here is
       the single highest-value edit left in this file. */
    sameAs: [profile.links.github, profile.links.x, profile.links.linkedin, profile.links.codeforces].filter(Boolean),
  };

  const website = {
    "@type": "WebSite",
    "@id": `${SITE}#website`,
    url: SITE,
    name: "Prashant Dubey — the field notebook",
    inLanguage: "en",
    publisher: { "@id": `${SITE}#person` },
  };

  const jsonLd = { "@context": "https://schema.org", "@graph": [person, website] };

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
