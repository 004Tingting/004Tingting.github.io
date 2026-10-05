import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Lang } from "@/lib/i18n";
import type { PostMeta } from "@/lib/blog-shared";

export type { PostMeta } from "@/lib/blog-shared";
export { fmtDate } from "@/lib/blog-shared";

const CONTENT_ROOT = path.join(process.cwd(), "content", "blog");

export type Post = PostMeta & { content: string };

/** YAML 无引号日期会被 js-yaml 解析成 Date 实例，统一归一化为 YYYY-MM-DD 字符串 */
function normalizeDate(d: unknown): string {
  if (typeof d === "string") return d;
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return "1970-01-01";
}

/**
 * 读取某语言的全部文章（构建时执行）。
 * 渐进式双语：未翻译的文章只出现在有内容的那侧，不需要另一侧有空壳。
 */
export function getPosts(lang: Lang): Post[] {
  const dir = path.join(CONTENT_ROOT, lang);
  if (!fs.existsSync(dir)) return [];

  const posts = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f): Post & { draft: boolean } => {
      const slug = f.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: (data.title as string) ?? slug,
        date: normalizeDate(data.date),
        tags: (data.tags as string[]) ?? [],
        summary: (data.summary as string) ?? "",
        draft: (data.draft as boolean) ?? false,
        content,
      };
    })
    .filter((p) => !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));

  return posts;
}

export function getPost(lang: Lang, slug: string): Post | undefined {
  return getPosts(lang).find((p) => p.slug === slug);
}

/** 列表场景只需要元数据，去掉正文减小序列化体积 */
export function toMeta(p: Post): PostMeta {
  const { content: _content, ...meta } = p;
  return meta;
}
