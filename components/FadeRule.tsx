"use client";

import { useEffect, useState } from "react";

/** 滚动后淡出的装饰线（与导航 hairline 的收紧逻辑同步：scrollY > 24 淡出） */
export default function FadeRule({ className = "" }: { className?: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className={`bg-accent transition-opacity duration-300 ${
        hidden ? "opacity-0" : "opacity-100"
      } ${className}`}
    />
  );
}
