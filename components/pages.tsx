import {
  about,
  achievements,
  highlights,
  now,
  profile,
  projects,
  skills,
  work,
  type Project,
} from "@/content/site";
import type { PostMeta } from "@/lib/format";
import { formatDate } from "@/lib/format";

export type Section = { label: string; target: number; folio: string };

/* top bar = section nav. target = number of leaves turned. */
export const SECTIONS: Section[] = [
  { label: "home", target: 0, folio: "cover" },
  { label: "about", target: 1, folio: "p.1" },
  { label: "work", target: 2, folio: "p.2" },
  { label: "projects", target: 2, folio: "p.3" },
  { label: "stack", target: 3, folio: "p.4" },
  { label: "writing", target: 4, folio: "p.6" },
  { label: "contact", target: 4, folio: "p.7" },
];

const PREVIEW_INK = ["#ea4aaa", "#3a86c8", "#e0a020", "#2a9d6f", "#8b5cf6", "#dc5050"];

function Head({
  title,
  folio,
  onExpand,
}: {
  title: string;
  folio: string;
  onExpand?: () => void;
}) {
  return (
    <div className="page-head">
      <h2 className="h-md">{title}</h2>
      <span className="page-head-r">
        {onExpand && (
          <button type="button" className="expand-btn" onClick={onExpand} title="Expand this page">
            ⤢
          </button>
        )}
        <span className="folio">{folio}</span>
      </span>
    </div>
  );
}

/* ---------- generated preview tile for a project ---------- */

export function ProjectPreview({ p, i }: { p: Project; i: number }) {
  const ink = PREVIEW_INK[i % PREVIEW_INK.length];
  const initials = p.name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  return (
    <svg
      className="pc-preview"
      viewBox="0 0 320 176"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${p.name} — ${p.tag}`}
    >
      <defs>
        <pattern id={`grid-${i}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke="#17150f" strokeOpacity="0.08" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="320" height="176" fill="#faf7ee" />
      <rect width="320" height="176" fill={`url(#grid-${i})`} />
      <text
        x="160"
        y="112"
        textAnchor="middle"
        fontFamily="var(--font-hand), cursive"
        fontSize="86"
        fill="none"
        stroke={ink}
        strokeWidth="2"
        opacity="0.9"
      >
        {initials}
      </text>
      <text
        x="20"
        y="30"
        fontFamily="var(--font-hand), cursive"
        fontSize="15"
        fill="#17150f"
        opacity="0.6"
      >
        {p.tag}
      </text>
      <path
        d={`M18 158 q60 -14 130 0 t154 -4`}
        fill="none"
        stroke={ink}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="292" cy="30" r="7" fill="none" stroke={ink} strokeWidth="2.5" />
    </svg>
  );
}

/* ---------- covers ---------- */

