"use client";

/**
 * Token Monitor：hub 多端 AI 工具用量聚合展示（关于页完整区 + 首页侧栏紧凑卡）。
 *
 * 数据链路（与「正在听」同哲学——构建时快照兜底，前端实时刷新）：
 *   ① 服务端首帧：getTokenMonitor() 合并静态基线（token-monitor-history.json，370 天窗口）
 *      + 构建时快照（token-monitor.json，fetch-token-stats.mjs 拉公开端点）
 *   ② 前端轮询：每 30s 直拉 hub /api/public/stats（免密钥、CORS *、服务端缓存 15s），
 *      更新三周期与日序列；标签页不可见时暂停，切回立即刷新（同 NowPlayingLive）
 *   ③ 降级：轮询失败保留 last-good 值，连续 2 次失败显示「hub 离线」——绝不闪空
 *
 * 共享单例轮询器：模块级订阅表 + 单 interval。两处挂载（不同路由不会同时出现，
 * 但同页多实例也只有一份轮询）；无订阅者时停表。
 */

import { useEffect, useState } from "react";
import { TOKEN_MONITOR } from "@/lib/site";
import { dic, type Lang } from "@/lib/i18n";
import MonthlyTrend from "@/components/MonthlyTrend";
import {
  fmtCostUsd,
  fmtDayTick,
  fmtMsHours,
  fmtTokensCompact,
  fmtTokensFull,
  type TokenDay,
  type TokenMonitorData,
  type TokenPeriod,
} from "@/lib/arts-shared";

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

const subs = new Set<Subscriber>();
let timer: ReturnType<typeof setInterval> | null = null;
let inFlight: Promise<void> | null = null;

const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);

