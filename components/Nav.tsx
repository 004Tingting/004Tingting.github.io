"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dic, type Lang } from "@/lib/i18n";
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

export default function Nav({ lang }: { lang: Lang }) {
  const pathname = usePathname() ?? "/";
  const t = dic[lang].nav;
  const routes = ROUTES[lang];

  // 语言切换：zh ↔ en 对等路径
  const otherHref =
    lang === "zh"
      ? pathname === "/"
        ? "/en"
        : `/en${pathname}`
      : pathname.replace(/^\/en/, "") || "/";

  const homeHref = lang === "zh" ? "/" : "/en";

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-y-1.5 px-6 py-3.5">
        <Link
          href={homeHref}
          className="font-serif text-2xl font-bold tracking-wide hover:text-accent"
        >
          Ting
        </Link>
        <nav className="flex flex-wrap items-baseline gap-x-5 gap-y-1 font-serif text-lg font-semibold">
          {ORDER.map((key) => (
            <Link key={key} href={routes[key]} className="hover:text-accent">
              {t[key]}
            </Link>
          ))}
          <Link href={otherHref} className="hover:text-accent" aria-label="Switch language">
            {lang === "zh" ? "EN" : "中"}
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
