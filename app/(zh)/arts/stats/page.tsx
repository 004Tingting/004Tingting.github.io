import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import {
  getGameHoursFull,
  getGamePlatformSplit,
  getMonthlyTrends,
  getScreen,
  getScreenByType,
  getStats,
  getTokenMonitor,
  getTopArtists,
} from "@/lib/arts";
import { fmtScreenHours } from "@/lib/arts-shared";
import Kicker from "@/components/Kicker";
import MonthlyTrend from "@/components/MonthlyTrend";
import TokenMonitor from "@/components/TokenMonitor";
import { PlatformBars, RankBar } from "@/components/StatBars";

export const metadata: Metadata = { title: "看板" };

/**
 * 游艺看板：构建时聚合音律 / 游戏 / 影卷 / 运动（零依赖、零客户端 JS）。
 *
 * 版面结构（Ting 2026-10-21 定）：
 *   按**大块**（音律 → 游戏 → 影卷 → 运动，与 /arts 导航同序）组织，
 *   大块下再放**小块**（如「平台分布」「时长排行」）。
 *   所有区块统一 max-w-2xl 内容宽度，与总览数字对齐。
 */
export default function StatsPage() {
  const t = dic.zh.arts;
  const st = t.stats;
  const s = getStats("zh");
  const m = getMonthlyTrends("zh");

  const gameFull = getGameHoursFull("zh");
  const topGames = gameFull.slice(0, 6);
  const screen = getScreen("zh")
    .filter((sc) => (sc.hours ?? 0) > 0)
    .slice(0, 6);
  const exerciseH = (s.exerciseMinutes / 60).toFixed(1);
  const km = s.exerciseKm.toFixed(1);

  const gameTotal = m.baselines.games ?? s.gameHours;

  const platformSplit = getGamePlatformSplit("zh");
  const platformLabels = {
    manual: st.platformOther,
    steam: "Steam",
    wegame: "WeGame",
    epic: "Epic",
  };
  const screenByType = getScreenByType("zh");
  const topArtists = getTopArtists(6);

  const big = [
    {
      label: t.music.kicker,
      value: m.neteaseTotalHours !== null ? m.neteaseTotalHours.toFixed(1) : "—",
      unit: st.hours,
    },
    { label: t.games.kicker, value: Number(gameTotal.toFixed(1)).toString(), unit: st.hours },
    { label: t.screen.kicker, value: fmtScreenHours(s.screenHours), unit: st.hours },
    { label: t.exercise.kicker, value: exerciseH, unit: st.hours },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{st.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{st.title}</h1>
      <p className="mt-6 max-w-2xl text-muted">{st.intro}</p>

      {/* 总览数字（与下方所有区块同宽） */}
      <div className="mt-12 grid max-w-2xl grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-4">
        {big.map((b) => (
          <div key={b.label}>
            <p className="font-mono text-xs tracking-widest text-muted">
              <span className="text-accent">·</span> {b.label}
            </p>
            <p className="mt-1 font-serif text-4xl font-bold">
              {b.value}
              <span className="ml-1 font-mono text-sm font-normal text-muted">{b.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ==================== 音律 ==================== */}
      <section className="mt-16 border-t border-rule pt-10">
        <h2 className="font-serif text-2xl font-bold">{t.music.kicker}</h2>

        {/* 小块：收听概览 */}
        <div className="mt-6 max-w-2xl">
          <div className="flex items-baseline justify-between gap-3 border-b border-rule/60 py-2.5">
            <span className="font-serif text-sm">{st.totalListen}</span>
            <span className="font-mono text-sm text-muted">
              {m.neteaseTotalHours !== null ? m.neteaseTotalHours.toFixed(1) : "—"} {st.hours}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-rule/60 py-2.5">
            <span className="font-serif text-sm">{st.recentListen}</span>
            <span className="font-mono text-sm text-muted">
              {m.music.reduce((sum, v) => sum + v, 0).toFixed(1)} {st.hours}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-2.5">
            <span className="font-serif text-sm">{st.coversLabel}</span>
            <span className="font-mono text-sm text-muted">{s.coverCount} 支</span>
          </div>
        </div>

        {/* 小块：月度趋势 */}
        <div className="mt-10 max-w-2xl">
          <h3 className="font-serif text-sm font-semibold">{st.monthlyKicker}</h3>
          <p className="mt-2 text-xs text-muted">{st.monthlyIntro}</p>
          <div className="mt-5">
            <MonthlyTrend
              months={m.months}
              values={m.music}
              label={t.music.kicker}
              unit={st.unitHoursMonth}
              lang="zh"
              emptyNote={st.accumulating}
              baseline={m.baselines.music}
              baselineLabel={st.baseline}
            />
          </div>
        </div>

        {/* 小块：常听歌手 */}
        <div className="mt-10 max-w-2xl">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-sm font-semibold">{st.artistKicker}</h3>
            <span className="font-mono text-[11px] text-muted">{st.hours}</span>
          </div>
          <p className="mt-2 text-xs text-muted">{st.artistIntro}</p>
          {topArtists.length > 0 ? (
            <RankBar items={topArtists.map((a) => ({ label: a.name, hours: a.hours }))} unit={st.hours} />
          ) : (
            <p className="mt-4 text-sm text-muted">{st.noData}</p>
          )}
        </div>

        <p className="mt-4 max-w-2xl text-xs text-muted">{st.musicNote}</p>
      </section>

      {/* ==================== 游戏 ==================== */}
      <section className="mt-16 border-t border-rule pt-10">
        <h2 className="font-serif text-2xl font-bold">{t.games.kicker}</h2>

        {/* 小块：平台分布 */}
        <div className="mt-6 max-w-2xl">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-sm font-semibold">{st.platformKicker}</h3>
            <span className="font-mono text-[11px] text-muted">{st.hours}</span>
          </div>
          <p className="mt-2 text-xs text-muted">{st.platformIntro}</p>
          <div className="mt-4">
            <PlatformBars
              items={platformSplit.map((p) => ({ label: platformLabels[p.key], hours: p.hours }))}
              unit={st.hours}
              totalLabel={st.totalRow}
            />
          </div>
        </div>

        {/* 小块：时长排行 */}
        <div className="mt-10 max-w-2xl">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-sm font-semibold">{st.byHours}</h3>
            <span className="font-mono text-[11px] text-muted">
              {s.gameCount} {st.entries} · {s.gameHours} {st.hours}
            </span>
          </div>
          {topGames.length > 0 ? (
            <RankBar
              items={topGames.map((g) => ({ label: g.name, hours: g.hours }))}
              unit={st.hours}
              format={(v) => String(Math.round(v))}
            />
          ) : (
            <p className="mt-4 text-sm text-muted">{st.noData}</p>
          )}
          <p className="mt-4">
            <Link href="/arts/stats/games" className="text-sm text-accent hover:underline">
              {st.gameFullLink}
            </Link>
          </p>
        </div>

        {/* 小块：月度趋势 */}
        <div className="mt-10 max-w-2xl">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-sm font-semibold">{st.monthlyKicker}</h3>
            <span className="font-mono text-[11px] text-muted">{st.unitHoursMonth}</span>
          </div>
          <div className="mt-5">
            <MonthlyTrend
              months={m.months}
              values={m.gamesDelta}
              label={t.games.kicker}
              unit={st.unitHoursMonth}
              lang="zh"
              emptyNote={st.accumulating}
              baseline={m.baselines.games}
              baselineLabel={st.baseline}
            />
          </div>
        </div>
      </section>

      {/* ==================== 影卷 ==================== */}
      <section className="mt-16 border-t border-rule pt-10">
        <h2 className="font-serif text-2xl font-bold">{t.screen.kicker}</h2>

        {/* 小块：按类型 */}
        <div className="mt-6 max-w-2xl">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-sm font-semibold">{st.screenTypeKicker}</h3>
            <span className="font-mono text-[11px] text-muted">
              {s.screenCount} {st.entries} · {fmtScreenHours(s.screenHours)}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">{st.screenTypeIntro}</p>
          {screenByType.length > 0 ? (
            <RankBar
              items={screenByType.map((x) => ({
                label: t.screenTypes[x.type],
                hours: x.hours,
                meta: `${x.count}`,
              }))}
              unit={st.hours}
              format={(v) => v.toFixed(2)}
            />
          ) : (
            <p className="mt-4 text-sm text-muted">{st.noData}</p>
          )}
        </div>

        {/* 小块：时长排行 */}
        <div className="mt-10 max-w-2xl">
          <h3 className="font-serif text-sm font-semibold">{st.byHours}</h3>
          {screen.length > 0 ? (
            <RankBar
              items={screen.map((sc) => ({ label: sc.title, hours: sc.hours ?? 0 }))}
              unit={st.hours}
              format={(v) => v.toFixed(2)}
            />
          ) : (
            <p className="mt-4 text-sm text-muted">{st.noData}</p>
          )}
          <p className="mt-4">
            <Link href="/arts/screen" className="text-sm text-accent hover:underline">
              {st.screenFullLink}
            </Link>
          </p>
        </div>

        {/* 小块：月度趋势 */}
        <div className="mt-10 max-w-2xl">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-sm font-semibold">{st.monthlyKicker}</h3>
            <span className="font-mono text-[11px] text-muted">{st.unitHoursMonth}</span>
          </div>
          <div className="mt-5">
            <MonthlyTrend
              months={m.months}
              values={m.screenDelta}
              label={t.screen.kicker}
              unit={st.unitHoursMonth}
              lang="zh"
              emptyNote={st.accumulating}
              baseline={m.baselines.screen}
              baselineLabel={st.baseline}
              fmtValue={(v) => v.toFixed(2)}
            />
          </div>
        </div>
      </section>

      {/* ==================== 运动 ==================== */}
      <section className="mt-16 border-t border-rule pt-10">
        <h2 className="font-serif text-2xl font-bold">{t.exercise.kicker}</h2>

        {/* 小块：累计 */}
        <div className="mt-6 max-w-2xl">
          <div className="flex items-baseline justify-between gap-3 border-b border-rule/60 py-2.5">
            <span className="font-serif text-sm">{st.entries}</span>
            <span className="font-mono text-sm text-muted">
              {s.exerciseCount} {st.times}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-rule/60 py-2.5">
            <span className="font-serif text-sm">{st.hours}</span>
            <span className="font-mono text-sm text-muted">
              {exerciseH} {st.hours}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-2.5">
            <span className="font-serif text-sm">{st.km}</span>
            <span className="font-mono text-sm text-muted">
              {km} {st.km}
            </span>
          </div>
        </div>

        {/* 小块：月度趋势 */}
        <div className="mt-10 max-w-2xl">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-sm font-semibold">{st.monthlyKicker}</h3>
            <span className="font-mono text-[11px] text-muted">{st.unitHoursMonth}</span>
          </div>
          <div className="mt-5">
            <MonthlyTrend
              months={m.months}
              values={m.exercise}
              label={t.exercise.kicker}
              unit={st.unitHoursMonth}
              lang="zh"
              emptyNote={st.accumulating}
            />
          </div>
        </div>
      </section>

      {/* ==================== Token 用量（三块点阵屏横排） ==================== */}
      <TokenMonitor lang="zh" initial={getTokenMonitor()} variant="tri" />
    </div>
  );
}
