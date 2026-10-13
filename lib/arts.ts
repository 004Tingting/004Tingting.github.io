import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Lang } from "@/lib/i18n";
import {
  asGameStatus,
  asScreenStatus,
  asScreenType,
  asExerciseKind,
  summarize,
  type CoverEntry,
  type GameEntry,
  type GameSourceItem,
  type LastfmData,
  type LastfmTrack,
  type LifeStats,
  type MonthlyTrends,
  type NetEaseMonthly,
  type NowPlaying,
  type ScreenEntry,
  type ExerciseEntry,
  type StatsHistory,
} from "@/lib/arts-shared";

/** 游艺（/arts）：音律（音乐）/ 游戏 / 影卷（影剧番小说）/ 运动（跑步 · 徒手） */
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

/** 游戏时长全榜：人工 frontmatter 条目 + Steam 全库 + WeGame 周更快照，同名去重（人工标记保留、时长取大），按小时倒序 */
export function getGameHoursFull(lang: Lang): Array<{ name: string; hours: number; manual: boolean }> {
  const byName = new Map<string, { hours: number; manual: boolean }>();
  for (const g of getGames(lang)) {
    if ((g.hours ?? 0) > 0) byName.set(g.title, { hours: g.hours as number, manual: true });
  }
  try {
    const history = JSON.parse(fs.readFileSync(STATS_HISTORY_FILE, "utf-8")) as StatsHistory;
    const months = Object.keys(history.snapshots).sort();
    const last = history.snapshots[months[months.length - 1]];
    for (const source of ["steam", "wegame", "epic"] as const) {
      for (const [name, hours] of Object.entries(last?.[source] ?? {})) {
        const prev = byName.get(name);
        if (!prev) byName.set(name, { hours, manual: false });
        else byName.set(name, { hours: Math.max(prev.hours, hours), manual: true });
      }
    }
  } catch {
    /* 快照缺失/损坏时仅用人工条目 */
  }
  return [...byName.entries()]
    .map(([name, v]) => ({ name, hours: v.hours, manual: v.manual }))
    .sort((a, b) => b.hours - a.hours);
}

/**
 * 自动源游戏（Steam / WeGame / Epic 最新快照）：跨源按名合并取大、剔除人工条目同名，按小时倒序。
 * 供游戏页「平台时长记录」分组列表使用；快照缺失/损坏时返回空数组（页面自动隐藏该区）。
 */
export function getGameSources(lang: Lang): GameSourceItem[] {
  const manualNames = new Set(getGames(lang).map((g) => g.title));
  const merged = new Map<string, { hours: number; source: GameSourceItem["source"] }>();
  try {
    const history = JSON.parse(fs.readFileSync(STATS_HISTORY_FILE, "utf-8")) as StatsHistory;
    const months = Object.keys(history.snapshots).sort();
    const last = history.snapshots[months[months.length - 1]];
    for (const source of ["steam", "wegame", "epic"] as const) {
      for (const [name, hours] of Object.entries(last?.[source] ?? {})) {
        const prev = merged.get(name);
        if (!prev || hours > prev.hours) merged.set(name, { hours, source });
      }
    }
  } catch {
    /* 快照缺失/损坏时仅返回空列表 */
  }
  return [...merged.entries()]
    .filter(([name]) => !manualNames.has(name))
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.hours - a.hours);
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

/** 音律：乐器 cover（order 升序，缺省按 date 倒序） */
export function getCovers(lang: Lang): CoverEntry[] {
  return readEntries(lang, "covers")
    .map(({ slug, data }) => ({
      slug,
      title: str(data.title, slug),
      instrument: str(data.instrument),
      order: numOrNull(data.order),
      date: str(data.date),
      bilibili: str(data.bilibili),
      notes: str(data.notes),
      tempo: numOrNull(data.tempo),
      sheet: typeof data.sheet === "string" && data.sheet ? data.sheet : null,
      accompaniment:
        typeof data.accompaniment === "string" && data.accompaniment ? data.accompaniment : null,
    }))
    .sort((a, b) => {
      const oa = a.order ?? Number.MAX_SAFE_INTEGER;
      const ob = b.order ?? Number.MAX_SAFE_INTEGER;
      if (oa !== ob) return oa - ob;
      return b.date.localeCompare(a.date);
    });
}

/** 音律：单条 cover（详情页；lang 内按 slug 查找，找不到返回 null） */
export function getCover(lang: Lang, slug: string): CoverEntry | null {
  return getCovers(lang).find((c) => c.slug === slug) ?? null;
}

