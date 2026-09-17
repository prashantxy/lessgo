import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
