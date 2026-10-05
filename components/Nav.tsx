"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dic, type Lang } from "@/lib/i18n";
import ThemeToggle from "@/components/ThemeToggle";

export default function Nav({ lang }: { lang: Lang }) {
  const pathname = usePathname() ?? "/";
  const t = dic[lang].nav;

  // 语言切换：zh ↔ en 对等路径（/ ↔ /en，/about ↔ /en/about）
  const otherHref =
    lang === "zh"
      ? pathname === "/"
        ? "/en"
        : `/en${pathname}`
      : pathname.replace(/^\/en/, "") || "/";

  const homeHref = lang === "zh" ? "/" : "/en";
  const blogHref = lang === "zh" ? "/blog" : "/en/blog";
  const lifeHref = lang === "zh" ? "/life" : "/en/life";
  const projectsHref = lang === "zh" ? "/projects" : "/en/projects";
  const aboutHref = lang === "zh" ? "/about" : "/en/about";

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex h-14 max-w-5xl items-baseline justify-between px-6">
        <Link href={homeHref} className="font-serif text-xl font-bold tracking-wide hover:text-accent">
          Ting
        </Link>
        <nav className="flex items-baseline gap-6 font-mono text-sm">
          <Link href={blogHref} className="hover:text-accent">
            {t.blog}
          </Link>
          <Link href={lifeHref} className="hover:text-accent">
            {t.life}
          </Link>
          <Link href={projectsHref} className="hover:text-accent">
            {t.projects}
          </Link>
          <Link href={aboutHref} className="hover:text-accent">
            {t.about}
          </Link>
          <Link href={otherHref} className="hover:text-accent" aria-label="Switch language">
            {lang === "zh" ? "EN" : "中"}
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
