"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { dic, type Lang } from "@/lib/i18n";

type Mode = "hidden" | "quick" | "article";

/**
 * 页面快捷条（所有页面挂载，sticky header 内）：
 * - 文章详情页（<article> 含 .prose 正文）：滚过标题后展开——返回/主页/刷新按钮 + 截断标题 + 阅读进度
 * - 其他页面：滚动收紧后只显示按钮组
 * 进度按 <article> 元素计算；标题取 article h1（三种详情页同构，免 i18n 传参）。
 */
export default function ReadingBar({ lang, pathname }: { lang: Lang; pathname: string }) {
  const t = dic[lang].nav;
  const homeHref = lang === "zh" ? "/" : "/en";
  const [mode, setMode] = useState<Mode>("hidden");
  const [title, setTitle] = useState("");
  const [pct, setPct] = useState(0);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const article = document.querySelector("article");
      const prose = article?.querySelector(".prose");

      /* 文章详情页：滚过标题 → 标题 + 进度 */
      if (article && prose) {
        const h1 = article.querySelector("h1");
        if (h1) setTitle(h1.textContent?.trim() ?? "");
        const rect = article.getBoundingClientRect();
        const visible = -rect.top > 160;
        setMode(visible ? "article" : "hidden");
        const total = article.offsetHeight - window.innerHeight;
        const passed = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
        setPct(total > 0 ? passed / total : 1);
        return;
      }

      /* 其他页面：滚动收紧后只显示按钮组 */
      setMode(window.scrollY > 24 ? "quick" : "hidden");
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
    setMode("hidden");
    setTitle("");
    setPct(0);
  }, [pathname]);

  const iconBtn =
    "flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:text-accent";

  return (
    <div
      className={`mx-auto max-w-5xl overflow-hidden px-3 transition-all duration-300 ${
        mode !== "hidden" ? "max-h-16 pt-2 opacity-100" : "max-h-0 pt-0 opacity-0"
      }`}
      aria-hidden={mode === "hidden"}
    >
      <div className="relative rounded-xl border border-rule bg-paper/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          {/* 快捷按钮：返回 / 主页 / 刷新 */}
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

          {mode === "article" ? (
            <>
              <span className="h-4 w-px shrink-0 bg-rule" aria-hidden />
              <span className="min-w-0 flex-1 truncate font-serif text-sm font-semibold">{title}</span>
              <span className="shrink-0 font-mono text-[11px] text-muted">{Math.round(pct * 100)}%</span>
            </>
          ) : null}
        </div>

        {mode === "article" ? (
          <div className="absolute inset-x-3 bottom-0 h-0.5 overflow-hidden rounded-full bg-rule" aria-hidden>
            <div
              className="h-full bg-accent transition-[width] duration-150"
              style={{ width: `${Math.round(pct * 100)}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
