"use client";

import {
  about,
  achievements,
  highlights,
  now,
  profile,
  projects,
  skills,
  work,
} from "@/content/site";
import type { PostMeta } from "@/lib/format";
import { formatDate } from "@/lib/format";
import LeaveNote from "../LeaveNote";
import { SPREADS } from "./state";
import type { ReactNode } from "react";

/* ------------------------------------------------------------ scribal bits */

const ROMAN: [number, string][] = [
  [100, "c"],
  [90, "xc"],
  [50, "l"],
  [40, "xl"],
  [10, "x"],
  [9, "ix"],
  [5, "v"],
  [4, "iv"],
  [1, "i"],
];

export function roman(n: number) {
  let out = "";
  let rest = n;
  for (const [value, numeral] of ROMAN) {
    while (rest >= value) {
      out += numeral;
      rest -= value;
    }
  }
  return out;
}

/**
 * One page of the codex. `side` decides which edge the folio number and the
 * marginal rule sit on, the way a real opening mirrors itself about the gutter.
 */
function Leaf({
  side,
  title,
  folio,
  children,
  catchword,
}: {
  side: "verso" | "recto";
  title?: string;
  folio: number;
  children: ReactNode;
  /** the first word of the next page, printed at the foot — a real binder's aid */
  catchword?: string;
}) {
  return (
    <div className="page" data-side={side}>
      {title && (
        <h2 className="folio-head">
          <span>{title}</span>
        </h2>
      )}
      <div className="folio-body">{children}</div>
      <div className="folio-foot">
        {catchword ? <span className="catchword">{catchword}</span> : <span />}
        <span className="folio-no">{roman(folio)}</span>
      </div>
    </div>
  );
}

/** a rubricated opening initial, the way a scribe starts a paragraph */
function Rubric({ text }: { text: string }) {
  return (
    <p className="folio-prose">
      <span className="initial" aria-hidden="true">
        {text.slice(0, 1)}
      </span>
      <span className="initial-rest">{text.slice(1)}</span>
    </p>
  );
}

/* ------------------------------------------------------------------- pages */

function TitlePage() {
  return (
    <div className="page" data-side="verso">
      <div className="title-page">
        <span className="title-kicker">the field notebook of</span>
        <h1 className="title-name">{profile.name}</h1>
        <span className="title-rule" aria-hidden="true" />
        <p className="title-role">{profile.role}</p>
        <p className="title-focus">
          being an account of {profile.focus.join(", ")}
        </p>
        <span className="title-device" aria-hidden="true">
          ❦
        </span>
        <p className="title-imprint">
          {profile.location} · Anno MMXXVI · vol. i
        </p>
      </div>
    </div>
  );
}

function ContentsPage() {
  return (
    <Leaf side="recto" title="Contents" folio={1} catchword="Of">
      <ol className="toc">
        {SPREADS.slice(1).map((s, i) => (
          <li key={s.id}>
            <span>{s.label}</span>
            <span className="dots" aria-hidden="true" />
            <span className="pg">{roman((i + 1) * 2)}</span>
          </li>
        ))}
      </ol>
      <ul className="marginalia" aria-label="Notes">
        {highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
    </Leaf>
  );
}

function AboutPage() {
  return (
    <Leaf side="verso" title="Of the Author" folio={2} catchword="Presently">
      {about.map((para, i) =>
        i === 0 ? <Rubric key={i} text={para} /> : <p key={i} className="folio-prose">{para}</p>,
      )}
    </Leaf>
  );
}

function NowPage() {
  return (
    <Leaf side="recto" title="Presently" folio={3} catchword="Of">
      <ul className="folio-list">
        {now.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <p className="folio-note">
        {profile.status}. Reachable at <span className="rubric">{profile.email}</span>.
      </p>
    </Leaf>
  );
}

function WorkEntry({ w }: { w: (typeof work)[number] }) {
  return (
    <article className="folio-entry">
      <h3>{w.role}</h3>
      <span className="folio-org">{w.org}</span>
      <span className="folio-when">
        {w.period} · {w.kind}
      </span>
      <ul>
        {w.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </article>
  );
}

function ProjectEntry({ p }: { p: (typeof projects)[number] }) {
  return (
    <article className="folio-entry folio-work">
      <h3>
        {p.name}
        <span className="folio-year">{p.year}</span>
      </h3>
      <span className="folio-org">{p.tag}</span>
      <p>{p.blurb}</p>
      <p className="folio-stack">{p.stack.join(" · ")}</p>
      {p.links.length > 0 && (
        <p className="folio-links">
          {p.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label}
            </a>
          ))}
        </p>
      )}
    </article>
  );
}

function SkillGroups({ groups }: { groups: typeof skills }) {
  return (
    <>
      {groups.map((g) => (
        <div className="folio-group" key={g.group}>
          <h3>{g.group}</h3>
          <p>{g.items.join(" · ")}</p>
        </div>
      ))}
    </>
  );
}

