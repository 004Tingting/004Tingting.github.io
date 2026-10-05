import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Lang } from "@/lib/i18n";
import {
  asGameStatus,
  asScreenStatus,
  asScreenType,
  summarize,
  type CoverEntry,
  type GameEntry,
  type LifeStats,
  type NowPlaying,
  type ScreenEntry,
} from "@/lib/life-shared";

const ROOT = path.join(process.cwd(), "content", "life");

function readEntries(lang: Lang, sub: string): Array<{ slug: string; data: Record<string, unknown>; content: string }> {
  const dir = path.join(ROOT, sub, lang);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      const { data, content } = matter(raw);
      return { slug: f.replace(/\.md$/, ""), data: data as Record<string, unknown>, content };
    });
}

const str = (v: unknown, d = ""): string => (typeof v === "string" ? v : d);
const numOrNull = (v: unknown): number | null => (typeof v === "number" ? v : null);
const strArray = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : typeof v === "string" && v ? [v] : []);

/** 游戏条目（按 date 倒序） */
export function getGames(lang: Lang): GameEntry[] {
  return readEntries(lang, "games")
    .map(({ slug, data }) => ({
      slug,
      title: str(data.title, slug),
      platform: strArray(data.platform),
      status: asGameStatus(data.status),
      rating: numOrNull(data.rating),
      hours: numOrNull(data.hours),
      designStudy: data.designStudy === true,
      date: str(data.date),
      review: typeof data.review === "string" ? data.review : null,
      summary: str(data.summary),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** 记录条目：剧 / 番 / 影 / 小说（按 date 倒序） */
export function getScreen(lang: Lang): ScreenEntry[] {
  return readEntries(lang, "screen")
    .map(({ slug, data }) => ({
      slug,
      title: str(data.title, slug),
      type: asScreenType(data.type),
      status: asScreenStatus(data.status),
      rating: numOrNull(data.rating),
      hours: numOrNull(data.hours),
      date: str(data.date),
      review: typeof data.review === "string" ? data.review : null,
      summary: str(data.summary),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** 乐器 cover（按 date 倒序） */
export function getCovers(lang: Lang): CoverEntry[] {
  return readEntries(lang, "covers")
    .map(({ slug, data }) => ({
      slug,
      title: str(data.title, slug),
      instrument: str(data.instrument),
      date: str(data.date),
      bilibili: str(data.bilibili),
      notes: str(data.notes),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** 正在听（content/life/now.json，无文件时返回 null） */
export function getNow(): NowPlaying | null {
  const file = path.join(ROOT, "now.json");
  if (!fs.existsSync(file)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf-8")) as Partial<NowPlaying>;
    if (!raw.title) return null;
    return {
      title: raw.title,
      subtitle: raw.subtitle ?? "",
      note: raw.note ?? "",
      embed: raw.embed ?? "",
      link: raw.link ?? "",
    };
  } catch {
    return null;
  }
}

/** 汇总统计（构建时计算） */
export function getStats(lang: Lang): LifeStats {
  return summarize(getGames(lang), getScreen(lang), getCovers(lang));
}
