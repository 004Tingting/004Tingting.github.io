import type { Metadata } from "next";
import { dic } from "@/lib/i18n";
import { getScreen, getStats } from "@/lib/life";
import LifeEntryList from "@/components/LifeEntryList";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "Log" };

/** Log: TV / anime / film / novel with build-time computed hours summary */
export default function LogPage() {
  const t = dic.en.life;
  const s = getStats("en");

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
        <LifeEntryList variant="screen" entries={getScreen("en")} lang="en" />
      </div>
    </div>
  );
}
