import type { Metadata } from "next";
import { getArticle, getArticles } from "@/lib/articles";
import { SITE } from "@/lib/site";
import ArticleDetail from "@/components/ArticleDetail";

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticles("en", "chronicles").map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle("en", "chronicles", slug);
  if (!article) return {};

  const canonical = `/en/chronicles/${slug}/`;
  return {
    title: article.title,
    description: article.summary,
    alternates: {
      canonical,
      languages: { "zh-CN": `/chronicles/${slug}/`, en: canonical },
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      url: canonical,
      publishedTime: article.date,
      tags: [...article.tags],
      images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [SITE.ogImage],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticleDetail lang="en" section="chronicles" slug={slug} />;
}
