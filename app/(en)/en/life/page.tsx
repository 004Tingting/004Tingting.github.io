import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import { getNow, getStats } from "@/lib/life";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "Life" };

/** Life overview: music / games / log entries with build-time computed counts */
export default function LifePage() {
  const t = dic.en.life;
  const s = getStats("en");
  const now = getNow();

  const rows = [
    {
      href: "/en/life/music",
      label: t.music.kicker,
      meta: `${s.coverCount} ${t.music.covers}${
        now ? ` · ${t.music.nowPlayingLabel}${now.title}` : ""
      }`,
    },
    {
      href: "/en/life/games",
      label: t.games.kicker,
      meta: [
        `${s.gameCount} ${t.games.countLabel}`,
        `${t.gameStatus.completed} ${s.gameByStatus.completed}`,
        `${t.games.avgLabel} ${s.gameAvgRating !== null ? s.gameAvgRating.toFixed(1) : "—"}`,
      ].join(" · "),
    },
    {
      href: "/en/life/log",
      label: t.log.kicker,
      meta: [
        `${t.screenTypes.tv} ${s.screenByType.tv}`,
        `${t.screenTypes.anime} ${s.screenByType.anime}`,
        `${t.screenTypes.movie} ${s.screenByType.movie}`,
        `${t.screenTypes.novel} ${s.screenByType.novel}`,
        `${t.log.total} ${s.screenHours}${t.log.hoursUnit}`,
      ].join(" · "),
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
