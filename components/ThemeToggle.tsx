"use client";

import { useEffect, useState } from "react";

/**
 * 深浅模式切换。
 * 初始主题由根 layout 的内联脚本设置（防 FOUC），这里只负责切换与持久化。
 *
 * 动效（两层，时长与缓动共用 globals.css 的 --theme-fx-duration / --theme-fx-ease，
 * 保证「擦除开始时开始旋转、擦除结束时正好旋转完成」）：
 *   ① 整页擦除式变色：View Transitions API + theme-wipe 关键帧；
 *      黑 → 白（切日间）从左到右，白 → 黑（切夜间）从右到左（html.wipe-rtl）
 *   ② 按钮图标旋入：按钮带 view-transition-name 单独捕获，新旧快照按同一时长旋转换接
 * 不支持 VT 或用户开启「减少动态效果」时：图标走普通 CSS 旋入，主题直接切换。
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);
  const [vtSupported, setVtSupported] = useState(false);

  useEffect(() => {
    setMounted(document.documentElement.classList.contains("dark"));
    setVtSupported(typeof document !== "undefined" && "startViewTransition" in document);
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    const apply = () => {
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {}
      setDark(next);
    };
    const root = document.documentElement;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (doc.startViewTransition && !reduced) {
      // 方向：黑 → 白（next = false，切日间）从左到右；白 → 黑（next = true，切夜间）从右到左
      root.classList.toggle("wipe-rtl", next);
      const vt = doc.startViewTransition(apply);
      const cleanup = () => root.classList.remove("wipe-rtl");
      vt.finished.then(cleanup, cleanup);
    } else {
      apply();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "切换到日间模式" : "切换到夜间模式"}
      className="theme-toggle-btn cursor-pointer text-xl leading-none transition-colors duration-300 hover:text-accent"
    >
      {mounted ? (
        <span
          key={dark ? "dark" : "light"}
          className={vtSupported ? "inline-block" : "theme-icon-in inline-block"}
        >
          {dark ? "◑" : "◐"}
        </span>
      ) : (
        "◐"
      )}
    </button>
  );
}