function Avatar() {
  return (
    <svg className="cover-avatar" viewBox="0 0 120 120" role="img" aria-label="Prashant Dubey">
      <circle cx="60" cy="60" r="54" fill="#f4f1e8" stroke="#17150f" strokeWidth="4" />
      <text
        x="60"
        y="82"
        textAnchor="middle"
        fontFamily="var(--font-hand), cursive"
        fontSize="52"
        fill="#17150f"
      >
        PD
      </text>
      <path
        d="M14 96 q46 20 92 0"
        fill="none"
        stroke="#ea4aaa"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Cover() {
  return (
    <div className="cover-inner">
      <span className="cover-kicker">field notebook — vol. 1</span>
      <Avatar />
      <h1 className="cover-title hand">Prashant Dubey</h1>
      <p className="cover-sub">
        {profile.role} — {profile.focus.join(", ")}.
      </p>
      <ul className="cover-notes" aria-label="Highlights">
        {highlights.map((h, i) => (
          <li key={h} data-i={i}>
            {h}
          </li>
        ))}
      </ul>
      <span className="cover-open">open the notebook →</span>
    </div>
  );
}

export function BackCover() {
  return (
    <div className="cover-back-inner">
      <span className="hand">— end of the notebook —</span>
      <p>
        {profile.alias} · the laboratory · {new Date().getFullYear()}
      </p>
      <p>hand-bound with next.js. no template.</p>
    </div>
  );
}

/* ---------- flyleaf / table of contents ---------- */

export function Flyleaf({ onGo }: { onGo: (n: number) => void }) {
  return (
    <div className="flyleaf">
      <span className="tag hand">this notebook belongs to</span>
      <h2 className="h-md">{profile.name}</h2>
      <p className="page-note">
        {profile.role}. Working out of {profile.location}. {profile.status}.
      </p>
      <ol className="toc">
        {SECTIONS.filter((s) => s.target > 0).map((s) => (
          <li key={s.label}>
            <button type="button" onClick={() => onGo(s.target)}>
              {s.label}
            </button>
            <span className="dots" aria-hidden="true" />
            <span className="pg">{s.folio}</span>
          </li>
        ))}
      </ol>
      <p className="flyleaf-foot hand">use the tabs up top, the arrows, or your ← → keys.</p>
    </div>
  );
}

/* ---------- content pages ---------- */

export function AboutPage({ onExpand }: { onExpand?: () => void }) {
  return (
    <div className="page">
      <Head title="about" folio="p.1" onExpand={onExpand} />
      <p className="page-lead">I build systems where the structure is the point.</p>
      {about.map((para, i) => (
        <p key={i} className="page-note">
          {para}
        </p>
      ))}
      <h3 className="sub-head">currently</h3>
      <ul className="tick-list">
        {now.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

export function WorkPage({ onExpand }: { onExpand?: () => void }) {
  return (
    <div className="page">
      <Head title="work" folio="p.2" onExpand={onExpand} />
      <ol className="entries">
        {work.map((w) => (
          <li className="entry" key={w.org}>
            <div className="entry-head">
              <h3>{w.role}</h3>
              <span className="entry-org">— {w.org}</span>
            </div>
            <span className="entry-meta">
              {w.where} · {w.kind}
            </span>
            <span className="entry-when">{w.period}</span>
            <ul>
              {w.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ProjectsPage({ onExpand }: { onExpand?: () => void }) {
  return (
    <div className="page">
      <Head title="projects" folio="p.3" onExpand={onExpand} />
      <p className="page-note" style={{ marginBottom: "1rem" }}>
        Backend, systems, and real-time work. Tap ⤢ to spread these out.
      </p>
      <div className="project-grid">
        {projects.map((p, i) => (
          <article className="project-card" key={p.n}>
            <ProjectPreview p={p} i={i} />
            <div className="pc-body">
              <div className="pc-top">
                <h3>{p.name}</h3>
                <span className="pc-year">{p.year}</span>
              </div>
              <span className="pc-tag">{p.tag}</span>
              {p.note && (
                <span className="pc-note" title={p.note}>
                  ✎ {p.note}
                </span>
              )}
              <p className="pc-blurb">{p.blurb}</p>
              <ul className="pc-stack">
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <p className="pc-links">
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label} ↗
                  </a>
                ))}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function SkillsPage({ onExpand }: { onExpand?: () => void }) {
  return (
    <div className="page">
      <Head title="stack" folio="p.4" onExpand={onExpand} />
      <div className="skill-groups">
        {skills.map((g) => (
          <div className="skill-group" key={g.group}>
            <h3>{g.group}</h3>
            <ul>
              {g.items.map((it) => (
                <li key={it}>
                  <span className="pill">{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SignalsPage({ onExpand }: { onExpand?: () => void }) {
  return (
    <div className="page">
      <Head title="signals" folio="p.5" onExpand={onExpand} />
      <p className="page-note">Competitive programming, hackathons, and the odd trophy.</p>
      <ul className="signals">
        {achievements.map((a) => (
          <li key={a.label}>
            <span>{a.label}</span>
            <span className="s-val">{a.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WritingPage({ posts, onExpand }: { posts: PostMeta[]; onExpand?: () => void }) {
  return (
    <div className="page">
      <Head title="writing" folio="p.6" onExpand={onExpand} />
      <p className="page-note">
        Notes on graph systems, terminal tooling, and backends. <a href="/writing">Full archive →</a>
      </p>
      <ul className="notes">
        {posts.map((p) => (
          <li key={p.slug}>
            <a href={`/writing/${p.slug}`}>
              <span className="n-date">{formatDate(p.date)}</span>
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContactPage({ onExpand }: { onExpand?: () => void }) {
  const rows: { k: string; label: string; href: string }[] = [
    { k: "email", label: profile.email, href: `mailto:${profile.email}` },
    { k: "github", label: "github.com/prashantxy", href: profile.links.github },
    { k: "site", label: "prashantdubey.work", href: profile.links.site },
    ...(profile.links.linkedin
      ? [
          {
            k: "linkedin",
            label: profile.links.linkedin.replace(/^https?:\/\/(www\.)?/, ""),
            href: profile.links.linkedin,
          },
        ]
      : []),
    { k: "résumé", label: "Prashant-SDE-Resume.pdf", href: profile.resume },
  ];
  return (
    <div className="page">
      <Head title="contact" folio="p.7" onExpand={onExpand} />
      <p className="page-lead">
        Building something that needs graphs, terminals, or a careful backend?
      </p>
      <ul className="contact-list">
        {rows.map((r) => (
          <li key={r.k}>
            <span className="c-k">{r.k}</span>
            <a
              href={r.href}
              {...(r.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {r.label}
            </a>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: "1.6rem" }}>
        <a className="btn btn-pink" href={`mailto:${profile.email}`}>
          say hello ✉
        </a>
      </p>
    </div>
  );
}
