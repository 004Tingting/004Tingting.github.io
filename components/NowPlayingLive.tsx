"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dic, type Lang } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/** 构建时的快照（仅作为所有实时源都不可用时的兜底） */
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

/** 轮询间隔：与本地脚本 scripts/push-now.mjs 的 15 秒推送节奏对齐 */
const REFRESH_MS = 15_000;

/**
 * 实时数据源（按优先级依次尝试，第一个成功即采用）：
 *   1–2. 国内 GitHub 直通代理 —— **无缓存**，能即时反映 now-data 分支（实测支持 CORS）
 *   3.   jsDelivr —— 仅作兜底；其 purge 会被限流（720s 重置），缓存可能滞后 10 分钟以上
 * 数据链路：本机脚本 → GitHub now-data 分支 → 代理 / CDN → 此处
 */
const NOW_SOURCES = [
  "https://gh-proxy.com/https://raw.githubusercontent.com/004Tingting/004Tingting.github.io/now-data/now.json",
  "https://gh.llkk.cc/https://raw.githubusercontent.com/004Tingting/004Tingting.github.io/now-data/now.json",
  "https://cdn.jsdelivr.net/gh/004Tingting/004Tingting.github.io@now-data/now.json",
];

/**
 * 实时「正在听」三级数据源：
 *   ① now-data（本地脚本推送，≤30 秒新鲜度，**带封面**）—— 首选
 *   ② Last.fm 直连（曲目实时）+ 构建时封面映射表 —— 本机脚本没在跑时
 *   ③ 构建时快照（initial）—— 全部失败时
 * SSR 阶段不渲染旧数据，避免「先显示过期歌曲再刷新」。
 */
export default function NowPlayingLive({ lang, initial, variant = "bar" }: Props) {
  const [now, setNow] = useState<NowSnapshot | null>(null);
  const [coverMap, setCoverMap] = useState<Record<string, string>>({});
  const t = dic[lang].arts.music;

  useEffect(() => {
    // 构建时生成的封面映射（降级路径用）
    fetch("/covers.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((m) => setCoverMap(m ?? {}))
      .catch(() => {});

    let cancelled = false;

    const load = async () => {
      /* ① 首选：本地脚本推送的实时数据（多源依次尝试，代理无缓存故最实时） */
      let payload: Record<string, unknown> | null = null;
      for (const src of NOW_SOURCES) {
        try {
          const res = await fetch(src, { cache: "no-store" });
          if (!res.ok) continue;
          const json = (await res.json()) as Record<string, unknown>;
          if (typeof json?.title === "string" && json.title) {
            payload = json;
            break; // 拿到有效数据即停止尝试
          }
        } catch {
          /* 该源失败，试下一个 */
        }
      }
      if (payload && !cancelled) {
        // 采用条件：数据足够新鲜（15 分钟内），**或**它带有封面
        const fresh =
          typeof payload.updatedAt === "string" &&
          Date.now() - new Date(payload.updatedAt).getTime() < 15 * 60 * 1000;
        if (fresh || payload.cover) {
          setNow({
            title: String(payload.title),
            subtitle: typeof payload.artist === "string" ? payload.artist : "",
            cover: typeof payload.cover === "string" ? payload.cover : "",
            live: payload.live === true,
            link: typeof payload.link === "string" ? payload.link : "",
          });
          return;
        }
      }

      /* ② 降级：直连 Last.fm（仅有曲目，封面靠映射表） */
      const { user, apiKey } = SITE.lastfm;
      if (!user || !apiKey) {
        if (!cancelled) setNow((prev) => prev ?? initial);
        return;
      }
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
          cover: "",
          live: track["@attr"]?.nowplaying === "true",
          link: track.url ?? "",
        });
      } catch {
        /* ③ 兜底：构建时快照 */
        if (!cancelled) setNow((prev) => prev ?? initial);
      }
    };

    load();
    const timer = setInterval(load, REFRESH_MS);
    // 页面重新可见时立即刷新一次（避免切回标签页时看到旧数据）
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SSR / 首帧：占位，保持布局稳定
  if (!now) {
    return variant === "card" ? <div className="mt-12 h-40" aria-hidden /> : <div className="h-12" aria-hidden />;
  }

  // 封面：实时源自带优先；否则查构建时映射表
  const cover = now.cover || coverMap[`${now.title}|${now.subtitle}`] || "";
  const href = lang === "zh" ? "/arts/music" : "/en/arts/music";

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
