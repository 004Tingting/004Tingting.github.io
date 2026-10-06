"use client";

import { useState } from "react";
import Link from "next/link";
import { fmtDate, type ArticleMeta } from "@/lib/article-shared";
import type { Lang } from "@/lib/i18n";

type Props = {
  articles: ArticleMeta[];
  lang: Lang;
  /** 栏目基路径，如 "/research" 或 "/en/chronicles" */
  basePath: string;
  allLabel: string;
};

/** 文章列表（研思 / 纪事共用）+ 标签筛选 */
export default function ArticleList({ articles, lang, basePath, allLabel }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const tags = Array.from(new Set(articles.flatMap((a) => a.tags)));
  const shown = active ? articles.filter((a) => a.tags.includes(active)) : articles;

  return (
    <div>
      {tags.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-4 font-mono text-sm">
          <button
            type="button"
            onClick={() => setActive(null)}
            className={`cursor-pointer ${active === null ? "text-accent" : "text-muted hover:text-ink"}`}
          >
            {allLabel}
          </button>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActive(active === t ? null : t)}
              className={`cursor-pointer ${active === t ? "text-accent" : "text-muted hover:text-ink"}`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-muted">—</p>
      ) : (
        <ul className="divide-y divide-rule">
          {shown.map((a, i) => (
            <li key={a.slug} className="py-6">
              <Link href={`${basePath}/${a.slug}`} className="group block">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="font-serif text-2xl font-semibold leading-snug group-hover:text-accent">
                    {a.title}
                  </h2>
                  <span className="ml-auto shrink-0 font-mono text-sm text-muted">
                    {fmtDate(a.date, lang)}
                  </span>
                </div>
                <p className="mt-2 pl-10 text-muted">{a.summary}</p>
                <p className="mt-2 pl-10 font-mono text-xs text-muted">
                  {a.tags.map((t) => `#${t}`).join("  ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
