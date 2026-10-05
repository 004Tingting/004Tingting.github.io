import Link from "next/link";
import { getNow } from "@/lib/life";
import { dic, type Lang } from "@/lib/i18n";

/** 首页状态带：一行「正在听」，链接到 /life/music（播放器在那里，首页不加载第三方 iframe） */
export default function NowPlaying({ lang }: { lang: Lang }) {
  const now = getNow();
  if (!now) return null;

  const t = dic[lang].life.music;
  const href = lang === "zh" ? "/life/music" : "/en/life/music";

  return (
    <Link
      href={href}
      className="group inline-flex flex-wrap items-baseline gap-x-2 font-mono text-sm text-muted"
    >
      <span className="text-accent">·</span>
      <span>{t.nowPlayingLabel}</span>
      <span className="text-ink group-hover:text-accent">{now.title}</span>
      {now.subtitle ? <span className="hidden sm:inline">— {now.subtitle}</span> : null}
      {now.note ? <span className="hidden text-muted md:inline">（{now.note}）</span> : null}
    </Link>
  );
}
