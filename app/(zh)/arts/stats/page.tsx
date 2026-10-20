import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import {
  getCovers,
  getExercise,
  getGameHoursFull,
  getGamePlatformSplit,
  getGames,
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

type BarItem = { title: string; hours: number };

/** 时长排行：纯 CSS 条形（相对最大值），零依赖 */
function Bars({ items, max, unit, format }: { items: BarItem[]; max: number; unit: string; format?: (h: number) => string }) {
  return (
    <div className="mt-4 space-y-2.5">
      {items.map((it) => (
        <div key={it.title} className="flex items-center gap-3">
          <span className="w-44 shrink-0 truncate font-serif text-sm font-semibold">
            {it.title}
          </span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-rule/50">
            <span
              className="block h-full rounded-full bg-accent"
              style={{ width: `${Math.round((it.hours / max) * 100)}%` }}
            />
          </span>
          <span className="w-16 shrink-0 text-right font-mono text-xs text-muted">
            {format ? format(it.hours) : it.hours} {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

/** 游艺看板：构建时聚合游戏 / 影卷 / 运动 / 音律数据（零依赖、零客户端 JS） */
export default function StatsPage() {
  const t = dic.zh.arts;
  const st = t.stats;
  const s = getStats("zh");
  const m = getMonthlyTrends("zh");

  // 游戏排行：人工记录 + Steam 全库合并，取前 6（全榜见 /arts/stats/games）
  const gameFull = getGameHoursFull("zh");
  const topGames = gameFull.slice(0, 6);

  // 影卷：只列最新 6 部（date 倒序），其余经链接到 /arts/screen 展开
  const screen = getScreen("zh")
    .filter((sc) => (sc.hours ?? 0) > 0)
    .slice(0, 6);
  const maxScreen = Math.max(screen[0]?.hours ?? 1, 1);
  const exerciseH = (s.exerciseMinutes / 60).toFixed(1);
  const km = s.exerciseKm.toFixed(1);

  // 游戏总时长统一口径：人工 frontmatter + Steam + WeGame + Epic（快照合并，见 getMonthlyTrends）
  const gameTotal = m.baselines.games ?? s.gameHours;

  /* 横截面聚合（2026-10-21 新增） */
  const platformSplit = getGamePlatformSplit("zh");
  const platformLabels = {
    manual: "手动记录",
    steam: "Steam",
    wegame: "WeGame",
    epic: "Epic",
  };
  const screenByType = getScreenByType("zh");
  const topArtists = getTopArtists(6);

  const big = [
    // 游戏：人工精选记录 + Steam 全库（自动）
    {
      label: t.games.kicker,
      value: Number(gameTotal.toFixed(1)).toString(),
      unit: st.hours,
    },
    { label: t.screen.kicker, value: fmtScreenHours(s.screenHours), unit: st.hours },
    { label: t.exercise.kicker, value: exerciseH, unit: st.hours },
    // 音律：账号总收听时长（网易云官方 total 接口，全量口径）
    {
      label: t.music.kicker,
      value: m.neteaseTotalHours !== null ? m.neteaseTotalHours.toFixed(1) : "—",
      unit: st.hours,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{st.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{st.title}</h1>
      <p className="mt-6 max-w-2xl text-muted">{st.intro}</p>

      {/* 总览数字 */}
      <div className="mt-12 grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-4">
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

      {/* 月度趋势：近 12 个月（SVG 折线，构建时渲染） */}
      <section className="mt-14 border-t border-rule pt-10">
        <Kicker>{st.monthlyKicker}</Kicker>
        <p className="mt-3 max-w-2xl text-sm text-muted">{st.monthlyIntro}</p>
        <div className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2">
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
          <MonthlyTrend
            months={m.months}
            values={m.exercise}
            label={t.exercise.kicker}
            unit={st.unitHoursMonth}
            lang="zh"
            emptyNote={st.accumulating}
          />
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
      </section>

      {/* 游戏：平台分布（堆叠条）——同一份总时长按来源切开 */}
      <section className="mt-14 border-t border-rule pt-10">
        <Kicker>{st.platformKicker}</Kicker>
        <p className="mt-3 max-w-2xl text-sm text-muted">{st.platformIntro}</p>
        <div className="mt-6 max-w-2xl">
          <PlatformBars
            items={platformSplit.map((p) => ({ label: platformLabels[p.key], hours: p.hours }))}
            unit={st.hours}
          />
        </div>
      </section>

      {/* 游戏：时长排行（前 6，全榜见链接） */}
      <section className="mt-14 border-t border-rule pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Kicker>
            {t.games.kicker} · {st.byHours}
          </Kicker>
          <span className="font-mono text-sm text-muted">
            {s.gameCount} {st.entries} · {s.gameHours} {st.hours}
          </span>
        </div>
        {topGames.length > 0 ? (
          <Bars
            items={topGames.map((g) => ({ title: g.name, hours: g.hours }))}
            max={topGames[0].hours}
            unit={st.hours}
          />
        ) : null}
        <p className="mt-5">
          <Link href="/arts/stats/games" className="text-sm text-accent hover:underline">
            {st.gameFullLink}
          </Link>
        </p>
      </section>

      {/* 影卷：按类型分布（横条）——比「最新 6 部」更能体现体量，且不随时间失效 */}
      <section className="mt-12 border-t border-rule pt-10">
        <Kicker>{st.screenTypeKicker}</Kicker>
        <p className="mt-3 max-w-2xl text-sm text-muted">{st.screenTypeIntro}</p>
        {screenByType.length > 0 ? (
          <div className="mt-2 max-w-2xl">
            <RankBar
              items={screenByType.map((x) => ({
                label: t.screenTypes[x.type],
                hours: x.hours,
                meta: `${x.count} ${st.entries}`,
              }))}
              unit={st.hours}
              format={(v) => v.toFixed(2)}
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">{st.noData}</p>
        )}
      </section>

      {/* 影卷：时长排行 */}
      <section className="mt-12 border-t border-rule pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Kicker>
            {t.screen.kicker} · {st.byHours}
          </Kicker>
          <span className="font-mono text-sm text-muted">
            {s.screenCount} {st.entries} · {fmtScreenHours(s.screenHours)}
          </span>
        </div>
        {screen.length > 0 ? (
          <Bars
            items={screen.map((sc) => ({ title: sc.title, hours: sc.hours ?? 0 }))}
            max={maxScreen}
            unit={st.hours}
            format={(h) => h.toFixed(2)}
          />
        ) : null}
        <p className="mt-5">
          <Link href="/arts/screen" className="text-sm text-accent hover:underline">
            {st.screenFullLink}
          </Link>
        </p>
      </section>

      {/* 运动：累计 */}
      <section className="mt-12 border-t border-rule pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Kicker>{t.exercise.kicker}</Kicker>
          <span className="font-mono text-sm text-muted">
            {s.exerciseCount} {st.times} · {exerciseH} {st.hours} · {km} {st.km}
          </span>
        </div>
      </section>

      {/* 音律：听歌与 cover（网易云官方口径 + 个人 cover 作品） */}
      <section className="mt-12 border-t border-rule pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Kicker>{t.music.kicker}</Kicker>
        </div>
        <div className="mt-4 max-w-2xl">
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
            <span className="font-mono text-sm text-muted">
              {s.coverCount} 支
            </span>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-xs text-muted">{st.musicNote}</p>

        {/* 常听歌手：从网易云播放记录按歌手聚合 */}
        <div className="mt-10 border-t border-rule/60 pt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-sm font-semibold">{st.artistKicker}</h3>
            <span className="font-mono text-[11px] text-muted">{st.hours}</span>
          </div>
          <p className="mt-2 max-w-2xl text-xs text-muted">{st.artistIntro}</p>
          {topArtists.length > 0 ? (
            <div className="mt-2 max-w-2xl">
              <RankBar items={topArtists.map((a) => ({ label: a.name, hours: a.hours }))} unit={st.hours} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">{st.noData}</p>
          )}
        </div>
      </section>

      {/* Token 用量：hub 多端聚合（摘要栅格自带明细页链接） */}
      <TokenMonitor lang="zh" initial={getTokenMonitor()} variant="grid" />
    </div>
  );
}
