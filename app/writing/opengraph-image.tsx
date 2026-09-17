import { ImageResponse } from "next/og";
import { getPosts } from "@/lib/blog";
import { CONTENT_TYPE, Fleuron, Frame, INK, INK_2, INK_FAINT, Imprint, SIZE, fonts, ground } from "@/lib/og";

export const alt = "Writing — Prashant Dubey";
export const size = SIZE;
export const contentType = CONTENT_TYPE;

export default function Image() {
  /* the three most recent titles, so the card shows what is actually in there
     rather than a bare section heading */
  const recent = getPosts().slice(0, 3);

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
            padding: "88px 96px 62px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Fell",
                fontStyle: "italic",
                fontSize: 28,
                letterSpacing: "0.2em",
                color: INK_FAINT,
              }}
            >
              from the field notebook of Prashant Dubey
            </div>

            <div
              style={{
                display: "flex",
                fontFamily: "Fell",
                fontSize: 92,
                lineHeight: 1.05,
                color: INK,
                marginTop: 14,
              }}
            >
              Writing
            </div>

            <div style={{ display: "flex", margin: "26px 0 26px" }}>
              <Fleuron width={340} />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {recent.map((p) => (
                <div
                  key={p.slug}
                  style={{
                    display: "flex",
                    fontFamily: "Garamond",
                    fontSize: 30,
                    lineHeight: 1.5,
                    color: INK_2,
                    maxWidth: 980,
                  }}
                >
                  {p.title}
                </div>
              ))}
            </div>
          </div>

          <Imprint left="notes on graphs, terminals and backends" right="prashantdubey.work" />
        </div>
      </div>
    ),
    { ...size, fonts: fonts() },
  );
}
