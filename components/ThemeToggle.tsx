"use client";

import { useEffect, useState } from "react";

/**
 * 深浅模式切换。
 * 初始主题由根 layout 的内联脚本设置（防 FOUC），这里只负责切换与持久化。
 * 动效两层：① 按钮图标旋入（.theme-icon-in，globals.css）② 整页从左到右
 * 擦除式变色（View Transitions API + theme-wipe 关键帧）；不支持 VT 或
 * 用户开启「减少动态效果」时退化为直接切换。
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
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (doc.startViewTransition && !reduced) {
      doc.startViewTransition(apply);
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
      {mounted ? (
        <span key={dark ? "dark" : "light"} className="theme-icon-in inline-block">
          {dark ? "◑" : "◐"}
        </span>
      ) : (
        "◐"
      )}
    </button>
  );
}
