import type { Metadata } from "next";
import { dic } from "@/lib/i18n";
import { getTraining } from "@/lib/arts";
import LifeEntryList from "@/components/LifeEntryList";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "Training" };

/** Training: running / bodyweight (entry-based, same shape as games & screen) */
export default function TrainingPage() {
  const t = dic.en.arts;
  const entries = getTraining("en");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.training.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.training.title}</h1>
      <p className="mt-6 max-w-2xl text-muted">{t.training.intro}</p>
      <div className="mt-14">
        <LifeEntryList variant="training" entries={entries} lang="en" />
      </div>
    </div>
  );
}
