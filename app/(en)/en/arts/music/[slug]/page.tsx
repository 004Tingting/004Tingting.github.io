import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dic } from "@/lib/i18n";
import { getCover, getCovers } from "@/lib/arts";
import EmbedPlayer from "@/components/EmbedPlayer";
import Kicker from "@/components/Kicker";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCovers("en").map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cover = getCover("en", slug);
  if (!cover) return {};
  const canonical = `/en/arts/music/${slug}/`;
  return {
    title: cover.title,
    alternates: {
      canonical,
      languages: { "zh-CN": `/arts/music/${slug}/`, en: canonical },
    },
  };
}

/**
 * Cover detail: original video (first) → metronome (original tempo) placeholder →
 * sheet music placeholder → accompaniment play placeholder.
 * The metronome plugin and the note cursor are future features; placeholders for now.
 */
export default async function CoverDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cover = getCover("en", slug);
  if (!cover) notFound();
  const t = dic.en.arts.music;

  return (
    <article className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{cover.title}</h1>
      <p className="mt-4 font-mono text-sm text-muted">
        {[cover.instrument, cover.date].filter(Boolean).join(" · ")}
      </p>
      {cover.notes ? <p className="mt-6 max-w-2xl text-muted">{cover.notes}</p> : null}

      {/* Original video (first) */}
      <section className="mt-12 border-t border-rule pt-10">
        <h2 className="font-mono text-sm tracking-widest text-muted">
          <span className="text-accent">·</span> {t.coverVideo}
        </h2>
        <div className="mt-6">
          {cover.bilibili ? (
            <EmbedPlayer
              src={`https://player.bilibili.com/player.html?bvid=${cover.bilibili}&autoplay=0&high_quality=1`}
              title={cover.title}
              aspect="video"
            />
          ) : (
            <p className="font-mono text-sm text-muted">{t.coverVideoEmpty}</p>
          )}
        </div>
      </section>

      {/* Metronome (original tempo) — placeholder until the plugin lands */}
      <section className="mt-12 border-t border-rule pt-10">
        <h2 className="font-mono text-sm tracking-widest text-muted">
          <span className="text-accent">·</span> {t.coverMetronome}
        </h2>
        <div className="mt-6 border border-dashed border-rule px-6 py-10 text-center">
          <p className="font-mono text-2xl text-ink">
            ♩ = {cover.tempo ?? "—"}
            <span className="ml-2 font-mono text-xs text-muted">original tempo</span>
          </p>
          <p className="mt-3 font-mono text-xs text-muted">{t.coverMetronomeTodo}</p>
        </div>
      </section>

      {/* Sheet music — placeholder: note cursor follows the metronome (see coverSheetTodo) */}
      <section className="mt-12 border-t border-rule pt-10">
        <h2 className="font-mono text-sm tracking-widest text-muted">
          <span className="text-accent">·</span> {t.coverSheet}
        </h2>
        <div className="mt-6 border border-dashed border-rule px-6 py-10 text-center">
          <p className="font-mono text-sm text-muted">{cover.sheet ?? t.coverSheetEmpty}</p>
          <p className="mt-3 font-mono text-xs text-muted">{t.coverSheetTodo}</p>
        </div>
      </section>

      {/* Accompaniment — placeholder */}
      <section className="mt-12 border-t border-rule pt-10">
        <h2 className="font-mono text-sm tracking-widest text-muted">
          <span className="text-accent">·</span> {t.coverAccompaniment}
        </h2>
        <div className="mt-6 border border-dashed border-rule px-6 py-10 text-center">
          <button
            type="button"
            disabled
            className="cursor-not-allowed border border-rule px-6 py-2 font-mono text-sm text-muted"
          >
            ▶ {t.coverPlay}
          </button>
          <p className="mt-3 font-mono text-xs text-muted">{t.coverAccompanimentTodo}</p>
        </div>
      </section>

      <p className="mt-16 border-t border-rule pt-6 font-mono text-sm">
        <Link href="/en/arts/music" className="hover:text-accent">
          {t.coverBack}
        </Link>
      </p>
    </article>
  );
}
