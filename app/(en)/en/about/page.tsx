import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import { getMonthlyTrends, getStats, getTokenMonitor } from "@/lib/arts";
import Kicker from "@/components/Kicker";
import TokenMonitor from "@/components/TokenMonitor";

export const metadata: Metadata = { title: "About" };

/** About: placeholder body + site data summary (full dashboard at /en/arts/stats); same shell as the other section pages */
export default function AboutPage() {
  const t = dic.en.about;
  const s = getStats("en");
  const mt = getMonthlyTrends("en");
  const token = getTokenMonitor();
  // Unified game-hours scope: manual frontmatter + Steam + WeGame + Epic (snapshot merge)
  const gameTotalH = mt.baselines.games ?? s.gameHours;

  const data = [
    { label: "Gaming", value: Number(gameTotalH.toFixed(1)).toString(), unit: "h" },
    { label: "Watch & Read", value: s.screenHours.toFixed(2), unit: "h" },
    { label: "Exercise", value: (s.exerciseMinutes / 60).toFixed(1), unit: "h" },
    // Music: official NetEase total listening hours (same scope as the dashboard)
    {
      label: "Music",
      value: mt.neteaseTotalHours !== null ? mt.neteaseTotalHours.toFixed(1) : "—",
      unit: "h",
    },
    { label: "Covers", value: `${s.coverCount}`, unit: "" },
  ];

  return (
    <article className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.title}</h1>
      <p className="mt-6 max-w-2xl text-muted">{t.placeholder}</p>

      <section className="mt-14 border-t border-rule pt-10">
        <h2 className="font-mono text-sm tracking-widest text-muted">
          <span className="text-accent">·</span> Site data
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-5">
          {data.map((d) => (
            <div key={d.label}>
              <p className="font-serif text-2xl font-bold">
                {d.value}
                <span className="ml-0.5 font-mono text-xs font-normal text-muted">{d.unit}</span>
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted">{d.label}</p>
            </div>
          ))}
        </div>
        <Link
          href="/en/arts/stats"
          className="mt-6 inline-block font-mono text-sm text-accent hover:underline"
        >
          Full dashboard →
        </Link>
      </section>

      {/* Token Monitor: multi-device AI tool usage from the hub (summary grid; details at /en/arts/stats/tokens) */}
      <TokenMonitor lang="en" initial={token} variant="grid" />
    </article>
  );
}
