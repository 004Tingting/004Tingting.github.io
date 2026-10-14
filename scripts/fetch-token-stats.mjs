/**
 * 构建前拉取 Token Monitor hub 多端聚合用量。
 *
 * 取数顺序（Ting 2026-10-14 定）：
 *   ① 独立快照仓库 004Tingting/token-monitor-data（Contents API，构建机对 api.github.com
 *      的可达性通常好于 workers.dev；该仓库由 GitHub Actions 每 15 分钟自动刷新）
 *   ② 仓库读不到 → 直连 hub 公开端点 /api/public/stats（免密钥）
 *   ③ 都失败 → 保留旧文件、不阻断构建
 *
 * 背景（2026-10-14）：Ting 把散落多处的 token monitor 合并到一台 Cloudflare Worker
 * hub（两台桌面 widget 上报，DO SQLite 存），本站「关于」页与首页侧栏展示聚合结果。
 * 端点形状经 token-monitor 仓库源码核实（Javis603/token-monitor）：
 *   - GET /api/public/stats：唯一免密钥数据路由（PUBLIC_STATS_ENABLED=1 开启），
 *     CORS *，cache-control: max-age=15；已剥离 devices/项目标识/账号，
 *     仅留 deviceCount + periods(today/month/allTime) + historyPreview(30d/12mo)
 *     + updatedAt + staleAfterMs（worker/src/index.js:359）
 *   - 完整历史（370 天窗口）在带密钥的 /api/history，密钥不进构建——
 *     全量基线由 dump-hub-history.ps1 每周导出为 content/arts/token-monitor-history.json
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_FILE = path.join(ROOT, "content", "arts", "token-monitor.json");
const HUB = "https://token-monitor-hub.saikouting004.workers.dev";
const DATA_REPO = { owner: "004Tingting", repo: "token-monitor-data", file: "token-monitor.json" };

// .env.local 手动加载：Node 脚本不会自动读它（只有 Next 读）。只填充未设置的字段。
try {
  for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf-8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {}

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** 归一化：hub 原始响应或仓库快照（同一种 normalized 形状）→ 本站快照格式 */
function normalize(s) {
  const p = s.periods ?? {};
  const pick = (name) => ({ totalTokens: num(p[name]?.totalTokens), costUsd: num(p[name]?.costUsd) });
  const preview = s.historyPreview ?? {};
  const rawDaily = Array.isArray(preview.daily) ? preview.daily : Array.isArray(s.daily) ? s.daily : [];
  const rawMonthly = Array.isArray(preview.monthly) ? preview.monthly : Array.isArray(s.monthly) ? s.monthly : [];
  return {
    source: "token-monitor-hub",
    fetchedAt: String(s.fetchedAt ?? new Date().toISOString()),
    hubUpdatedAt: String(s.hubUpdatedAt ?? s.updatedAt ?? ""),
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
}

/** ① 独立快照仓库（Contents API；无 token 或读不到返回 null） */
async function fetchFromRepo() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  const { owner, repo, file } = DATA_REPO;
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, {
    headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return null;
  const j = await res.json();
  const snap = JSON.parse(Buffer.from(j.content, "base64").toString("utf8"));
  if (!snap?.periods?.today) return null;
  return snap;
}

/** ② hub 公开端点（免密钥） */
async function fetchFromHub() {
  const res = await fetch(`${HUB}/api/public/stats`, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const s = await res.json();
  if (!s || s.ok !== true) throw new Error("响应缺少 ok:true（端点结构可能变了）");
  return normalize(s);
}

async function main() {
  let payload = null;
  let via = "";

  const repo = await fetchFromRepo().catch(() => null);
  if (repo) {
    payload = normalize(repo);
    via = "快照仓库（15 分钟级新鲜度）";
  } else {
    payload = await fetchFromHub();
    via = "hub 直连";
  }

  fs.writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`);
  const { today, allTime } = payload.periods;
  console.log(
    `✓ Token Monitor（${via}）：${payload.deviceCount} 台设备 · 今日 ${today.totalTokens.toLocaleString("en-US")} tokens · 累计 ${allTime.totalTokens.toLocaleString("en-US")}`,
  );
}

main().catch((e) => {
  // 失败不阻断构建：保留旧快照（页面按旧数据渲染），下次构建再试
  console.error(`✗ Token Monitor 拉取失败（保留旧 token-monitor.json）：${e.message}`);
});
