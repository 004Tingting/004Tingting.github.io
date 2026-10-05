/**
 * 构建前执行：从 Last.fm 拉取「正在播放 / 最近收听」，写入 content/life/lastfm.json。
 *
 * - 需要环境变量 LASTFM_API_KEY 与 LASTFM_USER（本地放 .env.local / CI 放 GitHub Secrets）
 * - 未配置或拉取失败时：静默跳过并保留已有数据，绝不阻塞构建
 * - 正在播放曲目的封面下载到 public/now-cover.jpg（避免依赖 Last.fm 的图片 CDN 可达性）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.join(root, "content", "life", "lastfm.json");
const coverFile = path.join(root, "public", "now-cover.jpg");

const apiKey = process.env.LASTFM_API_KEY;
const user = process.env.LASTFM_USER;

if (!apiKey || !user) {
  console.log("· LASTFM_API_KEY / LASTFM_USER 未配置 → 跳过（保留现有数据）");
  process.exit(0);
}

const endpoint =
  `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
  `&user=${encodeURIComponent(user)}&api_key=${apiKey}&format=json&limit=10`;

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

const pickCover = (t) => {
  const imgs = t.image ?? [];
  const big =
    imgs.find((i) => i.size === "extralarge") ??
    imgs.find((i) => i.size === "large") ??
    imgs[imgs.length - 1];
  return big?.["#text"] ?? "";
};

const toEntry = (t) => ({
  title: t.name ?? "",
  artist: t.artist?.["#text"] ?? "",
  album: t.album?.["#text"] ?? "",
  url: t.url ?? "",
  cover: pickCover(t),
  playedAt: t.date?.uts ? new Date(Number(t.date.uts) * 1000).toISOString() : null,
});

const nowPlaying = tracks[0]?.["@attr"]?.nowplaying === "true";
const head = toEntry(tracks[0]);
const recent = (nowPlaying ? tracks.slice(1) : tracks).map(toEntry);

// 封面本地化（失败不致命，降级为无图）
if (head.cover) {
  try {
    const img = await fetch(head.cover);
    if (img.ok) {
      fs.writeFileSync(coverFile, Buffer.from(await img.arrayBuffer()));
      head.cover = "/now-cover.jpg";
    }
  } catch {
    /* 保留远程 URL，组件侧做兜底 */
  }
}

fs.writeFileSync(
  outFile,
  JSON.stringify(
    {
      source: "lastfm",
      generatedAt: new Date().toISOString(),
      nowPlaying,
      track: head,
      recent: recent.slice(0, 8),
    },
    null,
    2,
  ),
);

console.log(
  `✓ lastfm.json 已更新（${nowPlaying ? "正在播放" : "最近收听"}：${head.title} — ${head.artist}，最近 ${recent.length} 条）`,
);
