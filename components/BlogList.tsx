"use client";

import { useState } from "react";
import Link from "next/link";
import { fmtDate, type PostMeta } from "@/lib/blog-shared";
import type { Lang } from "@/lib/i18n";

type Props = {
  posts: PostMeta[];
  lang: Lang;
  allLabel: string;
};

/** 文章列表 + 标签筛选（客户端交互；数据由页面在构建时传入） */
export default function BlogList({ posts, lang, allLabel }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags)));
  const base = lang === "zh" ? "/blog" : "/en/blog";
  const shown = active ? posts.filter((p) => p.tags.includes(active)) : posts;

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

      <ul className="divide-y divide-rule">
        {shown.map((p, i) => (
          <li key={p.slug} className="py-6">
            <Link href={`${base}/${p.slug}`} className="group block">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="font-serif text-2xl font-semibold leading-snug group-hover:text-accent">
                  {p.title}
                </h2>
                <span className="ml-auto shrink-0 font-mono text-sm text-muted">
                  {fmtDate(p.date, lang)}
                </span>
              </div>
              <p className="mt-2 pl-10 text-muted">{p.summary}</p>
              <p className="mt-2 pl-10 font-mono text-xs text-muted">
                {p.tags.map((t) => `#${t}`).join("  ")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
