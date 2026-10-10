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

  return (
    <header className="sticky top-0 z-50">
      {/* 全宽底衬：纸色 + 毛玻璃；不放 hairline——会被卡片的毛玻璃糊掉（只在两侧残留） */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-paper/95 backdrop-blur-sm transition-opacity duration-300 ${
          compact ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        className={`relative mx-auto max-w-5xl transition-all duration-300 ${
          compact ? "px-3 pt-2.5" : "px-0 pt-0"
        }`}
      >
        {/* 卡片：边框恒为 1px（透明 ↔ rule），圆角与 blur 恒定——只过渡颜色 / 阴影 / 内边距 */}
        <div
          className={`flex flex-wrap items-baseline justify-between gap-y-1 rounded-2xl border bg-paper/0 px-6 backdrop-blur-md transition-all duration-300 ${
            compact ? "border-rule bg-paper/90 py-2 shadow-sm" : "border-transparent py-3.5"
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
      {/* 页面快捷条：悬挂在导航栏下方 2~3px（绝对定位，不占导航高度） */}
      <div className="absolute inset-x-0 top-full z-10 mt-[3px]">
        <ReadingBar lang={lang} pathname={pathname} />
      </div>
      {/* hairline：独立 1px 色条压在毛玻璃之上——保证全页宽清晰（收紧时淡出） */}
      <div
        aria-hidden
        className={`absolute inset-x-0 bottom-0 h-px bg-rule transition-opacity duration-300 ${
          compact ? "opacity-0" : "opacity-100"
        }`}
      />
    </header>
  );
}
