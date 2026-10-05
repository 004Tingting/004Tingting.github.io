import type { Metadata } from "next";
import { dic } from "@/lib/i18n";
import { getGames } from "@/lib/life";
import LifeEntryList from "@/components/LifeEntryList";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "Games" };

export default function GamesPage() {
  const t = dic.en.life;
  const games = getGames("en");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.games.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.games.title}</h1>
      <div className="mt-10">
        <LifeEntryList variant="games" entries={games} lang="en" />
      </div>
    </div>
  );
}
