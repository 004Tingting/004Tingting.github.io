import type { Metadata } from "next";
import { dic } from "@/lib/i18n";
import { getScreen, getStats } from "@/lib/life";
import LifeEntryList from "@/components/LifeEntryList";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "记录" };

/** 记录：追剧 / 追番 / 电影 / 小说 + 时长汇总（构建时自动计算） */
export default function LogPage() {
  const t = dic.zh.life;
  const s = getStats("zh");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.log.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.log.title}</h1>
      <p className="mt-6 font-mono text-sm text-muted">
        {[
          `${t.screenTypes.tv} ${s.screenByType.tv}`,
          `${t.screenTypes.anime} ${s.screenByType.anime}`,
          `${t.screenTypes.movie} ${s.screenByType.movie}`,
          `${t.screenTypes.novel} ${s.screenByType.novel}`,
          `${t.log.total} ${s.screenHours}${t.log.hoursUnit}`,
        ].join(" · ")}
      </p>
      <div className="mt-10">
        <LifeEntryList variant="screen" entries={getScreen("zh")} lang="zh" />
      </div>
    </div>
  );
}
