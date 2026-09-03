import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo";

// Root-level social preview image. Applies to every route that doesn't declare
// its own opengraph-image, so links to the site (Slack, X, WhatsApp, LinkedIn,
// AI answer engines) render a branded card instead of a blank one.
//
// No request-time APIs and no params -> Next statically optimises this at build
// time and serves it from cache.

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DOMAIN = SITE_URL.replace(/^https?:\/\//, "");

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              display: "flex",
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#c4ee40",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: "30px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "82px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            One Student. One Mentor. One Journey.
          </div>
          <div style={{ display: "flex", fontSize: "34px", color: "#c4ee40" }}>
            Personalized 1-to-1 learning &amp; mentorship
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "26px", color: "#8a8d84" }}>
          {DOMAIN}
        </div>
      </div>
    ),
    { ...size }
  );
}
