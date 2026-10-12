/**
 * 构建前执行（月度趋势数据）：
 *
 * 1. Last.fm scrobbles 按月计数（近 12 个月）→ content/arts/lastfm-monthly.json
 *    月度听歌趋势是「天然逐次型」：每条 scrobble 带时间戳，直接按月分桶。
 *
 * 2. 游戏 / 影卷 / 网易云听歌快照 → content/arts/stats-history.json（追加式，同月覆盖）
 *    游戏/影卷 hours 是累计值（快照型）：月度新增 = 邻月快照差分，需要逐月快照积累。
 *    网易云 playCount 同为累计值，折算成听歌分钟（playCount × 单曲时长 dt）入快照，
 *    键 = 「歌名|歌手」；需要 NETEASE_MUSIC_U（.env.local，登录态才有次数）+ NETEASE_UID。
 *    快照来源 = content/arts/{games,screen}/zh/*.md 的 frontmatter（zh 为主，en 兜底）。
 *
 * - 需要 LASTFM_API_KEY / LASTFM_USER（.env.local / CI Secrets）；未配置或失败 → 跳过音乐部分
 * - 快照部分不依赖网络，总能执行；文件无变化时不写入（避免构建噪音）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artsDir = path.join(root, "content", "arts");
const monthlyFile = path.join(artsDir, "lastfm-monthly.json");
const historyFile = path.join(artsDir, "stats-history.json");

// .env.local 手动加载：Node 脚本不会自动读它（只有 Next 读）。
// 只填充未设置的字段——CI 里 GitHub Secrets 注入的环境变量优先。
try {
  for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf-8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {}

/* ---------- 月份轴（本地时区，近 8 个月，含本月；与 lib/arts.ts 的 MONTH_COUNT 保持一致） ---------- */

const pad2 = (n) => String(n).padStart(2, "0");
const monthKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

const now = new Date();
const MONTH_COUNT = 8;
const MONTHS = [];
for (let i = MONTH_COUNT - 1; i >= 0; i--) {
  MONTHS.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
}
const CURRENT = MONTHS[MONTHS.length - 1];

/* ---------- 1. Last.fm scrobbles 按月计数 ---------- */

const apiKey = process.env.LASTFM_API_KEY;
const user = process.env.LASTFM_USER;

if (!apiKey || !user) {
  console.log("· LASTFM_API_KEY / LASTFM_USER 未配置 → 月度听歌跳过（保留现有数据）");
} else {
  try {
    // 窗口起点 = 首月月初 00:00（本地时区）；终点 = 现在
    const [y, m] = MONTHS[0].split("-").map(Number);
    const from = Math.floor(new Date(y, m - 1, 1).getTime() / 1000);
    const to = Math.floor(now.getTime() / 1000);

    const counts = Object.fromEntries(MONTHS.map((k) => [k, 0]));
    const base =
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
      `&user=${encodeURIComponent(user)}&api_key=${apiKey}&format=json&limit=200`;

    // 第一页拿总页数
    const first = await fetch(`${base}&from=${from}&to=${to}&page=1`).then((r) => r.json());
    if (first.error) throw new Error(`${first.error}: ${first.message}`);
    const attr = first?.recenttracks?.["@attr"] ?? {};
    const totalPages = Math.min(Number(attr.totalPages ?? 1), 60); // 60 页（1.2 万条）封顶防失控

    const bucket = (t) => {
      if (!t?.date?.uts) return null; // nowplaying 条目无时间戳
      return monthKey(new Date(Number(t.date.uts) * 1000));
    };
    for (const t of first?.recenttracks?.track ?? []) {
      const k = bucket(t);
      if (k && k in counts) counts[k]++;
    }

    for (let p = 2; p <= totalPages; p++) {
      await new Promise((r) => setTimeout(r, 150)); // 节流
      const page = await fetch(`${base}&from=${from}&to=${to}&page=${p}`).then((r) => r.json());
      for (const t of page?.recenttracks?.track ?? []) {
        const k = bucket(t);
        if (k && k in counts) counts[k]++;
      }
    }

    fs.writeFileSync(
      monthlyFile,
      `${JSON.stringify(
        { source: "lastfm-monthly", generatedAt: now.toISOString(), unit: "scrobbles", monthly: counts },
        null,
        2,
      )}\n`,
    );
    const sum = Object.values(counts).reduce((s, v) => s + v, 0);
    console.log(`✓ lastfm-monthly.json 已更新（近 12 个月共 ${sum} 次 scrobble，${totalPages} 页）`);
  } catch (err) {
    console.error(`✗ 月度听歌拉取失败：${err.message} → 保留现有数据，继续构建`);
  }
}

