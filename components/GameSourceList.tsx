import Link from "next/link";
import { dic, type Lang } from "@/lib/i18n";
import type { GameSourceItem } from "@/lib/arts-shared";
import Kicker from "@/components/Kicker";

const SOURCE_ORDER: Array<GameSourceItem["source"]> = ["steam", "wegame", "epic"];

const fmtHours = (h: number) => (Number.isInteger(h) ? String(h) : h.toFixed(1));

/** 游戏页「平台时长记录」：Steam / WeGame / Epic 自动源按平台分组（构建时渲染，零客户端 JS） */
export default function GameSourceList({ games, lang }: { games: GameSourceItem[]; lang: Lang }) {
  const t = dic[lang].arts;
  if (games.length === 0) return null;

  return (
    <section className="mt-16 border-t border-rule pt-10">
      <Kicker>{t.games.platformKicker}</Kicker>
      <p className="mt-3 max-w-2xl text-sm text-muted">{t.games.platformNote}</p>

      {SOURCE_ORDER.map((src) => {
        const group = games.filter((g) => g.source === src);
        if (group.length === 0) return null;
        const subtotal = group.reduce((sum, g) => sum + g.hours, 0);
        return (
          <div key={src} className="mt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule pb-2">
              <h2 className="font-serif text-lg font-semibold">{t.games.sources[src]}</h2>
              <span className="font-mono text-sm text-muted">
                {group.length} {t.games.countLabel} · {fmtHours(subtotal)} {t.stats.hours}
              </span>
            </div>
            <ul className="mt-1">
              {group.map((g) => (
                <li
                  key={g.name}
                  className="flex items-baseline justify-between gap-4 border-b border-rule/40 py-1.5 last:border-b-0"
                >
                  <span className="min-w-0 truncate font-serif text-sm">{g.name}</span>
                  <span className="shrink-0 font-mono text-xs text-muted">
                    {fmtHours(g.hours)} {t.stats.hours}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <p className="mt-8">
        <Link
          href={lang === "zh" ? "/arts/stats/games" : "/en/arts/stats/games"}
          className="text-sm text-accent hover:underline"
        >
          {t.stats.gameFullLink}
        </Link>
      </p>
    </section>
  );
}
