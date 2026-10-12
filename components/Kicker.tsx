type Props = {
  children: React.ReactNode;
  /** 整行朱红（默认仅前导点为朱红） */
  accent?: boolean;
  /** 追加样式（如首页 hero 放大） */
  className?: string;
};

/** kicker：栏目标签小字（等宽 + 朱红点），杂志风的条目开头 */
export default function Kicker({ children, accent, className = "" }: Props) {
  return (
    <p
      className={`font-mono text-sm tracking-widest ${
        accent ? "text-accent" : "text-muted"
      } ${className}`}
    >
      <span className="text-accent">·</span> {children}
    </p>
  );
}
