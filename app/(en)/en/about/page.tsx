import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import { getStats } from "@/lib/arts";

export const metadata: Metadata = { title: "About" };

/** About: placeholder body + site data summary (full dashboard at /en/arts/stats) */
export default function AboutPage() {
  const t = dic.en.about;
  const s = getStats("en");

  const data = [
    { label: "Gaming", value: `${s.gameHours}`, unit: "h" },
    { label: "Screen", value: `${s.screenHours}`, unit: "h" },
    { label: "Exercise", value: (s.exerciseMinutes / 60).toFixed(1), unit: "h" },
    { label: "Covers", value: `${s.coverCount}`, unit: "" },
  ];

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-4xl font-bold">{t.title}</h1>
      <p className="mt-6 text-muted">{t.placeholder}</p>

      <section className="mt-12 border-t border-rule pt-8">
        <p className="font-mono text-xs tracking-widest text-muted">
          <span className="text-accent">·</span> Site data
        </p>
        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
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
          className="mt-5 inline-block font-mono text-xs text-accent hover:underline"
        >
          Full dashboard →
        </Link>
      </section>
    </article>
  );
}
