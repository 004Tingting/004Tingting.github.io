import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWork, getWorks } from "@/lib/works";
import { SITE } from "@/lib/site";
import MarkdownBody from "@/components/MarkdownBody";
import Kicker from "@/components/Kicker";

export const dynamicParams = false;

export function generateStaticParams() {
  return getWorks("zh").map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork("zh", slug);
  if (!work) return {};

  const canonical = `/works/${slug}/`;
  return {
    title: work.title,
    description: work.summary,
    alternates: {
      canonical,
      languages: { "zh-CN": canonical, en: `/en/works/${slug}/` },
    },
    openGraph: {
      type: "article",
      title: work.title,
      description: work.summary,
      url: canonical,
      tags: [...work.tags],
      images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: work.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: work.title,
      description: work.summary,
      images: [SITE.ogImage],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = getWork("zh", slug);
  if (!work) notFound();

  return (
    <article className="mx-auto max-w-[68ch] px-6 py-16">
      <header>
        <Kicker>{work.tags.map((t) => `#${t}`).join("  ")}</Kicker>
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">{work.title}</h1>
        <p className="mt-4 font-mono text-sm text-muted">
          {[work.status, work.period].filter(Boolean).join(" · ")}
        </p>
      </header>

      <div className="mt-10">
        <MarkdownBody content={work.content} />
      </div>

      <p className="mt-16 border-t border-rule pt-6 font-mono text-sm">
        <Link href="/works" className="hover:text-accent">
          ← 返回造物
        </Link>
      </p>
    </article>
  );
}
