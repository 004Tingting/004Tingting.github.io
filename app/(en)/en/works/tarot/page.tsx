import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = {
  title: "TAROT",
  description: "One card a day, with a deck and reading cases.",
};

/** Sub page order: deck / daily / cases (Ting 2026-10-18) */
const SUBS = ["deck", "daily", "cases"] as const;

/**
 * TAROT hub page (Works 03).
 * /en/works/tarot is a static segment overriding /en/works/[slug]
 * (the md entry `tarot` is excluded from [slug] generateStaticParams).
 */
export default function TarotHubPage() {
  const t = dic.en.sections.works;
  const tt = t.tarot;
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">TAROT</h1>
      <p className="mt-6 max-w-2xl text-muted">{tt.intro}</p>

      <ol className="mt-12 border-t border-rule">
        {SUBS.map((key, i) => (
          <li key={key} className="border-b border-rule/60">
            <Link href={`/en/works/tarot/${key}`} className="group flex items-baseline gap-5 py-6">
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
        <Link href="/en/works" className="hover:text-accent">
          ← {dic.en.nav.works}
        </Link>
      </p>
    </div>
  );
}
