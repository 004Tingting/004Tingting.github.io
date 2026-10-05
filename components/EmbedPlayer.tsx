type Props = {
  src: string;
  title: string;
  /** video: 16/9 自适应（B站）；player: 固定高度（网易云 outchain 用 66 / 430） */
  aspect?: "video" | "player";
  height?: number;
  href?: string;
  hrefLabel?: string;
};

/** 第三方嵌入（B站 / 网易云），lazy 加载 + 外部链接降级 */
export default function EmbedPlayer({ src, title, aspect = "video", height, href, hrefLabel }: Props) {
  return (
    <div className="mt-3">
      <div className="overflow-hidden border border-rule">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allowFullScreen
          className="block w-full"
          style={aspect === "video" ? { aspectRatio: "16 / 9" } : { height: `${height ?? 152}px` }}
        />
      </div>
      {href ? (
        <p className="mt-2 font-mono text-xs">
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            ↗ {hrefLabel ?? href}
          </a>
        </p>
      ) : null}
    </div>
  );
}
