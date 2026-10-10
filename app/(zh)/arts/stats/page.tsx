import type { Metadata } from "next";
import { dic } from "@/lib/i18n";
import { getCovers, getExercise, getGames, getScreen, getStats } from "@/lib/arts";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "看板" };

type BarItem = { title: string; hours: number };

/** 时长排行：纯 CSS 条形（相对最大值），零依赖 */
function Bars({ items, max, unit }: { items: BarItem[]; max: number; unit: string }) {
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
            {it.hours} {unit}
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

  const games = getGames("zh")
    .filter((g) => (g.hours ?? 0) > 0)
    .sort((a, b) => (b.hours ?? 0) - (a.hours ?? 0));
  const screen = getScreen("zh")
    .filter((sc) => (sc.hours ?? 0) > 0)
    .sort((a, b) => (b.hours ?? 0) - (a.hours ?? 0));
  const maxGame = Math.max(games[0]?.hours ?? 1, 1);
  const maxScreen = Math.max(screen[0]?.hours ?? 1, 1);
  const exerciseH = (s.exerciseMinutes / 60).toFixed(1);
  const km = s.exerciseKm.toFixed(1);

  const big = [
    { label: t.games.kicker, value: `${s.gameHours}`, unit: st.hours },
    { label: t.screen.kicker, value: `${s.screenHours}`, unit: st.hours },
    { label: t.exercise.kicker, value: exerciseH, unit: st.hours },
    { label: t.music.kicker, value: `${s.coverCount}`, unit: "支" },
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

      {/* 游戏：时长排行 */}
      <section className="mt-14 border-t border-rule pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Kicker>
            {t.games.kicker} · {st.byHours}
          </Kicker>
          <span className="font-mono text-sm text-muted">
            {s.gameCount} {st.entries} · {s.gameHours} {st.hours}
          </span>
        </div>
        {games.length > 0 ? (
          <Bars items={games.map((g) => ({ title: g.title, hours: g.hours ?? 0 }))} max={maxGame} unit={st.hours} />
        ) : null}
      </section>

      {/* 影卷：时长排行 */}
      <section className="mt-12 border-t border-rule pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Kicker>
            {t.screen.kicker} · {st.byHours}
          </Kicker>
          <span className="font-mono text-sm text-muted">
            {s.screenCount} {st.entries} · {s.screenHours} {st.hours}
          </span>
        </div>
        {screen.length > 0 ? (
          <Bars items={screen.map((sc) => ({ title: sc.title, hours: sc.hours ?? 0 }))} max={maxScreen} unit={st.hours} />
        ) : null}
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

      {/* 音律：数据源说明 */}
      <section className="mt-12 border-t border-rule pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Kicker>{t.music.kicker}</Kicker>
          <span className="font-mono text-sm text-muted">
            {s.coverCount} 支 cover
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted">{st.musicNote}</p>
      </section>
    </div>
  );
}
