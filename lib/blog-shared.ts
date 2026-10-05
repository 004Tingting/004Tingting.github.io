import type { Lang } from "@/lib/i18n";

/** 文章元数据类型（客户端/服务端共用） */
export type PostMeta = {
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
