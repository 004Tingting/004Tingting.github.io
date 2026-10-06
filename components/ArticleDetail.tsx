import Link from "next/link";
import { notFound } from "next/navigation";
import { fmtDate, getArticle, type Section } from "@/lib/articles";
import { dic, type Lang } from "@/lib/i18n";
import MarkdownBody from "@/components/MarkdownBody";
import Kicker from "@/components/Kicker";
import Giscus from "@/components/Giscus";

/** 文章详情（研思 / 纪事共用）：68ch 单栏 + 代码高亮 + 评论 */
export default function ArticleDetail({
  lang,
  section,
  slug,
}: {
  lang: Lang;
  section: Section;
  slug: string;
}) {
  const article = getArticle(lang, section, slug);
  if (!article) notFound();

  const t = dic[lang].sections[section];
  const base = lang === "zh" ? `/${section}` : `/en/${section}`;

  return (
    <article className="mx-auto max-w-[68ch] px-6 py-16">
      <header>
        <Kicker>{article.tags.map((tag) => `#${tag}`).join("  ")}</Kicker>
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
          {article.title}
        </h1>
        <p className="mt-4 font-mono text-sm text-muted">{fmtDate(article.date, lang)}</p>
      </header>

      <div className="mt-10">
        <MarkdownBody content={article.content} />
      </div>

      <Giscus lang={lang} />

      <p className="mt-16 border-t border-rule pt-6 font-mono text-sm">
        <Link href={base} className="hover:text-accent">
          {lang === "zh" ? `← 返回${t.kicker}` : `← Back to ${t.title}`}
        </Link>
      </p>
    </article>
  );
}
