import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { SITE_TITLE } from "@/lib/site";

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Next builds the image as a route handler, and route handlers are
// dynamic by default; a static export needs it declared static.
export const dynamic = "force-static";

/** The dark-theme pink; the card is always on the near-black ground. */
const PINK = "#ff99cc";

/**
 * The card shown when the URL is pasted into Slack, LinkedIn, iMessage and the
 * like. It is rendered once at build time: the portrait is read from public/
 * with fs and embedded as a data URL so the renderer never has to fetch it.
 */
export default async function OpenGraphImage() {
  const portrait = await readFile(
    path.join(process.cwd(), "public", "portrait.jpg"),
  );
  const portraitSrc = `data:image/jpeg;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#121212",
          color: "#fafafa",
        }}
      >
        <img
          src={portraitSrc}
          alt=""
          width={420}
          height={630}
          style={{ objectFit: "cover", flexShrink: 0 }}
        />
        {/* flex: 1 gives the column a width, so the long line wraps. */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 28,
            padding: "0 64px",
          }}
        >
          <div style={{ fontSize: 40, color: PINK }}>{"<MC>"}</div>
          <div style={{ fontSize: 80, fontWeight: 700, lineHeight: 1 }}>
            Michael Cohen
          </div>
          <div style={{ fontSize: 34, lineHeight: 1.3, color: "#d4d4d4" }}>
            Software engineer · Agentic Systems at Anthropic · Brooklyn, NY
          </div>
          <div style={{ fontSize: 32, color: PINK }}>michaelcohen.io</div>
        </div>
      </div>
    ),
    size,
  );
}
