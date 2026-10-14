"use client";

/**
 * Token Monitor：hub 多端 AI 工具用量聚合展示。
 * 三个变体：首页侧栏紧凑卡（aside）/ 关于页摘要栅格（grid，与「站点数据」同篇幅）/ 看板明细页（full）。
 *
 * 取数逻辑（Ting 2026-10-14 定：**先拉云端，拉不到再用离线快照**——避免先闪旧值再跳新值）：
 *   ① 首帧 + hydration：实时槽位一律显示骨架（tm-pending）；SSR HTML 里保留快照数字
 *      （opacity 0，不进视觉首帧；no-JS 经 <noscript> 样式恢复可见）
 *   ② 挂载即**并行**两路：hub 公开端点（**2s 超时**，Ting 定：超时即落快照，不干等）
 *      + 独立快照仓库（三源 Promise.any，各 3s；gh-proxy / gh.llkk 无缓存，jsDelivr 兜底）
 *   ③ 揭晓规则（全程最多一次跳转）：hub 成功 → 实时值；hub 失败 → 仓库快照（比 SSR 新，
 *      15 分钟内）顶显示，仓库也没有 → SSR 构建快照；若此前拿到过实时值，失败时保留
 *      last-good（比仓库快照更新），标签「实时数据停更于」
 *   ④ 此后每 90s 轮询 hub（Ting 定；后台标签页暂停、切回立即刷新、in-flight 去重），
 *      失败保留 last-good 不闪空；静态图表（30 天柱状 / 热力图 / 12 月累计 / 按模型）
 *      来自构建时合并数据，首帧即出（日序列随轮询/快照的窗口增量更新）
 *
 * 共享单例轮询器：模块级订阅表 + 单 interval（多处挂载只有一份轮询）；无订阅者时停表。
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { TOKEN_MONITOR } from "@/lib/site";
import { dic, type Lang } from "@/lib/i18n";
import MonthlyTrend from "@/components/MonthlyTrend";
import DotMatrix from "@/components/DotMatrix";
import {
  fmtCost,
  fmtDayTick,
  fmtHubTime,
  fmtMsHours,
  fmtTokensCompact,
  fmtTokensFull,
  type TokenDay,
  type TokenMonitorData,
  type TokenPeriod,
} from "@/lib/arts-shared";

/** 首页侧栏点阵屏的单词（代表「上进」——Ting 2026-10-15 采用推荐）。换词只改这一处，建议 4～7 个字母 */
const DOT_MATRIX_WORD = "STRIVE";

/* ---------- 共享单例轮询器 ---------- */

type Periods = { today: TokenPeriod; month: TokenPeriod; allTime: TokenPeriod };

type PollOk = {
  ok: true;
  periods: Periods | null;
  deviceCount: number | null;
  updatedAt: string | null;
  daily: TokenDay[];
};
type PollResult = PollOk | { ok: false };
type Subscriber = (r: PollResult) => void;

/** 云端快照仓库的一条记录（normalizeSnapshot 的产物） */
type RepoSnapshot = {
  periods: Periods;
  deviceCount: number | null;
  fetchedAt: string;
  daily: TokenDay[];
};

const subs = new Set<Subscriber>();
let timer: ReturnType<typeof setInterval> | null = null;
let inFlight: Promise<void> | null = null;

const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/** 首个成功的 Promise（Promise.any 的手写版，兼容旧浏览器；全部失败才 reject） */
function firstSuccess<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise((resolve, reject) => {
    let remaining = promises.length;
    if (remaining === 0) return reject(new Error("no sources"));
    for (const p of promises) {
      p.then(resolve, () => {
        if (--remaining === 0) reject(new Error("all sources failed"));
      });
    }
  });
}

