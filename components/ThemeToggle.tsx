"use client";

import { useEffect, useState } from "react";

/**
 * 深浅模式切换。
 * 初始主题由根 layout 的内联脚本设置（防 FOUC），这里只负责切换与持久化。
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="cursor-pointer text-base leading-none hover:text-accent"
    >
      {mounted ? (dark ? "◑" : "◐") : "◐"}
    </button>
  );
}
