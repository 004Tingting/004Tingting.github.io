"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { dic, type Lang } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import ThemeToggle from "@/components/ThemeToggle";

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

/**
 * 全站导航卡（唯一悬浮物）：logo + 五栏 + 语言 + 主题 + 快捷图标（返回/主页/刷新），
 * 收紧后中部浮现当前页/文章标题（文章页附底部进度条）。
 * 标题取 article h1（文章详情）或 main h1（其他页）；进度按 <article> 高度计算。
 */
export default function Nav({ lang }: { lang: Lang }) {
  const pathname = usePathname() ?? "/";
  const t = dic[lang].nav;
  const routes = ROUTES[lang];

  // 滚动收紧：离开页顶后导航变浮动圆角卡片，logo 与留白同步收缩
  const [compact, setCompact] = useState(false);
  // 中部信息：文章详情页 = 标题 + 进度；其他页 = 页面标题
  const [info, setInfo] = useState<{ title: string; pct: number | null }>({ title: "", pct: null });
  /** DOM 引用缓存：文章页结构在一次路由内不变，避免每个滚动帧重复 querySelector */
  const domCache = useRef<{ article: HTMLElement | null; prose: Element | null; h1: Element | null; ready: boolean }>(
    { article: null, prose: null, h1: null, ready: false }
  );

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const cache = domCache.current;
      if (!cache.ready) {
        cache.article = document.querySelector("article");
        cache.prose = cache.article?.querySelector(".prose") ?? null;
        cache.h1 = cache.article?.querySelector("h1") ?? null;
        cache.ready = true;
      }
      const compactNext = window.scrollY > 24;
      // 值没变就不 setState：否则每个滚动帧都会重渲染整张导航卡
      setCompact((prev) => (prev === compactNext ? prev : compactNext));

      const { article, prose, h1 } = cache;
      if (article && prose) {
        const rect = article.getBoundingClientRect();
        const total = article.offsetHeight - window.innerHeight;
        const passed = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
        const title = h1?.textContent?.trim() ?? "";
        const pct = total > 0 ? passed / total : 1;
        setInfo((prev) => (prev.title === title && prev.pct === pct ? prev : { title, pct }));
      } else {
        const title = document.querySelector("main h1")?.textContent?.trim() ?? "";
        setInfo((prev) => (prev.title === title && prev.pct === null ? prev : { title, pct: null }));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* 路由切换时重置（避免上一篇的标题残留；同时失效 DOM 缓存，等新文章挂载后重新查询） */
  useEffect(() => {
    setCompact(false);
    setInfo({ title: "", pct: null });
    const cache = domCache.current;
    cache.article = null;
    cache.prose = null;
    cache.h1 = null;
    cache.ready = false;
  }, [pathname]);

  // 语言切换：zh ↔ en 对等路径
  const otherHref =
    lang === "zh"
      ? pathname === "/"
        ? "/en"
        : `/en${pathname}`
      : pathname.replace(/^\/en/, "") || "/";

  const homeHref = lang === "zh" ? "/" : "/en";
  const iconBtn =
    "flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:text-accent";
  const iconSvg = "h-4 w-4";

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
          className={`relative flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl border bg-paper/0 px-6 backdrop-blur-md transition-all duration-300 ${
            compact ? "border-rule bg-paper/90 py-2 shadow-sm" : "border-transparent py-3.5"
          }`}
        >
          <Link
            href={homeHref}
            className={`shrink-0 font-serif font-bold tracking-wide transition-all duration-300 hover:text-accent ${
              compact ? "text-lg" : "text-2xl"
            }`}
          >
            Ting
          </Link>

          {/* GitHub 图标（标题右侧，外链；mark 取自 GitHub octicons） */}
          <Link
            href={SITE.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="GitHub"
            className="ml-1.5 shrink-0 text-muted transition-colors hover:text-accent"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path d="M6.766 11.328c-2.063-.25-3.516-1.734-3.516-3.656 0-.781.281-1.625.75-2.188-.203-.515-.172-1.609.063-2.062.625-.078 1.468.25 1.968.703.594-.187 1.219-.281 1.985-.281.765 0 1.39.094 1.953.265.484-.437 1.344-.765 1.969-.687.218.422.25 1.515.046 2.047.5.593.766 1.39.766 2.203 0 1.922-1.453 3.375-3.547 3.64.531.344.89 1.094.89 1.954v1.625c0 .468.391.734.86.547C13.781 14.359 16 11.53 16 8.03 16 3.61 12.406 0 7.984 0 3.563 0 0 3.61 0 8.031a7.88 7.88 0 0 0 5.172 7.422c.422.156.828-.125.828-.547v-1.25c-.219.094-.5.156-.75.156-1.031 0-1.64-.562-2.078-1.609-.172-.422-.36-.672-.719-.719-.187-.015-.25-.093-.25-.187 0-.188.313-.328.625-.328.453 0 .844.281 1.25.86.313.452.64.655 1.031.655s.641-.14 1-.5c.266-.265.47-.5.657-.656" />
            </svg>
          </Link>

          {/* 中部信息区（仅收紧后浮现，窄屏隐藏）：当前页/文章标题 + 阅读进度 */}
          <div
            aria-hidden={!compact}
            className={`hidden min-w-0 flex-1 px-2 transition-opacity duration-300 md:block ${
              compact ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="truncate font-serif text-sm font-semibold">{info.title}</p>
            {info.pct !== null ? (
              <p className="font-mono text-[11px] leading-tight text-muted">
                {Math.round(info.pct * 100)}%
              </p>
            ) : null}
          </div>

          <nav
            className={`flex flex-wrap items-center gap-x-5 gap-y-1 font-serif font-semibold transition-all duration-300 ${
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
            {/* 快捷图标：返回 / 主页 / 刷新——并入导航卡，全站常驻 */}
            <span aria-hidden className="hidden h-4 w-px bg-rule sm:block" />
            <span className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => history.back()}
                className={iconBtn}
                aria-label={t.back}
                title={t.back}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={iconSvg}
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <Link href={homeHref} className={iconBtn} aria-label={t.home} title={t.home}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={iconSvg}
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => location.reload()}
                className={iconBtn}
                aria-label={t.refresh}
                title={t.refresh}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={iconSvg}
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </span>
          </nav>

          {/* 阅读进度条：文章页收紧后压在卡片底边 */}
          {info.pct !== null ? (
            <div
              className={`absolute inset-x-6 bottom-0 h-0.5 overflow-hidden rounded-full bg-rule transition-opacity duration-300 ${
                compact ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden
            >
              <div
                className="h-full bg-accent transition-[width] duration-150"
                style={{ width: `${Math.round(info.pct * 100)}%` }}
              />
            </div>
          ) : null}
        </div>
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
