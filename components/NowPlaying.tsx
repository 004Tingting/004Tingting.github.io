import Link from "next/link";
import { getNow } from "@/lib/life";
import { dic, type Lang } from "@/lib/i18n";

/** 首页状态带：封面缩略图 +「正在播放 / 最近在听」+ 曲目，点击进 /life/music */
export default function NowPlaying({ lang }: { lang: Lang }) {
  const now = getNow();
  if (!now) return null;

  const t = dic[lang].life.music;
  const href = lang === "zh" ? "/life/music" : "/en/life/music";

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
