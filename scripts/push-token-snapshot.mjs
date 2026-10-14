/**
 * 拉一次 hub 最新快照 → 推送独立快照仓库（004Tingting/token-monitor-data）。
 *
 * 用法：node scripts/push-token-snapshot.mjs（.env.local 需有 GITHUB_TOKEN）
 *
 * 定位：手动补刀。仓库另有 GitHub Actions 每 15 分钟自动刷新（refresh.yml，需 workflow
 * scope 授权后启用）；当 hub 刚不可达、站点构建没用上最新数据时，跑一次本脚本即可把
 * 最新快照推上去——访客端的「云端快照」层级与下次构建都会立即受益，无需重新发布站点。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const HUB = "https://token-monitor-hub.saikouting004.workers.dev";
const REPO = { owner: "004Tingting", repo: "token-monitor-data", file: "token-monitor.json" };

// .env.local 手动加载（Node 脚本不自动读它；只填充未设置的字段）
try {
  for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf-8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {}

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** hub 原始响应 → normalized 快照（与 scripts/fetch-token-stats.mjs 同形状） */
function normalize(s) {
  const p = s.periods ?? {};
  const pick = (name) => ({ totalTokens: num(p[name]?.totalTokens), costUsd: num(p[name]?.costUsd) });
  const preview = s.historyPreview ?? {};
  const rawDaily = Array.isArray(preview.daily) ? preview.daily : [];
  const rawMonthly = Array.isArray(preview.monthly) ? preview.monthly : [];
  return {
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
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("缺少 GITHUB_TOKEN（.env.local）");

  /* ① 拉 hub */
  const res = await fetch(`${HUB}/api/public/stats`, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`hub HTTP ${res.status}`);
  const s = await res.json();
  if (!s || s.ok !== true) throw new Error("hub 响应缺少 ok:true");
  const payload = normalize(s);
  const { today, allTime } = payload.periods;

  /* ② 取当前文件 sha（更新需要） */
  const apiBase = `https://api.github.com/repos/${REPO.owner}/${REPO.repo}/contents/${REPO.file}`;
  const H = { authorization: `Bearer ${token}`, accept: "application/vnd.github+json" };
  const cur = await fetch(apiBase, { headers: H });
  const sha = cur.ok ? (await cur.json()).sha : undefined;

  /* ③ PUT 推送 */
  const put = await fetch(apiBase, {
    method: "PUT",
    headers: H,
    body: JSON.stringify({
      message: `snapshot: ${payload.fetchedAt}`,
      content: Buffer.from(`${JSON.stringify(payload, null, 2)}\n`, "utf8").toString("base64"),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!put.ok) throw new Error(`推送 HTTP ${put.status} ${(await put.text()).slice(0, 200)}`);
  const j = await put.json();

  console.log(
    `✓ 快照已推送 ${REPO.owner}/${REPO.repo}@${j.commit.sha.slice(0, 7)}：${payload.deviceCount} 台设备 · 今日 ${today.totalTokens.toLocaleString("en-US")} · 累计 ${allTime.totalTokens.toLocaleString("en-US")}`,
  );
}

main().catch((e) => {
  console.error(`✗ 快照推送失败：${e.message}`);
  process.exitCode = 1;
});
