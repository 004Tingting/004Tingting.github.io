"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { dic, type Lang } from "@/lib/i18n";
import ThemeToggle from "@/components/ThemeToggle";
import ReadingBar from "@/components/ReadingBar";

/** 五栏体系：研思 · 造物 · 游艺 · 纪事 · 关于 */
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

/** 文章详情页路径（研思 / 纪事 / 造物的 [slug]），用于挂载阅读迷你条 */
const ARTICLE_RE = /\/(research|chronicles|works)\/[^/]+/;

export default function Nav({ lang }: { lang: Lang }) {
  const pathname = usePathname() ?? "/";
  const t = dic[lang].nav;
  const routes = ROUTES[lang];

  // 滚动收紧：离开页顶后导航变浮动圆角卡片，logo 与留白同步收缩
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 语言切换：zh ↔ en 对等路径
  const otherHref =
    lang === "zh"
      ? pathname === "/"
        ? "/en"
        : `/en${pathname}`
      : pathname.replace(/^\/en/, "") || "/";

  const homeHref = lang === "zh" ? "/" : "/en";
  const isArticle = ARTICLE_RE.test(pathname);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        compact ? "px-3 pt-2.5" : "border-b border-rule bg-paper/95 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto max-w-5xl transition-all duration-300">
        <div
          className={`flex flex-wrap items-baseline justify-between gap-y-1 px-6 transition-all duration-300 ${
            compact
              ? "rounded-2xl border border-rule bg-paper/90 py-2 shadow-sm backdrop-blur-md"
              : "py-3.5"
          }`}
        >
          <Link
            href={homeHref}
            className={`font-serif font-bold tracking-wide transition-all duration-300 hover:text-accent ${
              compact ? "text-lg" : "text-2xl"
            }`}
          >
            Ting
          </Link>
          <nav
            className={`flex flex-wrap items-baseline gap-x-5 gap-y-1 font-serif font-semibold transition-all duration-300 ${
              compact ? "text-base" : "text-lg"
            }`}
          >
            {ORDER.map((key) => (
              <Link key={key} href={routes[key]} className="hover:text-accent">
                {t[key]}
              </Link>
            ))}
            <Link href={otherHref} className="hover:text-accent" aria-label="Switch language">
              {lang === "zh" ? "EN" : "中"}
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
      {isArticle && <ReadingBar />}
    </header>
  );
}
