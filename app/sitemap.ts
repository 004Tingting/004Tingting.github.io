import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getArticles, SECTIONS } from "@/lib/articles";
import { getWorks } from "@/lib/works";

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
    ["/arts/training/", "/en/arts/training/"],
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

  return entries;
}
