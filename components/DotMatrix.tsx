/**
 * 点阵屏（LED 矩阵风，零依赖纯 SVG + CSS 动画，2026-10-15；同日二稿改多组轮换）。
 *
 * 在若干组 5×7 字模间定时轮换（当前：STRIVE → 累计 tokens → 04TING.，每组 5s）：
 * 每个「亮点」按组相位（+5s）与列相位（+22ms）错峰，切换时旧组熄灭、新组亮起、
 * 两股扫掠同时进行——点阵小点在屏内「重组」。跨组共用的格位叠加多圈，各自按本组相位亮灭。
 *
 * 动画全部在 CSS（本组件注入 <style>：@keyframes 按组数生成 + .dm-item 规则），
 * no-JS 照常运转（SSR 即含 style）；prefers-reduced-motion 时定格显示 primary 组（数值）。
 */
import type { ReactNode } from "react";

/** 5×7 字模（7 行 × 5 列，"1" = 亮点）。已含 A–Z、0–9、'.'、'-'；新增字符按同格式补即可 */
const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["01110", "10001", "00001", "00110", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  ".": ["00000", "00000", "00000", "00000", "00000", "00000", "00100"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
};

const ROWS = 7;
const COLS_PER_CHAR = 5;
const CHAR_GAP = 1; // 字符间空列
const PITCH = 6.5; // 单格边长（viewBox 单位）
const DOT_R = 2.0;
/** 列相位延迟（ms）：重组扫掠从左到右 */
const COL_STEP_MS = 22;
/** 每组显示时长（ms）——注入的动画周期 = 组数 × ITEM_MS */
const ITEM_MS = 5000;

/** 文本 → 点亮格位集合（cell = col * ROWS + row；在 cols 宽度内水平居中） */
function litCells(text: string, cols: number): Set<number> {
  const out = new Set<number>();
  const chars = text.toUpperCase().split("");
  const width = chars.length * (COLS_PER_CHAR + CHAR_GAP) - CHAR_GAP;
  let cc = Math.floor((cols - width) / 2);
  for (const ch of chars) {
    const glyph = FONT[ch];
    if (glyph) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS_PER_CHAR; c++) {
          if (glyph[r][c] === "1") out.add((cc + c) * ROWS + r);
        }
      }
    }
    cc += COLS_PER_CHAR + CHAR_GAP;
  }
  return out;
}

export default function DotMatrix({
  items,
  primary = 1,
  title,
  className,
}: {
  /** 轮换显示的内容（渲染自动大写；建议 ≤7 字符，超长会整体缩小） */
  items: string[];
  /** prefers-reduced-motion 时定格显示的组下标（默认第 2 组，即数值） */
  primary?: number;
  /** 悬停提示（如「累计 6,623,213,267 tokens」） */
  title?: string;
  className?: string;
}) {
  const list = items.length > 0 ? items : [""];
  const n = list.length;
  const cols = Math.max(COLS_PER_CHAR * 2, ...list.map((s) => (COLS_PER_CHAR + CHAR_GAP) * s.length - CHAR_GAP));
  const cellSets = list.map((s) => litCells(s, cols));

  /* 注入动画：@keyframes 按组数生成（每组占周期 1/n；组末「带闪熄灭」、组首「带闪点亮」）
     + .dm-item / .dm-both / .dm-off / reduced-motion 规则（一处定义，随 SSR 输出）。 */
  const seg = 100 / n;
  const css = `@keyframes dm-swap {
  0% { opacity: 0; }
  0.7% { opacity: 0.85; }
  1.5% { opacity: 0.25; }
  2.4% { opacity: 1; }
  ${(seg - 3.4).toFixed(1)}% { opacity: 1; }
  ${(seg - 2.4).toFixed(1)}% { opacity: 0.15; }
  ${(seg - 1.5).toFixed(1)}% { opacity: 1; }
  ${(seg - 0.2).toFixed(1)}% { opacity: 0.2; }
  ${(seg + 0.6).toFixed(1)}% { opacity: 0; }
  97.6% { opacity: 0; }
  98.4% { opacity: 0.85; }
  99.2% { opacity: 0.3; }
  100% { opacity: 1; }
}
.dm-item { fill: var(--color-ink); opacity: 0; animation: dm-swap ${n * ITEM_MS}ms linear infinite; }
.dm-both { fill: var(--color-ink); }
.dm-off { fill: var(--color-ink); opacity: 0.13; }
@media (prefers-reduced-motion: reduce) {
  .dm-item { animation: none; }
  .dm-primary { opacity: 1; }
}`;

  const dots: ReactNode[] = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < ROWS; r++) {
      const cell = c * ROWS + r;
      const cx = (c + 0.5) * PITCH;
      const cy = (r + 0.5) * PITCH;
      const owners: number[] = [];
      for (let k = 0; k < n; k++) if (cellSets[k].has(cell)) owners.push(k);
      if (owners.length === 0) {
        // 全组都不含 → 底点（屏质感）
        dots.push(<circle key={`o${cell}`} cx={cx} cy={cy} r={DOT_R} className="dm-off" />);
      } else if (owners.length === n) {
        // 全组共用 → 常亮锚点
        dots.push(<circle key={`b${cell}`} cx={cx} cy={cy} r={DOT_R} className="dm-both" />);
      } else {
        for (const k of owners) {
          dots.push(
            <circle
              key={`i${cell}-${k}`}
              cx={cx}
              cy={cy}
              r={DOT_R}
              className={`dm-item dm-i${k}${k === primary ? " dm-primary" : ""}`}
              style={{ animationDelay: `${k * ITEM_MS + c * COL_STEP_MS}ms` }}
            />,
          );
        }
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${cols * PITCH} ${ROWS * PITCH}`}
      className={className}
      style={{ height: "auto" }}
      role="img"
      aria-label={list.join(" / ")}
    >
      <style>{css}</style>
      {title ? <title>{title}</title> : null}
      {dots}
    </svg>
  );
}
