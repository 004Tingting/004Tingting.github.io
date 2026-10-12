/**
 * Epic Games 设备授权（一次性，照 legendary 协议实现）：
 *   node scripts/epic-auth.mjs start  → 生成授权链接（打印后等待 Ting 浏览器确认）
 *   node scripts/epic-auth.mjs poll   → 轮询授权结果，成功后存 .epic-auth.json 并实测 playtime
 *
 * 凭据文件 .epic-auth.json（已 gitignore）：access_token 会过期，fetch-monthly 用 refresh_token 自动续期。
 * client_id/secret 为 Epic Games Launcher 的公开内置值（legendary/Heroic 生态通用），非机密。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const authFile = path.join(root, ".epic-auth.json");

const CLIENT_ID = "34a02cf8f4414e29b15921876da36f9a";
// launcherAppClient2 的 secret（来源：MixV2/EpicResearch docs/auth/auth_clients.md 与 legendary-gl/legendary egs.py）
const CLIENT_SECRET = "daafbccc737745039dffe53d94fc76cf";
const TOKEN_URL = "https://api.epicgames.dev/epic/oauth/v2/token";
const DEVICE_URL = "https://api.epicgames.dev/epic/oauth/v2/deviceAuthorization";
const USERINFO_URL = "https://api.epicgames.dev/epic/oauth/v2/userInfo";
const PLAYTIME_URL = (accountId) =>
  `https://library-service.live.use1a.on.epicgames.com/api/playtime/account/${accountId}/all`;

const mode = process.argv[2] ?? "start";

const BASIC = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

const postForm = async (url, body) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${BASIC}`,
      Accept: "application/json",
    },
    body: new URLSearchParams(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json).slice(0, 200)}`);
  return json;
};

if (mode === "start") {
  const dev = await postForm(DEVICE_URL, { client_id: CLIENT_ID, client_secret: CLIENT_SECRET });
  const prev = fs.existsSync(authFile) ? JSON.parse(fs.readFileSync(authFile, "utf-8")) : {};
  fs.writeFileSync(
    authFile,
    `${JSON.stringify(
      { ...prev, status: "pending", device_code: dev.device_code, interval: dev.interval ?? 5 },
      null,
      2,
    )}\n`,
  );
  console.log("▸ 请在浏览器打开下面的链接并登录 Epic 账号确认授权：");
  console.log(`  ${dev.verification_uri_complete ?? dev.verification_uri}`);
  console.log(`  （用户码：${dev.user_code}，${Math.round(dev.expires_in / 60)} 分钟内有效）`);
  console.log("▸ 确认后运行：node scripts/epic-auth.mjs poll");
} else if (mode === "poll") {
  const saved = JSON.parse(fs.readFileSync(authFile, "utf-8"));
  if (saved.status !== "pending" || !saved.device_code) throw new Error("没有待确认的授权（先跑 start）");

  let token;
  const deadline = Date.now() + 150_000;
  const interval = (saved.interval ?? 5) * 1000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, interval));
    try {
      token = await postForm(TOKEN_URL, {
        grant_type: "device_code",
        device_code: saved.device_code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });
      break;
    } catch (err) {
      if (String(err.message).includes("authorization_pending")) continue;
      throw err;
    }
  }
  if (!token) throw new Error("轮询超时（150 秒内未确认）");

  const uiRes = await fetch(`${USERINFO_URL}?token=${token.access_token}`, {
    headers: { Authorization: `bearer ${token.access_token}` },
  });
  const userInfo = await uiRes.json().catch(() => ({}));
  const accountId = userInfo.id ?? token.account_id;

  const expiresAt = Date.now() + (token.expires_in ?? 3600) * 1000;
  fs.writeFileSync(
    authFile,
    `${JSON.stringify(
      {
        status: "authorized",
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expires_at: expiresAt,
        account_id: accountId,
        displayName: userInfo.preferred_username ?? "",
      },
      null,
      2,
    )}\n`,
  );
  console.log(`✓ 授权成功（账号：${userInfo.preferred_username ?? accountId}），凭据已存 .epic-auth.json`);

  // 实测 playtime 接口（LibraryService）
  try {
    const ptRes = await fetch(PLAYTIME_URL(accountId), {
      headers: { Authorization: `bearer ${token.access_token}`, Accept: "application/json" },
    });
    const pt = await ptRes.json().catch(() => []);
    if (!ptRes.ok) throw new Error(`HTTP ${ptRes.status}`);
    const rows = (Array.isArray(pt) ? pt : pt?.playtimeList ?? []).sort((a, b) => b.totalTime - a.totalTime);
    const sum = rows.reduce((s, r) => s + (r.totalTime ?? 0), 0);
    console.log(`✓ playtime 可用（${rows.length} 款，累计 ${(sum / 3600).toFixed(1)} 小时）top：`);
    for (const r of rows.slice(0, 5)) {
      console.log(`  ${(r.totalTime / 3600).toFixed(1)} h  ${r.artifactId}`);
    }
  } catch (err) {
    console.error(`✗ playtime 实测失败：${err.message}（token 已存，fetch-monthly 时再诊断）`);
  }
} else {
  console.error("未知模式：start | poll");
}
