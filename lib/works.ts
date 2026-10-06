import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Lang } from "@/lib/i18n";

/** 造物（/works）：代码、产品与具体实践成果 */
const CONTENT_ROOT = path.join(process.cwd(), "content", "works");

export type WorkEntry = {
  slug: string;
  title: string;
  status: string;
  period: string;
  tags: string[];
  summary: string;
  order: number;
};

export type Work = WorkEntry & { content: string };

/** 读取某语言的全部作品，按 frontmatter 的 order 排序（构建时执行） */
export function getWorks(lang: Lang): Work[] {
  const dir = path.join(CONTENT_ROOT, lang);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f): Work & { draft: boolean } => {
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
    .filter((w) => !w.draft)
    .sort((a, b) => a.order - b.order);
}

export function getWork(lang: Lang, slug: string): Work | undefined {
  return getWorks(lang).find((w) => w.slug === slug);
}

/** 列表场景去掉正文 */
export function toWorkMeta(w: Work): WorkEntry {
  const { content: _content, ...meta } = w;
  return meta;
}
