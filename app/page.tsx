import SmoothScroller from "@/components/SmoothScroller";
import Nav from "@/components/Nav";
import Spine from "@/components/Spine";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Footer from "@/components/Footer";
import { About, Work, Skills, Signals, Writing, Contact } from "@/components/sections";
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
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <div className="field" aria-hidden="true" />
      <Nav />
      <Spine />

      <SmoothScroller>
        <main>
          <Hero />
          <About />
          <Work />
          <Projects />
          <Skills />
          <Signals />
          <Writing posts={posts} />
          <Contact />
        </main>
        <Footer />
      </SmoothScroller>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
