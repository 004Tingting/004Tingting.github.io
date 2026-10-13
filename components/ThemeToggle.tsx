"use client";

import { useEffect, useState } from "react";

/**
 * 深浅模式切换。
 * 初始主题由根 layout 的内联脚本设置（防 FOUC），这里只负责切换与持久化。
 * 动效只有一层：整页擦除式变色（View Transitions API + theme-wipe 关键帧，
 * 时长/缓动见 globals.css 的 --theme-fx-duration / --theme-fx-ease）——
 * 黑 → 白（切日间）从左到右，白 → 黑（切夜间）从右到左（html.wipe-rtl）。
 * 切换图标本身不旋转（Ting 2026-10-13 要求），仅随擦除经过时换态。
 * 不支持 VT 或用户开启「减少动态效果」时直接切换，无动画但功能不变。
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(document.documentElement.classList.contains("dark"));
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
      className="cursor-pointer text-xl leading-none transition-colors duration-300 hover:text-accent"
    >
      {mounted ? (dark ? "◑" : "◐") : "◐"}
    </button>
  );
}
