import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";
import { getPosts } from "@/lib/blog";

/**
 * Nothing on the site links to a post from anywhere a crawler can follow with
 * confidence — the book's text is portalled into WebGL and the flat copy is
 * inert — so the sitemap is how the writing gets found at all.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  const newest = posts[0]?.date;

  return [
    {
      url: SITE,
      lastModified: newest ? new Date(newest) : new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE}/writing`,
      lastModified: newest ? new Date(newest) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE}/gallery`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...posts.map((p) => ({
      url: `${SITE}/writing/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
