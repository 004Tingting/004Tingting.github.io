import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import { getTokenMonitor } from "@/lib/arts";
import Kicker from "@/components/Kicker";
import TokenMonitor from "@/components/TokenMonitor";

export const metadata: Metadata = { title: "Token Usage Details" };

/** Token usage details (stats sub-page): the full hub-aggregated view — live periods + 30-day bars + 12-month trend + by tool */
export default function TokenStatsPage() {
  const t = dic.en;
  const token = getTokenMonitor();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.arts.stats.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.tokenMonitor.detailTitle}</h1>
      <p className="mt-5 max-w-2xl text-sm text-muted">{t.tokenMonitor.intro}</p>

      <div className="mt-10">
        <TokenMonitor lang="en" initial={token} variant="full" />
      </div>

      <Link
        href="/en/arts/stats"
        className="mt-10 inline-block font-mono text-sm text-accent hover:underline"
      >
        {t.tokenMonitor.backToStats}
      </Link>
    </div>
  );
}
