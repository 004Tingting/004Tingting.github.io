import type { Lang } from "@/lib/i18n";

/**
 * 月度趋势折线（杂志风 SVG，构建时渲染，零依赖零客户端 JS）。
 * - 折线/数据点用唯一强调色，基线与刻度用 hairline/灰
 * - 每个数据点内嵌 <title>，浏览器原生 hover 提示
 * - 全零序列显示「积累中」占位；若传 baseline（差分基线月的当前累计），
 *   则在末月位置画单点 + 数值标注——积累期也有信息量
 */
const W = 640;
const H = 170;
const PAD = { l: 8, r: 8, t: 22, b: 28 };

const MONTH_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmt(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function monthLabel(m: string, lang: Lang): string {
  const mm = Number(m.slice(5, 7));
  return lang === "zh" ? `${mm}月` : (MONTH_EN[mm - 1] ?? m);
}

type Props = {
  months: string[];
  values: number[];
  label: string;
  unit: string;
  lang: Lang;
  emptyNote: string;
  /** 差分基线月的当前累计（小时）——values 全 0 时展示单点标注；null/undefined = 无数据 */
  baseline?: number | null;
  /** 基线小标（如「基线」/ baseline），拼在数值后 */
  baselineLabel?: string;
  /** 数值格式化（默认 1 位小数；影卷传 2 位） */
  fmtValue?: (v: number) => string;
};

export default function MonthlyTrend({
  months,
  values,
  label,
  unit,
  lang,
  emptyNote,
  baseline = null,
  baselineLabel = "",
  fmtValue = fmt,
}: Props) {
  const n = months.length;
  const maxV = Math.max(...values, 0);
  const hasData = maxV > 0 && n > 1;
  const showBaseline = !hasData && baseline !== null && baseline > 0;
  const baseX = W - PAD.r;
  const baseY = H / 2 - 8;

  const x = (i: number) =>
    n <= 1 ? (PAD.l + (W - PAD.l - PAD.r) / 2) : PAD.l + (i * (W - PAD.l - PAD.r)) / (n - 1);
  const y = (v: number) => PAD.t + (1 - v / maxV) * (H - PAD.t - PAD.b);

  const pts = values.map((v, i) => ({ x: x(i), y: y(v), v, m: months[i] }));
  const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = hasData
    ? `${x(0).toFixed(1)},${H - PAD.b} ${line} ${x(n - 1).toFixed(1)},${H - PAD.b}`
    : "";

  const peak = pts.reduce((a, b) => (b.v > a.v ? b : a), pts[0] ?? { x: 0, y: 0, v: 0, m: "" });
  const step = Math.max(1, Math.ceil(n / 6));
  const tickIdx = pts.map((_, i) => i).filter((i) => i % step === 0 || i === n - 1);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-serif text-sm font-semibold">{label}</h3>
        <span className="font-mono text-[11px] text-muted">{unit}</span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        role="img"
        aria-label={`${label}（${unit}）`}
      >
        {/* 基线 hairline */}
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} className="stroke-rule" strokeWidth="1" />

        {hasData ? (
          <>
            {/* 面积（轻着色） */}
            <polygon points={area} className="fill-accent/10" />
            {/* 折线 */}
            <polyline
              points={line}
              className="fill-none stroke-accent"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* 数据点（原生 tooltip） */}
            {pts.map((p) => (
              <circle key={p.m} cx={p.x} cy={p.y} r="2.5" className="fill-accent">
                <title>{`${monthLabel(p.m, lang)} · ${fmtValue(p.v)}`}</title>
              </circle>
            ))}
            {/* 峰值标注（首末点改对齐方向防溢出） */}
            <text
              x={peak.x}
              y={peak.y - 9}
              textAnchor={peak.x < 30 ? "start" : peak.x > W - 30 ? "end" : "middle"}
              className="fill-accent font-mono"
              fontSize="11"
            >
              {fmtValue(peak.v)}
            </text>
          </>
        ) : (
          <>
            {/* 基线月：末月位置单点 + 数值标注（积累期仍有信息量） */}
            {showBaseline ? (
              <>
                <line
                  x1={PAD.l}
                  y1={baseY}
                  x2={baseX}
                  y2={baseY}
                  className="stroke-rule"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
                <circle cx={baseX} cy={baseY} r="3" className="fill-accent" />
                <text
                  x={baseX}
                  y={baseY - 9}
                  textAnchor="end"
                  className="fill-accent font-mono"
                  fontSize="11"
                >
                  {`${fmtValue(baseline)}${baselineLabel ? ` ${baselineLabel}` : ""}`}
                </text>
              </>
            ) : null}
            <text
              x={W / 2}
              y={showBaseline ? baseY + 20 : H / 2}
              textAnchor="middle"
              className="fill-muted font-mono"
              fontSize="11"
            >
              {emptyNote}
            </text>
          </>
        )}

        {/* 月份刻度 */}
        {tickIdx.map((i) => (
          <text
            key={months[i]}
            x={x(i)}
            y={H - 9}
            textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
            className="fill-muted font-mono"
            fontSize="10"
          >
            {monthLabel(months[i], lang)}
          </text>
        ))}
      </svg>
    </div>
  );
}
