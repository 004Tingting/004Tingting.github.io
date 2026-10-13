import type { Metadata } from "next";
import Link from "next/link";
import { dic } from "@/lib/i18n";
import { getCovers, getNow, getPlaylist, getPlaylistEmbed, getRecentTracks } from "@/lib/arts";
import { fmtRelative, fmtTrackDuration } from "@/lib/arts-shared";
import EmbedPlayer from "@/components/EmbedPlayer";
import Kicker from "@/components/Kicker";
import NowPlayingLive from "@/components/NowPlayingLive";

export const metadata: Metadata = { title: "Music" };

/** Music: live now-playing, recent tracks, standing playlist (full track list), covers, notes link */
export default function MusicPage() {
  const t = dic.en.arts;
  const now = getNow();
  const playlist = getPlaylistEmbed();
  const tracks = getPlaylist();
  const recent = getRecentTracks();
  const covers = getCovers("en");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>{t.music.kicker}</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">{t.music.title}</h1>

      <NowPlayingLive lang="en" initial={now} variant="card" />

      {recent.length > 0 ? (
        <section className="mt-16 border-t border-rule pt-10">
          <h2 className="font-mono text-sm tracking-widest text-muted">
            <span className="text-accent">·</span> {t.music.recentListHeading}
          </h2>
          <ul className="mt-6 divide-y divide-rule">
            {recent.map((r, i) => (
              <li key={`${r.title}-${r.playedAt ?? i}`} className="flex flex-wrap items-baseline gap-x-4 py-3">
                <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-ink">{r.title}</span>
                <span className="text-muted">— {r.artist}</span>
                <span className="ml-auto font-mono text-xs text-muted">
                  {fmtRelative(r.playedAt, "en")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Standing playlist (NetEase embed) + full track list */}
      {playlist || tracks ? (
        <section className="mt-16 border-t border-rule pt-10">
          <h2 className="font-mono text-sm tracking-widest text-muted">
            <span className="text-accent">·</span> {t.music.playlistHeading}
          </h2>
          {playlist ? (
            <>
              <p className="mt-4 font-serif text-2xl font-semibold">{playlist.title}</p>
              <p className="mt-1 font-mono text-sm text-muted">{playlist.subtitle}</p>
              <EmbedPlayer
                src={playlist.embed}
                title={playlist.title}
                aspect="player"
                height={430}
                href={playlist.link}
                hrefLabel={t.music.openExternal}
              />
              <p className="mt-3 font-mono text-xs text-muted">{t.music.nowNote}</p>
            </>
          ) : null}

          {tracks ? (
            <div className="mt-10">
              <p className="font-mono text-xs tracking-widest text-muted">
                <span className="text-accent">·</span> {t.music.tracksHeading}
                <span className="ml-2 normal-case tracking-normal">
                  {tracks.trackCount} {t.music.tracksUnit}
                </span>
              </p>
              <ol className="mt-4 divide-y divide-rule">
                {tracks.tracks.map((tr, i) => (
                  <li key={`${tr.name}-${i}`} className="flex items-baseline gap-4 py-1.5">
                    <span className="w-8 shrink-0 text-right font-mono text-xs text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 text-sm">
                      {tr.name}
                      {tr.artist ? <span className="text-muted"> — {tr.artist}</span> : null}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {fmtTrackDuration(tr.duration)}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-muted">{t.music.tracksNote}</p>
            </div>
          ) : null}
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
                  <h3 className="font-serif text-xl font-semibold">
                    <Link href={`/en/arts/music/${c.slug}`} className="hover:text-accent">
                      {c.title}
                    </Link>
                  </h3>
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
          href="/en/chronicles"
          className="mt-4 inline-block font-mono text-sm text-accent hover:underline"
        >
          {t.music.notesLink}
        </Link>
      </section>
    </div>
  );
}
