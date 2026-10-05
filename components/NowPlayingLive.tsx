"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dic, type Lang } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/** 构建时的快照（首屏用；无 JS / 接口不可用时保持这份数据） */
export type NowSnapshot = {
  title: string;
  subtitle: string;
  cover: string;
  live: boolean;
  link: string;
};

type Props = {
  lang: Lang;
  initial: NowSnapshot | null;
  /** bar：首页状态带；card：音乐页大图区 */
  variant?: "bar" | "card";
};

const REFRESH_MS = 60_000;

/**
 * 实时「正在听」：挂载后立刻拉一次，之后每 60 秒直连 Last.fm API 刷新。
 * 曲目/艺术家/播放状态实时；封面沿用构建时下载的本地图（浏览器无法直连网易云接口）。
 */
export default function NowPlayingLive({ lang, initial, variant = "bar" }: Props) {
  const [now, setNow] = useState<NowSnapshot | null>(initial);
  const t = dic[lang].life.music;

  useEffect(() => {
    const { user, apiKey } = SITE.lastfm;
    if (!user || !apiKey) return;

    let cancelled = false;

    const load = async () => {
      try {
        const url =
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
          `&user=${encodeURIComponent(user)}&api_key=${apiKey}&format=json&limit=1`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const track = data?.recenttracks?.track?.[0];
        if (!track || cancelled) return;
        setNow((prev) => ({
          title: track.name ?? "",
          subtitle: track.artist?.["#text"] ?? "",
          cover: prev?.cover ?? "",
          live: track["@attr"]?.nowplaying === "true",
          link: track.url ?? "",
        }));
      } catch {
        /* 静默失败：保留上一次数据 */
      }
    };

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (!now) return null;

  const href = lang === "zh" ? "/life/music" : "/en/life/music";

  if (variant === "card") {
    return (
      <section className="mt-12">
        <h2 className="font-mono text-sm tracking-widest text-muted">
          <span className="text-accent">·</span> {now.live ? t.nowLiveHeading : t.recentHeading}
        </h2>
        <div className="mt-6 flex items-center gap-6">
          {now.cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={now.cover}
              alt=""
              className="h-28 w-28 shrink-0 border border-rule object-cover"
            />
          ) : null}
          <div>
            <p className="font-serif text-2xl font-semibold">{now.title}</p>
            {now.subtitle ? <p className="mt-1 text-muted">{now.subtitle}</p> : null}
            {now.link ? (
              <a
                href={now.link}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block font-mono text-xs text-accent hover:underline"
              >
                ↗ Last.fm
              </a>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <Link href={href} className="group inline-flex items-center gap-4">
      {now.cover ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={now.cover}
          alt=""
          loading="lazy"
          className="h-12 w-12 shrink-0 border border-rule object-cover"
        />
      ) : null}
      <span className="font-mono text-sm text-muted">
        <span className="text-accent">·</span>{" "}
        {now.live ? t.nowLiveLabel : t.nowPlayingLabel}
        <span className="text-ink group-hover:text-accent">{now.title}</span>
        {now.subtitle ? ` — ${now.subtitle}` : ""}
      </span>
    </Link>
  );
}
