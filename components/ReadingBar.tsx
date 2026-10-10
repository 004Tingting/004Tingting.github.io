"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dic, type Lang } from "@/lib/i18n";

/**
 * 页面快捷条（所有页面、始终渲染，sticky header 内）：
 * - 页顶：仅三个快捷按钮（透明底，融入导航下方）
 * - 下滚：卡片样式浮现，并向右展开标题区——
 *     文章详情页（<article> 含 .prose）：文章标题 + 阅读进度（按 <article> 计算）
 *     其他页面：页面标题（main 内首个 h1），无进度线
 */
export default function ReadingBar({ lang, pathname }: { lang: Lang; pathname: string }) {
  const t = dic[lang].nav;
  const homeHref = lang === "zh" ? "/" : "/en";
  const [scrolled, setScrolled] = useState(false);
  const [article, setArticle] = useState<{ title: string; pct: number } | null>(null);
  const [pageTitle, setPageTitle] = useState("");

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 24);

      const article = document.querySelector("article");
      const prose = article?.querySelector(".prose");
      if (article && prose) {
        /* 文章详情页：标题 + 进度 */
        const h1 = article.querySelector("h1");
        const rect = article.getBoundingClientRect();
        const total = article.offsetHeight - window.innerHeight;
        const passed = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
        setArticle({
          title: h1?.textContent?.trim() ?? "",
          pct: total > 0 ? passed / total : 1,
        });
      } else {
        /* 其他页面：页面标题 = main 内首个 h1 */
        setArticle(null);
        setPageTitle(document.querySelector("main h1")?.textContent?.trim() ?? "");
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
  }, [lang, pathname]);

  /* 路由切换时重置（避免上一篇的标题残留） */
  useEffect(() => {
    setScrolled(false);
    setArticle(null);
    setPageTitle("");
  }, [pathname]);

  const title = article ? article.title : pageTitle;
  const iconBtn =
    "flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:text-accent";

  return (
    <div className="mx-auto max-w-5xl px-3 pt-2.5">
      <div
        className={`relative flex items-center gap-2 rounded-xl border px-3 py-1.5 backdrop-blur-md transition-all duration-300 ${
          scrolled ? "border-rule bg-paper/90 shadow-sm" : "border-transparent bg-paper/0 shadow-none"
        }`}
      >
        {/* 快捷按钮：返回 / 主页 / 刷新（页顶即显示） */}
        <div className="flex shrink-0 items-center gap-0.5">
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
              className="h-3.5 w-3.5"
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
              className="h-3.5 w-3.5"
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
              className="h-3.5 w-3.5"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>

        {/* 标题区：下滚后向右展开（文章=文章标题+进度，其他=页面标题） */}
        <div
          className={`min-w-0 flex-1 overflow-hidden transition-all duration-300 ${
            scrolled ? "max-w-[40rem] opacity-100" : "max-w-0 opacity-0"
          }`}
          aria-hidden={!scrolled}
        >
          <div className="flex items-baseline gap-2.5">
            <span className="h-3.5 w-px shrink-0 bg-rule" aria-hidden />
            <span className="truncate font-serif text-sm font-semibold">{title}</span>
            {article ? (
              <span className="ml-auto shrink-0 font-mono text-[11px] text-muted">
                {Math.round(article.pct * 100)}%
              </span>
            ) : null}
          </div>
        </div>

        {/* 进度线：仅文章页 */}
        {scrolled && article ? (
          <div className="absolute inset-x-3 bottom-0 h-0.5 overflow-hidden rounded-full bg-rule" aria-hidden>
            <div
              className="h-full bg-accent transition-[width] duration-150"
              style={{ width: `${Math.round(article.pct * 100)}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
