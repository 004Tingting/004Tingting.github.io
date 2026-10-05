import Link from "next/link";
import { dic } from "@/lib/i18n";
import { getPosts, fmtDate } from "@/lib/posts";
import { getProjects, toProjectMeta } from "@/lib/projects";
import Kicker from "@/components/Kicker";
import ProjectList from "@/components/ProjectList";

/** 首页（门户型）：hero + 最新文章 + 精选项目 */
export default function HomePage() {
  const t = dic.zh.home;
  const recent = getPosts("zh").slice(0, 3);
  const projects = getProjects("zh").map(toProjectMeta);

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* 封面区：超大衬线姓名，杂志封面感 */}
      <section className="py-24 md:py-32">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-4 font-serif text-7xl font-bold tracking-tight md:text-9xl">Ting</h1>
        <p className="mt-8 text-lg text-muted md:text-xl">{t.identity}</p>
        <p className="mt-3 font-mono text-sm text-muted md:text-base">{t.interests.join(" / ")}</p>
      </section>

      {/* 最新文章 */}
      <section className="border-t border-rule py-12">
        <div className="flex items-baseline justify-between">
          <Kicker>{t.latest}</Kicker>
          <Link href="/blog" className="font-mono text-sm text-muted hover:text-accent">
            {t.viewAll}
          </Link>
        </div>
        {recent.length > 0 ? (
          <ul className="mt-2 divide-y divide-rule">
            {recent.map((p, i) => (
              <li key={p.slug} className="py-5">
                <Link href={`/blog/${p.slug}`} className="group block">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-sm text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-serif text-xl font-semibold group-hover:text-accent">
                      {p.title}
                    </p>
                    <span className="ml-auto shrink-0 font-mono text-xs text-muted">
                      {fmtDate(p.date, "zh")}
                    </span>
                  </div>
                  <p className="mt-1 pl-10 text-sm text-muted">{p.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-muted">{t.empty}</p>
        )}
      </section>

      {/* 精选项目 */}
      <section className="border-t border-rule py-12">
        <div className="flex items-baseline justify-between">
          <Kicker>{t.projects}</Kicker>
          <Link href="/projects" className="font-mono text-sm text-muted hover:text-accent">
            {t.viewAll}
          </Link>
        </div>
        <div className="mt-2">
          <ProjectList projects={projects} lang="zh" />
        </div>
      </section>
    </div>
  );
}