async function pollOnce(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const res = await fetch(`${TOKEN_MONITOR.hub}/api/public/stats`, {
        cache: "no-store",
        signal: AbortSignal.timeout(TOKEN_MONITOR.fetchTimeoutMs),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const s = (await res.json()) as Record<string, unknown>;
      const rawPeriods = s.periods as Record<string, Record<string, unknown>> | undefined;
      const period = (name: string): TokenPeriod => ({
        totalTokens: num(rawPeriods?.[name]?.totalTokens),
        costUsd: num(rawPeriods?.[name]?.costUsd),
      });
      const preview = s.historyPreview as Record<string, unknown> | undefined;
      const rawDaily: Record<string, unknown>[] = Array.isArray(preview?.daily) ? preview.daily : [];
      const result: PollOk = {
        ok: true,
        periods: rawPeriods
          ? { today: period("today"), month: period("month"), allTime: period("allTime") }
          : null,
        deviceCount: typeof s.deviceCount === "number" ? s.deviceCount : null,
        updatedAt: typeof s.updatedAt === "string" ? s.updatedAt : null,
        daily: rawDaily.map((d) => ({
          date: String(d.date ?? ""),
          tokens: num(d.tokens),
          cost: num(d.cost),
          activeTimeMs: num(d.activeTimeMs),
        })),
      };
      for (const fn of subs) fn(result);
    } catch {
      for (const fn of subs) fn({ ok: false });
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

/* ---------- 云端快照仓库（hub 拉不到时的第二级：比 SSR 快照新，且不依赖站点重新发布） ---------- */

let repoSnap: RepoSnapshot | null = null;
let repoAt = 0;
let repoInFlight: Promise<RepoSnapshot | null> | null = null;
const REPO_TTL_MS = 5 * 60 * 1000;

/** 快照仓库文件 → RepoSnapshot（normalized 形状，refresh.mjs 写入） */
function normalizeRepoSnapshot(raw: Record<string, unknown>): RepoSnapshot | null {
  const p = raw.periods as Record<string, Record<string, unknown>> | undefined;
  if (!p?.today) return null;
  const period = (name: string): TokenPeriod => ({
    totalTokens: num(p[name]?.totalTokens),
    costUsd: num(p[name]?.costUsd),
  });
  const rawDaily: Record<string, unknown>[] = Array.isArray(raw.daily) ? raw.daily : [];
  return {
    periods: { today: period("today"), month: period("month"), allTime: period("allTime") },
    deviceCount: typeof raw.deviceCount === "number" ? raw.deviceCount : null,
    fetchedAt: String(raw.fetchedAt ?? ""),
    daily: rawDaily.map((d) => ({
      date: String(d.date ?? ""),
      tokens: num(d.tokens),
      cost: num(d.cost),
      activeTimeMs: num(d.activeTimeMs),
    })),
  };
}

/** 拉快照仓库：5 分钟会话缓存 + in-flight 去重（hub 持续不可达时不会反复打代理） */
function ensureRepoSnapshot(): Promise<RepoSnapshot | null> {
  if (repoSnap && Date.now() - repoAt < REPO_TTL_MS) return Promise.resolve(repoSnap);
  if (repoInFlight) return repoInFlight;
  repoInFlight = (async () => {
    try {
      const raw = await firstSuccess(
        TOKEN_MONITOR.dataRepo.proxySources.map(async (url) => {
          const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(3_000) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return (await res.json()) as Record<string, unknown>;
        }),
      );
      const snap = normalizeRepoSnapshot(raw);
      if (snap) {
        repoSnap = snap;
        repoAt = Date.now();
      }
      return snap;
    } catch {
      return null;
    } finally {
      repoInFlight = null;
    }
  })();
  return repoInFlight;
}

function subscribe(fn: Subscriber): () => void {
  subs.add(fn);
  if (!timer) {
    timer = setInterval(() => {
      // 后台标签页暂停轮询：空转只烧请求；切回可见由 visibilitychange 立即刷新
      if (!document.hidden) void pollOnce();
    }, TOKEN_MONITOR.pollMs);
  }
  if (!document.hidden) void pollOnce();
  const onVisible = () => {
    if (!document.hidden) void pollOnce();
  };
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    subs.delete(fn);
    document.removeEventListener("visibilitychange", onVisible);
    if (subs.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/* ---------- 组件 ---------- */

type Props = {
  lang: Lang;
  /** 服务端合并视图（getTokenMonitor）——实时槽位的离线兜底 + 静态图表数据 */
  initial: TokenMonitorData;
  variant: "aside" | "grid" | "full";
};

export default function TokenMonitor({ lang, initial, variant }: Props) {
  const t = dic[lang].tokenMonitor;
  const [periods, setPeriods] = useState<Periods | null>(initial.periods);
  const [deviceCount, setDeviceCount] = useState<number | null>(initial.deviceCount);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initial.updatedAt);
  const [daily, setDaily] = useState<TokenDay[]>(initial.daily);
  /** 首次揭晓未定 → 实时槽位显示骨架（云端优先，不先露离线旧值） */
  const [pending, setPending] = useState(true);
  /** 最近一次 hub 轮询是否成功；null = 还没结果 */
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  /** 最近一次成功拿到实时数据的时刻（hub 失败时说明数据停更点） */
  const [liveAt, setLiveAt] = useState<string | null>(null);
  /** 当前显示的是否为云端快照仓库的数据（hub 失败后的第二级） */
  const [repoOk, setRepoOk] = useState(false);
  const liveAtRef = useRef<string | null>(null);

  /** 把一路数据（hub 实时 / 仓库快照）应用进状态 */
  const applyData = useCallback(
    (data: { periods: Periods | null; deviceCount: number | null; updatedAt: string | null; daily: TokenDay[] }) => {
      if (data.periods) setPeriods(data.periods);
      if (data.deviceCount !== null) setDeviceCount(data.deviceCount);
      if (data.updatedAt) setUpdatedAt(data.updatedAt);
      if (data.daily.length) {
        setDaily((prev) => {
          const map = new Map(prev.map((d) => [d.date, d]));
          for (const d of data.daily) map.set(d.date, d);
          return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
        });
      }
    },
    [],
  );

  useEffect(() => {
    // 并行预热快照仓库：hub 2s 超时前它通常已就绪，失败路径微秒级取用
    void ensureRepoSnapshot();
    return subscribe((r) => {
      if (r.ok) {
        setLastOk(true);
        setRepoOk(false);
        if (r.updatedAt) {
          liveAtRef.current = r.updatedAt;
          setLiveAt(r.updatedAt);
        }
        applyData({ periods: r.periods, deviceCount: r.deviceCount, updatedAt: r.updatedAt, daily: r.daily });
        setPending(false);
        return;
      }
      setLastOk(false);
      // hub 失败：已有实时值（last-good 更 fresh）→ 保留；否则用仓库快照顶显示；再没有 → SSR 快照
      void ensureRepoSnapshot().then((snap) => {
        if (!liveAtRef.current && snap) {
          setRepoOk(true);
          applyData({ periods: snap.periods, deviceCount: snap.deviceCount, updatedAt: snap.fetchedAt, daily: snap.daily });
        } else {
          setRepoOk(false);
        }
        setPending(false);
      });
    });
  }, [applyData]);

  /* 状态行：在线（实时）／离线（last-good：实时停更于 X ＞ 云端快照 X ＞ 构建快照 X） */
  const status = (() => {
    if (pending) return null;
    if (lastOk) {
      return [
        t.online,
        deviceCount !== null ? `${deviceCount} ${t.devicesSuffix}` : null,
        updatedAt ? `${t.updatedAt} ${fmtHubTime(updatedAt, lang)}` : null,
      ]
        .filter(Boolean)
        .join(" · ");
    }
    if (liveAt) return `${t.offline} · ${t.staleLive} ${fmtHubTime(liveAt, lang)}`;
    if (repoOk && updatedAt) return `${t.offline} · ${t.staleRepo} ${fmtHubTime(updatedAt, lang)}`;
    return `${t.offline} · ${t.staleSnapshot} ${
      initial.updatedAt ? fmtHubTime(initial.updatedAt, lang) : "—"
    }`;
  })();

  const dot = (
    <span className={pending || lastOk === false ? "text-muted" : "text-accent"}>
      {lastOk === false ? "○" : "●"}
    </span>
  );

  /** 实时槽位骨架：pending 时显骨架、隐藏真实值（真实值留在 DOM 供 no-JS/爬虫） */
  const live = (node: ReactNode) => (
    <>
      <span className="tm-real">{node}</span>
      <span className="tm-skel" aria-hidden />
    </>
  );

  const pendingCls = pending ? "tm-pending" : undefined;

  /* ---------- 侧栏紧凑卡 ---------- */
  if (variant === "aside") {
    /* 主显示（2026-10-15）：点阵屏在单词与「累计 tokens」之间定时重组交换；
       不参与骨架——动画即时可见，数字随轮询静默更新（点阵逐帧本来就在变） */
    const allTime = periods?.allTime ?? null;
    const matrixValue = allTime ? fmtTokensCompact(allTime.totalTokens) : "0";
    const matrixTitle = allTime ? `${t.allTime} ${fmtTokensFull(allTime.totalTokens)} tokens` : undefined;
    return (
      <section>
        <p className="font-mono text-xs tracking-widest text-muted">
          <span className="text-accent">·</span> {t.kicker}
        </p>
        <DotMatrix
          word={DOT_MATRIX_WORD}
          value={matrixValue}
          title={matrixTitle}
          className="mt-2 block w-full"
        />
        <dl className={`mt-2.5 space-y-1.5 ${pendingCls ?? ""}`}>
          <AsideRow lang={lang} t={t} label={t.today} period={periods?.today ?? null} live={live} lead />
          <AsideRow lang={lang} t={t} label={t.month} period={periods?.month ?? null} live={live} />
        </dl>
        <p className={`mt-2 flex items-center gap-1.5 font-mono text-[11px] leading-snug text-muted ${pendingCls ?? ""}`}>
          {dot}
          {live(<span className="min-w-0">{status}</span>)}
        </p>
        <NoScriptFallback />
      </section>
    );
  }

  /* ---------- 关于页摘要栅格（与「站点数据」同篇幅） ---------- */
  if (variant === "grid") {
    const detailHref = lang === "zh" ? "/arts/stats/tokens" : "/en/arts/stats/tokens";
    return (
      <section className="mt-14 border-t border-rule pt-10">
        <h2 className="font-mono text-sm tracking-widest text-muted">
          <span className="text-accent">·</span> {t.kicker}
        </h2>
        <div className={`mt-6 grid grid-cols-3 gap-x-8 gap-y-5 ${pendingCls ?? ""}`}>
          <GridPeriod lang={lang} t={t} label={t.today} period={periods?.today ?? null} live={live} />
          <GridPeriod lang={lang} t={t} label={t.month} period={periods?.month ?? null} live={live} />
          <GridPeriod lang={lang} t={t} label={t.allTime} period={periods?.allTime ?? null} live={live} />
        </div>
        <p className={`mt-5 flex items-center gap-1.5 font-mono text-xs text-muted ${pendingCls ?? ""}`}>
          {dot}
          {live(status)}
        </p>
        <Link
          href={detailHref}
          className="mt-6 inline-block font-mono text-sm text-accent hover:underline"
        >
          {t.detailLink} →
        </Link>
        <NoScriptFallback />
      </section>
    );
  }

  /* ---------- 看板明细页 ---------- */
  const monthly = initial.monthly;
  const s = initial.summary;
  // 近 12 个月改累计口径（Ting 2026-10-14）：running sum，折线看的是总量增长而非单月波动
  const monthlyCum: number[] = [];
  monthly.reduce((sum, m) => {
    const next = sum + m.tokens;
    monthlyCum.push(next);
    return next;
  }, 0);
  const chips = [
    s?.currentStreak ? `${t.streak} ${s.currentStreak} ${t.days}` : null,
    s?.longestStreak ? `${t.longest} ${s.longestStreak} ${t.days}` : null,
    s?.messages ? `${s.messages.toLocaleString("en-US")} ${t.messages}` : null,
    s?.peakDayTokens ? `${t.peakDay} ${fmtTokensCompact(s.peakDayTokens)}` : null,
    s?.favoriteModel ? `${t.topModel} ${s.favoriteModel}` : null,
    s?.activeTimeMs ? `${t.activeTime} ${fmtMsHours(s.activeTimeMs)}` : null,
  ].filter(Boolean);

  return (
    <div>
      <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted ${pendingCls ?? ""}`}>
        {dot}
        {live(status)}
      </p>

      <div className={`mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 ${pendingCls ?? ""}`}>
        <BigPeriod lang={lang} t={t} label={t.today} period={periods?.today ?? null} live={live} />
        <BigPeriod lang={lang} t={t} label={t.month} period={periods?.month ?? null} live={live} />
        <BigPeriod lang={lang} t={t} label={t.allTime} period={periods?.allTime ?? null} live={live} />
      </div>

      {/* 近 30 天柱状（朱红 = 今日；日序列随轮询增量更新） */}
      <div className="mt-12">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-sm font-semibold">{t.dailyLabel}</h3>
          <span className="font-mono text-[11px] text-muted">{t.unitDay}</span>
        </div>
        <DailyBars days={daily.slice(-30)} emptyNote={t.emptyDaily} lang={lang} />
      </div>

      {/* 日用量热力图（全时段，周一开列；朱红深浅 = 当日用量档位） */}
      <div className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-serif text-sm font-semibold">{t.heatmapLabel}</h3>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
            {t.heatmapLess}
            {[0, 1, 2, 3, 4].map((lv) => (
              <span
                key={lv}
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{
                  background: lv === 0 ? "var(--color-rule)" : "var(--color-accent)",
                  opacity: lv === 0 ? 0.5 : 0.3 + lv * 0.2,
                }}
              />
            ))}
            {t.heatmapMore}
          </span>
        </div>
        <DailyHeatmap days={daily} emptyNote={t.emptyDaily} lang={lang} />
      </div>

      {/* 近 12 个月累计折线（复用看板同款组件；累计口径见 monthlyCum） */}
      <div className="mt-12">
        <MonthlyTrend
          months={monthly.map((m) => m.month)}
          values={monthlyCum}
          label={t.monthlyLabel}
          unit="tokens"
          lang={lang}
          emptyNote={t.emptyMonthly}
          fmtValue={fmtTokensCompact}
        />
      </div>

      {/* 按模型（仅静态基线含 perModel，公开端点已剥离；两列放置） */}
      {initial.byModel.length > 0 ? (
        <div className="mt-12">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-serif text-sm font-semibold">{t.byClient}</h3>
            <span className="font-mono text-[11px] text-muted">
              {t.baselineNote} {initial.baselineGeneratedAt?.slice(0, 10) ?? "—"}
            </span>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {initial.byModel.map((c) => {
              const pct = (c.tokens / initial.byModel[0].tokens) * 100;
              return (
                <li key={c.name} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate font-mono text-xs" title={c.name}>
                    {c.name}
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden bg-ink/10">
                    <span className="block h-full bg-accent/70" style={{ width: `${pct}%` }} />
                  </span>
                  <span
                    className="w-14 text-right font-mono text-xs tabular-nums"
                    title={fmtTokensFull(c.tokens)}
                  >
                    {fmtTokensCompact(c.tokens)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {chips.length > 0 ? <p className="mt-8 font-mono text-xs text-muted">{chips.join(" · ")}</p> : null}

      {/* 口径说明：货币 / 时区 / 数据来源 */}
      <p className="mt-8 border-t border-rule pt-4 text-xs leading-relaxed text-muted">{t.footNote}</p>
      <NoScriptFallback />
    </div>
  );
}

/** no-JS 时恢复显示 SSR 里的快照数字（骨架仅服务于「先拉云端」的交互逻辑） */
function NoScriptFallback() {
  return (
    <noscript>
      <style>{".tm-pending .tm-real{opacity:1}.tm-pending .tm-skel{display:none}"}</style>
    </noscript>
  );
}

/* ---------- 子组件 ---------- */

type RowT = Record<keyof typeof dic.zh.tokenMonitor, string>;
type LiveFn = (node: ReactNode) => ReactNode;

function AsideRow({
  lang,
  t,
  label,
  period,
  live,
  lead = false,
}: {
  lang: Lang;
  t: RowT;
  label: string;
  period: TokenPeriod | null;
  live: LiveFn;
  lead?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 font-mono text-xs text-muted">{label}</dt>
      <dd
        className="font-mono text-sm tabular-nums"
        title={period ? fmtTokensFull(period.totalTokens) : undefined}
      >
        {live(
          period ? (
            <>
              <span className={lead ? "font-semibold" : undefined}>{fmtTokensCompact(period.totalTokens)}</span>
              <span className="ml-1.5 font-mono text-[11px] font-normal text-muted">
                {fmtCost(period.costUsd, lang)}
              </span>
            </>
          ) : (
            <span className="text-muted">—</span>
          ),
        )}
      </dd>
    </div>
  );
}

/** 关于页栅格项（与「站点数据」同款式：衬线大数字 + 等宽标签） */
function GridPeriod({
  lang,
  t,
  label,
  period,
  live,
}: {
  lang: Lang;
  t: RowT;
  label: string;
  period: TokenPeriod | null;
  live: LiveFn;
}) {
  return (
    <div>
      <p
        className="font-serif text-2xl font-bold tabular-nums"
        title={period ? fmtTokensFull(period.totalTokens) : undefined}
      >
        {live(period ? fmtTokensCompact(period.totalTokens) : "—")}
      </p>
      <p className="mt-0.5 font-mono text-xs text-muted">{label}</p>
      <p className="font-mono text-xs text-muted">{live(period ? fmtCost(period.costUsd, lang) : "—")}</p>
    </div>
  );
}

function BigPeriod({
  lang,
  t,
  label,
  period,
  live,
}: {
  lang: Lang;
  t: RowT;
  label: string;
  period: TokenPeriod | null;
  live: LiveFn;
}) {
  return (
    <div>
      <p className="font-mono text-xs text-muted">{label}</p>
      <p
        className="mt-1 font-serif text-3xl font-bold tabular-nums"
        title={period ? fmtTokensFull(period.totalTokens) : undefined}
      >
        {live(period ? fmtTokensCompact(period.totalTokens) : "—")}
      </p>
      <p className="mt-0.5 font-mono text-xs text-muted">{live(period ? fmtCost(period.costUsd, lang) : "—")}</p>
    </div>
  );
}

/** 日用量热力图（杂志风 SVG，零依赖；周一开列，朱红深浅 = 当日用量档位；悬停看精确值） */
function DailyHeatmap({ days, emptyNote, lang }: { days: TokenDay[]; emptyNote: string; lang: Lang }) {
  if (days.length === 0) {
    return <p className="mt-4 font-mono text-xs text-muted">{emptyNote}</p>;
  }

  /* 周一开列的周列（UTC 运算，SSR/客户端确定一致；缺失日期 = 当日无用量） */
  const CELL = 13;
  const GAP = 3.5;
  const PAD = { l: 30, t: 18, r: 4, b: 4 };
  const WEEKDAYS_ZH = ["一", "", "三", "", "五", "", "日"];
  const WEEKDAYS_EN = ["Mon", "", "Wed", "", "Fri", "", ""];
  const wd = lang === "zh" ? WEEKDAYS_ZH : WEEKDAYS_EN;
  const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const byDate = new Map(days.map((d) => [d.date, d]));
  const first = new Date(`${days[0].date}T00:00:00Z`);
  const mondayShift = (first.getUTCDay() + 6) % 7; // 周一 = 0
  const last = new Date(`${days[days.length - 1].date}T00:00:00Z`);

  type Cell = { date: string; tokens: number; cost: number } | null;
  const weeks: Cell[][] = [];
  for (let w = new Date(first); w <= last; w.setUTCDate(w.getUTCDate() + 7)) {
    const col: Cell[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(w);
      day.setUTCDate(w.getUTCDate() + i - mondayShift);
      const key = day.toISOString().slice(0, 10);
      const hit = byDate.get(key);
      col.push(hit ? { date: key, tokens: hit.tokens, cost: hit.cost } : null);
    }
    weeks.push(col);
  }

  const max = Math.max(1, ...days.map((d) => d.tokens));
  const level = (tokens: number): number =>
    tokens <= 0 ? 0 : tokens >= max * 0.75 ? 4 : tokens >= max * 0.5 ? 3 : tokens >= max * 0.25 ? 2 : 1;

  const W = PAD.l + weeks.length * (CELL + GAP) + PAD.r;
  const H = PAD.t + 7 * (CELL + GAP) + PAD.b;

  /* 月份标签：每列首个日期的月份与上一列不同时标注 */
  const monthLabels: { x: number; label: string }[] = [];
  weeks.forEach((col, i) => {
    const anyDay = col.find(Boolean);
    if (!anyDay) return;
    const mm = Number(anyDay.date.slice(5, 7));
    const prev = i > 0 ? weeks[i - 1].find(Boolean) : null;
    if (!prev || Number(prev.date.slice(5, 7)) !== mm) {
      monthLabels.push({
        x: PAD.l + i * (CELL + GAP),
        label: lang === "zh" ? `${mm}月` : (MONTHS_EN[mm - 1] ?? String(mm)),
      });
    }
  });

  return (
    <div className="mt-4 overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block"
        style={{ width: W, minWidth: W, height: "auto" }}
        role="img"
        aria-label={emptyNote}
      >
        {/* 月份刻度 */}
        {monthLabels.map((m) => (
          <text key={m.label + m.x} x={m.x} y={10} className="fill-muted font-mono" fontSize="9">
            {m.label}
          </text>
        ))}
        {/* 星期刻度（周一 / 三 / 五） */}
        {[0, 2, 4].map((r) => (
          <text
            key={r}
            x={PAD.l - 6}
            y={PAD.t + r * (CELL + GAP) + CELL - 2}
            textAnchor="end"
            className="fill-muted font-mono"
            fontSize="9"
          >
            {wd[r]}
          </text>
        ))}
        {/* 日格 */}
        {weeks.map((col, ci) =>
          col.map((cell, ri) => {
            const lv = cell ? level(cell.tokens) : 0;
            return (
              <rect
                key={`${ci}-${ri}`}
                x={PAD.l + ci * (CELL + GAP)}
                y={PAD.t + ri * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2}
                fill={lv === 0 ? "var(--color-rule)" : "var(--color-accent)"}
                fillOpacity={lv === 0 ? 0.35 : 0.3 + lv * 0.2}
              >
                {cell ? (
                  <title>{`${cell.date} · ${fmtTokensFull(cell.tokens)} tokens · ${fmtCost(cell.cost, lang)}`}</title>
                ) : null}
              </rect>
            );
          }),
        )}
      </svg>
    </div>
  );
}

/** 近 30 天柱状（杂志风 SVG，零依赖；朱红 = 今日，其余墨色） */
function DailyBars({ days, emptyNote, lang }: { days: TokenDay[]; emptyNote: string; lang: Lang }) {
  if (days.length === 0) {
    return <p className="mt-4 font-mono text-xs text-muted">{emptyNote}</p>;
  }
  const W = 640;
  const H = 130;
  const PAD = { l: 8, r: 8, t: 18, b: 22 };
  const max = Math.max(1, ...days.map((d) => d.tokens));
  const bw = (W - PAD.l - PAD.r) / days.length;
  const barW = Math.max(2, bw - 2);
  const peak = days.reduce((a, b) => (b.tokens > a.tokens ? b : a), days[0]);
  const peakIdx = days.indexOf(peak);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label={emptyNote}>
      <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} className="stroke-rule" strokeWidth="1" />
      {days.map((d, i) => {
        const h = (d.tokens / max) * (H - PAD.t - PAD.b);
        const isToday = i === days.length - 1;
        return (
          <rect
            key={d.date}
            x={PAD.l + i * bw + (bw - barW) / 2}
            y={H - PAD.b - Math.max(h, 1.5)}
            width={barW}
            height={Math.max(h, 1.5)}
            className={isToday ? "fill-accent" : d.tokens > 0 ? "fill-ink/25" : "fill-ink/10"}
          >
            <title>{`${d.date} · ${fmtTokensFull(d.tokens)} tokens · ${fmtCost(d.cost, lang)}`}</title>
          </rect>
        );
      })}
      {/* 峰值标注 */}
      <text
        x={PAD.l + peakIdx * bw + bw / 2}
        y={H - PAD.b - (peak.tokens / max) * (H - PAD.t - PAD.b) - 6}
        textAnchor="middle"
        className="fill-accent font-mono"
        fontSize="10"
      >
        {fmtTokensCompact(peak.tokens)}
      </text>
      {/* 日期刻度：首 / 中 / 尾 */}
      {[0, Math.floor((days.length - 1) / 2), days.length - 1].map((i) => (
        <text
          key={i}
          x={PAD.l + i * bw + bw / 2}
          y={H - 6}
          textAnchor={i === 0 ? "start" : i === days.length - 1 ? "end" : "middle"}
          className="fill-muted font-mono"
          fontSize="10"
        >
          {fmtDayTick(days[i].date)}
        </text>
      ))}
    </svg>
  );
}
