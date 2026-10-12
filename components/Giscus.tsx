"use client";

import { useEffect, useRef } from "react";
import { GISCUS } from "@/lib/site";

/**
 * giscus 评论（基于 GitHub Discussions）。
 * 配置见 lib/site.ts：repoId/categoryId 填入且 enabled=true 后才渲染。
 */
export default function Giscus({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GISCUS.enabled || !GISCUS.repoId || !GISCUS.categoryId || !ref.current) return;

    let injected = false;
    const inject = () => {
      if (injected || !ref.current) return;
      injected = true;
      const script = document.createElement("script");
      script.src = "https://giscus.app/client.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.setAttribute("data-repo", GISCUS.repo);
      script.setAttribute("data-repo-id", GISCUS.repoId);
      script.setAttribute("data-category", GISCUS.category);
      script.setAttribute("data-category-id", GISCUS.categoryId);
      script.setAttribute("data-mapping", "pathname");
      script.setAttribute("data-strict", "0");
      script.setAttribute("data-reactions-enabled", "1");
      script.setAttribute("data-emit-metadata", "0");
      script.setAttribute("data-input-position", "top");
      script.setAttribute("data-theme", "preferred_color_scheme");
      script.setAttribute("data-lang", lang === "zh" ? "zh-CN" : "en");
      script.setAttribute("data-loading", "lazy");
      ref.current.appendChild(script);
    };

    // data-loading=lazy 只延迟 iframe，不延迟 client.js 本身——用 IntersectionObserver
    // 把脚本注入也推迟到评论区接近视口时；不支持 IO 的浏览器直接注入
    if (typeof IntersectionObserver === "undefined") {
      inject();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          inject();
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [lang]);

  if (!GISCUS.enabled) return null;

  return <div ref={ref} className="mt-16 border-t border-rule pt-8" />;
}
