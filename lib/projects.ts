import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Lang } from "@/lib/i18n";

const CONTENT_ROOT = path.join(process.cwd(), "content", "projects");

export type ProjectMeta = {
  slug: string;
  title: string;
  status: string;
  period: string;
  tags: string[];
  summary: string;
  order: number;
};

export type Project = ProjectMeta & { content: string };

/** 读取某语言的全部项目，按 frontmatter 的 order 排序（构建时执行） */
export function getProjects(lang: Lang): Project[] {
  const dir = path.join(CONTENT_ROOT, lang);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f): Project & { draft: boolean } => {
      const slug = f.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: (data.title as string) ?? slug,
        status: (data.status as string) ?? "",
        period: (data.period as string) ?? "",
        tags: (data.tags as string[]) ?? [],
        summary: (data.summary as string) ?? "",
        order: typeof data.order === "number" ? data.order : 99,
        draft: (data.draft as boolean) ?? false,
        content,
      };
    })
    .filter((p) => !p.draft)
    .sort((a, b) => a.order - b.order);
}

export function getProject(lang: Lang, slug: string): Project | undefined {
  return getProjects(lang).find((p) => p.slug === slug);
}

/** 列表场景去掉正文 */
export function toProjectMeta(p: Project): ProjectMeta {
  const { content: _content, ...meta } = p;
  return meta;
}
