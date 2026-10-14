import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import { getTokenMonitor } from "@/lib/arts";
import Kicker from "@/components/Kicker";
import TokenMonitor from "@/components/TokenMonitor";

export const metadata: Metadata = { title: "Token 用量明细" };

/** Token 用量明细（看板子页）：hub 多端聚合的完整视图——实时三周期 + 30 天柱状 + 12 个月折线 + 按工具 */
export default function TokenStatsPage() {
  const t = dic.zh;
  const token = getTokenMonitor();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.arts.stats.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.tokenMonitor.detailTitle}</h1>
      <p className="mt-5 max-w-2xl text-sm text-muted">{t.tokenMonitor.intro}</p>

      <div className="mt-10">
        <TokenMonitor lang="zh" initial={token} variant="full" />
      </div>

      <Link
        href="/arts/stats"
        className="mt-10 inline-block font-mono text-sm text-accent hover:underline"
      >
        {t.tokenMonitor.backToStats}
      </Link>
    </div>
  );
}
