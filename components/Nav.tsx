"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { dic, type Lang } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import ThemeToggle from "@/components/ThemeToggle";

/** 五栏体系：研思 · 造物 · 游艺 · 纪事 · 关于 */
const ORDER = ["research", "works", "arts", "chronicles", "about"] as const;

const ROUTES: Record<Lang, Record<(typeof ORDER)[number], string>> = {
  zh: {
    research: "/research",
    works: "/works",
    arts: "/arts",
    chronicles: "/chronicles",
    about: "/about",
  },
  en: {
    research: "/en/research",
    works: "/en/works",
    arts: "/en/arts",
    chronicles: "/en/chronicles",
    about: "/en/about",
  },
};

/** GitHub 图标（官方 octicons mark-github-16；外链用，fill 继承 currentColor） */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M6.766 11.328c-2.063-.25-3.516-1.734-3.516-3.656 0-.781.281-1.625.75-2.188-.203-.515-.172-1.609.063-2.062.625-.078 1.468.25 1.968.703.594-.187 1.219-.281 1.985-.281.765 0 1.39.094 1.953.265.484-.437 1.344-.765 1.969-.687.218.422.25 1.515.046 2.047.5.593.766 1.39.766 2.203 0 1.922-1.453 3.375-3.547 3.64.531.344.89 1.094.89 1.954v1.625c0 .468.391.734.86.547C13.781 14.359 16 11.53 16 8.03 16 3.61 12.406 0 7.984 0 3.563 0 0 3.61 0 8.031a7.88 7.88 0 0 0 5.172 7.422c.422.156.828-.125.828-.547v-1.25c-.219.094-.5.156-.75.156-1.031 0-1.64-.562-2.078-1.609-.172-.422-.36-.672-.719-.719-.187-.015-.25-.093-.25-.187 0-.188.313-.328.625-.328.453 0 .844.281 1.25.86.313.452.64.655 1.031.655s.641-.14 1-.5c.266-.265.47-.5.657-.656" />
    </svg>
  );
}

/** GitHub 浮层图标基准尺寸（px，即 h-6）；实际大小 = 基准 × 槽位实测缩放（收紧态 16px = ×2/3） */
const GH_BASE = 24;

/** 图标飞行时长（ms）——与收紧/展开编排（globals.css 的 nav-gh-* 规则）同拍：0.75s 全部落位 */
const GH_FLIGHT_MS = 750;

/** SSR 下退化为 useEffect，避免 useLayoutEffect 的服务端告警（服务端本就不运行 effect） */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * 全站导航卡（唯一悬浮物）：logo + 五栏 + 语言 + 主题 + 快捷图标（返回/主页/刷新），
 * 收紧后中部浮现当前页/文章标题（文章页附底部进度条）。
 *
 * GitHub 图标为**单一浮层节点**（2026-10-15）：最初展开/收紧各一枚条件渲染节点，
 * 切换瞬间瞬换闪烁；现改为浮层（绝对定位于卡片基准层），位置与缩放逐帧实测。
 *
 * **收紧/展开编排（0.75s，同日二稿——治「回程时图标与小标题左右颠倒」）**：
 *  - 向下收紧：品牌与左侧槽位即时收缩（0–0.3s，此时标题被裁剪不可见）→ 标题擦除式
 *    呈现（0.3–0.75s，字符从左向右逐个出现，CSS clip）→ 图标同步缓动右移缩小落位（0–0.75s）；
 *  - 滚动回顶：标题先从右向左逐个消失（0–0.3s）→ 品牌与左侧槽位延迟展开（0.3–0.6s，
 *    此刻标题已不可见，布局位移全在不可见时段发生）→ 图标缓动左移放大（0–0.75s）；
 *  - 展开方向图标目标取**缓存的展开位**（固定目标，不追随槽位展开而右滑的实时位置，避免过冲）。
 *
 * 槽位只留占位：品牌槽位常驻（宽度随状态平滑收放 + 静态图标兜底 SSR/no-JS），
 * 小标题后槽位常驻保证截断版式不变。
 */
