import type { Metadata } from "next";
import { dic } from "@/lib/i18n";
import { getWorks, toWorkMeta } from "@/lib/works";
import WorkList from "@/components/WorkList";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "造物" };

export default function WorksPage() {
  const t = dic.zh.sections.works;
  const works = getWorks("zh").map(toWorkMeta);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.title}</h1>
      <p className="mt-6 max-w-2xl text-muted">{t.intro}</p>
      <div className="mt-10">
        <WorkList works={works} lang="zh" />
      </div>
    </div>
  );
}
