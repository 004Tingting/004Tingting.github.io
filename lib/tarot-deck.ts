/**
 * 塔罗牌库数据（韦特体系，78 张）。
 * 纯静态数据、无 Node API —— 供服务端页面与客户端组件共用（"use client" 可安全 import）。
 * 牌义正文待 Ting 接入（当前为关键词 + 占位）；命名：major-{0-21} / {suit}-{1-14}。
 */

export type TarotSuit = "wands" | "cups" | "swords" | "pentacles";

export type TarotCard = {
  id: string;
  /** 中文名（如「权杖二」「愚者」） */
  name: string;
  /** 英文名（如 "Two of Wands" / "The Fool"） */
  nameEn: string;
  arcana: "major" | "minor";
  suit?: TarotSuit;
  /** 大阿卡纳 0–21；小阿卡纳 1–14（1 = 首牌，11–14 = 侍从/骑士/王后/国王） */
  number: number;
  /** 中文关键词（2 个） */
  keywords: string[];
  keywordsEn: string[];
};

/* ---------- 大阿卡纳（22） ---------- */

const MAJOR_DEFS: Array<[string, string, [string, string], [string, string]]> = [
  ["愚者", "The Fool", ["开始", "冒险"], ["Beginnings", "Leap of faith"]],
  ["魔术师", "The Magician", ["意志", "创造"], ["Will", "Creation"]],
  ["女祭司", "The High Priestess", ["直觉", "秘密"], ["Intuition", "Secrets"]],
  ["女皇", "The Empress", ["丰饶", "滋养"], ["Abundance", "Nurture"]],
  ["皇帝", "The Emperor", ["秩序", "权威"], ["Order", "Authority"]],
  ["教皇", "The Hierophant", ["传统", "教导"], ["Tradition", "Teaching"]],
  ["恋人", "The Lovers", ["选择", "结合"], ["Choice", "Union"]],
  ["战车", "The Chariot", ["前进", "胜利"], ["Drive", "Victory"]],
  ["力量", "Strength", ["勇气", "柔韧"], ["Courage", "Gentleness"]],
  ["隐者", "The Hermit", ["内省", "独处"], ["Introspection", "Solitude"]],
  ["命运之轮", "Wheel of Fortune", ["变化", "周期"], ["Change", "Cycles"]],
  ["正义", "Justice", ["公正", "平衡"], ["Justice", "Balance"]],
  ["倒吊人", "The Hanged Man", ["等待", "牺牲"], ["Suspension", "Sacrifice"]],
  ["死神", "Death", ["结束", "转变"], ["Endings", "Transition"]],
  ["节制", "Temperance", ["调和", "耐心"], ["Balance", "Patience"]],
  ["恶魔", "The Devil", ["束缚", "欲望"], ["Bondage", "Desire"]],
  ["塔", "The Tower", ["崩塌", "警醒"], ["Rupture", "Awakening"]],
  ["星星", "The Star", ["希望", "疗愈"], ["Hope", "Healing"]],
  ["月亮", "The Moon", ["幻象", "不安"], ["Illusion", "Unease"]],
  ["太阳", "The Sun", ["活力", "澄明"], ["Vitality", "Clarity"]],
  ["审判", "Judgement", ["召唤", "清算"], ["Calling", "Reckoning"]],
  ["世界", "The World", ["完成", "圆满"], ["Completion", "Wholeness"]],
];

export const MAJOR_CARDS: TarotCard[] = MAJOR_DEFS.map(([name, nameEn, keywords, keywordsEn], i) => ({
  id: `major-${i}`,
  name,
  nameEn,
  arcana: "major",
  number: i,
  keywords,
  keywordsEn,
}));

/* ---------- 小阿卡纳（56） ---------- */

