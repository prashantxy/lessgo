import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import type { PostMeta } from "./format";

export type { PostMeta } from "./format";
export { formatDate } from "./format";

export type Post = PostMeta & { html: string };

const DIR = path.join(process.cwd(), "content/blog");

function readAll(): { meta: PostMeta; raw: string }[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const { data, content } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));
      return {
        raw: content,
        meta: {
          slug,
          title: String(data.title ?? slug),
          date: String(data.date ?? ""),
          excerpt: String(data.excerpt ?? ""),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        },
      };
    });
}

export function getPosts(): PostMeta[] {
  return readAll()
    .map((p) => p.meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  const found = readAll().find((p) => p.meta.slug === slug);
  if (!found) return null;
  marked.setOptions({ gfm: true, breaks: false });
  return { ...found.meta, html: marked.parse(found.raw) as string };
}
