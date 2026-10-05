import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getPosts } from "@/lib/posts";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-static";

/** 双语 sitemap：静态页 + 全部文章 + 全部项目，带 hreflang alternates */
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
    ["/blog/", "/en/blog/"],
    ["/life/", "/en/life/"],
    ["/life/games/", "/en/life/games/"],
    ["/life/music/", "/en/life/music/"],
    ["/life/log/", "/en/life/log/"],
    ["/projects/", "/en/projects/"],
    ["/about/", "/en/about/"],
  ];
  for (const [zh, en] of staticPages) {
    entries.push({ url: u(zh), lastModified: now, alternates: langs(zh, en) });
    entries.push({ url: u(en), lastModified: now, alternates: langs(zh, en) });
  }

  // 文章
  for (const post of getPosts("zh")) {
    const zh = `/blog/${post.slug}/`;
    const en = `/en/blog/${post.slug}/`;
    entries.push({
      url: u(zh),
      lastModified: new Date(post.date),
      alternates: langs(zh, en),
    });
  }
  for (const post of getPosts("en")) {
    const zh = `/blog/${post.slug}/`;
    const en = `/en/blog/${post.slug}/`;
    entries.push({
      url: u(en),
      lastModified: new Date(post.date),
      alternates: langs(zh, en),
    });
  }

  // 项目
  for (const project of getProjects("zh")) {
    const zh = `/projects/${project.slug}/`;
    const en = `/en/projects/${project.slug}/`;
    entries.push({ url: u(zh), lastModified: now, alternates: langs(zh, en) });
  }
  for (const project of getProjects("en")) {
    const zh = `/projects/${project.slug}/`;
    const en = `/en/projects/${project.slug}/`;
    entries.push({ url: u(en), lastModified: now, alternates: langs(zh, en) });
  }

  return entries;
}
