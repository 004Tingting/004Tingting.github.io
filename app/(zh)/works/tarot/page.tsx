import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = {
  title: "每日塔罗",
  description: "一天一张，日期做种子——同一天打开，抽到的是同一张牌。",
};

/**
 * 每日塔罗（占位页）。
 * 路由 /works/tarot 为静态段，优先于 /works/[slug]（不建同名 md 条目即可共存）。
 * 牌面与抽牌逻辑在站外实现——接入时替换牌背占位区即可，其余版式不动。
 */
export default function TarotPage() {
  const t = dic.zh.sections.works;
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.tarotTitle}</h1>
      <p className="mt-6 max-w-2xl text-muted">{t.tarotIntro}</p>

      {/* 牌背占位：3×5 点阵纹样，呼应首页 DotMatrix */}
      <div className="mt-16 flex flex-col items-center">
        <div className="relative h-[21rem] w-[12rem] rounded-[3px] border border-rule bg-paper">
          <div className="absolute inset-3 border border-rule/70" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid grid-cols-3 gap-2.5">
              {Array.from({ length: 15 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1 w-1 rounded-full ${i === 7 ? "bg-accent" : "bg-rule"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-6 font-mono text-xs tracking-widest text-muted">{t.tarotNote}</p>
        <Link href="/works" className="mt-8 font-mono text-sm text-muted hover:text-accent">
          ← {dic.zh.nav.works}
        </Link>
      </div>
    </div>
  );
}
