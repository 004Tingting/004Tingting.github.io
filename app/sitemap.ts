import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getArticles, SECTIONS } from "@/lib/articles";
import { getWorks } from "@/lib/works";
import { getCovers } from "@/lib/arts";

export const dynamic = "force-static";

/** 双语 sitemap：静态页 + 文章（研思 / 纪事）+ 造物，带 hreflang alternates */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const u = (p: string) => `${SITE.url}${p}`;
  const langs = (zh: string, en: string) => ({
    languages: { "zh-CN": u(zh), en: u(en) },
  });

  const entries: MetadataRoute.Sitemap = [];

  // 静态页（双语对）
  const staticPages: Array<[string, string]> = [
    ["/", "/en/"],
    ["/research/", "/en/research/"],
    ["/chronicles/", "/en/chronicles/"],
    ["/works/", "/en/works/"],
    ["/arts/", "/en/arts/"],
    ["/arts/music/", "/en/arts/music/"],
    ["/arts/games/", "/en/arts/games/"],
    ["/arts/screen/", "/en/arts/screen/"],
    ["/arts/exercise/", "/en/arts/exercise/"],
    ["/arts/stats/", "/en/arts/stats/"],
    ["/arts/stats/games/", "/en/arts/stats/games/"],
    ["/about/", "/en/about/"],
  ];
  for (const [zh, en] of staticPages) {
    entries.push({ url: u(zh), lastModified: now, alternates: langs(zh, en) });
    entries.push({ url: u(en), lastModified: now, alternates: langs(zh, en) });
  }

  // 文章（研思 + 纪事，按栏目遍历）
  for (const section of SECTIONS) {
    for (const a of getArticles("zh", section)) {
      const zh = `/${section}/${a.slug}/`;
      const en = `/en/${section}/${a.slug}/`;
      entries.push({ url: u(zh), lastModified: new Date(a.date), alternates: langs(zh, en) });
    }
    for (const a of getArticles("en", section)) {
      const zh = `/${section}/${a.slug}/`;
      const en = `/en/${section}/${a.slug}/`;
      entries.push({ url: u(en), lastModified: new Date(a.date), alternates: langs(zh, en) });
    }
  }

  // 造物
  for (const w of getWorks("zh")) {
    const zh = `/works/${w.slug}/`;
    const en = `/en/works/${w.slug}/`;
    entries.push({ url: u(zh), lastModified: now, alternates: langs(zh, en) });
  }
  for (const w of getWorks("en")) {
    const zh = `/works/${w.slug}/`;
    const en = `/en/works/${w.slug}/`;
    entries.push({ url: u(en), lastModified: now, alternates: langs(zh, en) });
  }

  // 乐器 cover 详情（音律；按 slug 双语对齐，缺镜像的一侧单独收录）
  const coversZh = new Set(getCovers("zh").map((c) => c.slug));
  const coversEn = new Set(getCovers("en").map((c) => c.slug));
  for (const slug of new Set([...coversZh, ...coversEn])) {
    const zh = `/arts/music/${slug}/`;
    const en = `/en/arts/music/${slug}/`;
    if (coversZh.has(slug)) {
      entries.push({ url: u(zh), lastModified: now, alternates: coversEn.has(slug) ? langs(zh, en) : undefined });
    }
    if (coversEn.has(slug)) {
      entries.push({ url: u(en), lastModified: now, alternates: coversZh.has(slug) ? langs(zh, en) : undefined });
    }
  }

  return entries;
}
