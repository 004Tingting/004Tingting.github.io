/**
 * 构建前执行：从 Last.fm 拉取「正在播放 / 最近收听」，写入 content/life/lastfm.json；
 * 同时为最近 10 首生成网易云封面映射（public/covers/<hash>.jpg + content/life/covers.json）。
 *
 * 为什么要预生成封面：
 *   浏览器无法直连网易云接口（无 CORS），iTunes 等替代源对日文/中文歌匹配不准，
 *   因此采用「构建时映射表 + 同源图片」：前端切歌时查 covers.json 即时换图。
 *
 * - 需要 LASTFM_API_KEY / LASTFM_USER（本地 .env.local、CI 用 GitHub Secrets）
 * - 未配置或拉取失败：静默跳过并保留已有数据，绝不阻塞构建
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.join(root, "content", "life", "lastfm.json");
const coversJson = path.join(root, "public", "covers.json");
const coversDir = path.join(root, "public", "covers");

const apiKey = process.env.LASTFM_API_KEY;
const user = process.env.LASTFM_USER;

if (!apiKey || !user) {
  console.log("· LASTFM_API_KEY / LASTFM_USER 未配置 → 跳过（保留现有数据）");
  process.exit(0);
}

const endpoint =
  `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
  `&user=${encodeURIComponent(user)}&api_key=${apiKey}&format=json&limit=50`;

let payload;
try {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  payload = await res.json();
  if (payload.error) throw new Error(`${payload.error}: ${payload.message}`);
} catch (err) {
  console.error(`✗ Last.fm 拉取失败：${err.message} → 保留现有数据，继续构建`);
  process.exit(0);
}

const tracks = payload?.recenttracks?.track ?? [];
if (!tracks.length) {
  console.log("· Last.fm 无收听记录 → 跳过");
  process.exit(0);
}

const toEntry = (t) => ({
  title: t.name ?? "",
  artist: t.artist?.["#text"] ?? "",
  album: t.album?.["#text"] ?? "",
  url: t.url ?? "",
  cover: "",
  playedAt: t.date?.uts ? new Date(Number(t.date.uts) * 1000).toISOString() : null,
});

const nowPlaying = tracks[0]?.["@attr"]?.nowplaying === "true";
const head = toEntry(tracks[0]);
// 第一条已作为 head 展示（正在播放 / 最近一条），列表里不重复
let recent = tracks.slice(1).map(toEntry);

/** 网易云公开搜索接口 → 歌曲详情 → 专辑封面 URL */
async function findNetEaseCover(title, artist) {
  if (!title) return "";
  try {
    const q = encodeURIComponent([title, artist].filter(Boolean).join(" "));
    const search = await fetch(`https://music.163.com/api/search/get/web?s=${q}&type=1&limit=1`).then(
      (r) => r.json(),
    );
    const song = search?.result?.songs?.[0];
    if (!song?.id) return "";
    const detail = await fetch(
      `https://music.163.com/api/song/detail?ids=%5B${song.id}%5D`,
    ).then((r) => r.json());
    return detail?.songs?.[0]?.album?.picUrl ?? "";
  } catch {
    return "";
  }
}

const hashName = (s) => crypto.createHash("md5").update(s).digest("hex").slice(0, 12);

// ---- 封面映射表：最近 50 首，每次构建重建 ----
const coverMap = {};
const all = [head, ...recent].slice(0, 50);
const seen = new Set();
if (all.length) {
  fs.rmSync(coversDir, { recursive: true, force: true }); // 少量文件，避免无限累积
  fs.mkdirSync(coversDir, { recursive: true });

  for (const t of all) {
    const key = `${t.title}|${t.artist}`;
    if (!t.title || seen.has(key)) continue;
    seen.add(key);

    const remote = await findNetEaseCover(t.title, t.artist);
    if (!remote) continue;

    const thumb = remote.includes("?") ? remote : `${remote}?param=200y200`;
    try {
      const img = await fetch(thumb);
      if (!img.ok) continue;
      const file = `${hashName(key)}.jpg`;
      fs.writeFileSync(path.join(coversDir, file), Buffer.from(await img.arrayBuffer()));
      coverMap[key] = `/covers/${file}`;
    } catch {
      /* 单张失败不影响整体 */
    }
    // 轻微节流，避免网易云接口限流
    await new Promise((r) => setTimeout(r, 60));
  }

  fs.writeFileSync(coversJson, `${JSON.stringify(coverMap, null, 2)}\n`);
}

head.cover = coverMap[`${head.title}|${head.artist}`] ?? "";
recent = recent.map((t) => ({ ...t, cover: coverMap[`${t.title}|${t.artist}`] ?? "" }));

fs.writeFileSync(
  outFile,
  `${JSON.stringify(
    {
      source: "lastfm",
      generatedAt: new Date().toISOString(),
      nowPlaying,
      track: head,
      recent: recent.slice(0, 8),
    },
    null,
    2,
  )}\n`,
);

console.log(
  `✓ lastfm.json 已更新（${nowPlaying ? "正在播放" : "最近收听"}：${head.title} — ${head.artist}，` +
    `最近 ${recent.length} 条，封面 ${Object.keys(coverMap).length}/${seen.size}）`,
);
