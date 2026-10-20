import type { Lang } from "@/lib/i18n";

/**
 * 看板横截面横条（杂志风，构建时渲染，零依赖零客户端 JS）。
 *
 * 两种形态：
 *   · `variant="split"` —— 堆叠条：一个总量按来源切成几段（游戏平台分布用），
 *     条下配图例（衬线名 + 等宽数字），每段用不同透明度的同一强调色，不引入新色。
 *   · `variant="rank"`  —— 排行条：每行「名次 / 名称 / 横条 / 数值」（影卷按类型、常听歌手用）。
 *
 * 设计约束（DESIGN.md）：唯一彩色是朱红，所以多段靠 opacity 分档而不是换色；
 * 分隔用 1px hairline，不用圆角大块和阴影。
 */

export type SplitItem = { label: string; hours: number };

/**
 * 平台分布：每个来源一行独立横条（**不用堆叠条**）。
 *
 * 为什么不用堆叠条：Steam 7140h 占总量 96%，堆叠后 WeGame(15%) 只剩一条细线、
 * Epic(0.2%) 几乎不可见——量级差太大时堆叠会「吃掉」小项。
 * 改成一行一项、横条按各自相对最大值的比例，小项也能看清自己的占比。
 * 每行右侧同时给「小时」与「占总量的百分比」，信息比堆叠更完整。
 */
export function PlatformBars({
  items,
  unit,
  format = (v) => v.toFixed(1),
}: {
  items: SplitItem[];
  unit: string;
  format?: (v: number) => string;
}) {
  const total = items.reduce((s, it) => s + it.hours, 0);
  if (total <= 0) return null;
  const max = Math.max(...items.map((i) => i.hours), 1);

  return (
    <div className="space-y-2.5">
      {items.map((it, i) => {
        const pctOfMax = (it.hours / max) * 100;
        const pctOfTotal = (it.hours / total) * 100;
        return (
          <div key={it.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 truncate font-serif text-sm font-semibold">{it.label}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-rule/50">
              <span
                className="block h-full rounded-full bg-accent"
                style={{ width: `${Math.max(2, pctOfMax)}%`, opacity: [1, 0.78, 0.56, 0.36][i % 4] }}
              />
            </span>
            <span className="w-24 shrink-0 text-right font-mono text-xs text-muted">
              {format(it.hours)} {unit}
            </span>
            <span className="w-12 shrink-0 text-right font-mono text-[11px] text-muted/70">
              {pctOfTotal < 1 ? "<1" : pctOfTotal.toFixed(0)}%
            </span>
          </div>
        );
      })}
      <div className="flex items-center gap-3 border-t border-rule/60 pt-2">
        <span className="w-24 shrink-0 font-mono text-[11px] text-muted">合计</span>
        <span className="flex-1" />
        <span className="w-24 shrink-0 text-right font-mono text-xs">
          {format(total)} {unit}
        </span>
        <span className="w-12 shrink-0" />
      </div>
    </div>
  );
}

/** 多段堆叠条：总量按来源分段，段间留 1px 纸色缝隙（仅用于量级相近的分段） */
export function SplitBar({
  items,
  unit,
  format = (v) => v.toFixed(1),
  lang,
}: {
  items: SplitItem[];
  unit: string;
  format?: (v: number) => string;
  lang: Lang;
}) {
  const total = items.reduce((s, it) => s + it.hours, 0);
  if (total <= 0) return null;

  /* 段透明度分档：第一段最实，往后依次变浅，保持「朱红唯一色」 */
  const shades = [1, 0.72, 0.48, 0.3, 0.18];

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-sm bg-rule/40">
        {items.map((it, i) => {
          const pct = (it.hours / total) * 100;
          if (pct <= 0) return null;
          return (
            <span
              key={it.label}
              className="h-full bg-accent"
              style={{
                width: `${pct}%`,
                opacity: shades[i % shades.length],
                /* 段间 1px 纸色缝隙（用 outline 而非 border，避免挤压宽度计算） */
                boxShadow: i > 0 ? "inset 1px 0 0 var(--color-paper)" : undefined,
              }}
              title={`${it.label} · ${format(it.hours)} ${unit}`}
            />
          );
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-baseline gap-1.5">
            <span
              className="inline-block h-2 w-2 shrink-0 translate-y-[-1px] rounded-sm bg-accent"
              style={{ opacity: shades[i % shades.length] }}
            />
            <span className="font-serif text-xs">{it.label}</span>
            <span className="font-mono text-[11px] text-muted">
              {format(it.hours)} {unit}
            </span>
          </li>
        ))}
        <li className="flex items-baseline gap-1.5">
          <span className="font-mono text-[11px] text-muted">
            {lang === "zh" ? "合计" : "total"} {format(total)} {unit}
          </span>
        </li>
      </ul>
    </div>
  );
}

/** 排行条：名次 + 名称 + 相对最大值的横条 + 数值 */
export function RankBar({
  items,
  unit,
  format = (v) => v.toFixed(1),
  /** 每行右侧附加说明（如「12 部」） */
  meta,
}: {
  items: Array<{ label: string; hours: number; meta?: string }>;
  unit: string;
  format?: (v: number) => string;
  meta?: (it: { label: string; hours: number; meta?: string }) => string | undefined;
}) {
  if (items.length === 0) return null;
  const max = Math.max(...items.map((i) => i.hours), 1);

  return (
    <div className="mt-4 space-y-2.5">
      {items.map((it, i) => {
        /* 时长为 0 = 条目存在但没填时长（如漫画/小说未折算）——显示「—」并保留占位条，
           不写成「0.00 小时」，免得读成「没有内容」 */
        const noHours = it.hours <= 0;
        return (
          <div key={it.label} className="flex items-center gap-3">
            <span className="w-5 shrink-0 font-mono text-[11px] text-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="w-40 shrink-0 truncate font-serif text-sm font-semibold">{it.label}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-rule/50">
              {!noHours && (
                <span
                  className="block h-full rounded-full bg-accent"
                  style={{ width: `${Math.max(3, (it.hours / max) * 100)}%` }}
                />
              )}
            </span>
            <span className="w-20 shrink-0 text-right font-mono text-xs text-muted">
              {noHours ? "—" : `${format(it.hours)} ${unit}`}
            </span>
            {(meta ?? ((x) => x.meta))(it) ? (
              <span className="w-14 shrink-0 text-right font-mono text-[11px] text-muted/70">
                {(meta ?? ((x) => x.meta))(it)}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
