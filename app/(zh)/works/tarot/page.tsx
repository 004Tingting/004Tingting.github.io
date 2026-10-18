import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = {
  title: "TAROT",
  description: "每日一张牌，连同牌库与解析案例。",
};

/** 子页顺序：每日 / 牌库 / 案例 */
const SUBS = ["daily", "deck", "cases"] as const;

/**
 * TAROT 枢纽页（造物 03）。
 * /works/tarot 为静态段，覆盖 /works/[slug]（md 条目 tarot 不生成详情页，见 [slug] 的 generateStaticParams 过滤）。
 * 牌面与抽牌逻辑在站外实现——接入时改子页，不改本页结构。
 */
export default function TarotHubPage() {
  const t = dic.zh.sections.works;
  const tt = t.tarot;
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">TAROT</h1>
      <p className="mt-6 max-w-2xl text-muted">{tt.intro}</p>

      <ol className="mt-12 border-t border-rule">
        {SUBS.map((key, i) => (
          <li key={key} className="border-b border-rule/60">
            <Link href={`/works/tarot/${key}`} className="group flex items-baseline gap-5 py-6">
              <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-2xl font-semibold leading-snug group-hover:text-accent">
                  {tt.subs[key].title}
                </span>
                <span className="mt-1.5 block text-muted">{tt.subs[key].summary}</span>
              </span>
              <span className="shrink-0 font-mono text-sm text-muted">→</span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-16 border-t border-rule pt-6 font-mono text-sm">
        <Link href="/works" className="hover:text-accent">
          ← {dic.zh.nav.works}
        </Link>
      </p>
    </div>
  );
}
