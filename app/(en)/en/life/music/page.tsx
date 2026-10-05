import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import { getCovers, getNow } from "@/lib/life";
import EmbedPlayer from "@/components/EmbedPlayer";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "Music" };

/** Music: now playing (NetEase embed) + instrumental covers (Bilibili embeds) + notes link */
export default function MusicPage() {
  const t = dic.en.life;
  const now = getNow();
  const covers = getCovers("en");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.music.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.music.title}</h1>

      {now ? (
        <section className="mt-12">
          <h2 className="font-mono text-sm tracking-widest text-muted">
            <span className="text-accent">·</span> {t.music.nowPlayingHeading}
          </h2>
          <p className="mt-4 font-serif text-2xl font-semibold">{now.title}</p>
          <p className="mt-1 font-mono text-sm text-muted">
            {[now.subtitle, now.note].filter(Boolean).join(" · ")}
          </p>
          {now.embed ? (
            <EmbedPlayer
              src={now.embed}
              title={now.title}
              aspect="player"
              height={430}
              href={now.link}
              hrefLabel={t.music.openExternal}
            />
          ) : null}
          <p className="mt-3 font-mono text-xs text-muted">{t.music.nowNote}</p>
        </section>
      ) : null}

      <section className="mt-16 border-t border-rule pt-10">
        <h2 className="font-mono text-sm tracking-widest text-muted">
          <span className="text-accent">·</span> {t.music.covers}
        </h2>
        {covers.length === 0 ? (
          <p className="mt-6 text-muted">{t.music.coversEmpty}</p>
        ) : (
          <ul className="mt-8 space-y-12">
            {covers.map((c, i) => (
              <li key={c.slug}>
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-sm text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-xl font-semibold">{c.title}</h3>
                  <span className="ml-auto shrink-0 font-mono text-xs text-muted">
                    {[c.instrument, c.date].filter(Boolean).join(" · ")}
                  </span>
                </div>
                {c.bilibili ? (
                  <div className="pl-10">
                    <EmbedPlayer
                      src={`https://player.bilibili.com/player.html?bvid=${c.bilibili}&autoplay=0&high_quality=1`}
                      title={c.title}
                      aspect="video"
                    />
                  </div>
                ) : (
                  <p className="mt-3 pl-10 font-mono text-xs text-muted">
                    {c.notes || t.music.coversHint}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-16 border-t border-rule pt-10">
        <h2 className="font-mono text-sm tracking-widest text-muted">
          <span className="text-accent">·</span> {t.music.notes}
        </h2>
        <p className="mt-4 text-muted">{t.music.notesDesc}</p>
        <Link
          href="/en/blog"
          className="mt-4 inline-block font-mono text-sm text-accent hover:underline"
        >
          {t.music.notesLink}
        </Link>
      </section>
    </div>
  );
}