export const SUITS: Array<{
  id: TarotSuit;
  name: string;
  nameEn: string;
  element: string;
  elementEn: string;
  keywords: [string, string];
  keywordsEn: [string, string];
}> = [
  { id: "wands", name: "权杖", nameEn: "Wands", element: "火", elementEn: "Fire", keywords: ["行动", "热情"], keywordsEn: ["Action", "Passion"] },
  { id: "cups", name: "圣杯", nameEn: "Cups", element: "水", elementEn: "Water", keywords: ["情感", "关系"], keywordsEn: ["Feeling", "Relationship"] },
  { id: "swords", name: "宝剑", nameEn: "Swords", element: "风", elementEn: "Air", keywords: ["思想", "冲突"], keywordsEn: ["Mind", "Conflict"] },
  { id: "pentacles", name: "星币", nameEn: "Pentacles", element: "土", elementEn: "Earth", keywords: ["物质", "劳作"], keywordsEn: ["Matter", "Craft"] },
];

/** 牌面数字（1 = 首牌；11–14 = 侍从 / 骑士 / 王后 / 国王） */
const RANKS: Array<{ zh: string; en: string; keyZh: string; keyEn: string }> = [
  { zh: "首牌", en: "Ace", keyZh: "起点", keyEn: "Seed" },
  { zh: "二", en: "Two", keyZh: "权衡", keyEn: "Weighing" },
  { zh: "三", en: "Three", keyZh: "开展", keyEn: "Growth" },
  { zh: "四", en: "Four", keyZh: "稳定", keyEn: "Stability" },
  { zh: "五", en: "Five", keyZh: "冲突", keyEn: "Conflict" },
  { zh: "六", en: "Six", keyZh: "调和", keyEn: "Harmony" },
  { zh: "七", en: "Seven", keyZh: "审视", keyEn: "Review" },
  { zh: "八", en: "Eight", keyZh: "推进", keyEn: "Progress" },
  { zh: "九", en: "Nine", keyZh: "临界", keyEn: "Threshold" },
  { zh: "十", en: "Ten", keyZh: "收束", keyEn: "Culmination" },
  { zh: "侍从", en: "Page", keyZh: "讯息", keyEn: "Message" },
  { zh: "骑士", en: "Knight", keyZh: "行动", keyEn: "Action" },
  { zh: "王后", en: "Queen", keyZh: "涵养", keyEn: "Nurture" },
  { zh: "国王", en: "King", keyZh: "掌舵", keyEn: "Command" },
];

export const MINOR_BY_SUIT: Record<TarotSuit, TarotCard[]> = {
  wands: [],
  cups: [],
  swords: [],
  pentacles: [],
};

for (const suit of SUITS) {
  MINOR_BY_SUIT[suit.id] = RANKS.map((r, i) => {
    const number = i + 1;
    return {
      id: `${suit.id}-${number}`,
      name: `${suit.name}${r.zh}`,
      nameEn: `${r.en} of ${suit.nameEn}`,
      arcana: "minor" as const,
      suit: suit.id,
      number,
      keywords: [suit.keywords[0], r.keyZh],
      keywordsEn: [suit.keywordsEn[0], r.keyEn],
    };
  });
}

/** 全库（大阿卡纳在前，小阿卡纳按 权杖→圣杯→宝剑→星币） */
export const ALL_CARDS: TarotCard[] = [
  ...MAJOR_CARDS,
  ...SUITS.flatMap((s) => MINOR_BY_SUIT[s.id]),
];

/** 罗马数字（大阿卡纳牌面用） */
export const ROMAN = [
  "0",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
  "XXI",
] as const;

/** 牌名按语言 */
export function cardName(card: TarotCard, lang: "zh" | "en"): string {
  return lang === "zh" ? card.name : card.nameEn;
}

/** 牌面顶端标记：大阿卡纳罗马数字；小阿卡纳花色首字 / 数字 */
export function cardMark(card: TarotCard, lang: "zh" | "en"): string {
  if (card.arcana === "major") return ROMAN[card.number];
  const rank = RANKS[card.number - 1];
  return lang === "zh" ? rank.zh : rank.en;
}
