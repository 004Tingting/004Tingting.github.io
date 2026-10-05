import type { Metadata } from "next";
import { dic } from "@/lib/i18n";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  const t = dic.en.about;
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-4xl font-bold">{t.title}</h1>
      <p className="mt-6 text-muted">{t.placeholder}</p>
    </article>
  );
}
