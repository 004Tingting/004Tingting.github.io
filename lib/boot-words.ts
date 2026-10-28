import { dic, type Lang } from "@/lib/i18n";
import { getArticles } from "@/lib/articles";
import { getWorks } from "@/lib/works";

/**
 * 开场动画（BootIntro）的散字池：导航五词（Ting 指定必须包含）+ 兴趣方向
 * + 研思/纪事/造物标题里长度合适的词。构建时静态取材，条目排序确定
 * （兴趣 → 研思 → 纪事 → 造物，各按自身顺序），不引入随机源。
 * 返回数组的前 5 个恒为导航词，BootIntro 对其做「保大保清晰」的排字加权。
 */
export function getBootWords(lang: Lang): string[] {
  const t = dic[lang];
  const nav = [t.nav.research, t.nav.works, t.nav.arts, t.nav.chronicles, t.nav.about];
  // zh 词短，en 标题长——各给一条长度线，太长的标题不适合做散字
  const maxLen = lang === "zh" ? 12 : 26;

  const titles = [
    ...getArticles(lang, "research").map((a) => a.title),
    ...getArticles(lang, "chronicles").map((a) => a.title),
    ...getWorks(lang).map((w) => w.title),
  ];

  const pool: string[] = [];
  const seen = new Set<string>(nav);
  for (const s of [...t.home.interests, ...titles]) {
    const v = s.trim();
    if (!v || v.length > maxLen || seen.has(v)) continue;
    seen.add(v);
    pool.push(v);
    if (pool.length >= 11) break; // 5 导航词 + 11 = 16 词封顶
  }
  return [...nav, ...pool];
}
