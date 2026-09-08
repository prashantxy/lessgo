import Reveal from "./Reveal";
import {
  about,
  achievements,
  profile,
  skills,
  work,
} from "@/content/site";
import type { PostMeta } from "@/lib/blog";
import { formatDate } from "@/lib/blog";

function Head({ idx, title }: { idx: string; title: string }) {
  return (
    <div className="sec-head">
      <span className="idx">{idx}</span>
      <span className="ttl">/ {title}</span>
    </div>
  );
}

export function About() {
  return (
    <section className="section" id="about">
      <div className="section-inner">
        <Head idx="01" title="about" />
        <Reveal className="about-body">
          <p className="label about-meta">
            entry — 2026 · {profile.location} · <span className="sig">status:</span>{" "}
            {profile.status}
          </p>
          {about.map((para, i) => (
            <p key={i} className={i === 0 ? "lede about-lede" : "about-p"}>
              {para}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function Work() {
  return (
    <section className="section" id="work">
      <div className="section-inner">
        <Head idx="02" title="work" />
        <ol className="work-list">
          {work.map((w, i) => (
            <Reveal as="li" key={w.org} className="work-item" delay={i * 60}>
              <div className="work-meta">
                <span className="mono work-period">{w.period}</span>
                <span className="mono work-kind">{w.kind}</span>
              </div>
              <div className="work-main">
                <h3 className="d3 work-role">
                  {w.role} <span className="work-at">— {w.org}</span>
                </h3>
                <span className="mono work-where">{w.where}</span>
                <ul className="work-points">
                  {w.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Skills() {
  return (
    <section className="section" id="skills">
      <div className="section-inner">
        <Head idx="04" title="stack" />
        <Reveal>
          <dl className="skills-grid">
            {skills.map((g) => (
              <div className="skills-row" key={g.group}>
                <dt className="mono">{g.group}</dt>
                <dd>
                  {g.items.map((it, i) => (
                    <span key={it}>
                      {i > 0 && <span className="skills-sep" aria-hidden="true"> · </span>}
                      {it}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

export function Signals() {
  return (
    <section className="section" id="signals">
      <div className="section-inner">
        <Head idx="05" title="signals" />
        <Reveal>
          <dl className="signals-list">
            {achievements.map((a) => (
              <div className="signals-row" key={a.label}>
                <dt>{a.label}</dt>
                <dd className="mono">{a.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

export function Writing({ posts }: { posts: PostMeta[] }) {
  return (
    <section className="section" id="writing">
      <div className="section-inner">
        <Head idx="06" title="writing" />
        <ol className="writing-list">
          {posts.map((p, i) => (
            <Reveal as="li" key={p.slug} className="writing-item" delay={i * 50}>
              <a href={`/writing/${p.slug}`}>
                <span className="mono writing-date">{formatDate(p.date)}</span>
                <h3 className="d3 writing-title">{p.title}</h3>
                <p className="writing-excerpt">{p.excerpt}</p>
              </a>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Contact() {
  const rows: { k: string; label: string; href: string }[] = [
    { k: "email", label: profile.email, href: `mailto:${profile.email}` },
    { k: "github", label: "github.com/prashantxy", href: profile.links.github },
    { k: "site", label: "prashantdubey.work", href: profile.links.site },
    ...(profile.links.linkedin
      ? [{ k: "linkedin", label: profile.links.linkedin.replace(/^https?:\/\/(www\.)?/, ""), href: profile.links.linkedin }]
      : []),
    ...(profile.links.codeforces
      ? [{ k: "codeforces", label: profile.links.codeforces.replace(/^https?:\/\/(www\.)?/, ""), href: profile.links.codeforces }]
      : []),
    { k: "résumé", label: "Prashant-SDE-Resume.pdf", href: profile.resume },
  ];
  return (
    <section className="section section-contact" id="contact">
      <div className="section-inner">
        <Head idx="07" title="contact" />
        <Reveal>
          <p className="d2 contact-line">
            Building something that needs graphs, terminals, or a careful backend?
          </p>
          <ul className="contact-list">
            {rows.map((r) => (
              <li key={r.k}>
                <span className="mono contact-k">{r.k}</span>
                <a
                  href={r.href}
                  {...(r.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {r.label} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
