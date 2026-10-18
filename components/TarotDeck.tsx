"use client";

import { useEffect, useMemo, useState } from "react";
import { dic, type Lang } from "@/lib/i18n";
import {
  ALL_CARDS,
  SUITS,
  cardMark,
  cardName,
  type TarotCard,
  type TarotSuit,
} from "@/lib/tarot-deck";

type Filter = "all" | "major" | TarotSuit;

/**
 * 塔罗牌库（demo）：
 * - 筛选 chips（全部 / 大阿卡纳 / 权杖 / 圣杯 / 宝剑 / 星币）
 * - 搜索：中文名、英文名、拼音全拼、拼音首字母、关键词
 * - 78 张网格（3/4/5/6 列）+ 点击翻开预览（3D 翻牌；URL ?card=<id> 可分享）
 * 卡面为扁平占位（分层闪卡效果待接入：替换 CardTile 与弹窗牌面）。
 */
export default function TarotDeck({ lang }: { lang: Lang }) {
  const tt = dic[lang].sections.works.tarot.deck;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<TarotCard | null>(null);
  const [flipped, setFlipped] = useState(false);

  const openCard = (card: TarotCard) => {
    setActive(card);
    window.history.replaceState(null, "", `?card=${card.id}`);
  };

  const closeCard = () => {
    setActive(null);
    window.history.replaceState(null, "", window.location.pathname);
  };

  /* 首次挂载：?card=<id> 直接打开（分享 / 书签） */
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("card");
    if (!id) return;
    const card = ALL_CARDS.find((c) => c.id === id);
    if (card) setActive(card);
  }, []);

  /* 弹窗：Esc 关闭 + 锁滚动并补偿滚动条宽度（防背景右偏）+ 翻牌时序 */
  useEffect(() => {
    if (!active) {
      setFlipped(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActive(null);
        window.history.replaceState(null, "", window.location.pathname);
      }
    };
    window.addEventListener("keydown", onKey);
    const prevPad = document.body.style.paddingRight;
    const sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (sw > 0) document.body.style.paddingRight = `${sw}px`;
    const timer = window.setTimeout(() => setFlipped(true), 90);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.style.paddingRight = prevPad;
      window.clearTimeout(timer);
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

      {/* 卡牌预览弹窗：牌面 3D 翻开（先见牌背，再翻到正面） */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={cardName(active, lang)}
          onClick={closeCard}
        >
          <div
            className="relative w-full max-w-3xl border border-rule bg-paper p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeCard}
              aria-label={tt.close}
              className="absolute right-4 top-3 font-mono text-sm text-muted hover:text-accent"
            >
              ✕
            </button>

            <div className="grid gap-6 md:grid-cols-[13rem_minmax(0,1fr)]">
              {/* 翻牌容器：perspective + preserve-3d；reduced-motion 直接显示牌面 */}
              <div className="mx-auto w-40 [perspective:1000px] md:mx-0 md:w-full">
                <div
                  className={`relative aspect-[2/3] w-full transition-transform duration-500 ease-out [transform-style:preserve-3d] ${
                    flipped ? "[transform:rotateY(180deg)]" : ""
                  } motion-reduce:transition-none`}
                >
                  {/* 牌背（初始朝向） */}
                  <div className="absolute inset-0 rounded-[3px] border border-rule bg-paper [backface-visibility:hidden] motion-reduce:hidden">
                    <span className="absolute inset-3 border border-rule/70" />
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="h-3 w-3 rotate-45 bg-accent" />
                    </span>
                  </div>
                  {/* 牌面（翻转 180° 后朝向观者） */}
                  <div className="absolute inset-0 rounded-[3px] border border-rule bg-paper [backface-visibility:hidden] [transform:rotateY(180deg)] motion-reduce:[transform:none]">
                    <span className="absolute inset-3 border border-rule/70" />
                    <span className="absolute inset-x-0 top-4 text-center font-mono text-xs tracking-widest text-muted">
                      {cardMark(active, lang)}
                    </span>
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="h-3 w-3 rotate-45 border border-accent" />
                    </span>
                    <span className="absolute inset-x-2 bottom-4 text-center font-serif text-sm font-semibold leading-tight">
                      {cardName(active, lang)}
                    </span>
                  </div>
                </div>
              </div>

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
      )}
    </>
  );
}

/** 单张牌缩略（扁平占位；hover 仅边框微变，不做 3D 效果） */
function CardTile({ card, lang, onOpen }: { card: TarotCard; lang: Lang; onOpen: () => void }) {
  const name = cardName(card, lang);
  return (
    <button type="button" onClick={onOpen} aria-label={name} className="group block w-full text-left">
      <span className="relative block aspect-[2/3] w-full rounded-[2px] border border-rule bg-paper transition-colors group-hover:border-accent">
        <span className="absolute inset-1.5 border border-rule/60" />
        <span className="absolute inset-x-0 top-2.5 text-center font-mono text-[10px] tracking-widest text-muted">
          {cardMark(card, lang)}
        </span>
        <span className="absolute inset-0 grid place-items-center">
          <span className="h-2 w-2 rotate-45 border border-accent/80" />
        </span>
        <span className="absolute inset-x-1 bottom-2 text-center font-serif text-[11px] font-semibold leading-tight">
          {name}
        </span>
      </span>
    </button>
  );
}
