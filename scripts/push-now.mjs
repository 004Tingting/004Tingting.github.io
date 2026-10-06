/**
 * 本地常驻脚本：把「电脑上正在播放的音乐」实时推给网站。
 *
 * 为什么需要它：
 *   浏览器无法直连网易云接口（无 CORS），但本机没有这个限制。
 *   本脚本读 Last.fm 当前曲目 → 查网易云封面 → 经 GitHub API 推到 now-data 分支 →
 *   网站前端从 jsDelivr 读取（CORS 可用），实现「切歌后 ≤30 秒封面更新」。
 *
 * 用法：
 *   node scripts/push-now.mjs                 # 每 15 秒检查一次（默认）
 *   node scripts/push-now.mjs --interval 10   # 自定义间隔（秒）
 *   node scripts/push-now.mjs --once          # 只推一次（调试）
 *
 * 依赖：.env.local 中的 LASTFM_API_KEY / LASTFM_USER / GITHUB_TOKEN
 *   （GITHUB_TOKEN 可用 `gh auth token` 获取）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO = "004Tingting/004Tingting.github.io";
const BRANCH = "now-data";
const FILE = "now.json";

const args = process.argv.slice(2);
const once = args.includes("--once");
const intervalIdx = args.indexOf("--interval");
const INTERVAL_MS = (intervalIdx >= 0 ? Number(args[intervalIdx + 1]) : 15) * 1000;

// ---- 读取 .env.local（简易解析，避免额外依赖）----
function loadEnv() {
  const file = path.join(root, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();

const apiKey = process.env.LASTFM_API_KEY;
const user = process.env.LASTFM_USER;
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const missing = [
  !apiKey && "LASTFM_API_KEY",
  !user && "LASTFM_USER",
  !token && "GITHUB_TOKEN",
].filter(Boolean);
if (missing.length) {
  console.error(`✗ 缺少配置：${missing.join(" / ")}（请在 .env.local 中补全）`);
  process.exit(1);
}

/* ---------------- 数据获取 ---------------- */

/** Last.fm：当前曲目 */
async function fetchCurrent() {
  const url =
    `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
    `&user=${encodeURIComponent(user)}&api_key=${apiKey}&format=json&limit=1`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Last.fm HTTP ${res.status}`);
  const track = (await res.json())?.recenttracks?.track?.[0];
  if (!track) return null;
  return {
    title: track.name ?? "",
    artist: track.artist?.["#text"] ?? "",
    live: track["@attr"]?.nowplaying === "true",
    link: track.url ?? "",
  };
}

const coverCache = new Map();

/** 网易云：搜索 → 歌曲详情 → 专辑封面（本机直连，无 CORS 限制） */
async function findCover(title, artist) {
  const key = `${title}|${artist}`;
  if (coverCache.has(key)) return coverCache.get(key);
  try {
    const q = encodeURIComponent([title, artist].filter(Boolean).join(" "));
    const search = await fetch(`https://music.163.com/api/search/get/web?s=${q}&type=1&limit=1`).then(
      (r) => r.json(),
    );
    const song = search?.result?.songs?.[0];
    if (!song?.id) {
      coverCache.set(key, "");
      return "";
    }
    const detail = await fetch(
      `https://music.163.com/api/song/detail?ids=%5B${song.id}%5D`,
    ).then((r) => r.json());
    const url = detail?.songs?.[0]?.album?.picUrl ?? "";
    const cover = url ? `${url}?param=200y200` : "";
    coverCache.set(key, cover);
    return cover;
  } catch {
    coverCache.set(key, "");
    return "";
  }
}

/* ---------------- 推送（纯 HTTP，无需 git 子进程） ---------------- */

async function pushToGitHub(data) {
  const api = `https://api.github.com/repos/${REPO}/contents/${FILE}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "personal-site-push-now",
  };

  // 更新已有文件需要 sha
  let sha;
  const cur = await fetch(`${api}?ref=${BRANCH}`, { headers });
  if (cur.ok) {
    sha = (await cur.json()).sha;
  } else if (cur.status !== 404) {
    throw new Error(`读取现状失败 HTTP ${cur.status}`);
  }

  const res = await fetch(api, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `now: ${data.title} — ${data.artist}`,
      content: Buffer.from(`${JSON.stringify(data, null, 2)}\n`).toString("base64"),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`推送失败 HTTP ${res.status}: ${(await res.text()).slice(0, 150)}`);
  }
  return true;
}

/** 清除 jsDelivr 缓存，让前端立即拿到新数据 */
async function purgeCache() {
  try {
    await fetch(`https://purge.jsdelivr.net/gh/${REPO}@${BRANCH}/${FILE}`);
  } catch {
    /* purge 失败不致命（缓存过期后自更新） */
  }
}

/* ---------------- 主循环 ---------------- */

let lastSignature = "";

async function tick() {
  try {
    const current = await fetchCurrent();
    if (!current) {
      console.log("· 未获取到播放记录");
      return;
    }
    const cover = await findCover(current.title, current.artist);
    const data = { ...current, cover, updatedAt: new Date().toISOString() };
    const signature = `${data.title}|${data.artist}|${data.live}|${data.cover}`;

    if (signature === lastSignature) return; // 无变化，不推送

    await pushToGitHub(data);
    await purgeCache();
    lastSignature = signature;
    console.log(
      `✓ [${new Date().toLocaleTimeString()}] ${data.live ? "▶ 正在播放" : "· 最近播放"} ` +
        `${data.title} — ${data.artist}${cover ? "（含封面）" : "（无封面）"}`,
    );
  } catch (err) {
    console.error(`✗ ${err.message}`);
  }
}

console.log(`▸ 监听中（每 ${INTERVAL_MS / 1000} 秒检查一次，Ctrl+C 退出）`);
await tick();
if (!once) {
  setInterval(tick, INTERVAL_MS);
}
