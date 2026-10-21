"use client";

import { useEffect, useRef, useState } from "react";

/* 闪卡参数（Ting 2026-10-21 23:5x 在 widgets 预览页调定的整行参数，逐项落位）
 *
 *   tilt=8 art=8 scale=104.5 num=11 title=11 ox=50.1 oy=46.5 rain=20 travel=135 enter=420 leave=420
 *
 * scale / ox / oy 三项在 CSS 里（app/globals.css 的 .tarot-foil-artwork），其余在此。
 */
const TILT = 8; // 倾斜幅度（deg）
const ART = 8; // 牌面视差（px，反向）
const NUM = 11; // 序号视差（px，同向）
const TITLE = 11; // 标题视差（px，同向）
const TRAVEL = 1.35; // rainbow 扫幅系数（预览页 135%）
/** 入场过渡时长（ms）：鼠标突然移到卡面时，视差从 0 平滑走到目标值。
 *  0 = 关闭（退回瞬时跳变）。对应 widgets 预览页的「入场过渡时长」滑杆。 */
const ENTER_MS = 420;
/** 出场过渡时长（ms）：指针离开时视差从当前位置平滑回到 0。
 *  与卡片本身的 0.32s 弹性回正并行（变量走 LEAVE_MS，transform 走 0.32s）。 */
const LEAVE_MS = 420;

/**
 * 塔罗闪卡（78 张通用）。
 *
 * 加载顺序（Ting 2026-10-21 定）：
 *   ① 先显示**整体牌面**（thumb.webp，单张 240px 拍平图 ≈29KB，一张就到齐）；
 *   ② artwork + edge 都加载完成后，才切到分层（视差才有意义），此时才挂 rainbow 箔面；
 *   ③ 任一必需层加载失败（网络问题）→ 保持整体牌面，**不显示 rainbow**。
 *
 * 视差：指针进入卡面 → 倾斜 + 牌面反向 / 浮层同向平移；离开弹性回正、所有层精确归位。
 * 交互前提：卡面本身必须可接收指针事件（父层是 pointer-events-none 时要在本组件内翻回 auto）。
 *
 * 资源：`${basePath}/<card-id>/{artwork,edge,number,title,thumb}.webp`
 * 层缺失即不渲染该层：数字牌 2–10 无 title（印版无牌名带），5 张缺 number。
 * reduced-motion：不绑定倾斜，仅静态展示。
 */
