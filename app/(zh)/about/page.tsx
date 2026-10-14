import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import { getMonthlyTrends, getStats, getTokenMonitor } from "@/lib/arts";
import Kicker from "@/components/Kicker";
import TokenMonitor from "@/components/TokenMonitor";

export const metadata: Metadata = { title: "关于" };

/** 关于：占位正文 + 站点数据摘要（完整看板在 /arts/stats）；版式与其余栏目页一致 */
export default function AboutPage() {
  const t = dic.zh.about;
  const s = getStats("zh");
  const mt = getMonthlyTrends("zh");
  const token = getTokenMonitor();
  // 游戏总时长统一口径：人工 frontmatter + Steam + WeGame + Epic（快照合并）
  const gameTotalH = mt.baselines.games ?? s.gameHours;

  const data = [
    { label: "游戏", value: Number(gameTotalH.toFixed(1)).toString(), unit: "h" },
    { label: "影卷", value: s.screenHours.toFixed(2), unit: "h" },
    { label: "运动", value: (s.exerciseMinutes / 60).toFixed(1), unit: "h" },
    // 音乐：网易云官方总收听时长（与看板口径一致）
    {
      label: "音乐",
      value: mt.neteaseTotalHours !== null ? mt.neteaseTotalHours.toFixed(1) : "—",
      unit: "h",
    },
    { label: "cover", value: `${s.coverCount}`, unit: "支" },
  ];

  return (
    <article className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.title}</h1>
      <p className="mt-6 max-w-2xl text-muted">{t.placeholder}</p>

      <section className="mt-14 border-t border-rule pt-10">
        <h2 className="font-mono text-sm tracking-widest text-muted">
          <span className="text-accent">·</span> 站点数据
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
          href="/arts/stats"
          className="mt-6 inline-block font-mono text-sm text-accent hover:underline"
        >
          完整看板 →
        </Link>
      </section>

      {/* Token Monitor：hub 多端 AI 工具用量（摘要栅格，明细在 /arts/stats/tokens） */}
      <TokenMonitor lang="zh" initial={token} variant="grid" />
    </article>
  );
}
