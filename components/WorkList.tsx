import Link from "next/link";
import type { WorkEntry } from "@/lib/works";
import type { Lang } from "@/lib/i18n";

/** 造物列表（服务端组件，双语复用；首页与 /works 共用） */
export default function WorkList({ works, lang }: { works: WorkEntry[]; lang: Lang }) {
  const base = lang === "zh" ? "/works" : "/en/works";

  return (
    <ul className="divide-y divide-rule">
      {works.map((w, i) => (
        <li key={w.slug} className="py-6">
          <Link href={`${base}/${w.slug}`} className="group block">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-serif text-2xl font-semibold leading-snug group-hover:text-accent">
                {w.title}
              </h2>
              <span className="ml-auto shrink-0 font-mono text-sm text-muted">
                {[w.status, w.period].filter(Boolean).join(" · ")}
              </span>
            </div>
            <p className="mt-2 pl-10 text-muted">{w.summary}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
