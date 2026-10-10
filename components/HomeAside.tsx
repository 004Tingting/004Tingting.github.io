import Link from "next/link";
import { dic, type Lang } from "@/lib/i18n";
import type { Section } from "@/lib/articles";
import NowPlayingLive, { type NowSnapshot } from "@/components/NowPlayingLive";

/** 首页侧栏「近作」需要的字段（ArticleMeta + 所属栏目） */
type RecentItem = {
  slug: string;
  title: string;
  date: string;
  section: Section;
};

/** 五栏顺序（与 Nav 保持一致） */
const ORDER = ["research", "works", "arts", "chronicles", "about"] as const;

const ROUTES: Record<Lang, Record<(typeof ORDER)[number], string>> = {
  zh: {
    research: "/research",
    works: "/works",
    arts: "/arts",
    chronicles: "/chronicles",
    about: "/about",
  },
  en: {
    research: "/en/research",
    works: "/en/works",
    arts: "/en/arts",
    chronicles: "/en/chronicles",
    about: "/en/about",
  },
};

/** 各栏目的一句话定位（简版，侧栏用） */
const BLURBS: Record<Lang, Record<(typeof ORDER)[number], string>> = {
  zh: {
    research: "推导与文献研读",
    works: "做出来的东西",
    arts: "在听、在玩、在看",
    chronicles: "时间切片与随笔",
    about: "履历与站务",
  },
  en: {
    research: "Derivations and notes",
    works: "Things actually made",
    arts: "Listening, playing, watching",
    chronicles: "Time slices and essays",
    about: "Bio and site notes",
  },
};

/**
 * 首页侧栏（仅 ≥1280px 显示）。
 * 四部分：编辑部印记（装饰）→ 正在听（实时）→ 五栏索引（导航）→ 近作（时效）。
 * 本体为服务端组件，正在听为客户端子组件（实时轮询）。
 */
export default function HomeAside({
  lang,
  latest,
  now,
}: {
  lang: Lang;
  latest: RecentItem[];
  now: NowSnapshot | null;
}) {
  const t = dic[lang].home.aside;
  const routes = ROUTES[lang];
  const base = lang === "zh" ? "" : "/en";

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-8 space-y-5">
        {/* 编辑部印记：竖排站名 + 期号，纯装饰 */}
        <div className="border-t-2 border-accent pt-3">
          <p className="font-mono text-xs tracking-[0.3em] text-muted uppercase">
            {lang === "zh" ? "个人杂志" : "Personal Journal"}
          </p>
          <p className="mt-2 font-serif text-2xl font-bold leading-tight">
            Ting
            <span className="text-accent">.</span>
          </p>
          <p className="mt-1 font-mono text-xs text-muted">
            {t.colophon} · {t.est}
          </p>
        </div>

        {/* 正在听：实时状态（窄版，位于印记与索引之间） */}
        <div className="border-t border-rule pt-3">
          <NowPlayingLive lang={lang} initial={now} variant="aside" />
        </div>

        {/* 五栏索引 */}
        <nav className="border-t border-rule pt-3">
          <p className="font-mono text-xs tracking-widest text-muted">
            <span className="text-accent">·</span> {t.index}
          </p>
          <ul className="mt-2.5 space-y-2">
            {ORDER.map((key, i) => (
              <li key={key}>
                <Link href={routes[key]} className="group flex items-baseline gap-2.5">
                  <span className="font-mono text-xs text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-base font-semibold group-hover:text-accent">
                    {dic[lang].nav[key]}
                  </span>
                </Link>
                <p className="mt-0.5 pl-7 text-xs leading-snug text-muted">
                  {BLURBS[lang][key]}
                </p>
              </li>
            ))}
          </ul>
        </nav>

        {/* 近作 */}
        {latest.length > 0 ? (
          <div className="border-t border-rule pt-3">
            <p className="font-mono text-xs tracking-widest text-muted">
              <span className="text-accent">·</span> {t.latestShort}
            </p>
            <ul className="mt-2.5 space-y-2">
              {latest.slice(0, 3).map((a) => (
                <li key={`${a.section}/${a.slug}`}>
                  <Link href={`${base}/${a.section}/${a.slug}`} className="group block">
                    <p className="font-serif text-sm font-semibold leading-snug group-hover:text-accent">
                      {a.title}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-muted">
                      {a.date.replaceAll("-", ".")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
