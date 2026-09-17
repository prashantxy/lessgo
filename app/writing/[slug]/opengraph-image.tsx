import { ImageResponse } from "next/og";
import { getPost, getPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { CONTENT_TYPE, Fleuron, Frame, INK, INK_2, INK_FAINT, Imprint, SIZE, fonts, ground } from "@/lib/og";

export const alt = "An entry from the field notebook";
export const size = SIZE;
export const contentType = CONTENT_TYPE;

/* Each post is prerendered, so its card is baked at build time too. */
export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

/**
 * Satori cannot measure text, so the title cannot be fitted by feedback — it
 * is stepped down by length instead. The breakpoints are chosen so the
 * longest title currently in content/blog still sits on three lines.
 */
function titleSize(title: string) {
  if (title.length <= 28) return 82;
  if (title.length <= 46) return 68;
  if (title.length <= 68) return 56;
  return 48;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  const title = post?.title ?? "Marginalia";
  const excerpt = post?.excerpt ?? "";
  const stamp = post?.date ? formatDate(post.date) : "";
  const tags = post?.tags ?? [];

  return new ImageResponse(
    (
      <div style={ground}>
        <Frame />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: "82px 96px 62px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Fell",
                fontStyle: "italic",
                fontSize: 26,
                letterSpacing: "0.2em",
                color: INK_FAINT,
              }}
            >
              marginalia · the field notebook
            </div>

            <div
              style={{
                display: "flex",
                fontFamily: "Fell",
                fontSize: titleSize(title),
                lineHeight: 1.12,
                color: INK,
                marginTop: 20,
                maxWidth: 1000,
              }}
            >
              {title}
            </div>

            {/* One real column, not a fragment: satori does not flatten
                fragments, so a <>…</> here lays its two children out as row
                siblings and the excerpt lands on top of the fleuron. */}
            {excerpt ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", margin: "26px 0 24px" }}>
                  <Fleuron width={300} />
                </div>
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Garamond",
                    fontSize: 30,
                    lineHeight: 1.45,
                    color: INK_2,
                    maxWidth: 940,
                  }}
                >
                  {excerpt}
                </div>
              </div>
            ) : null}
          </div>

          <Imprint
            left={[stamp, tags.join(" · ")].filter(Boolean).join("  ·  ")}
            right="prashantdubey.work"
          />
        </div>
      </div>
    ),
    { ...size, fonts: fonts() },
  );
}
