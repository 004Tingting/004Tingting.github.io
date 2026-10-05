"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dic, type Lang } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/** 构建时的快照（仅作为接口不可用时的兜底） */
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
 * 实时「正在听」：
 * - 初始状态为 null —— **SSR 不渲染构建时的旧数据**，避免「先显示旧歌再刷新」
 * - 挂载后立刻拉一次 Last.fm，之后每 60 秒刷新；接口失败才回退到构建时快照
 * - 封面查构建时生成的映射表（public/covers + covers.json），切歌即时换图；表里没有则不显示封面
 */
export default function NowPlayingLive({ lang, initial, variant = "bar" }: Props) {
  const [now, setNow] = useState<NowSnapshot | null>(null);
  const [coverMap, setCoverMap] = useState<Record<string, string>>({});
  const t = dic[lang].life.music;

  useEffect(() => {
    // 封面映射（构建时生成，同源）
    fetch("/covers.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((m) => setCoverMap(m ?? {}))
      .catch(() => {});

    const { user, apiKey } = SITE.lastfm;
    if (!user || !apiKey) {
      setNow(initial); // 未配置 key → 用构建时快照兜底
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const url =
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
          `&user=${encodeURIComponent(user)}&api_key=${apiKey}&format=json&limit=1`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const track = data?.recenttracks?.track?.[0];
        if (!track || cancelled) return;
        setNow({
          title: track.name ?? "",
          subtitle: track.artist?.["#text"] ?? "",
          cover: "", // 由映射表决定，见下方渲染
          live: track["@attr"]?.nowplaying === "true",
          link: track.url ?? "",
        });
      } catch {
        // 首次失败回退构建时快照；后续失败保留当前数据
        setNow((prev) => prev ?? initial);
      }
    };

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SSR / 首帧：占位（保持布局稳定，不显示过期数据）
  if (!now) return variant === "card" ? <div className="mt-12 h-40" aria-hidden /> : <div className="h-12" aria-hidden />;

  const cover = coverMap[`${now.title}|${now.subtitle}`] || now.cover || "";
  const href = lang === "zh" ? "/life/music" : "/en/life/music";

  if (variant === "card") {
    return (
      <section className="mt-12">
        <h2 className="font-mono text-sm tracking-widest text-muted">
          <span className="text-accent">·</span> {now.live ? t.nowLiveHeading : t.recentHeading}
        </h2>
        <div className="mt-6 flex items-center gap-6">
          {cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cover}
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
    <Link href={href} className="group inline-flex h-12 items-center gap-4">
      {cover ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={cover}
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