/* ---------- 1.5 网易云官方听歌时长（全量口径：总时长 + 当月时长） ---------- */

const NETEASE_UID = process.env.NETEASE_UID || "547547014";
const musicU = process.env.NETEASE_MUSIC_U;
const neteaseMonthlyFile = path.join(artsDir, "netease-monthly.json");
let neteaseMonthly = { source: "netease-monthly", note: "", updatedAt: "", totalHours: null, monthly: {} };
if (fs.existsSync(neteaseMonthlyFile)) {
  try {
    neteaseMonthly = { ...neteaseMonthly, ...JSON.parse(fs.readFileSync(neteaseMonthlyFile, "utf-8")) };
  } catch {
    /* 损坏则重建（人工回填月份会丢——除非从 git 恢复，改前先 commit） */
  }
}
if (!neteaseMonthly.monthly || typeof neteaseMonthly.monthly !== "object") neteaseMonthly.monthly = {};

if (!musicU) {
  console.log("· NETEASE_MUSIC_U 未配置 → 网易云官方时长跳过");
} else {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    Referer: "https://music.163.com/",
    Cookie: `MUSIC_U=${musicU}`,
  };
  try {
    // 总收听时长（接口返回秒；与官方页头「总时长」一致）
    const totalRes = await fetch("https://music.163.com/api/content/activity/listen/data/total", { headers });
    if (!totalRes.ok) throw new Error(`total HTTP ${totalRes.status}`);
    const totalData = (await totalRes.json())?.data;
    if (typeof totalData?.totalDuration !== "number") throw new Error("total 数据异常");
    neteaseMonthly.totalHours = Math.round((totalData.totalDuration / 3600) * 10) / 10;

    // 当月收听时长（realtime/report 返回分钟，与官方「本月收听时长」页头逐分一致）
    const rtRes = await fetch(
      "https://music.163.com/api/content/activity/listen/data/realtime/report?type=month",
      { headers },
    );
    if (!rtRes.ok) throw new Error(`realtime HTTP ${rtRes.status}`);
    const rtData = (await rtRes.json())?.data;
    const minutes = rtData?.listenTimeDistributionBlock?.playDuration;
    if (typeof minutes !== "number") throw new Error("realtime 数据异常");

    // 只覆盖「当前月」键——历史月份是官方截图人工回填，永不触碰
    neteaseMonthly.monthly[CURRENT] = minutes;
    neteaseMonthly.updatedAt = now.toISOString();
    fs.writeFileSync(neteaseMonthlyFile, `${JSON.stringify(neteaseMonthly, null, 2)}\n`);
    console.log(
      `✓ netease-monthly.json 已更新（总 ${neteaseMonthly.totalHours}h / ${CURRENT} ${minutes} 分钟）`,
    );
  } catch (err) {
    console.error(`✗ 网易云官方时长拉取失败：${err.message} → 保留现有数据`);
  }
}

/* ---------- 2. 网易云 top100 听歌排行快照（备份口径，暂不用于展示） ---------- */

let netease = null;

