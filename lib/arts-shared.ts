import type { Lang } from "@/lib/i18n";

/* 游艺（/arts）内部条目：状态与类型用枚举存 frontmatter，展示标签统一走 lib/i18n.ts */

export type GameStatus = "playing" | "completed" | "dropped";
export type ScreenType = "tv" | "anime" | "movie" | "novel";
export type ScreenStatus = "watching" | "completed" | "dropped";
export type ExerciseKind = "run" | "bodyweight" | "other";

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

/** 自动源游戏条目（Steam / WeGame / Epic 快照）：游戏页「平台时长记录」分组列表用 */
export type GameSourceItem = {
  name: string;
  hours: number;
  source: "steam" | "wegame" | "epic";
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
  /** 展示顺序（升序；缺省按 date 倒序）——同日期多条目时保证顺序稳定 */
  order: number | null;
  date: string;
  bilibili: string;
  notes: string;
  /** 原速 BPM（节拍器占位展示；插件接入后启用） */
  tempo: number | null;
  /** 曲谱链接 / 文件路径（占位） */
  sheet: string | null;
  /** 伴奏音频链接 / 文件路径（占位） */
  accompaniment: string | null;
};

/** 运动条目（跑步 / 徒手）：kind 可缺省（如「开篇」随笔条目不计为一次运动） */
export type ExerciseEntry = {
  slug: string;
  title: string;
  kind: ExerciseKind | null;
  date: string;
  /** 分钟，可缺省 */
  duration: number | null;
  /** 公里，可缺省（跑步时填） */
  distance: number | null;
  note: string;
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
export const EXERCISE_KINDS: ExerciseKind[] = ["run", "bodyweight", "other"];

export function asGameStatus(v: unknown): GameStatus {
  return v === "playing" || v === "completed" || v === "dropped" ? v : "completed";
}

export function asExerciseKind(v: unknown): ExerciseKind | null {
  return v === "run" || v === "bodyweight" || v === "other" ? v : null;
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

/** 影卷时长显示：分钟折算小时除不尽，统一保留两位小数（22.5 → 22.50h；null → —） */
export function fmtScreenHours(h: number | null): string {
  return h === null ? "—" : `${h.toFixed(2)}h`;
}

/** 歌单曲目时长：毫秒 → m:ss（221400 → 3:41；0 或负值 → —） */
export function fmtTrackDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
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
  exerciseCount: number;
  /** 累计运动分钟数（用于总览页换算小时） */
  exerciseMinutes: number;
  /** 累计运动公里数（看板用） */
  exerciseKm: number;
};

/* ---------- 月度趋势（看板，构建时聚合） ---------- */

/** content/arts/lastfm-monthly.json 的结构（scripts/fetch-monthly.mjs 生成） */
export type LastfmMonthly = {
  source: "lastfm-monthly";
  generatedAt: string;
  unit: "scrobbles";
  monthly: Record<string, number>;
};

/** content/arts/stats-history.json 的结构（追加式快照，同月覆盖） */
export type StatsHistory = {
  source: "stats-history";
  updatedAt: string;
  snapshots: Record<
    string,
    {
      games: Record<string, number>; // 人工记录累计小时（精选条目）
      screen: Record<string, number>; // 累计小时
      /** 网易云听歌：键「歌名|歌手」→ 累计分钟（playCount × dt 折算） */
      netease?: Record<string, number>;
      /** Steam 全库游玩：键「游戏名」→ 累计小时（playtime_forever 折算） */
      steam?: Record<string, number>;
      /** WeGame 游玩：键「游戏名」→ 累计小时（Ting 每周人工报数，wegame-games.json） */
      wegame?: Record<string, number>;
      /** Epic 游玩：键「游戏名」→ 累计小时（Ting 人工报数，epic-games.json；无可用 API） */
      epic?: Record<string, number>;
    }
  >;
};

/** content/arts/netease-monthly.json 的结构（人工回填历史月 + 脚本自动抓当月） */
export type NetEaseMonthly = {
  source: "netease-monthly";
  note: string;
  updatedAt: string;
  /** 账号总收听时长（小时，total 接口折算） */
  totalHours: number | null;
  /** 月度收听时长（分钟）：2026-01~09 官方截图人工回填，当月起 realtime/report 自动覆盖 */
  monthly: Record<string, number>;
};

/** 月度趋势：统一月轴（构建时本地时区），四系列对齐 */
export type MonthlyTrends = {
  /** ["2026-03", …, "2026-10"] */
  months: string[];
  /** 运动：每月小时（条目逐次聚合） */
  exercise: number[];
  /** 音律：每月听歌小时（网易云官方全量口径；早于回填起点的月份为 0） */
  music: number[];
  /** 网易云账号总收听时长（小时）——总览大数字用 */
  neteaseTotalHours: number | null;
  /** 游戏：每月新增小时（人工 frontmatter 快照 + Steam 全库快照，两源差分相加） */
  gamesDelta: number[];
  /** Steam 全库累计小时——游戏总览大数字用 */
  steamTotalHours: number | null;
  /** WeGame 累计小时（周更）——游戏总览大数字用 */
  wegameTotalHours: number | null;
  /** 影卷：每月新增小时（快照差分，积累自 2026-10） */
  screenDelta: number[];
  /** 基线月（2026-10）的当前累计（小时）——差分首月无上月起，展示单点而非空态；null = 无数据 */
  baselines: {
    music: number | null;
    games: number | null;
    screen: number | null;
  };
};

export function summarize(
  games: GameEntry[],
  screen: ScreenEntry[],
  covers: CoverEntry[],
  exercise: ExerciseEntry[],
): LifeStats {
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
    exerciseCount: exercise.length,
    exerciseMinutes: exercise.reduce((s, e) => s + (e.duration ?? 0), 0),
    exerciseKm: exercise.reduce((s, e) => s + (e.distance ?? 0), 0),
  };
}
