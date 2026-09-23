import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { projects, type Project } from "@/content/site";

/**
 * The long accounts of the works — one markdown file per project in
 * content/works/, keyed by the project's `study` slug in content/site.ts.
 * The book can only hold two clamped lines per project; these are where the
 * rest of it lives.
 */

export type Study = {
  slug: string;
  title: string;
  tag: string;
  year: string;
  excerpt: string;
  stack: string[];
  html: string;
  project: Project | undefined;
};

const DIR = path.join(process.cwd(), "content/works");

marked.setOptions({ gfm: true, breaks: false });

export function getStudySlugs(): string[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getStudy(slug: string): Study | null {
  const file = path.join(DIR, `${slug}.md`);
  if (!/^[a-z0-9-]+$/.test(slug) || !fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    slug,
    title: String(data.title ?? slug),
    tag: String(data.tag ?? ""),
    year: String(data.year ?? ""),
    excerpt: String(data.excerpt ?? ""),
    stack: Array.isArray(data.stack) ? data.stack.map(String) : [],
    html: marked.parse(content) as string,
    project: projects.find((p) => p.study === slug),
  };
}