/* --------------------------------------------------------------- the book */

export type SpreadContent = { verso: ReactNode; recto: ReactNode };

export function buildSpreads(posts: PostMeta[]): SpreadContent[] {
  return [
    { verso: <TitlePage />, recto: <ContentsPage /> },
    { verso: <AboutPage />, recto: <NowPage /> },
    {
      verso: (
        <Leaf side="verso" title="Of Labours Undertaken" folio={4} catchword="Formerly">
          <WorkEntry w={work[0]} />
        </Leaf>
      ),
      recto: (
        <Leaf side="recto" title="Formerly" folio={5} catchword="Of">
          {work.slice(1).map((w) => (
            <WorkEntry key={w.org} w={w} />
          ))}
        </Leaf>
      ),
    },
    {
      verso: (
        <Leaf side="verso" title="Of Works Wrought" folio={6} catchword={projects[3]?.name}>
          {projects.slice(0, 3).map((p) => (
            <ProjectEntry key={p.n} p={p} />
          ))}
        </Leaf>
      ),
      recto: (
        <Leaf side="recto" folio={7} catchword={projects[6]?.name}>
          {projects.slice(3, 6).map((p) => (
            <ProjectEntry key={p.n} p={p} />
          ))}
        </Leaf>
      ),
    },
    {
      verso: (
        <Leaf side="verso" folio={8} catchword="Of">
          {projects.slice(6).map((p) => (
            <ProjectEntry key={p.n} p={p} />
          ))}
        </Leaf>
      ),
      recto: (
        <Leaf side="recto" title="Of Instruments" folio={9} catchword="Databases">
          <SkillGroups groups={skills.slice(0, 2)} />
        </Leaf>
      ),
    },
    {
      verso: (
        <Leaf side="verso" folio={10} catchword="Cloud">
          <SkillGroups groups={skills.slice(2, 5)} />
        </Leaf>
      ),
      recto: (
        <Leaf side="recto" folio={11} catchword="Of">
          <SkillGroups groups={skills.slice(5)} />
        </Leaf>
      ),
    },
    {
      verso: (
        <Leaf side="verso" title="Of Honours & Contests" folio={12} catchword="Marginalia">
          <ul className="folio-ledger">
            {achievements.map((a) => (
              <li key={a.label}>
                <span>{a.label}</span>
                <span className="dots" aria-hidden="true" />
                <span className="rubric">{a.value}</span>
              </li>
            ))}
          </ul>
        </Leaf>
      ),
      recto: (
        <Leaf side="recto" title="Marginalia" folio={13} catchword="Of">
          <ul className="folio-writing">
            {posts.map((p) => (
              <li key={p.slug}>
                <a href={`/writing/${p.slug}`}>
                  <span className="folio-when">{formatDate(p.date)}</span>
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                </a>
              </li>
            ))}
          </ul>
          <p className="folio-note">
            <a href="/writing">the whole archive →</a>
          </p>
        </Leaf>
      ),
    },
    {
      verso: (
        <Leaf side="verso" title="Of Correspondence" folio={14} catchword="Leave">
          <ul className="folio-ledger">
            <li>
              <span>letters</span>
              <span className="dots" aria-hidden="true" />
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </li>
            <li>
              <span>workshop</span>
              <span className="dots" aria-hidden="true" />
              <a href={profile.links.github} target="_blank" rel="noopener noreferrer">
                github.com/prashantxy
              </a>
            </li>
            <li>
              <span>this house</span>
              <span className="dots" aria-hidden="true" />
              <a href={profile.links.site} target="_blank" rel="noopener noreferrer">
                prashantdubey.work
              </a>
            </li>
            <li>
              <span>testimonial</span>
              <span className="dots" aria-hidden="true" />
              <a href={profile.resume} target="_blank" rel="noopener">
                résumé
              </a>
            </li>
          </ul>
        </Leaf>
      ),
      recto: (
        <Leaf side="recto" title="Leave a Note" folio={15}>
          <LeaveNote />
        </Leaf>
      ),
    },
    {
      verso: (
        <Leaf side="verso" title="Colophon" folio={16}>
          <p className="folio-prose">
            Hand-bound with Next.js and three.js. Set in Fell&rsquo;s English and Garamond. The
            binding is a 17th-century octavo; the leaves turn as you read down the page.
          </p>
          <p className="folio-note">
            {profile.alias} · the laboratory · {new Date().getFullYear()}
          </p>
        </Leaf>
      ),
      recto: (
        <div className="page" data-side="recto">
          <div className="title-page">
            <span className="title-device" aria-hidden="true">
              ❦
            </span>
            <p className="title-imprint">here ends the notebook</p>
          </div>
        </div>
      ),
    },
  ];
}
