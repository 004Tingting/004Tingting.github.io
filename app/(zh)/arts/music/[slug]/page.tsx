import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dic } from "@/lib/i18n";
import { getCover, getCovers } from "@/lib/arts";
import EmbedPlayer from "@/components/EmbedPlayer";
import Kicker from "@/components/Kicker";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCovers("zh").map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cover = getCover("zh", slug);
  if (!cover) return {};
  const canonical = `/arts/music/${slug}/`;
  return {
    title: cover.title,
    alternates: {
      canonical,
      languages: { "zh-CN": canonical, en: `/en/arts/music/${slug}/` },
    },
  };
}

/**
 * cover 详情：原视频嵌入（最前）→ 节拍器（原速）占位 → 曲谱占位 → 伴奏播放占位。
 * 节拍器插件与曲谱光标为后续功能，此处按占位呈现并注明需求。
 */
export default async function CoverDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cover = getCover("zh", slug);
  if (!cover) notFound();
  const t = dic.zh.arts.music;

  return (
    <article className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{cover.title}</h1>
      <p className="mt-4 font-mono text-sm text-muted">
        {[cover.instrument, cover.date].filter(Boolean).join(" · ")}
      </p>
      {cover.notes ? <p className="mt-6 max-w-2xl text-muted">{cover.notes}</p> : null}

      {/* 原视频（放最前） */}
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

      {/* 节拍器（原速）——占位：插件接入后启用 */}
      <section className="mt-12 border-t border-rule pt-10">
        <h2 className="font-mono text-sm tracking-widest text-muted">
          <span className="text-accent">·</span> {t.coverMetronome}
        </h2>
        <div className="mt-6 border border-dashed border-rule px-6 py-10 text-center">
          <p className="font-mono text-2xl text-ink">
            ♩ = {cover.tempo ?? "—"}
            <span className="ml-2 font-mono text-xs text-muted">原速</span>
          </p>
          <p className="mt-3 font-mono text-xs text-muted">{t.coverMetronomeTodo}</p>
        </div>
      </section>

      {/* 曲谱——占位：跟随节拍器的乐符光标（需求见 coverSheetTodo） */}
      <section className="mt-12 border-t border-rule pt-10">
        <h2 className="font-mono text-sm tracking-widest text-muted">
          <span className="text-accent">·</span> {t.coverSheet}
        </h2>
        <div className="mt-6 border border-dashed border-rule px-6 py-10 text-center">
          <p className="font-mono text-sm text-muted">{cover.sheet ?? t.coverSheetEmpty}</p>
          <p className="mt-3 font-mono text-xs text-muted">{t.coverSheetTodo}</p>
        </div>
      </section>

      {/* 伴奏播放——占位 */}
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
        <Link href="/arts/music" className="hover:text-accent">
          {t.coverBack}
        </Link>
      </p>
    </article>
  );
}
