"use client";

import { useEffect, useLayoutEffect, useState } from "react";

/** 每个会话只播一次的 sessionStorage 键（新标签页视为新会话） */
const SESSION_KEY = "boot-intro-played";
/** 与 globals.css 的 .boot-overlay 动画总时长对齐（含淡出尾巴） */
const COVER_MS = 2100;
/** 点击跳过后的快淡时长（与 .boot-skip 的 0.26s 对齐） */
const SKIP_MS = 280;

/** SSR（无 window）用 useEffect 占位避免告警；客户端用 useLayoutEffect 在首绘前移除，
 *  回访（已播过 / 减弱动效）不会闪一帧纸色覆盖层 */
const isoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Props = {
  /** 竖排逐字浮现的主标题（zh：个人杂志；en：TING） */
  letters: string;
  /** 压脚小字（等宽 + 朱红点，与 Kicker 体例一致） */
  caption: string;
};

/**
 * 开场动画（杂志封面式）：纸色全屏覆盖 → 竖排标题自下而上逐字浮现（底部字先出）
 * + hairline 竖线自底生长 → 等宽压脚小字 → 整层淡出。
 * 动画全程由 globals.css 的纯 CSS 时间线驱动——无 JS 时 2s 后覆盖层自行隐藏，
 * 不挡内容；本组件只负责「播不播」（sessionStorage 每会话一次 / prefers-reduced-motion
 * 不播）、在场时锁滚动、点击跳过与到点卸载。层级 z-[90]，高于导航与塔罗面板。
 */
export default function BootIntro({ letters, caption }: Props) {
  const [show, setShow] = useState(true);
  const [skipping, setSkipping] = useState(false);

  isoLayoutEffect(() => {
    let played: string | null = null;
    try {
      played = sessionStorage.getItem(SESSION_KEY);
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (played || reduce) {
      setShow(false);
      return;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const t = setTimeout(() => setShow(false), COVER_MS);
    return () => {
      clearTimeout(t);
      root.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    if (!skipping) return;
    const t = setTimeout(() => setShow(false), SKIP_MS);
    return () => clearTimeout(t);
  }, [skipping]);

  if (!show) return null;

  const chars = [...letters];
  const n = chars.length;

  return (
    <div
      className={`boot-overlay fixed inset-0 z-[90] flex select-none items-center justify-center bg-paper${
        skipping ? " boot-skip" : ""
      }`}
      role="presentation"
      aria-hidden="true"
      onClick={() => setSkipping(true)}
    >
      <div className="flex items-stretch gap-5 md:gap-7">
        <div className="boot-rule w-px bg-rule" />
        <div className="flex flex-col items-center font-serif text-6xl font-bold leading-[1.18] text-ink md:text-7xl">
          {chars.map((ch, i) => (
            <span
              key={`${i}-${ch}`}
              className="boot-char"
              style={{ "--d": 140 + (n - 1 - i) * 110 } as React.CSSProperties}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>
      <p className="boot-caption absolute bottom-10 font-mono text-xs tracking-[0.35em] text-muted md:bottom-14 md:text-sm">
        <span className="text-accent">·</span> {caption}
      </p>
    </div>
  );
}
