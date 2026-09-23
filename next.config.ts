import type { NextConfig } from "next";

/* Nothing here is embedded elsewhere, asks for a device, or needs to leak a
   full URL to the sites it links out to. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      /* The binding is 3.2 MB and the page will not show a book until it has
         arrived; a returning reader should never fetch it twice. Rename the
         file if it is ever re-exported — that is the cache-bust. */
      {
        source: "/:file(ancient_book\\.web\\.glb|parchment\\.jpg|town-heidelberg-1620\\.jpg)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      /* the engraved plates — same rule: re-bake under a new name to bust */
      {
        source: "/plates/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  /* The social cards read their four TTFs off disk. Every opengraph-image
     route is prerendered, so in practice this happens at build time only —
     but if one is ever invoked at request time (a deploy target that opts out
     of the static copy), the tracer would not know those files were needed,
     because the path is assembled at runtime. Declare them. */
  outputFileTracingIncludes: {
    "/opengraph-image": ["./assets/fonts/**"],
    "/twitter-image": ["./assets/fonts/**"],
    "/writing/opengraph-image": ["./assets/fonts/**"],
    "/writing/[slug]/opengraph-image": ["./assets/fonts/**"],
  },
};

export default nextConfig;
