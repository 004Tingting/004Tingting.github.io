/**
 * 构建前拉取 Token Monitor hub 多端聚合用量（免密钥公开端点）。
 *
 * 背景（2026-10-14）：Ting 把散落多处的 token monitor 合并到一台 Cloudflare Worker
 * hub（两台桌面 widget 上报，hub 聚合），本站「关于」页与首页侧栏展示聚合结果。
 * 端点形状经 token-monitor 仓库源码核实（Javis603/token-monitor）：
 *   - GET /api/public/stats：唯一免密钥数据路由（PUBLIC_STATS_ENABLED=1 开启），
 *     CORS *，cache-control: max-age=15；已剥离 devices/项目标识/账号，
 *     仅留 deviceCount + periods(today/month/allTime) + historyPreview(30d/12mo)
 *     + updatedAt + staleAfterMs（worker/src/index.js:359）
 *   - 完整历史（370 天窗口）在带密钥的 /api/history，密钥不进构建——
 *     全量基线由 dump-hub-history.ps1 每周导出为 content/arts/token-monitor-history.json
 * 拉取失败时保留旧文件并告警，不阻断构建（与其他 fetch 脚本一致；
 * workers.dev 国内可达性因机器/时段而异，失败是预期内情况）。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_FILE = path.join(ROOT, "content", "arts", "token-monitor.json");
const HUB = "https://token-monitor-hub.saikouting004.workers.dev";
const TIMEOUT_MS = 20000;

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

async function main() {
  const res = await fetch(`${HUB}/api/public/stats`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const s = await res.json();
  if (!s || s.ok !== true) throw new Error("响应缺少 ok:true（端点结构可能变了）");

  const periods = s.periods ?? {};
  const pick = (name) => ({
    totalTokens: num(periods[name]?.totalTokens),
    costUsd: num(periods[name]?.costUsd),
  });

  const preview = s.historyPreview ?? {};
  const rawDaily = Array.isArray(preview.daily) ? preview.daily : [];
  const rawMonthly = Array.isArray(preview.monthly) ? preview.monthly : [];

  const payload = {
    source: "token-monitor-hub",
    fetchedAt: new Date().toISOString(),
    hubUpdatedAt: String(s.updatedAt ?? ""),
    staleAfterMs: num(s.staleAfterMs),
    deviceCount: num(s.deviceCount),
    periods: { today: pick("today"), month: pick("month"), allTime: pick("allTime") },
    daily: rawDaily.map((d) => ({
      date: String(d.date ?? ""),
      tokens: num(d.tokens),
      cost: num(d.cost),
      activeTimeMs: num(d.activeTimeMs),
    })),
    monthly: rawMonthly.map((m) => ({
      month: String(m.month ?? ""),
      tokens: num(m.tokens),
      cost: num(m.cost),
      activeTimeMs: num(m.activeTimeMs),
    })),
  };

  fs.writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`);
  const { today, allTime } = payload.periods;
  console.log(
    `✓ Token Monitor hub：${payload.deviceCount} 台设备 · 今日 ${today.totalTokens.toLocaleString("en-US")} tokens · 累计 ${allTime.totalTokens.toLocaleString("en-US")}`,
  );
}

main().catch((e) => {
  // 失败不阻断构建：保留旧快照（页面按旧数据渲染），下次构建再试
  console.error(`✗ Token Monitor hub 拉取失败（保留旧 token-monitor.json）：${e.message}`);
});
