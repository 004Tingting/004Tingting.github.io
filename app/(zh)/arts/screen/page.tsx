import type { Metadata } from "next";
import { dic } from "@/lib/i18n";
import { getScreen, getStats } from "@/lib/arts";
import LifeEntryList from "@/components/LifeEntryList";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "影卷" };

/** 影卷：电影 / 番剧 / 剧集 / 小说 + 时长汇总（构建时自动计算） */
export default function ScreenPage() {
  const t = dic.zh.arts;
  const s = getStats("zh");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.screen.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.screen.title}</h1>
      <p className="mt-6 font-mono text-sm text-muted">
        {[
          `${t.screenTypes.tv} ${s.screenByType.tv}`,
          `${t.screenTypes.anime} ${s.screenByType.anime}`,
          `${t.screenTypes.movie} ${s.screenByType.movie}`,
          `${t.screenTypes.novel} ${s.screenByType.novel}`,
          `${t.screen.total} ${s.screenHours}${t.screen.hoursUnit}`,
        ].join(" · ")}
      </p>
      <div className="mt-10">
        <LifeEntryList variant="screen" entries={getScreen("zh")} lang="zh" />
      </div>
    </div>
  );
}
