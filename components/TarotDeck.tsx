"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { dic, type Lang } from "@/lib/i18n";
import TarotFoilCard from "@/components/TarotFoilCard";
import {
  ALL_CARDS,
  SUITS,
  cardName,
  type TarotCard,
  type TarotSuit,
} from "@/lib/tarot-deck";

type Filter = "all" | "major" | TarotSuit;

/** SSR 安全：服务端退化为 useEffect */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * 塔罗牌库（demo）：
 * - 筛选 chips（全部 / 大阿卡纳 / 四花色）+ 搜索（中英名 / 拼音全拼 / 首字母 / 关键词）
 * - 78 张网格 + 点击 → 详情状态（?card=<id>，可分享）
 * - 过渡（FLIP，不走 View Transitions——避免复用主题擦除）：
 *   卡片从列表位置放大为弹窗牌面（420ms）；遮罩独立淡入（tarot-veil）；
 *   导航栏由 html.tarot-open 同步收紧（时长与卡片同拍）。
 * 卡面：愚者为分层闪卡（TarotFoilCard，占位）；其余为线框占位。
 */
export default function TarotDeck({ lang }: { lang: Lang }) {
  const tt = dic[lang].sections.works.tarot.deck;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<TarotCard | null>(null);

  const faceRef = useRef<HTMLDivElement>(null);
  const fromRectRef = useRef<DOMRect | null>(null);

  const openCard = (card: TarotCard) => {
    const el = document.getElementById(`tarot-card-${card.id}`);
    fromRectRef.current = el?.getBoundingClientRect() ?? null;
    document.documentElement.classList.add("tarot-open");
    window.dispatchEvent(new Event("tarot-open"));
    setActive(card);
    window.history.replaceState(null, "", `?card=${card.id}`);
  };

  const closeCard = () => {
    const node = faceRef.current;
    const cardEl = active ? document.getElementById(`tarot-card-${active.id}`) : null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finish = () => {
      document.documentElement.classList.remove("tarot-open");
      window.dispatchEvent(new Event("tarot-close"));
      setActive(null);
      window.history.replaceState(null, "", window.location.pathname);
    };

    if (!node || !cardEl || reduce) {
      finish();
      return;
    }

    /* 第一拍：面板背景先收（回到牌面区域）+ 文字先撤 + 遮罩淡出 + 导航展开 */
    document.querySelector(".tarot-panel-bg")?.classList.add("tarot-panel-bg-out");
    document.querySelector(".tarot-panel-content")?.classList.add("tarot-panel-content-out");
    document.querySelector(".tarot-veil")?.classList.add("tarot-veil-out");
    document.documentElement.classList.remove("tarot-open");
    window.dispatchEvent(new Event("tarot-close"));

    /* 第二拍：背景收完后再让牌面缩回列表卡片 */
    window.setTimeout(() => {
      const from = node.getBoundingClientRect();
      const to = cardEl.getBoundingClientRect();
      if (!from.width || !to.width) {
        finish();
        return;
      }
      node.style.setProperty("--flip-x", `${to.left - from.left}px`);
      node.style.setProperty("--flip-y", `${to.top - from.top}px`);
      node.style.setProperty("--flip-sx", `${to.width / from.width}`);
      node.style.setProperty("--flip-sy", `${to.height / from.height}`);
      node.classList.remove("tarot-face-anim");
      node.classList.add("tarot-face-out");
      window.setTimeout(finish, 360);
    }, 220);
  };

  /* FLIP：fixed 牌面层对齐槽位 rect，随后从「卡片位置与尺寸」过渡到槽位（420ms） */
  useIsoLayoutEffect(() => {
    if (!active) return;
    const node = faceRef.current;
    const from = fromRectRef.current;
    fromRectRef.current = null;
    if (!node) return;

    const slot = document.querySelector("[data-face-slot]") as HTMLElement | null;
    if (!slot) return;
    const to = slot.getBoundingClientRect();
    if (!to.width || !to.height) return;

    /* fixed 牌面层定位到槽位（尺寸与位置随槽位）——必须先定位，
       否则牌面层是 0×0 不可见（?card= 深链打开时没有起始卡片 rect，此步尤其关键） */
    node.style.left = `${to.left}px`;
    node.style.top = `${to.top}px`;
    node.style.width = `${to.width}px`;
    node.style.height = `${to.height}px`;

    /* 面板背景的展开起点 = 牌面 rect（相对面板边框盒） */
    const panelBg = document.querySelector(".tarot-panel-bg") as HTMLElement | null;
    const panel = panelBg?.parentElement ?? null;
    if (panelBg && panel) {
      const pr = panel.getBoundingClientRect();
      panelBg.style.setProperty("--bg-t", `${to.top - pr.top}px`);
      panelBg.style.setProperty("--bg-b", `${pr.bottom - to.bottom}px`);
      panelBg.style.setProperty("--bg-l", `${to.left - pr.left}px`);
      panelBg.style.setProperty("--bg-r", `${pr.right - to.right}px`);
    }

    /* 深链 / 无起始卡片 / reduced-motion：定位完就结束，不做 FLIP */
    if (!from) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const sx = from.width / to.width;
    const sy = from.height / to.height;

    /* CSS animation 驱动 FLIP：起点写入变量 + 重启动画类（比 inline transition 稳，
       不受并帧影响）。transform-origin 与动画定义见 globals.css .tarot-face-anim。 */
    node.style.setProperty("--flip-x", `${dx}px`);
    node.style.setProperty("--flip-y", `${dy}px`);
    node.style.setProperty("--flip-sx", `${sx}`);
    node.style.setProperty("--flip-sy", `${sy}`);
    node.classList.remove("tarot-face-anim");
    void node.offsetWidth; // 强制 reflow：让移除生效后再加，动画才能重播
    node.classList.add("tarot-face-anim");
  }, [active]);

  /* 首次挂载：?card=<id> 直接打开（分享 / 书签） */
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("card");
    if (!id) return;
    const card = ALL_CARDS.find((c) => c.id === id);
    if (card) {
      document.documentElement.classList.add("tarot-open");
      window.dispatchEvent(new Event("tarot-open"));
      setActive(card);
    }
  }, []);

  /* 弹窗：Esc 关闭 + 锁滚动并补偿滚动条宽度（防背景右偏） */
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCard();
    };
    window.addEventListener("keydown", onKey);
    const prevPad = document.body.style.paddingRight;
    const sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (sw > 0) document.body.style.paddingRight = `${sw}px`;
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.style.paddingRight = prevPad;
    };
  }, [active]);

  const filtered = useMemo(() => {
    const raw = query.trim();
    const k = raw.toLowerCase();
    return ALL_CARDS.filter((c) => {
      if (filter === "major" && c.arcana !== "major") return false;
      if (filter !== "all" && filter !== "major" && c.suit !== filter) return false;
      if (!raw) return true;
      return (
        c.name.includes(raw) ||
        c.nameEn.toLowerCase().includes(k) ||
        c.pinyin.includes(k) ||
        c.initials.includes(k) ||
        c.keywords.some((w) => w.includes(raw)) ||
        c.keywordsEn.some((w) => w.toLowerCase().includes(k)) ||
        c.id.includes(k)
      );
    });
  }, [query, filter]);

  const majors = filtered.filter((c) => c.arcana === "major");
  const minorOf = (suit: TarotSuit) => filtered.filter((c) => c.suit === suit);
  const minorCount = filtered.filter((c) => c.arcana === "minor").length;

  const chips: Array<{ id: Filter; label: string }> = [
    { id: "all", label: tt.chipAll },
    { id: "major", label: tt.major },
    ...SUITS.map((s) => ({ id: s.id as Filter, label: lang === "zh" ? s.name : s.nameEn })),
  ];

  const suitMeta = (suit?: TarotSuit) => SUITS.find((s) => s.id === suit);

  return (
    <>
      {/* 筛选 chips */}
      <div className="mt-8 flex flex-wrap gap-2 font-mono text-xs">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            className={`border px-2.5 py-1 transition-colors ${
              filter === c.id
                ? "border-accent text-accent"
                : "border-rule text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 搜索：细线抽屉式，右侧实时计数 */}
      <div className="mt-6 flex items-baseline gap-4 border-b border-rule pb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tt.searchPlaceholder}
          aria-label={tt.searchLabel}
          className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted/60"
        />
        <span className="shrink-0 font-mono text-xs text-muted">
          {filtered.length} / {ALL_CARDS.length} {tt.cards}
        </span>
      </div>

      {/* 大阿卡纳 */}
      {majors.length > 0 && (
        <section className="mt-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-2xl font-semibold">{tt.major}</h2>
            <span className="shrink-0 font-mono text-xs text-muted">
              {majors.length} {tt.cards}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{tt.majorNote}</p>
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {majors.map((card) => (
              <CardTile key={card.id} card={card} lang={lang} onOpen={() => openCard(card)} />
            ))}
          </div>
        </section>
      )}

      {/* 小阿卡纳：总标题（56 张，按花色分四节） */}
      {minorCount > 0 && (
        <div className="mt-14 border-t border-rule pt-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-2xl font-semibold">{tt.minor}</h2>
            <span className="shrink-0 font-mono text-xs text-muted">
              {minorCount} {tt.cards}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{tt.minorNote}</p>
        </div>
      )}

      {/* 小阿卡纳：四个花色 */}
      {SUITS.map((suit) => {
        const list = minorOf(suit.id);
        if (list.length === 0) return null;
        return (
          <section key={suit.id} className="mt-10">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-serif text-xl font-semibold">
                {lang === "zh" ? suit.name : suit.nameEn}
                <span className="ml-2 font-mono text-xs font-normal text-muted">
                  {lang === "zh" ? suit.element : suit.elementEn} ·{" "}
                  {(lang === "zh" ? suit.keywords : suit.keywordsEn).join(" / ")}
                </span>
              </h3>
              <span className="shrink-0 font-mono text-xs text-muted">
                {list.length} {tt.cards}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {list.map((card) => (
                <CardTile key={card.id} card={card} lang={lang} onOpen={() => openCard(card)} />
              ))}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && <p className="mt-12 text-muted">{tt.searchEmpty}</p>}

      {/* 卡牌详情：牌面独立 fixed 层（z-70，不被面板裁剪）+ 面板（z-60，背景第二拍展开） */}
      {active && (
        <>
          {/* 遮罩：z-40（低于导航），延迟到牌面到位后淡入 */}
          <div className="tarot-veil fixed inset-0 z-40 bg-ink/50" onClick={closeCard} aria-hidden="true" />

          {/* 牌面：fixed 独立层——第一拍就可见，FLIP 全程不被面板/导航裁剪。
              外层保持 pointer-events-none（不挡遮罩/面板点击），
              内层 TarotFoilCard 自带 pointer-events-auto 以接收 hover 视差。 */}
          <div ref={faceRef} data-tarot-face className="pointer-events-none fixed z-[70]" aria-hidden="true">
            <TarotFoilCard cardId={active.id} />
          </div>

          {/* 面板：z-60；背景层从牌面区域向外展开（--bg-* 由脚本写入），文字第二拍淡入 */}
          <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-label={cardName(active, lang)}
              className="pointer-events-auto relative max-h-[92vh] w-full max-w-3xl overflow-hidden"
            >
              <div className="tarot-panel-bg absolute inset-0 border border-rule bg-paper" aria-hidden="true" />
              <div className="tarot-panel-content relative max-h-[92vh] overflow-y-auto p-6 md:p-8">
                <button
                  type="button"
                  onClick={closeCard}
                  aria-label={tt.close}
                  className="absolute right-4 top-3 font-mono text-sm text-muted hover:text-accent"
                >
                  ✕
                </button>

                <div className="grid gap-6 md:grid-cols-[13rem_minmax(0,1fr)]">
                  {/* 牌面槽位：只占位（真实牌面在 fixed 层，位置由脚本按此 rect 对齐） */}
                  <div
                    data-face-slot
                    className="mx-auto aspect-[2100/3600] w-40 md:mx-0 md:w-full"
                    aria-hidden="true"
                  />

                  {/* 内容 */}
                  <div className="min-w-0">
                    <p className="font-mono text-xs tracking-widest text-muted">
                      <span className="text-accent">·</span>{" "}
                      {active.arcana === "major" ? tt.arcanaMajor : tt.arcanaMinor}
                      {active.suit
                        ? ` / ${lang === "zh" ? suitMeta(active.suit)?.name : suitMeta(active.suit)?.nameEn}`
                        : ""}
                    </p>
                    <h2 className="mt-2 font-serif text-3xl font-bold">{cardName(active, lang)}</h2>
                    <p className="mt-1 font-mono text-xs text-muted">
                      {lang === "zh" ? active.nameEn : active.name}
                    </p>

                    <ul className="mt-4 flex flex-wrap gap-2">
                      {(lang === "zh" ? active.keywords : active.keywordsEn).map((w) => (
                        <li key={w} className="border border-rule px-2 py-0.5 font-mono text-xs text-muted">
                          {w}
                        </li>
                      ))}
                    </ul>

                    <p className="mt-6 border-t border-rule pt-4 text-sm leading-relaxed text-muted">
                      {tt.readingNote}
                    </p>

                    <p className="mt-4 font-mono text-[11px] text-muted/70">
                      {lang === "zh" ? "可分享：" : "Permalink: "}?card={active.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/** 单张牌缩略（真实牌面拍平成一张 thumb.webp；hover 仅边框微变，不做 3D 效果） */
function CardTile({ card, lang, onOpen }: { card: TarotCard; lang: Lang; onOpen: () => void }) {
  const name = cardName(card, lang);
  return (
    <button
      type="button"
      id={`tarot-card-${card.id}`}
      onClick={onOpen}
      aria-label={name}
      className="group block w-full text-left"
    >
      <span className="relative block aspect-[2100/3600] w-full overflow-hidden rounded-[2px] border border-rule bg-paper transition-colors group-hover:border-accent">
        <img
          src={`/tarot/${card.id}/thumb.webp`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </span>
    </button>
  );
}
