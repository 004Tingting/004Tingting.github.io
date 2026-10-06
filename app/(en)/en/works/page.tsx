import type { Metadata } from "next";
import { dic } from "@/lib/i18n";
import { getWorks, toWorkMeta } from "@/lib/works";
import WorkList from "@/components/WorkList";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "Works" };

export default function WorksPage() {
  const t = dic.en.sections.works;
  const works = getWorks("en").map(toWorkMeta);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.title}</h1>
      <p className="mt-6 max-w-2xl text-muted">{t.intro}</p>
      <div className="mt-10">
        <WorkList works={works} lang="en" />
      </div>
    </div>
  );
}
