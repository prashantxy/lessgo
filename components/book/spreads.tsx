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

export { roman } from "@/lib/roman";
import { roman } from "@/lib/roman";

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

/**
 * An engraved plate, printed on the leaf. Cut from Merian's view of
 * Heidelberg (1620) — the town outside the study window — and keyed to ink
 * only, so it lies on the parchment rather than on a white card
 * (scripts/make-plates.mjs). Lazy: the flat reader copy renders every spread,
 * and none of it should fetch a plate nobody is looking at.
 */
const PLATE_SIZE = {
  town: [720, 274],
  castle: [600, 345],
  bridge: [600, 279],
  panorama: [1000, 342],
} as const;

function Engraving({
  plate,
  caption,
  alt,
}: {
  plate: keyof typeof PLATE_SIZE;
  caption: string;
  alt: string;
}) {
  const [w, h] = PLATE_SIZE[plate];
  const src = `/plates/${plate}.webp`;
  return (
    <figure className="engraving" data-plate={plate}>
      {/* A button: at the size a leaf can hold it, a plate is a thumbnail of
          itself, so it lifts off the page to be looked at. The shell hears
          about it by event — this renders inside the scene's own portal. */}
      <button
        type="button"
        className="engraving-mark"
        aria-label={`Enlarge the plate: ${caption}`}
        onClick={() =>
          window.dispatchEvent(
            new CustomEvent("codex:plate", { detail: { src, w, h, alt, caption } }),
          )
        }
      >
        {/* a plain <img>: it lives inside a CSS3D portal, where next/image's wrapper and srcset buy nothing */}
        <img src={src} width={w} height={h} alt={alt} loading="lazy" decoding="async" />
      </button>
      <figcaption>{caption}</figcaption>
    </figure>
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
      <Engraving
        plate="town"
        alt="Engraving of the old town of Heidelberg on the Neckar, with its church spires and rooftops"
        caption="Prospect of the town from the study window"
      />
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
        {p.study ? <a href={`/works/${p.study}`}>{p.name}</a> : p.name}
        <span className="folio-year">{p.year}</span>
      </h3>
      <span className="folio-org">{p.tag}</span>
      <p>{p.blurb}</p>
      <p className="folio-stack">{p.stack.join(" · ")}</p>
      {(p.links.length > 0 || p.study) && (
        <p className="folio-links">
          {p.study && <a href={`/works/${p.study}`}>the account</a>}
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
          <Engraving
            plate="castle"
            alt="Engraving of Heidelberg Castle on its wooded hillside, with towers and terraced gardens"
            caption="The workshop upon the hill"
          />
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
            {profile.links.x && (
              <li>
                <span>dispatches</span>
                <span className="dots" aria-hidden="true" />
                <a href={profile.links.x} target="_blank" rel="noopener noreferrer">
                  x.com/{profile.links.x.split("/").pop()}
                </a>
              </li>
            )}
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
          <Engraving
            plate="bridge"
            alt="Engraving of the old covered bridge and its gate tower over the river Neckar"
            caption="Whence letters go out — the old bridge"
          />
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
          <p className="folio-prose">
            The town through the study window, and every plate in these leaves, is Heidelberg as
            Matthäus Merian engraved it in 1620 — public domain, re-inked for dusk.
          </p>
          <p className="folio-note">
            <a href="/gallery">the cabinet of likenesses →</a>
          </p>
          <p className="folio-note">
            {profile.alias} · the laboratory · {new Date().getFullYear()}
          </p>
        </Leaf>
      ),
      recto: (
        <div className="page" data-side="recto">
          <div className="title-page">
            <Engraving
              plate="panorama"
              alt="Matthäus Merian's 1620 panorama of Heidelberg: the castle, the old town and the river Neckar beneath wooded hills"
              caption="Heidelberga · M. Merian fecit, 1620"
            />
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