export default function TarotFoilCard({
  cardId,
  basePath = "/tarot",
  className = "",
}: {
  cardId: string;
  /** 素材根路径，默认 `/tarot`（站点 public/tarot） */
  basePath?: string;
  className?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef(0);
  const base = `${basePath}/${cardId}`;

  /* 分层是否就绪：artwork + edge 都加载完才切到分层视图 */
  const [layersReady, setLayersReady] = useState(false);
  const [hasNumber, setHasNumber] = useState(true);
  const [hasTitle, setHasTitle] = useState(true);

  /* 预加载 artwork + edge；任一失败 → 不切分层（保持整体牌面、不显 rainbow） */
  useEffect(() => {
    setLayersReady(false);
    let alive = true;
    const preload = (src: string) =>
      new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
      });

    Promise.all([preload(`${base}/artwork.webp`), preload(`${base}/edge.webp`)]).then(
      ([artOk, edgeOk]) => {
        if (alive && artOk && edgeOk) setLayersReady(true);
      },
    );
    return () => {
      alive = false;
    };
  }, [base]);

  /* 指针交互：倾斜 + 视差 + 箔面扫动。
   *
   * ⚠️ 必须等 FLIP 飞行动画结束（0.42s）再绑定（2026-10-21 修）：
   * 组件在弹窗打开瞬间就挂载，但此时牌面正从列表卡片飞向槽位（`.tarot-face-anim`），
   * `getBoundingClientRect()` 拿到的是**动画中间态**（实测位置偏 75/60px、尺寸小 6/11px）。
   * onEnter 一旦缓存了这个错误 rect，后续所有视差计算都基于错基准——
   * 表现为「第一次打开有概率视差不对/不灵」，关掉重开（此时没有飞行）就正常。
   * 修法：等动画结束再挂监听；指针已在卡面上时，主动补一次 enter 以立即生效。 */
  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let settleTimer = 0;
    let enterTimer = 0;
    let leaveTimer = 0;
    let bound = false;
    let disposed = false;
    /** 牌面飞行期间（.tarot-face-anim 存在）不绑定 */
    const FLIP_MS = 430; // .tarot-face-anim 是 0.42s，留 10ms 余量

    /** 入场过渡的触发：进场时挂 .entering，让各层从 0 走到目标值 */
    const startEntering = () => {
      card.style.setProperty("--enter-ms", `${ENTER_MS}ms`);
      card.classList.add("entering");
      window.clearTimeout(enterTimer);
      enterTimer = window.setTimeout(() => {
        card.classList.remove("entering");
      }, ENTER_MS + 40);
    };

    const onEnter = () => {
      /* 每次进入都重新量——飞行期间量到的是中间态，所以只在绑定后调用 */
      rectRef.current = stage.getBoundingClientRect();
      card.classList.add("live");
      card.style.transition = "transform 80ms ease-out";
      window.setTimeout(() => {
        card.style.transition = "";
      }, 90);

      /* 入场过渡（Ting 2026-10-21）：鼠标突然移到卡面（尤其边缘）时，
         视差不应瞬间跳到极大值，而要从 0 平滑走到目标值。
         CSS 自定义属性本身不可过渡，所以短暂给各层挂 transition，
         让「0 → 目标」这段由样式引擎插值；窗口结束移除，move 恢复 1:1 跟手。 */
      startEntering();
    };

    const onMove = (e: PointerEvent) => {
      /* 兜底：rect 尚未缓存时（例如动画刚结束、指针已在卡上）就地补量 */
      if (!rectRef.current) rectRef.current = stage.getBoundingClientRect();
      const rect = rectRef.current;
      if (!rect.width || !rect.height) return;
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
      card.classList.remove("entering");
      window.clearTimeout(enterTimer);

      /* 出场过渡（Ting 2026-10-21）：与入场对称——视差从当前位置平滑回到 0，
         而不是瞬间归位。做法同入场：短暂挂 .leaving 让各层 transform 参与插值，
         窗口结束后移除（此时值已全部是 0，移除过渡不会跳变）。 */
      card.style.setProperty("--leave-ms", `${LEAVE_MS}ms`);
      card.classList.add("leaving");
      window.clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(() => {
        card.classList.remove("leaving");
      }, LEAVE_MS + 40);

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

    const bind = () => {
      if (bound || disposed) return;
      bound = true;
      stage.addEventListener("pointerenter", onEnter);
      stage.addEventListener("pointermove", onMove, { passive: true });
      stage.addEventListener("pointerleave", onLeave);
      /* 指针可能已经停在卡面上（飞行期间就移过来了）：补一次 enter，
         否则要等指针移出再移入才生效——这正是「第一次有概率不灵」的直观感受。
         onEnter 内部已含进场过渡，所以这里只需调它一次。 */
      if (stage.matches(":hover")) onEnter();
    };

    /* 正在播 FLIP 就等它结束，否则立即绑定 */
    const flipping = card.closest(".tarot-face-anim") !== null;
    let timer = 0;
    if (flipping) {
      timer = window.setTimeout(bind, FLIP_MS);
    } else {
      bind();
    }

    return () => {
      disposed = true;
      if (timer) window.clearTimeout(timer);
      if (!bound) return;
      stage.removeEventListener("pointerenter", onEnter);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.clearTimeout(settleTimer);
      window.clearTimeout(enterTimer);
      window.clearTimeout(leaveTimer);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      /* pointer-events-auto：父层（弹窗牌面 fixed 层）是 pointer-events-none，这里要翻回来才能收到 hover */
      className={`pointer-events-auto relative w-full [perspective:1100px] ${className}`}
    >
      <div
        ref={cardRef}
        className="tarot-foil-card relative aspect-[2100/3600] w-full touch-none [transform-style:preserve-3d]"
      >
        {/* ① 整体牌面（一张拍平图）：先出这张，分层就绪后隐藏 */}
        <img
          className="tarot-foil-thumb pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
          src={`${base}/thumb.webp`}
          alt=""
          draggable={false}
          hidden={layersReady}
        />

        {/* ② 分层视图：artwork + edge 就绪后才显示 */}
        {layersReady && (
          <>
            <img
              className="tarot-foil-artwork pointer-events-none absolute inset-0 h-full w-full select-none"
              src={`${base}/artwork.webp`}
              alt=""
              draggable={false}
            />
            <img
              className="pointer-events-none absolute inset-0 h-full w-full select-none"
              src={`${base}/edge.webp`}
              alt=""
              draggable={false}
            />
            {/* rainbow 箔面：只在分层就绪后挂载——资源没到位时绝不出现 */}
            <div className="tarot-foil-rainbow pointer-events-none absolute inset-0" />
            {/* 序号 / 标题浮层（同向视差）——缺层时 onError 隐藏 */}
            {hasNumber && (
              <img
                className="tarot-foil-number pointer-events-none absolute inset-0 h-full w-full select-none"
                src={`${base}/number.webp`}
                alt=""
                draggable={false}
                onError={() => setHasNumber(false)}
              />
            )}
            {hasTitle && (
              <img
                className="tarot-foil-title pointer-events-none absolute inset-0 h-full w-full select-none"
                src={`${base}/title.webp`}
                alt=""
                draggable={false}
                onError={() => setHasTitle(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
