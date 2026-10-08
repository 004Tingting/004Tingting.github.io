import type { Metadata } from "next";
import { dic } from "@/lib/i18n";
import { getExercise } from "@/lib/arts";
import LifeEntryList from "@/components/LifeEntryList";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "Exercise" };

/** Exercise: running / bodyweight (entry-based, same shape as games & screen) */
export default function ExercisePage() {
  const t = dic.en.arts;
  const entries = getExercise("en");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.exercise.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.exercise.title}</h1>
      <p className="mt-6 max-w-2xl text-muted">{t.exercise.intro}</p>
      <div className="mt-14">
        <LifeEntryList variant="exercise" entries={entries} lang="en" />
      </div>
    </div>
  );
}
