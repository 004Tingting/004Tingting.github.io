"use client";

import { useEffect, useState } from "react";

/**
 * 文章阅读迷你条：滚过文章头部后出现在导航下方（NYT/Medium 式）。
 - 标题取自 <article> 内的 <h1>（三种详情页同构）
 - 进度按 <article> 元素计算，不依赖页面总高
 */
export default function ReadingBar() {
  const [title, setTitle] = useState("");
  const [visible, setVisible] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const article = document.querySelector("article");
      if (!article) return;
      const h1 = article.querySelector("h1");
      const text = h1?.textContent?.trim() ?? "";
      if (text) setTitle((prev) => prev || text);

      const rect = article.getBoundingClientRect();
      setVisible(-rect.top > 160);
      const total = article.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      setPct(total > 0 ? passed / total : 1);
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

  return (
    <div
      className={`mx-auto max-w-5xl overflow-hidden px-3 transition-all duration-300 ${
        visible ? "max-h-16 pt-2 opacity-100" : "max-h-0 pt-0 opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="relative rounded-xl border border-rule bg-paper/90 px-4 py-1.5 shadow-sm backdrop-blur-md">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate font-serif text-sm font-semibold">{title}</span>
          <span className="shrink-0 font-mono text-[11px] text-muted">
            {Math.round(pct * 100)}%
          </span>
        </div>
        <div className="absolute inset-x-3 bottom-0 h-0.5 overflow-hidden rounded-full bg-rule">
          <div
            className="h-full bg-accent transition-[width] duration-150"
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
