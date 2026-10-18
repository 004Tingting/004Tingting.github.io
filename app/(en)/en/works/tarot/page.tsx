import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = {
  title: "Daily Tarot",
  description: "One card a day, seeded by the date — the same card for everyone that day.",
};

/**
 * Daily Tarot (placeholder page).
 * /en/works/tarot is a static segment overriding /en/works/[slug] (no md entry with this slug).
 * The deck and draw logic are implemented elsewhere — replace the card-back placeholder when ready.
 */
export default function TarotPage() {
  const t = dic.en.sections.works;
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.tarotTitle}</h1>
      <p className="mt-6 max-w-2xl text-muted">{t.tarotIntro}</p>

      {/* Card-back placeholder: 3×5 dot grid echoing the DotMatrix language */}
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
        <Link href="/en/works" className="mt-8 font-mono text-sm text-muted hover:text-accent">
          ← {dic.en.nav.works}
        </Link>
      </div>
    </div>
  );
}
