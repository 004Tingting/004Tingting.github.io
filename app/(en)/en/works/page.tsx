import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import { getWorks, toWorkMeta } from "@/lib/works";
import WorkList from "@/components/WorkList";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "Works" };

export default function WorksPage() {
  const t = dic.en.sections.works;
  const works = getWorks("en").map(toWorkMeta);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.title}</h1>
      <p className="mt-6 max-w-2xl text-muted">{t.intro}</p>
      <div className="mt-10">
        {/* Daily Tarot: static route /en/works/tarot (featured entry beside md-backed works) */}
        <Link
          href="/en/works/tarot"
          className="group mb-8 flex items-center gap-5 border border-rule p-5 transition-colors hover:border-accent"
        >
          <span className="relative block h-20 w-12 shrink-0 rounded-[2px] border border-rule">
            <span className="absolute inset-[3px] border border-rule/70" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
            </span>
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-xl font-semibold group-hover:text-accent">
              {t.tarotTitle}
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-muted">{t.tarotIntro}</span>
          </span>
          <span className="ml-auto shrink-0 font-mono text-sm text-muted">→</span>
        </Link>
        <WorkList works={works} lang="en" />
      </div>
    </div>
  );
}
