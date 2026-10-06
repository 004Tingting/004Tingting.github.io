import type { Metadata } from "next";
import { dic } from "@/lib/i18n";
import { getArticles, toArticleMeta } from "@/lib/articles";
import ArticleList from "@/components/ArticleList";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "纪事" };

export default function ChroniclesPage() {
  const t = dic.zh.sections.chronicles;
  const articles = getArticles("zh", "chronicles").map(toArticleMeta);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.title}</h1>
      <p className="mt-6 max-w-2xl text-muted">{t.intro}</p>
      <div className="mt-10">
        <ArticleList articles={articles} lang="zh" basePath="/chronicles" allLabel="全部" />
      </div>
    </div>
  );
}
