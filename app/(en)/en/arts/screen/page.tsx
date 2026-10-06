import type { Metadata } from "next";
import { dic } from "@/lib/i18n";
import { getScreen, getStats } from "@/lib/arts";
import LifeEntryList from "@/components/LifeEntryList";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "Screen & Books" };

/** Screen & Books: film / anime / TV / novel with build-time computed hours */
export default function ScreenPage() {
  const t = dic.en.arts;
  const s = getStats("en");

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
        <LifeEntryList variant="screen" entries={getScreen("en")} lang="en" />
      </div>
    </div>
  );
}
