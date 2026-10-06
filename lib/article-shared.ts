import type { Lang } from "@/lib/i18n";

/** 文章元数据（研思 / 纪事 共用；客户端安全，无 node 依赖） */
export type ArticleMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
};

/** 日期显示：zh → 2026.10.06；en → Oct 6, 2026 */
export function fmtDate(date: string, lang: Lang): string {
  if (lang === "zh") return date.replaceAll("-", ".");
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
