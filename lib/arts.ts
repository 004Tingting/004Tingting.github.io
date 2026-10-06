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
  type LastfmData,
  type LastfmTrack,
  type LifeStats,
  type NowPlaying,
  type ScreenEntry,
} from "@/lib/arts-shared";

/** 游艺（/arts）：音律（音乐）/ 游戏 / 影卷（影剧番小说） */
const ROOT = path.join(process.cwd(), "content", "arts");
const LASTFM_FILE = path.join(ROOT, "lastfm.json");
const NOW_FILE = path.join(ROOT, "now.json");

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

/** 影卷条目：剧 / 番 / 影 / 小说（按 date 倒序） */
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

/** 音律：乐器 cover（按 date 倒序） */
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

/** Last.fm 实时数据（构建前由 scripts/fetch-now.mjs 生成；不存在时返回 null） */
export function getLastfm(): LastfmData | null {
  if (!fs.existsSync(LASTFM_FILE)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(LASTFM_FILE, "utf-8")) as LastfmData;
    return data?.track?.title ? data : null;
  } catch {
    return null;
  }
}

/** 手动兜底配置（content/arts/now.json）：常驻歌单嵌入 + Last.fm 不可用时的降级 */
function getManualNow(): NowPlaying | null {
  if (!fs.existsSync(NOW_FILE)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(NOW_FILE, "utf-8")) as Partial<NowPlaying>;
    if (!raw.title) return null;
    return {
      title: raw.title,
      subtitle: raw.subtitle ?? "",
      note: raw.note ?? "",
      embed: raw.embed ?? "",
      link: raw.link ?? "",
      cover: raw.cover ?? "",
      live: false,
    };
  } catch {
    return null;
  }
}

/** 「正在听」：优先 Last.fm 实时数据（含封面与正在播放标记），回退手动 now.json */
export function getNow(): NowPlaying | null {
  const lf = getLastfm();
  if (lf) {
    return {
      title: lf.track.title,
      subtitle: lf.track.artist,
      note: "",
      embed: "",
      link: lf.track.url,
      cover: lf.track.cover,
      live: lf.nowPlaying,
    };
  }
  return getManualNow();
}

/** 常驻歌单嵌入（始终来自手动 now.json） */
export function getPlaylistEmbed(): { title: string; subtitle: string; embed: string; link: string } | null {
  const manual = getManualNow();
  if (!manual || !manual.embed) return null;
  return { title: manual.title, subtitle: manual.subtitle, embed: manual.embed, link: manual.link };
}

/** 最近收听列表（Last.fm） */
export function getRecentTracks(): LastfmTrack[] {
  return getLastfm()?.recent ?? [];
}

/** 汇总统计（构建时计算） */
export function getStats(lang: Lang): LifeStats {
  return summarize(getGames(lang), getScreen(lang), getCovers(lang));
}