if (!musicU) {
  console.log("· NETEASE_MUSIC_U 未配置 → 网易云听歌快照跳过");
} else {
  try {
    // 听歌排行：GET 即可（无需 weapi 加密），Cookie 只需 MUSIC_U。
    // 无登录态也能返回 top 100，但 playCount 全为 0——次数仅登录态可见。
    const res = await fetch(`https://music.163.com/api/v1/play/record?uid=${NETEASE_UID}&type=0`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Referer: "https://music.163.com/",
        Cookie: `MUSIC_U=${musicU}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    const all = payload?.allData ?? [];
    if (!all.length) throw new Error("allData 为空（Cookie 可能已过期）");

    netease = {};
    for (const it of all) {
      const name = it?.song?.name;
      const artist = it?.song?.ar?.[0]?.name ?? "";
      const pc = it?.playCount; // 累计播放次数
      const dt = it?.song?.dt; // 单曲时长（毫秒，返回自带，无需补查 song/detail）
      if (!name || typeof pc !== "number" || typeof dt !== "number" || dt <= 0) continue;
      // 折算累计听歌分钟（次数 × 时长）；键用「歌名|歌手」保持跨月稳定
      netease[`${name}|${artist}`] = Math.round(((pc * dt) / 60000) * 10) / 10;
    }
    if (!Object.keys(netease).length) throw new Error("无可解析的听歌记录");
    const totalH = Object.values(netease).reduce((s, v) => s + v, 0) / 60;
    console.log(`✓ 网易云听歌记录已获取（top ${Object.keys(netease).length}，累计 ${totalH.toFixed(1)} 小时）`);
  } catch (err) {
    console.error(`✗ 网易云拉取失败：${err.message} → 本次快照不含网易云（沿用旧值）`);
    netease = null;
  }
}

/* ---------- 2.5 Steam 游戏时长快照（全库，分钟→小时；官方 API，GET 即可） ---------- */

const steamKey = process.env.STEAM_API_KEY;
const steamId = process.env.STEAM_ID;
let steam = null;

if (!steamKey || !steamId) {
  console.log("· STEAM_API_KEY / STEAM_ID 未配置 → Steam 快照跳过");
} else {
  try {
    const url =
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/` +
      `?key=${steamKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const games = (await res.json())?.response?.games ?? [];
    if (!games.length) throw new Error("games 为空（key 失效或隐私设置问题）");

    steam = {};
    for (const g of games) {
      if (typeof g.playtime_forever !== "number" || g.playtime_forever <= 0) continue;
      const name = g.name || `appid_${g.appid}`;
      steam[name] = Math.round((g.playtime_forever / 60) * 10) / 10; // 分钟 → 小时
    }
    const totalH = Object.values(steam).reduce((s, v) => s + v, 0);
    console.log(
      `✓ Steam 游戏记录已获取（${Object.keys(steam).length} 款有游玩记录，累计 ${totalH.toFixed(1)} 小时）`,
    );
  } catch (err) {
    console.error(`✗ Steam 拉取失败：${err.message} → 本次快照不含 Steam（沿用旧值）`);
    steam = null;
  }
}

/* ---------- 2.6 WeGame 游戏时长快照（无 API：Ting 每周人工报数 → content/arts/wegame-games.json） ---------- */

const wegameFile = path.join(artsDir, "wegame-games.json");
let wegame = null;
try {
  if (fs.existsSync(wegameFile)) {
    const data = JSON.parse(fs.readFileSync(wegameFile, "utf-8"));
    if (data?.games && Object.keys(data.games).length) wegame = data.games;
  }
} catch {
  /* 损坏则跳过，保留旧快照 */
}
if (wegame) {
  const totalH = Object.values(wegame).reduce((s, v) => s + v, 0);
  console.log(`✓ WeGame 人工数据已读入（${Object.keys(wegame).length} 款，累计 ${totalH.toFixed(1)} 小时）`);
} else {
  console.log("· wegame-games.json 无有效数据 → WeGame 快照跳过（沿用旧值）");
}

/* ---------- 2.7 Epic 游戏时长快照（无可用 API：Ting 人工报数 → content/arts/epic-games.json） ---------- */

const epicFile = path.join(artsDir, "epic-games.json");
let epic = null;
try {
  if (fs.existsSync(epicFile)) {
    const data = JSON.parse(fs.readFileSync(epicFile, "utf-8"));
    if (data?.games && Object.keys(data.games).length) epic = data.games;
  }
} catch {
  /* 损坏则跳过，保留旧快照 */
}
if (epic) {
  const totalH = Object.values(epic).reduce((s, v) => s + v, 0);
  console.log(`✓ Epic 人工数据已读入（${Object.keys(epic).length} 款，累计 ${totalH.toFixed(1)} 小时）`);
} else {
  console.log("· epic-games.json 无数据 → Epic 快照跳过");
}

/* ---------- 3. 游戏 / 影卷 / 网易云 / Steam / WeGame / Epic → stats-history.json（追加式快照，同月覆盖） ---------- */

/** 读某栏目条目 frontmatter（title + hours）；数据以 zh 为准（en 是镜像翻译，标题不同会重复计数），zh 缺失才整栏目回退 en */
function readHours(dirName) {
  for (const lang of ["zh", "en"]) {
    const dir = path.join(artsDir, dirName, lang);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    if (!files.length) continue;
    const out = {};
    for (const f of files) {
      try {
        const { data } = matter(fs.readFileSync(path.join(dir, f), "utf-8"));
        const title = typeof data.title === "string" && data.title ? data.title : f.replace(/\.md$/, "");
        const hours = typeof data.hours === "number" ? data.hours : null;
        if (hours !== null && hours >= 0) out[title] = hours;
      } catch {
        /* 单文件解析失败不影响整体 */
      }
    }
    if (Object.keys(out).length) return out; // zh 优先命中即返回
  }
  return {};
}

const games = readHours("games");
const screen = readHours("screen");

let history = { source: "stats-history", updatedAt: "", snapshots: {} };
if (fs.existsSync(historyFile)) {
  try {
    history = { ...history, ...JSON.parse(fs.readFileSync(historyFile, "utf-8")) };
  } catch {
    /* 损坏则重建 */
  }
}
if (!history.snapshots || typeof history.snapshots !== "object") history.snapshots = {};

const prevSnap = history.snapshots[CURRENT] ?? {};
const snapshot = {
  games,
  screen,
  // 网易云 / Steam / WeGame / Epic 拉取失败时沿用当月旧值，与游戏/影卷的更新解耦
  netease: netease ?? prevSnap.netease ?? {},
  steam: steam ?? prevSnap.steam ?? {},
  wegame: wegame ?? prevSnap.wegame ?? {},
  epic: epic ?? prevSnap.epic ?? {},
};
const prev = JSON.stringify(history.snapshots[CURRENT] ?? null);
const next = JSON.stringify(snapshot);

if (prev === next) {
  console.log(`· stats-history.json 本月快照无变化（${CURRENT}）`);
} else {
  history.snapshots[CURRENT] = snapshot;
  history.updatedAt = now.toISOString();
  // 快照键排序（月序），删除未知脏键
  const sorted = Object.keys(history.snapshots)
    .filter((k) => /^\d{4}-\d{2}$/.test(k))
    .sort();
  history.snapshots = Object.fromEntries(sorted.map((k) => [k, history.snapshots[k]]));
  fs.writeFileSync(historyFile, `${JSON.stringify(history, null, 2)}\n`);
  console.log(
    `✓ stats-history.json 快照已写入（${CURRENT}：游戏 ${Object.keys(games).length} 项 / 影卷 ${Object.keys(screen).length} 项 / 网易云 ${Object.keys(snapshot.netease).length} 首 / Steam ${Object.keys(snapshot.steam).length} 款 / WeGame ${Object.keys(snapshot.wegame).length} 款 / Epic ${Object.keys(snapshot.epic).length} 款）`,
  );
}