export default function Nav({ lang }: { lang: Lang }) {
  const pathname = usePathname() ?? "/";
  const t = dic[lang].nav;
  const routes = ROUTES[lang];

  // 滚动收紧：离开页顶后导航变浮动圆角卡片，logo 与留白同步收缩
  const [compact, setCompact] = useState(false);
  // 中部信息：文章详情页 = 标题 + 进度；其他页 = 页面标题
  const [info, setInfo] = useState<{ title: string; pct: number | null }>({ title: "", pct: null });
  /** DOM 引用缓存：文章页结构在一次路由内不变，避免每个滚动帧重复 querySelector */
  const domCache = useRef<{ article: HTMLElement | null; prose: Element | null; h1: Element | null; ready: boolean }>(
    { article: null, prose: null, h1: null, ready: false }
  );
  const compactRef = useRef(compact);
  compactRef.current = compact;

  /* ---------- GitHub 浮层图标 ---------- */

  /** 浮层基准层（inset-0 = 与槽位测量同一坐标系）、两处槽位、浮层本体 */
  const ghLayerRef = useRef<HTMLDivElement | null>(null);
  const ghBrandSlotRef = useRef<HTMLAnchorElement | null>(null);
  const ghMidSlotRef = useRef<HTMLSpanElement | null>(null);
  const ghFloatRef = useRef<HTMLAnchorElement | null>(null);
  /** 浮层当前视觉位置（基准层局部坐标）；x < 0 = 未就位（首帧前 / 无目标隐藏后） */
  const ghCur = useRef({ x: -1, y: -1, s: 1 });
  /** 展开位缓存（挂载时/窗口缩放/字体就绪时实测）——回程飞行的固定目标 */
  const ghBrandBerth = useRef<{ x: number; y: number; s: number } | null>(null);
  const ghRaf = useRef(0);
  const ghFirstRun = useRef(true);
  /** 浮层就位后接管交互；此前由品牌槽位里的静态图标兜底（覆盖 SSR 首帧与 no-JS） */
  const [ghReady, setGhReady] = useState(false);

  /** 实测活动槽位（收紧态 = 小标题后；否则 = 品牌右侧）；纯测量，不写缓存 */
  const ghMeasureLive = useCallback((): { x: number; y: number; s: number } | null => {
    const layer = ghLayerRef.current;
    const slot = compactRef.current ? ghMidSlotRef.current : ghBrandSlotRef.current;
    if (!layer || !slot) return null;
    const lr = layer.getBoundingClientRect();
    const sr = slot.getBoundingClientRect();
    if (sr.width === 0) return null; // 窄屏：信息区整体隐藏；或左槽位正处于收放过渡（宽度 0）
    return { x: sr.left - lr.left, y: sr.top - lr.top, s: sr.width / GH_BASE };
  }, []);

  /** 活动槽位中心的 Y（基准层局部）——不受宽度影响（左槽位收放期间宽度为 0，高度始终可测），纵向软跟随用 */
  const ghSlotCenterY = useCallback((): number | null => {
    const layer = ghLayerRef.current;
    const slot = compactRef.current ? ghMidSlotRef.current : ghBrandSlotRef.current;
    if (!layer || !slot) return null;
    const lr = layer.getBoundingClientRect();
    const sr = slot.getBoundingClientRect();
    if (sr.height === 0) return null;
    return sr.top + sr.height / 2 - lr.top;
  }, []);

  /** 飞行目标：收紧 → 实时小标题槽位（随布局平滑滑动，逐帧重测）；
      展开 → 缓存的展开位（固定目标——左槽位此刻正在延迟展开，实时测量是过渡中间值，不可信） */
  const ghFlightTarget = useCallback((): { x: number; y: number; s: number } | null => {
    if (compactRef.current) return ghMeasureLive();
    return ghBrandBerth.current ?? ghMeasureLive();
  }, [ghMeasureLive]);

  /**
   * duration = 0 → 直接就位（首帧 / 窗口缩放；展开态顺带刷新展开位缓存——只信稳态测量）；
   * 否则 rAF 缓动：收紧方向逐帧重测槽位（槽位在布局过渡中持续滑动，只有逐帧重测才能贴住）；
   * 展开方向用固定目标（见 ghFlightTarget）。过程中再次切换（快速来回滚动）先 cancel
   * 再从当前视觉位置重新起步，不跳变。
   */
  const ghAnimate = useCallback(
    (duration: number) => {
      cancelAnimationFrame(ghRaf.current);
      const el = ghFloatRef.current;
      if (!el) return;
      const paint = (x: number, y: number, s: number) => {
        ghCur.current = { x, y, s };
        el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
        el.style.visibility = "";
      };
      const hide = () => {
        ghCur.current = { x: -1, y: -1, s: 1 };
        el.style.visibility = "hidden";
      };
      const live = ghMeasureLive();
      /* 展开方向的飞行目标：优先缓存展开位（此时左槽位正延迟展开，实时宽度不可信） */
      const flew = duration > 0 && !compactRef.current;
      const target = flew ? ghBrandBerth.current ?? live : live;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (duration <= 0 || reduceMotion || ghCur.current.x < 0) {
        if (target) {
          // 稳态（无过渡在跑）的展开位才可信 → 更新缓存
          if (!compactRef.current && duration <= 0) ghBrandBerth.current = target;
          paint(target.x, target.y, target.s);
        } else {
          hide();
        }
        setGhReady(true);
        return;
      }
      if (!target) {
        hide();
        return;
      }
      const start = { ...ghCur.current };
      const fixed = compactRef.current ? null : target; // 展开：固定目标；收紧：逐帧重测
      const t0 = performance.now();
      let prevNow = t0;
      let yCur = start.y; // 纵向软跟随的当前值
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        // easeInOutCubic：横向缓动（Ting 指定的 0.75s 渐变）
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        const cur = fixed ?? ghFlightTarget();
        if (!cur) {
          hide();
          return;
        }
        const s = start.s + (cur.s - start.s) * e;
        /* 纵向不与横向共用缓动：布局（文字行/槽位中心）按 300ms 曲线移动，
           共用缓动会滞后于行中心（实测 ±7px 高度偏差）；改为帧率归一化指数软跟随，
           逐帧贴住活动槽位中心，末帧精确落位 */
        const cy = ghSlotCenterY();
        const dt = Math.min(now - prevNow, 64);
        prevNow = now;
        if (cy !== null) {
          yCur += (cy - 12 * s - yCur) * (1 - Math.exp(-dt / 22));
          if (p >= 1) yCur = cy - 12 * s;
        } else {
          yCur = start.y + (cur.y - start.y) * e;
        }
        paint(start.x + (cur.x - start.x) * e, yCur, s);
        if (p < 1) ghRaf.current = requestAnimationFrame(step);
      };
      ghRaf.current = requestAnimationFrame(step);
      setGhReady(true);
    },
    [ghMeasureLive, ghFlightTarget, ghSlotCenterY],
  );

  /* 挂载：浮层直接就位（同一帧内与品牌槽位静态图标交棒，无闪跳） */
  useIsoLayoutEffect(() => {
    ghAnimate(0);
    return () => cancelAnimationFrame(ghRaf.current);
  }, [ghAnimate]);

  /* 收紧状态切换:浮层按 0.75s 编排飞向新位置（挂载首轮已由上面 effect 直接就位） */
  useIsoLayoutEffect(() => {
    if (ghFirstRun.current) {
      ghFirstRun.current = false;
      return;
    }
    ghAnimate(GH_FLIGHT_MS);
  }, [compact, ghAnimate]);

  /* 窗口尺寸变化：槽位整体跳变，直接就位不补间（展开态顺带刷新展开位缓存） */
  useEffect(() => {
    const onResize = () => ghAnimate(0);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [ghAnimate]);

  /* 字体晚加载（display:swap）会挪动品牌宽度 → 槽位位移，加载完成后重新对位 */
  useEffect(() => {
    let cancelled = false;
    void document.fonts?.ready?.then(() => {
      if (!cancelled) ghAnimate(0);
    });
    return () => {
      cancelled = true;
    };
  }, [ghAnimate]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const cache = domCache.current;
      if (!cache.ready) {
        cache.article = document.querySelector("article");
        cache.prose = cache.article?.querySelector(".prose") ?? null;
        cache.h1 = cache.article?.querySelector("h1") ?? null;
        cache.ready = true;
      }
      const y = window.scrollY;
      // 滞回收紧（2026-10-15）：只在单一阈值上跨线时状态来回闪换 → 收紧 >24 / 展开 <12；
      // 值没变就不 setState：否则每个滚动帧都会重渲染整张导航卡
      setCompact((prev) => {
        const next = prev ? y > 12 : y > 24;
        return next === prev ? prev : next;
      });

      const { article, prose, h1 } = cache;
      if (article && prose) {
        const rect = article.getBoundingClientRect();
        const total = article.offsetHeight - window.innerHeight;
        const passed = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
        const title = h1?.textContent?.trim() ?? "";
        const pct = total > 0 ? passed / total : 1;
        setInfo((prev) => (prev.title === title && prev.pct === pct ? prev : { title, pct }));
      } else {
        const title = document.querySelector("main h1")?.textContent?.trim() ?? "";
        setInfo((prev) => (prev.title === title && prev.pct === null ? prev : { title, pct: null }));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* 路由切换时重置（避免上一篇的标题残留；同时失效 DOM 缓存，等新文章挂载后重新查询） */
  useEffect(() => {
    setCompact(false);
    setInfo({ title: "", pct: null });
    const cache = domCache.current;
    cache.article = null;
    cache.prose = null;
    cache.h1 = null;
    cache.ready = false;
  }, [pathname]);

  // 语言切换：zh ↔ en 对等路径
  const otherHref =
    lang === "zh"
      ? pathname === "/"
        ? "/en"
        : `/en${pathname}`
      : pathname.replace(/^\/en/, "") || "/";

  const homeHref = lang === "zh" ? "/" : "/en";
  const iconBtn =
    "flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:text-accent";
  const iconSvg = "h-4 w-4";

  return (
    <header className={`sticky top-0 z-50 ${compact ? "nav-is-compact" : ""}`}>
      {/* 全宽底衬：纸色 + 毛玻璃；不放 hairline——会被卡片的毛玻璃糊掉（只在两侧残留） */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-paper/95 backdrop-blur-sm transition-opacity duration-300 ${
          compact ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        className={`relative mx-auto max-w-5xl transition-all duration-300 ${
          compact ? "px-3 pt-2.5" : "px-0 pt-0"
        }`}
      >
        {/* 卡片：边框恒为 1px（透明 ↔ rule），圆角与 blur 恒定——只过渡颜色 / 阴影 / 内边距 */}
        <div
          className={`relative flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl border bg-paper/0 px-6 backdrop-blur-md transition-all duration-300 ${
            compact ? "border-rule bg-paper/90 py-2 shadow-sm" : "border-transparent py-3.5"
          }`}
        >
          <Link
            href={homeHref}
            className={`nav-brand shrink-0 font-serif font-bold tracking-wide hover:text-accent ${
              compact ? "text-lg" : "text-2xl"
            }`}
          >
            Ting
          </Link>

          {/* GitHub 浮层图标：单一节点（绝对定位），JS 逐帧设定 位置+缩放。
              展开态停靠品牌右侧（24px），收紧后平滑缩小并移到小标题之后（16px） */}
          <div ref={ghLayerRef} className="pointer-events-none absolute inset-0 z-20">
            <Link
              ref={ghFloatRef}
              href={SITE.links.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className={`pointer-events-auto absolute left-0 top-0 flex h-6 w-6 origin-top-left items-center justify-center text-ink transition-colors hover:text-accent ${
                ghReady ? "" : "invisible"
              }`}
            >
              <GitHubIcon className="h-full w-full" />
            </Link>
          </div>

          {/* 槽位 1（品牌右侧）：常驻占位——宽度按编排收放（收紧即时 / 展开延迟到标题擦除后，
              布局位移只发生在标题不可见的时段）；内含静态图标兜底 SSR 首帧 / no-JS，
              浮层就位后隐去（invisible），同时 min-w-0 + overflow-hidden 保证宽度可收为 0 */}
          <Link
            ref={ghBrandSlotRef}
            href={SITE.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="GitHub"
            className={`nav-gh-slot inline-flex h-6 min-w-0 shrink-0 items-center text-ink transition-colors hover:text-accent ${
              ghReady ? "invisible" : ""
            }`}
          >
            <GitHubIcon className="h-6 w-6" />
          </Link>

          {/* 中部信息区（仅收紧后浮现，窄屏隐藏）：当前页/文章标题 + 阅读进度。
              收紧态 GitHub 图标停靠标题文字之后——此处常驻 16px 槽位，小标题截断版式与既有约定一致 */}
          <div aria-hidden={!compact} className="hidden min-w-0 flex-1 px-2 md:block">
            <div className="flex items-center gap-1.5">
              {/* 标题：擦除式显隐（字符从左向右逐个呈现 / 从右向左逐个消失），见 globals.css */}
              <p className="nav-gh-title min-w-0 truncate font-serif text-sm font-semibold">{info.title}</p>
              <span ref={ghMidSlotRef} className="nav-mid-slot h-4 w-4 shrink-0" aria-hidden />
            </div>
            {info.pct !== null ? (
              <p className="nav-gh-sub font-mono text-[11px] leading-tight text-muted">
                {Math.round(info.pct * 100)}%
              </p>
            ) : null}
          </div>

          <nav
            className={`flex flex-wrap items-center gap-x-5 gap-y-1 font-serif font-semibold transition-all duration-300 ${
              compact ? "text-base" : "text-lg"
            }`}
          >
            {ORDER.map((key) => (
              <Link key={key} href={routes[key]} className="hover:text-accent">
                {t[key]}
              </Link>
            ))}
            <Link href={otherHref} className="hover:text-accent" aria-label="Switch language">
              {lang === "zh" ? "EN" : "中"}
            </Link>
            <ThemeToggle />
            {/* 快捷图标：返回 / 主页 / 刷新——并入导航卡，全站常驻 */}
            <span aria-hidden className="hidden h-4 w-px bg-rule sm:block" />
            <span className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => history.back()}
                className={iconBtn}
                aria-label={t.back}
                title={t.back}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={iconSvg}
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <Link href={homeHref} className={iconBtn} aria-label={t.home} title={t.home}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={iconSvg}
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => location.reload()}
                className={iconBtn}
                aria-label={t.refresh}
                title={t.refresh}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={iconSvg}
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </span>
          </nav>

          {/* 阅读进度条：文章页收紧后压在卡片底边 */}
          {info.pct !== null ? (
            <div
              className={`absolute inset-x-6 bottom-0 h-0.5 overflow-hidden rounded-full bg-rule transition-opacity duration-300 ${
                compact ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden
            >
              <div
                className="h-full bg-accent transition-[width] duration-150"
                style={{ width: `${Math.round(info.pct * 100)}%` }}
              />
            </div>
          ) : null}
        </div>
      </div>
      {/* hairline：独立 1px 色条压在毛玻璃之上——保证全页宽清晰（收紧时淡出） */}
      <div
        aria-hidden
        className={`absolute inset-x-0 bottom-0 h-px bg-rule transition-opacity duration-300 ${
          compact ? "opacity-0" : "opacity-100"
        }`}
      />
    </header>
  );
}
