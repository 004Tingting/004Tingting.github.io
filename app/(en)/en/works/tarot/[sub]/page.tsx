import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dic } from "@/lib/i18n";
import Kicker from "@/components/Kicker";
import TarotDeck from "@/components/TarotDeck";

export const dynamicParams = false;

const SUBS = ["deck", "daily", "cases"] as const;
type Sub = (typeof SUBS)[number];

export function generateStaticParams() {
  return SUBS.map((sub) => ({ sub }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sub: string }>;
}): Promise<Metadata> {
  const { sub } = await params;
  const item = dic.en.sections.works.tarot.subs[sub as Sub];
  return item ? { title: `${item.title} · TAROT`, description: item.summary } : {};
}

/** TAROT sub pages: deck = library demo (search + grid + preview dialog); daily / cases remain placeholders */
export default async function TarotSubPage({ params }: { params: Promise<{ sub: string }> }) {
  const { sub } = await params;
  const tt = dic.en.sections.works.tarot;
  const item = tt.subs[sub as Sub];
  if (!item) notFound();

  if (sub === "deck") {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <Kicker>TAROT</Kicker>
        <h1 className="mt-4 font-serif text-5xl font-bold">{item.title}</h1>
        <p className="mt-6 max-w-2xl text-muted">{item.summary}</p>
        <TarotDeck lang="en" />
        <p className="mt-16 border-t border-rule pt-6 font-mono text-sm">
          <Link href="/en/works/tarot" className="hover:text-accent">
            ← TAROT
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>TAROT</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{item.title}</h1>
      <p className="mt-6 max-w-2xl text-muted">{item.summary}</p>

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
        <p className="mt-6 font-mono text-xs tracking-widest text-muted">{tt.placeholder}</p>
      </div>

      <p className="mt-16 border-t border-rule pt-6 font-mono text-sm">
        <Link href="/en/works/tarot" className="hover:text-accent">
          ← TAROT
        </Link>
      </p>
    </div>
  );
}
