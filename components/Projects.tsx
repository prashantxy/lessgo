import ArcCarousel from "./ArcCarousel";

export default function Projects() {
  return (
    <section className="section-projects" id="projects" aria-label="Selected work">
      <div className="section-inner projects-head">
        <div className="sec-head">
          <span className="idx">03</span>
          <span className="ttl">/ projects</span>
        </div>
      </div>
      <ArcCarousel />
    </section>
  );
}
