import { ImageResponse } from "next/og";
import { profile } from "@/content/site";
import { CONTENT_TYPE, Fleuron, Frame, INK, INK_2, INK_FAINT, Imprint, SIZE, fonts, ground } from "@/lib/og";

/* The card the whole site is judged by before anyone has seen a page of it:
   the notebook's title page, reset for a 1200x630 frame. */

export const alt = `${profile.name} — the field notebook`;
export const size = SIZE;
export const contentType = CONTENT_TYPE;

export default function Image() {
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
                fontSize: 30,
                letterSpacing: "0.2em",
                color: INK_FAINT,
              }}
            >
              the field notebook of
            </div>

            <div
              style={{
                display: "flex",
                fontFamily: "Fell",
                fontSize: 106,
                lineHeight: 1.05,
                color: INK,
                marginTop: 14,
              }}
            >
              {profile.name}
            </div>

            <div style={{ display: "flex", margin: "30px 0 28px" }}>
              <Fleuron width={380} />
            </div>

            <div style={{ display: "flex", fontFamily: "Garamond", fontSize: 38, color: INK_2 }}>
              {profile.role}
            </div>

            <div
              style={{
                display: "flex",
                fontFamily: "Fell",
                fontStyle: "italic",
                fontSize: 28,
                lineHeight: 1.45,
                color: INK_FAINT,
                marginTop: 16,
                maxWidth: 880,
              }}
            >
              being an account of {profile.focus.join(", ")}
            </div>
          </div>

          <Imprint left={`${profile.location} · Anno MMXXVI · vol. i`} right="prashantdubey.work" />
        </div>
      </div>
    ),
    { ...size, fonts: fonts() },
  );
}
