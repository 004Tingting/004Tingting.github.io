"use client";

import { useEffect, useRef } from "react";

/* 闪卡参数（与 preview.html 默认值一致） */
const TILT = 16; // 倾斜幅度（deg）
const ART = 14; // 牌面视差（px，反向）
const NUM = 16; // 序号视差（px，同向）
const TITLE = 22; // 标题视差（px，同向）
const TRAVEL = 1; // rainbow 扫幅系数

/**
 * 塔罗闪卡（78 张通用）。
 * 分层拆解（artwork / edge / rainbow 箔 / number / title）+ 指针倾斜 + 视差；
 * 离开时弹性回正、所有层精确归位。
 * 资源：public/tarot/<card-id>/*.webp（scripts/sync-tarot-assets.mjs 从 widgets 工作区同步）。
 * 层缺失即不渲染该层：数字牌 2–10 无 title（印版无牌名带），5 张缺 number。
 * reduced-motion：不绑定倾斜，仅静态展示。
 */
export default function TarotFoilCard({
  cardId,
  className = "",
}: {
  cardId: string;
  className?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef(0);
  const base = `/tarot/${cardId}`;

  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let settleTimer = 0;

    const onEnter = () => {
      rectRef.current = stage.getBoundingClientRect();
      card.classList.add("live");
      card.style.transition = "transform 80ms ease-out";
      window.setTimeout(() => {
        card.style.transition = "";
      }, 90);
    };

    const onMove = (e: PointerEvent) => {
      const rect = rectRef.current ?? stage.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        card.style.transform = `rotateX(${(-ny * TILT).toFixed(2)}deg) rotateY(${(nx * TILT).toFixed(2)}deg)`;
        card.style.setProperty("--ax", `${(-nx * ART).toFixed(1)}px`);
        card.style.setProperty("--ay", `${(-ny * ART).toFixed(1)}px`);
        card.style.setProperty("--nx", `${(nx * NUM).toFixed(1)}px`);
        card.style.setProperty("--ny", `${(ny * NUM).toFixed(1)}px`);
        card.style.setProperty("--tx", `${(nx * TITLE).toFixed(1)}px`);
        card.style.setProperty("--ty", `${(ny * TITLE).toFixed(1)}px`);
        card.style.setProperty("--bx", `${(50 + nx * 25 * TRAVEL).toFixed(1)}%`);
        card.style.setProperty("--by", `${(50 + ny * 32 * TRAVEL).toFixed(1)}%`);
      });
    };

    const onLeave = () => {
      rectRef.current = null;
      card.classList.remove("live");
      card.style.transition = "transform .32s cubic-bezier(.2,.65,.3,1.12)";
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
      for (const k of ["ax", "ay", "nx", "ny", "tx", "ty"]) card.style.setProperty(`--${k}`, "0px");
      card.style.setProperty("--bx", "50%");
      card.style.setProperty("--by", "50%");
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        card.style.transition = "";
      }, 340);
    };

    stage.addEventListener("pointerenter", onEnter);
    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointerenter", onEnter);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.clearTimeout(settleTimer);
    };
  }, []);

  return (
    <div ref={stageRef} className={`relative w-full [perspective:1100px] ${className}`}>
      <div
        ref={cardRef}
        className="tarot-foil-card relative aspect-[2100/3600] w-full touch-none [transform-style:preserve-3d]"
      >
        {/* 牌面（反向视差 + 放大裁切） */}
        <img
          className="tarot-foil-artwork pointer-events-none absolute inset-0 h-full w-full select-none"
          src={`${base}/artwork.webp`}
          alt=""
          draggable={false}
        />
        {/* 边框层 */}
        <img
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          src={`${base}/edge.webp`}
          alt=""
          draggable={false}
        />
        {/* rainbow 箔面（color-dodge，随指针扫动） */}
        <div className="tarot-foil-rainbow pointer-events-none absolute inset-0" />
        {/* 序号 / 标题浮层（同向视差）——层不存在时文件缺失，onError 隐藏 */}
        <img
          className="tarot-foil-number pointer-events-none absolute inset-0 h-full w-full select-none"
          src={`${base}/number.webp`}
          alt=""
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <img
          className="tarot-foil-title pointer-events-none absolute inset-0 h-full w-full select-none"
          src={`${base}/title.webp`}
          alt=""
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    </div>
  );
}
