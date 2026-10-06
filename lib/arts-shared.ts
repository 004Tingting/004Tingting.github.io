import type { Lang } from "@/lib/i18n";

/* 游艺（/arts）内部条目：状态与类型用枚举存 frontmatter，展示标签统一走 lib/i18n.ts */

export type GameStatus = "playing" | "completed" | "dropped";
export type ScreenType = "tv" | "anime" | "movie" | "novel";
export type ScreenStatus = "watching" | "completed" | "dropped";

export type GameEntry = {
  slug: string;
  title: string;
  platform: string[];
  status: GameStatus;
  rating: number | null;
  hours: number | null;
  designStudy: boolean;
  date: string;
  review: string | null;
  summary: string;
};

export type ScreenEntry = {
  slug: string;
  title: string;
  type: ScreenType;
  status: ScreenStatus;
  rating: number | null;
  hours: number | null;
  date: string;
  review: string | null;
  summary: string;
};

export type CoverEntry = {
  slug: string;
  title: string;
  instrument: string;
  date: string;
  bilibili: string;
  notes: string;
};

export type NowPlaying = {
  title: string;
  subtitle: string;
  note: string;
  embed: string;
  link: string;
  cover: string;
  live: boolean;
};

/** Last.fm 拉取的单条收听记录（scripts/fetch-now.mjs 生成） */
export type LastfmTrack = {
  title: string;
  artist: string;
  album: string;
  url: string;
  cover: string;
  playedAt: string | null;
};

/** content/arts/lastfm.json 的结构 */
export type LastfmData = {
  source: "lastfm";
  generatedAt: string;
  nowPlaying: boolean;
  track: LastfmTrack;
  recent: LastfmTrack[];
};

export const GAME_STATUSES: GameStatus[] = ["playing", "completed", "dropped"];
export const SCREEN_TYPES: ScreenType[] = ["tv", "anime", "movie", "novel"];

export function asGameStatus(v: unknown): GameStatus {
  return v === "playing" || v === "completed" || v === "dropped" ? v : "completed";
}

export function asScreenType(v: unknown): ScreenType {
  return v === "tv" || v === "anime" || v === "movie" || v === "novel" ? v : "tv";
}

export function asScreenStatus(v: unknown): ScreenStatus {
  return v === "watching" || v === "completed" || v === "dropped" ? v : "completed";
}

/** 时长显示：42 → 42h；null → — */
export function fmtHours(h: number | null): string {
  return h === null ? "—" : `${h}h`;
}

/** 相对时间（构建时计算）：ISO → 3 小时前 / 3h ago */
export function fmtRelative(iso: string | null, lang: Lang): string {
  if (!iso) return "";
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (lang === "zh") {
    if (hours < 1) return "刚刚";
    if (hours < 24) return `${hours} 小时前`;
    return `${Math.floor(hours / 24)} 天前`;
  }
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** 评分显示：8.5 → 8.5；null → — */
export function fmtRating(r: number | null): string {
  return r === null ? "—" : r.toFixed(1);
}

export type LifeStats = {
  gameCount: number;
  gameByStatus: Record<GameStatus, number>;
  gameAvgRating: number | null;
  gameHours: number;
  screenCount: number;
  screenByType: Record<ScreenType, number>;
  screenHours: number;
  coverCount: number;
};

export function summarize(games: GameEntry[], screen: ScreenEntry[], covers: CoverEntry[]): LifeStats {
  const rated = games.filter((g) => g.rating !== null);
  return {
    gameCount: games.length,
    gameByStatus: {
      playing: games.filter((g) => g.status === "playing").length,
      completed: games.filter((g) => g.status === "completed").length,
      dropped: games.filter((g) => g.status === "dropped").length,
    },
    gameAvgRating: rated.length
      ? rated.reduce((s, g) => s + (g.rating as number), 0) / rated.length
      : null,
    gameHours: games.reduce((s, g) => s + (g.hours ?? 0), 0),
    screenCount: screen.length,
    screenByType: {
      tv: screen.filter((s) => s.type === "tv").length,
      anime: screen.filter((s) => s.type === "anime").length,
      movie: screen.filter((s) => s.type === "movie").length,
      novel: screen.filter((s) => s.type === "novel").length,
    },
    screenHours: screen.reduce((s, e) => s + (e.hours ?? 0), 0),
    coverCount: covers.length,
  };
}
