import Link from "next/link";
import { dic } from "@/lib/i18n";
import { getPosts, fmtDate } from "@/lib/posts";
import { getProjects, toProjectMeta } from "@/lib/projects";
import Kicker from "@/components/Kicker";
import ProjectList from "@/components/ProjectList";
import { getNow } from "@/lib/life";
import NowPlayingLive from "@/components/NowPlayingLive";

/** Home (portal): hero + latest posts + selected projects */
export default function EnHomePage() {
  const t = dic.en.home;
  const recent = getPosts("en").slice(0, 3);
  const projects = getProjects("en").map(toProjectMeta);
  const now = getNow();

  return (
    <div className="mx-auto max-w-5xl px-6">
      <section className="py-24 md:py-32">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-4 font-serif text-7xl font-bold tracking-tight md:text-9xl">Ting</h1>
        <p className="mt-8 text-lg text-muted md:text-xl">{t.identity}</p>
        <p className="mt-3 font-mono text-sm text-muted md:text-base">{t.interests.join(" / ")}</p>
        <div className="mt-8">
          <NowPlayingLive lang="en" initial={now} />
        </div>
      </section>

      <section className="border-t border-rule py-12">
        <div className="flex items-baseline justify-between">
          <Kicker>{t.latest}</Kicker>
          <Link href="/en/blog" className="font-mono text-sm text-muted hover:text-accent">
            {t.viewAll}
          </Link>
        </div>
        {recent.length > 0 ? (
          <ul className="mt-2 divide-y divide-rule">
            {recent.map((p, i) => (
              <li key={p.slug} className="py-5">
                <Link href={`/en/blog/${p.slug}`} className="group block">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-sm text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-serif text-xl font-semibold group-hover:text-accent">
                      {p.title}
                    </p>
                    <span className="ml-auto shrink-0 font-mono text-xs text-muted">
                      {fmtDate(p.date, "en")}
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

      <section className="border-t border-rule py-12">
        <div className="flex items-baseline justify-between">
          <Kicker>{t.projects}</Kicker>
          <Link href="/en/projects" className="font-mono text-sm text-muted hover:text-accent">
            {t.viewAll}
          </Link>
        </div>
        <div className="mt-2">
          <ProjectList projects={projects} lang="en" />
        </div>
      </section>
    </div>
  );
}
