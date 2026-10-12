import type { Metadata } from "next";
import { dic } from "@/lib/i18n";
import { getGameHoursFull } from "@/lib/arts";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "游戏时长全榜" };

const fmtHours = (h: number) => (Number.isInteger(h) ? String(h) : h.toFixed(1));

/** 游戏时长全榜：人工记录 + Steam 全库（构建时聚合，静态渲染） */
export default function GameHoursPage() {
  const t = dic.zh.arts;
  const st = t.stats;
  const all = getGameHoursFull("zh");
  const total = all.reduce((sum, g) => sum + g.hours, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{st.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{st.gameFullTitle}</h1>
      <p className="mt-5 font-mono text-sm text-muted">
        {all.length} {t.games.countLabel} · {total.toFixed(1)} {st.hours}
      </p>
      <p className="mt-4 max-w-2xl text-sm text-muted">{st.gameFullNote}</p>

      <ol className="mt-10 border-t border-rule">
        {all.map((g, i) => (
          <li
            key={g.name}
            className="flex items-baseline gap-4 border-b border-rule/60 py-2.5"
          >
            <span className="w-10 shrink-0 text-right font-mono text-xs text-muted">
              {i + 1}
            </span>
            <span
              className={`min-w-0 flex-1 truncate font-serif text-sm ${
                g.manual ? "font-semibold" : "text-muted"
              }`}
            >
              {g.name}
            </span>
            <span className="shrink-0 font-mono text-xs text-muted">
              {fmtHours(g.hours)} {st.hours}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-xs text-muted">
        {t.games.kicker} · {st.gameFullTitle}
      </p>
    </div>
  );
}
