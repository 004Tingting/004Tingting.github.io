/**
 * 构建前拉取网易云歌单全量曲目（公开歌单，无需登录 Cookie）。
 *
 * 背景（2026-10-13 踩坑）：旧接口 /api/playlist/detail 会把 tracks 数组截断到
 * 10 条、且 trackCount 也谎报为 10——内嵌播放器（outchain player）读的是
 * /api/v6/playlist/detail，其 trackIds 才是全量。正确姿势：
 *   ① /api/v6/playlist/detail?id=X&n=1000 拿全量 trackIds
 *   ② /api/v3/song/detail?c=[{"id":…}] 分批取歌曲详情（按 id 映射回歌单顺序；
 *      旧的 /api/song/detail?ids= 已失效，返回 400）
 * 拉取失败时保留旧文件并告警，不阻断构建（与其他 fetch 脚本一致）。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_FILE = path.join(ROOT, "content", "arts", "playlist.json");
const PLAYLIST_ID = "13345990688";
const BATCH = 200;

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  Referer: "https://music.163.com/",
};

async function getJson(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return res.json();
}

async function main() {
  /* ① 全量曲目 id（歌单顺序） */
  const detail = await getJson(
    `https://music.163.com/api/v6/playlist/detail?id=${PLAYLIST_ID}&n=1000&s=0`,
  );
  const playlist = detail?.playlist;
  const ids = (playlist?.trackIds ?? []).map((t) => (typeof t === "object" && t ? t.id : t));
  if (!ids.length) throw new Error("trackIds 为空（接口结构可能变了）");

  /* ② 分批取详情，按 id 映射回歌单顺序。
     注意：/api/song/detail?ids= 已失效（400）；现用 /api/v3/song/detail?c=[{"id":…}]，
     字段为 v3 格式（ar = 艺人，al = 专辑，dt = 时长 ms）。 */
  const byId = new Map();
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const c = encodeURIComponent(JSON.stringify(chunk.map((id) => ({ id }))));
    const d = await getJson(`https://music.163.com/api/v3/song/detail?c=${c}`);
    for (const s of d?.songs ?? []) byId.set(s.id, s);
  }

  const tracks = ids.map((id) => {
    const s = byId.get(id);
    return {
      id,
      name: s?.name ?? `（已下架 #${id}）`,
      artist: (s?.ar ?? []).map((a) => a.name).join(" / "),
      album: s?.al?.name ?? "",
      duration: typeof s?.dt === "number" ? s.dt : 0,
    };
  });

  const payload = {
    source: "netease",
    playlistId: Number(PLAYLIST_ID),
    name: playlist?.name ?? "",
    trackCount: tracks.length,
    updatedAt: new Date().toISOString(),
    tracks,
  };
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`✓ 歌单《${payload.name}》${tracks.length} 首 → content/arts/playlist.json`);
}

main().catch((e) => {
  // 失败不阻断构建：保留旧文件（页面按旧数据渲染），下次构建再试
  console.error(`✗ 歌单拉取失败（保留旧 playlist.json）：${e.message}`);
});
