import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Lang } from "@/lib/i18n";
import type { ArticleMeta } from "@/lib/article-shared";

export type { ArticleMeta } from "@/lib/article-shared";
export { fmtDate } from "@/lib/article-shared";

/**
 * 文章栏目：
 *   research   = 研思（推导 / 方法 / 理论 / 复盘）
 *   chronicles = 纪事（叙事 / 随笔 / 阶段复盘）
 * 归属规则见 AGENTS.md「内容归属」。
 */
export type Section = "research" | "chronicles";
export const SECTIONS: Section[] = ["research", "chronicles"];

const CONTENT_ROOT = path.join(process.cwd(), "content");

export type Article = ArticleMeta & { content: string; section: Section };

/** YAML 无引号日期会被解析成 Date 实例，统一归一化为 YYYY-MM-DD 字符串 */
function normalizeDate(d: unknown): string {
  if (typeof d === "string") return d;
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return "1970-01-01";
}

/** 读取某栏目某语言的全部文章（构建时执行，按 date 倒序） */
export function getArticles(lang: Lang, section: Section): Article[] {
  const dir = path.join(CONTENT_ROOT, section, lang);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f): Article & { draft: boolean } => {
      const slug = f.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug,
        section,
        title: (data.title as string) ?? slug,
        date: normalizeDate(data.date),
        tags: (data.tags as string[]) ?? [],
        summary: (data.summary as string) ?? "",
        draft: (data.draft as boolean) ?? false,
        content,
      };
    })
    .filter((a) => !a.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticle(lang: Lang, section: Section, slug: string): Article | undefined {
  return getArticles(lang, section).find((a) => a.slug === slug);
}

/** 列表场景去掉正文与栏目字段 */
export function toArticleMeta(a: Article): ArticleMeta {
  const { content: _content, section: _section, ...meta } = a;
  return meta;
}

/** 首页「最新文章」：跨栏目合并后按日期倒序 */
export function getLatestArticles(lang: Lang, limit = 3): Article[] {
  return SECTIONS.flatMap((s) => getArticles(lang, s))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}
