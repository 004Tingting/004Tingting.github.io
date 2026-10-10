import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import { getNow, getStats } from "@/lib/arts";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "游艺" };

/** 游艺总览：音律 / 游戏 / 影卷 三个入口 + 构建时汇总的计数 */
export default function ArtsPage() {
  const t = dic.zh.arts;
  const s = getStats("zh");
  const now = getNow();

  const rows = [
    {
      href: "/arts/music",
      label: t.music.kicker,
      meta: `${s.coverCount} ${t.music.covers}${
        now ? ` · ${t.music.nowPlayingLabel}${now.title}` : ""
      }`,
    },
    {
      href: "/arts/games",
      label: t.games.kicker,
      meta: [
        `${s.gameCount} ${t.games.countLabel}`,
        `${t.gameStatus.completed} ${s.gameByStatus.completed}`,
        `${t.games.avgLabel} ${s.gameAvgRating !== null ? s.gameAvgRating.toFixed(1) : "—"}`,
      ].join(" · "),
    },
    {
      href: "/arts/screen",
      label: t.screen.kicker,
      meta: [
        `${t.screenTypes.tv} ${s.screenByType.tv}`,
        `${t.screenTypes.anime} ${s.screenByType.anime}`,
        `${t.screenTypes.movie} ${s.screenByType.movie}`,
        `${t.screenTypes.novel} ${s.screenByType.novel}`,
        `${t.screen.total} ${s.screenHours}${t.screen.hoursUnit}`,
      ].join(" · "),
    },
    {
      href: "/arts/exercise",
      label: t.exercise.kicker,
      meta: [
        `${s.exerciseCount} ${t.exercise.countLabel}`,
        s.exerciseMinutes > 0
          ? `${t.screen.total} ${(s.exerciseMinutes / 60).toFixed(1)}${t.screen.hoursUnit}`
          : null,
      ]
        .filter(Boolean)
        .join(" · "),
    },
    {
      href: "/arts/stats",
      label: t.stats.kicker,
      meta: `${s.gameCount + s.screenCount + s.exerciseCount} ${t.stats.entries} · ${
        s.gameHours + s.screenHours + Math.round(s.exerciseMinutes / 60)
      } ${t.stats.hours}`,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.title}</h1>
      <p className="mt-6 max-w-2xl text-muted">{t.intro}</p>

      <ul className="mt-12 divide-y divide-rule border-t border-rule">
        {rows.map((r, i) => (
          <li key={r.href}>
            <Link
              href={r.href}
              className="group flex flex-wrap items-baseline gap-x-6 gap-y-2 py-6"
            >
              <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-serif text-3xl font-semibold group-hover:text-accent">
                {r.label}
              </span>
              <span className="ml-auto font-mono text-sm text-muted">{r.meta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
