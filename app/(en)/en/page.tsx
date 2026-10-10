import Link from "next/link";
import { dic } from "@/lib/i18n";
import { getLatestArticles, fmtDate } from "@/lib/articles";
import { getWorks, toWorkMeta } from "@/lib/works";
import { getNow } from "@/lib/arts";
import Kicker from "@/components/Kicker";
import WorkList from "@/components/WorkList";
import NowPlayingLive from "@/components/NowPlayingLive";
import HomeAside from "@/components/HomeAside";

/** Home (portal): hero + latest posts + selected works; two columns at ≥1280px */
export default function EnHomePage() {
  const t = dic.en.home;
  const latest = getLatestArticles("en", 3);
  const works = getWorks("en").map(toWorkMeta);
  const now = getNow();

  return (
    <div className="mx-auto max-w-5xl px-6">
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-16">
        {/* Main column */}
        <div className="min-w-0">
          <section className="py-24 md:py-32">
            <Kicker>{t.kicker}</Kicker>
            <h1 className="mt-4 font-serif text-7xl font-bold tracking-tight md:text-9xl">Ting</h1>
            <p className="mt-8 text-lg text-muted md:text-xl">{t.identity}</p>
            <p className="mt-3 font-mono text-sm text-muted md:text-base">
              {t.interests.join(" / ")}
            </p>
            <div className="mt-8 xl:hidden">
              <NowPlayingLive lang="en" initial={now} />
            </div>
          </section>

          <section className="border-t border-rule py-12">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Kicker>{t.latest}</Kicker>
              <span className="font-mono text-sm text-muted">
                <Link href="/en/research" className="hover:text-accent">
                  {dic.en.nav.research}
                </Link>
                {" · "}
                <Link href="/en/chronicles" className="hover:text-accent">
                  {dic.en.nav.chronicles}
                </Link>
              </span>
            </div>
            {latest.length > 0 ? (
              <ul className="mt-2 divide-y divide-rule">
                {latest.map((a, i) => (
                  <li key={`${a.section}-${a.slug}`} className="py-5">
                    <Link href={`/en/${a.section}/${a.slug}`} className="group block">
                      <div className="flex items-baseline gap-4">
                        <span className="font-mono text-sm text-muted">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="font-serif text-xl font-semibold group-hover:text-accent">
                          {a.title}
                        </p>
                        <span className="ml-auto shrink-0 font-mono text-xs text-muted">
                          {fmtDate(a.date, "en")}
                        </span>
                      </div>
                      <p className="mt-1 pl-10 text-sm text-muted">{a.summary}</p>
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
              <Kicker>{t.featured}</Kicker>
              <Link href="/en/works" className="font-mono text-sm text-muted hover:text-accent">
                {t.viewAll}
              </Link>
            </div>
            <div className="mt-2">
              <WorkList works={works} lang="en" />
            </div>
          </section>
        </div>

        {/* Aside: ≥1280px only */}
        <HomeAside
          lang="en"
          now={now}
          latest={latest.map((a) => ({
            slug: a.slug,
            title: a.title,
            date: a.date,
            section: a.section,
          }))}
        />
      </div>
    </div>
  );
}
