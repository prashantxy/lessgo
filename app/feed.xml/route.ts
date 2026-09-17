import { SITE, profile } from "@/content/site";
import { getPost, getPosts } from "@/lib/blog";

/* Built once, served as a file — there is no request-time work to do here. */
export const dynamic = "force-static";

const TITLE = "Prashant Dubey — the field notebook";
const DESC = "Notes on graph systems, terminal tooling, and backends.";

/** XML has five characters that cannot appear raw in text or an attribute. */
function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const posts = getPosts();
  const built = posts[0]?.date ? new Date(posts[0].date) : new Date();

  const items = posts
    .map((meta) => {
      const full = getPost(meta.slug);
      const link = `${SITE}/writing/${meta.slug}`;
      return [
        "    <item>",
        `      <title>${esc(meta.title)}</title>`,
        `      <link>${esc(link)}</link>`,
        `      <guid isPermaLink="true">${esc(link)}</guid>`,
        `      <pubDate>${new Date(meta.date).toUTCString()}</pubDate>`,
        `      <description>${esc(meta.excerpt)}</description>`,
        ...meta.tags.map((t) => `      <category>${esc(t)}</category>`),
        /* the whole post, so readers that show full text can */
        full ? `      <content:encoded><![CDATA[${full.html}]]></content:encoded>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${esc(TITLE)}</title>
    <link>${esc(SITE)}</link>
    <description>${esc(DESC)}</description>
    <language>en</language>
    <managingEditor>${esc(profile.email)} (${esc(profile.name)})</managingEditor>
    <lastBuildDate>${built.toUTCString()}</lastBuildDate>
    <atom:link href="${esc(`${SITE}/feed.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
