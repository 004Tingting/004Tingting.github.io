type Props = {
  children: React.ReactNode;
};

/** kicker：栏目标签小字（等宽 + 朱红点），杂志风的条目开头 */
export default function Kicker({ children }: Props) {
  return (
    <p className="font-mono text-sm tracking-widest text-muted">
      <span className="text-accent">·</span> {children}
    </p>
  );
}
