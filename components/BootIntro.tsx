"use client";

import { useEffect, useLayoutEffect, useState } from "react";

/** 每个会话只播一次的 sessionStorage 键（新标签页视为新会话） */
const SESSION_KEY = "boot-intro-played";
/** 与 globals.css 的 .boot-overlay 动画总时长对齐（含淡出尾巴） */
const COVER_MS = 2650;
/** 点击跳过后的快淡时长（与 .boot-skip 的 0.26s 对齐） */
const SKIP_MS = 280;

/** 散字字号档位：导航词（anchor）只取大三档，其余词全档位（Ting 要求大小不一）；
 *  四稿整体上调约 30%——标题 z-20 压顶，小字再大也不遮挡四字主标题 */
const ANCHOR_SIZES = [26, 32, 38];
const WORD_SIZES = [17, 20, 23, 27, 31, 35];

/** SSR（无 window）用 useEffect 占位避免告警；客户端用 useLayoutEffect 在首绘前移除，
 *  回访（已播过 / 减弱动效）不会闪一帧纸色覆盖层 */
const isoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** 字符串 → 32 位哈希（排字确定性来源：渲染期禁 Math.random，SSR 与 hydration 才能一致） */
function hash(s: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  return h >>> 0;
}

type Props = {
  /** 竖排逐字浮现的主标题（zh：个人杂志；en：TING） */
  letters: string;
  /** 压脚小字（等宽 + 朱红点，与 Kicker 体例一致） */
  caption: string;
  /** 散字池（导航五词 + 兴趣 + 文章/造物标题，构建时由 lib/boot-words.ts 取材） */
  words: string[];
  /** 前多少个词是导航词（排字保大保清晰，确保 Ting 指定的「导航区所有字」醒目在列） */
  anchorCount?: number;
};

/**
 * 开场动画（杂志封面式，2026-10-29 四稿）：纸色全屏覆盖 → 竖排大标题自下而上逐字
 * 浮现（完全不透明，标题列按视口高度撑到 ~66vh、z-20 压在散字之上）+ hairline 竖线
 * 同高生长 + 压脚小字；**散字雨铺满全屏**（字号 17–38px 六档，四稿整体上调约 30%）——
 * 取材自导航五词（必须包含）/ 兴趣 / 文章标题，淡入淡出、大小不一、位置与节奏由
 * 词面哈希确定性排出（词池跑两遍加密铺满）。动画全程纯 CSS 时间线（globals.css 的
 * boot-\* 段）——无 JS 时约 2.6s 后覆盖层自行隐藏不挡内容；本组件只负责「播不播」
 * （sessionStorage 每会话一次 / prefers-reduced-motion 不播）、锁滚动、点击跳过与
 * 到点卸载。层级 z-[90]。
 */
export default function BootIntro({ letters, caption, words, anchorCount = 5 }: Props) {
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
      className={`boot-overlay fixed inset-0 z-[90] flex select-none items-center justify-center overflow-hidden bg-paper${
        skipping ? " boot-skip" : ""
      }`}
      role="presentation"
      aria-hidden="true"
      onClick={() => setSkipping(true)}
    >
      {/* 散字层：下落字雨铺满全屏——词池跑两遍（盐值错开、延迟错相），位置全部由
          词面哈希推出：左定位词从 --wx 向右排，.side-r 词以 right 定位从右缘向左排，
          两侧合起来覆盖整个视口；纵向 -8%..77% 加落距直达底缘。长词少量出界由
          覆盖层 overflow-hidden 裁掉。 */}
      <div className="boot-words" aria-hidden="true">
        {[...words, ...words].map((w, i) => {
          const anchor = i < anchorCount;
          const pass = i >= words.length ? 1 : 0;
          const pick = (salt: number, mod: number) => hash(w, salt + pass * 97) % mod;
          const sizes = anchor ? ANCHOR_SIZES : WORD_SIZES;
          const style = {
            "--wx": `${3 + pick(13, 58)}%`,
            "--wy": `${-8 + pick(17, 86)}%`,
            "--ws": `${sizes[pick(19, sizes.length)]}px`,
            "--wo": ((anchor ? 75 + pick(23, 16) : 45 + pick(23, 41)) / 100).toFixed(2),
            "--wdur": `${((170 + pick(29, 70)) / 100).toFixed(2)}s`,
            "--wdelay": `${((pick(31, 100) + pass * 40) / 100).toFixed(2)}s`,
            "--wf": `${18 + pick(37, 15)}vh`,
          } as React.CSSProperties;
          return (
            <span key={`${i}-${w}`} className={`boot-word${pick(11, 2) === 1 ? " side-r" : ""}`} style={style}>
              {w}
            </span>
          );
        })}
      </div>

      <div className="relative z-20 flex items-stretch gap-5 md:gap-7">
        <div className="boot-rule w-px bg-rule" />
        <div className="flex flex-col items-center font-serif text-[14vh] font-bold leading-[1.18] text-ink">
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
      <p className="boot-caption absolute bottom-10 z-10 font-mono text-xs tracking-[0.35em] text-muted md:bottom-14 md:text-sm">
        <span className="text-accent">·</span> {caption}
      </p>
    </div>
  );
}