/** 运动条目：跑步 / 徒手（按 date 倒序） */
export function getExercise(lang: Lang): ExerciseEntry[] {
  return readEntries(lang, "exercise")
    .map(({ slug, data }) => ({
      slug,
      title: str(data.title, slug),
      kind: asExerciseKind(data.kind),
      date: str(data.date),
      duration: numOrNull(data.duration),
      distance: numOrNull(data.distance),
      note: str(data.note, str(data.summary)),
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

/** 常驻歌单全量曲目（scripts/fetch-playlist.mjs 构建时生成；不存在或损坏时返回 null） */
export type PlaylistTrack = { name: string; artist: string; album: string; duration: number };
export type Playlist = { name: string; trackCount: number; tracks: PlaylistTrack[] };
export function getPlaylist(): Playlist | null {
  const file = path.join(ROOT, "playlist.json");
  if (!fs.existsSync(file)) return null;
  try {
    const d = JSON.parse(fs.readFileSync(file, "utf-8")) as Playlist;
    return d?.tracks?.length ? d : null;
  } catch {
    return null;
  }
}

/** 最近收听列表（Last.fm） */
export function getRecentTracks(): LastfmTrack[] {
  return getLastfm()?.recent ?? [];
}

/** 汇总统计（构建时计算） */
export function getStats(lang: Lang): LifeStats {
  return summarize(getGames(lang), getScreen(lang), getCovers(lang), getExercise(lang));
}

/* ---------- 月度趋势（看板，构建时聚合；月轴 = 近 8 个月，本地时区；想改 6/12 只动这一个数） ---------- */

const STATS_HISTORY_FILE = path.join(ROOT, "stats-history.json");
const NETEASE_MONTHLY_FILE = path.join(ROOT, "netease-monthly.json");

const MONTH_COUNT = 8;

const pad2 = (n: number): string => String(n).padStart(2, "0");

function lastMonths(count = MONTH_COUNT): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
  });
}

/** 快照差分：逐月对键并集求 max(0, 当月 − 上月) 之和（首月无基线计 0） */
function diffSnapshots(
  history: StatsHistory,
  months: string[],
  key: "games" | "screen" | "netease" | "steam" | "wegame" | "epic",
): number[] {
  return months.map((m, i) => {
    const cur = history.snapshots[m]?.[key] ?? null;
    const prev = i > 0 ? (history.snapshots[months[i - 1]]?.[key] ?? null) : null;
    if (!cur) return 0;
    if (!prev) return 0;
    const titles = new Set([...Object.keys(cur), ...Object.keys(prev)]);
    let sum = 0;
    for (const t of titles) sum += Math.max(0, (cur[t] ?? 0) - (prev[t] ?? 0));
    return sum;
  });
}

/** 月度趋势：运动（逐次聚合）/ 音律（网易云听歌时长差分）/ 游戏·影卷（快照差分） */
export function getMonthlyTrends(lang: Lang): MonthlyTrends {
  const months = lastMonths();

  /* 运动：条目按月聚合（kind 存在且有时长才计，开篇随笔类不计） */
  const exByMonth = Object.fromEntries(months.map((m) => [m, 0]));
  for (const e of getExercise(lang)) {
    if (e.kind === null || e.duration === null) continue;
    const m = e.date.slice(0, 7);
    if (m in exByMonth) exByMonth[m] += e.duration;
  }

  /* 游戏 / 影卷 / 网易云：累计值的追加式快照，月度增量 = 邻月差分 */
  let history: StatsHistory = { source: "stats-history", updatedAt: "", snapshots: {} };
  try {
    if (fs.existsSync(STATS_HISTORY_FILE)) {
      history = { ...history, ...(JSON.parse(fs.readFileSync(STATS_HISTORY_FILE, "utf-8")) as StatsHistory) };
    }
  } catch {
    /* 损坏按空快照处理 */
  }

  /* 音律：网易云官方月度收听时长（分钟；2026-01~09 官方截图人工回填、当月起 realtime 自动覆盖） */
  let netease: NetEaseMonthly | null = null;
  try {
    if (fs.existsSync(NETEASE_MONTHLY_FILE)) {
      netease = JSON.parse(fs.readFileSync(NETEASE_MONTHLY_FILE, "utf-8")) as NetEaseMonthly;
    }
  } catch {
    netease = null;
  }

  /* 基线月（末月）的当前累计——差分首月无上月起，展示单点而非空态 */
  const lastSnap = history.snapshots[months[months.length - 1]];
  const sumOf = (rec: Record<string, number> | undefined): number | null =>
    rec && Object.keys(rec).length ? Object.values(rec).reduce((s, v) => s + v, 0) : null;

  /* 游戏：人工 frontmatter + Steam + WeGame + Epic，四源差分逐月相加 */
  const gamesDiff = diffSnapshots(history, months, "games");
  const steamDiff = diffSnapshots(history, months, "steam");
  const wegameDiff = diffSnapshots(history, months, "wegame");
  const epicDiff = diffSnapshots(history, months, "epic");
  const manualGamesTotal = sumOf(lastSnap?.games);
  const steamTotal = sumOf(lastSnap?.steam);
  const wegameTotal = sumOf(lastSnap?.wegame);
  const epicTotal = sumOf(lastSnap?.epic);

  return {
    months,
    exercise: months.map((m) => Math.round((exByMonth[m] / 60) * 10) / 10),
    // 音律走官方全量口径（分钟 → 小时）；top100 快照差分仅作备份，不再用于折线
    music: months.map((m) => {
      const min = netease?.monthly?.[m];
      return typeof min === "number" ? Math.round((min / 60) * 10) / 10 : 0;
    }),
    neteaseTotalHours: netease?.totalHours ?? null,
    gamesDelta: gamesDiff.map(
      (v, i) => Math.round((v + steamDiff[i] + wegameDiff[i] + epicDiff[i]) * 10) / 10,
    ),
    steamTotalHours: steamTotal,
    wegameTotalHours: wegameTotal,
    screenDelta: diffSnapshots(history, months, "screen"),
    baselines: {
      // 音乐已切换官方全量口径（回填后有历史数据，不再需要基线视图）
      music: null,
      // 游戏 = 人工精选记录 + Steam 全库 + WeGame + Epic
      games:
        manualGamesTotal === null &&
        steamTotal === null &&
        wegameTotal === null &&
        epicTotal === null
          ? null
          : (manualGamesTotal ?? 0) + (steamTotal ?? 0) + (wegameTotal ?? 0) + (epicTotal ?? 0),
      screen: sumOf(lastSnap?.screen),
    },
  };
}