async function pollOnce(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const res = await fetch(`${TOKEN_MONITOR.hub}/api/public/stats`, { cache: "no-store" });
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

/* ---------- 工具 ---------- */

/** ISO → HH:mm（UTC 直切，避免服务端/客户端时区差异导致 hydration 不一致） */
function hhmmUtc(iso: string): string {
  return iso.length >= 16 && iso[10] === "T" ? iso.slice(11, 16) : iso.slice(0, 10);
}

/* ---------- 组件 ---------- */

type Props = {
  lang: Lang;
  /** 服务端合并视图（getTokenMonitor）——两处挂载同源，杜绝数字不一致 */
  initial: TokenMonitorData;
  variant: "aside" | "full";
};

export default function TokenMonitor({ lang, initial, variant }: Props) {
  const t = dic[lang].tokenMonitor;
  const [periods, setPeriods] = useState<Periods | null>(initial.periods);
  const [deviceCount, setDeviceCount] = useState<number | null>(initial.deviceCount);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initial.updatedAt);
  const [daily, setDaily] = useState<TokenDay[]>(initial.daily);
  const [fails, setFails] = useState(0);
  const [polled, setPolled] = useState(false);

  useEffect(
    () =>
      subscribe((r) => {
        setPolled(true);
        if (!r.ok) {
          setFails((f) => f + 1);
          return;
        }
        if (r.periods) setPeriods(r.periods);
        if (r.deviceCount !== null) setDeviceCount(r.deviceCount);
        if (r.updatedAt) setUpdatedAt(r.updatedAt);
        if (r.daily.length) {
          setDaily((prev) => {
            const map = new Map(prev.map((d) => [d.date, d]));
            for (const d of r.daily) map.set(d.date, d);
            return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
          });
        }
        setFails(0);
      }),
    [],
  );

  const offline = polled && fails >= 2;
  const status = offline
    ? t.offline
    : [
        polled ? t.online : null,
        deviceCount !== null ? `${deviceCount} ${t.devicesSuffix}` : null,
        updatedAt ? `${t.updatedAt} ${hhmmUtc(updatedAt)} UTC` : null,
      ]
        .filter(Boolean)
        .join(" · ");

  const dot = <span className={offline ? "text-muted" : "text-accent"}>{offline ? "○" : "●"}</span>;

  /* ---------- 侧栏紧凑卡 ---------- */
  if (variant === "aside") {
    return (
      <section>
        <p className="font-mono text-xs tracking-widest text-muted">
          <span className="text-accent">·</span> {t.kicker}
        </p>
        <dl className="mt-2.5 space-y-1.5">
          <AsideRow label={t.today} period={periods?.today ?? null} lead />
          <AsideRow label={t.month} period={periods?.month ?? null} />
          <AsideRow label={t.allTime} period={periods?.allTime ?? null} />
        </dl>
        <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] leading-snug text-muted">
          {dot}
          <span className="min-w-0">{status}</span>
        </p>
      </section>
    );
  }

  /* ---------- 关于页完整区 ---------- */
  const monthly = initial.monthly;
  const s = initial.summary;
  const chips = [
    s?.currentStreak ? `${t.streak} ${s.currentStreak} ${t.days}` : null,
    s?.longestStreak ? `${t.longest} ${s.longestStreak} ${t.days}` : null,
    s?.messages ? `${s.messages.toLocaleString("en-US")} ${t.messages}` : null,
    s?.peakDayTokens ? `${t.peakDay} ${fmtTokensCompact(s.peakDayTokens)}` : null,
    s?.activeTimeMs ? `${t.activeTime} ${fmtMsHours(s.activeTimeMs)}` : null,
  ].filter(Boolean);

  return (
    <section className="mt-14 border-t border-rule pt-10">
      <h2 className="font-mono text-sm tracking-widest text-muted">
        <span className="text-accent">·</span> {t.kicker}
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-muted">{t.intro}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <BigPeriod label={t.today} period={periods?.today ?? null} />
        <BigPeriod label={t.month} period={periods?.month ?? null} />
        <BigPeriod label={t.allTime} period={periods?.allTime ?? null} />
      </div>

      <p className="mt-5 flex items-center gap-1.5 font-mono text-xs text-muted">
        {dot}
        {status}
      </p>

      {/* 近 30 天柱状（朱红 = 今日） */}
      <div className="mt-12">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-sm font-semibold">{t.dailyLabel}</h3>
          <span className="font-mono text-[11px] text-muted">{t.unitDay}</span>
        </div>
        <DailyBars days={daily.slice(-30)} emptyNote={t.emptyDaily} />
      </div>

      {/* 近 12 个月折线（复用看板同款组件） */}
      <div className="mt-12">
        <MonthlyTrend
          months={monthly.map((m) => m.month)}
          values={monthly.map((m) => m.tokens)}
          label={t.monthlyLabel}
          unit="tokens"
          lang={lang}
          emptyNote={t.emptyMonthly}
          fmtValue={fmtTokensCompact}
        />
      </div>

      {/* 按工具（仅静态基线含 perClient，公开端点已剥离） */}
      {initial.byClient.length > 0 ? (
        <div className="mt-12">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-serif text-sm font-semibold">{t.byClient}</h3>
            <span className="font-mono text-[11px] text-muted">
              {t.baselineNote} {initial.baselineGeneratedAt?.slice(0, 10) ?? "—"}
            </span>
          </div>
          <ul className="mt-4 space-y-2.5">
            {initial.byClient.map((c) => {
              const pct = (c.tokens / initial.byClient[0].tokens) * 100;
              return (
                <li key={c.name} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 truncate font-mono text-xs" title={c.name}>
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
    </section>
  );
}

/* ---------- 子组件 ---------- */

function AsideRow({
  label,
  period,
  lead = false,
}: {
  label: string;
  period: TokenPeriod | null;
  lead?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 font-mono text-xs text-muted">{label}</dt>
      <dd className="font-mono text-sm tabular-nums" title={period ? fmtTokensFull(period.totalTokens) : undefined}>
        {period ? (
          <>
            <span className={lead ? "font-semibold" : undefined}>{fmtTokensCompact(period.totalTokens)}</span>
            <span className="ml-1.5 font-mono text-[11px] font-normal text-muted">
              {fmtCostUsd(period.costUsd)}
            </span>
          </>
        ) : (
          <span className="text-muted">—</span>
        )}
      </dd>
    </div>
  );
}

function BigPeriod({ label, period }: { label: string; period: TokenPeriod | null }) {
  return (
    <div>
      <p className="font-mono text-xs text-muted">{label}</p>
      <p
        className="mt-1 font-serif text-3xl font-bold tabular-nums"
        title={period ? fmtTokensFull(period.totalTokens) : undefined}
      >
        {period ? fmtTokensCompact(period.totalTokens) : "—"}
      </p>
      <p className="mt-0.5 font-mono text-xs text-muted">{period ? fmtCostUsd(period.costUsd) : "—"}</p>
    </div>
  );
}

/** 近 30 天柱状（杂志风 SVG，零依赖；朱红 = 今日，其余墨色） */
function DailyBars({ days, emptyNote }: { days: TokenDay[]; emptyNote: string }) {
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
            <title>{`${d.date} · ${fmtTokensFull(d.tokens)} tokens · ${fmtCostUsd(d.cost)}`}</title>
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
