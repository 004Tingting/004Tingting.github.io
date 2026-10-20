#!/usr/bin/env node
/**
 * 同步 78 张塔罗牌正面分层素材 → public/tarot/<card-id>/<layer>.webp
 *
 * 源：widgets 工作区的 RWS 拆层产物（公有领域，Rider-Waite-Smith 1909）
 *   <SRC>/major-arcana/NN-slug/{artwork,edge,number,title}.png
 *   <SRC>/minor-arcana/<suit>/NN-rank/{...}.png
 * 目标命名与 lib/tarot-deck.ts 的 card id 对齐：
 *   major-arcana/00-the-fool        → major-0
 *   minor-arcana/wands/01-ace-of-wands → wands-1
 *
 * 用法：
 *   node scripts/sync-tarot-assets.mjs                 # 默认源/默认宽度
 *   node scripts/sync-tarot-assets.mjs --width 600     # 换宽度
 *   node scripts/sync-tarot-assets.mjs --force         # 忽略 mtime 缓存全部重转
 *   node scripts/sync-tarot-assets.mjs --src D:/other  # 换源目录
 *
 * 只转存在的层：数字牌 2–10 牌面无牌名带（无 title），5 张缺 number 层。
 * 缺层不生成文件，前端按「层不存在」渲染即可。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");

const args = process.argv.slice(2);
const argOf = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const SRC = path.resolve(
  argOf("src", "P:/widgets/assets/rider-waite-smith/processed"),
);
const DEST = path.join(ROOT, "public/tarot");
const WIDTH = Number(argOf("width", 480));
const QUALITY = Number(argOf("quality", 80));
/** 列表页缩略图：四层拍平成单张（240px ≈ 29KB，78 张 ≈ 2.3MB） */
const THUMB = Number(argOf("thumb", 240));
const THUMB_Q = Number(argOf("thumb-quality", 82));
const FORCE = args.includes("--force");

const LAYERS = ["artwork", "edge", "number", "title"];

/** 源目录清单 → [{ id, dir, layers[] }] */
function collect() {
  const cards = [];

  // 大阿卡纳：00-the-fool → major-0
  const majorDir = path.join(SRC, "major-arcana");
  for (const name of fs.readdirSync(majorDir)) {
    const dir = path.join(majorDir, name);
    if (!fs.statSync(dir).isDirectory()) continue;
    const m = /^(\d{2})-/.exec(name);
    if (!m) continue;
    cards.push({ id: `major-${Number(m[1])}`, dir, label: name });
  }

  // 小阿卡纳：wands/01-ace-of-wands → wands-1
  const minorDir = path.join(SRC, "minor-arcana");
  for (const suit of fs.readdirSync(minorDir)) {
    const suitDir = path.join(minorDir, suit);
    if (!fs.statSync(suitDir).isDirectory()) continue;
    for (const name of fs.readdirSync(suitDir)) {
      const dir = path.join(suitDir, name);
      if (!fs.statSync(dir).isDirectory()) continue;
      const m = /^(\d{2})-/.exec(name);
      if (!m) continue;
      cards.push({ id: `${suit}-${Number(m[1])}`, dir, label: `${suit}/${name}` });
    }
  }
  return cards;
}

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`✗ 源目录不存在：${SRC}`);
    process.exit(1);
  }
  const cards = collect();
  if (cards.length !== 78) {
    console.warn(`⚠ 期望 78 张，实际 ${cards.length} 张`);
  }

  let converted = 0;
  let skipped = 0;
  let bytes = 0;
  let thumbBytes = 0;
  const layerStats = Object.fromEntries(LAYERS.map((l) => [l, 0]));

  for (const card of cards) {
    const outDir = path.join(DEST, card.id);
    fs.mkdirSync(outDir, { recursive: true });

    /* ---- 分层（详情弹窗用：视差需要独立层） ---- */
    const present = [];
    for (const layer of LAYERS) {
      const src = path.join(card.dir, `${layer}.png`);
      if (!fs.existsSync(src)) continue; // 该牌没有这一层：跳过，不生成文件
      present.push(layer);
      layerStats[layer]++;

      const out = path.join(outDir, `${layer}.webp`);
      const srcStat = fs.statSync(src);
      if (!FORCE && fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcStat.mtimeMs) {
        skipped++;
        bytes += fs.statSync(out).size;
        continue;
      }

      const buf = await sharp(src)
        .resize({ width: WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 4 })
        .toBuffer();
      fs.writeFileSync(out, buf);
      converted++;
      bytes += buf.length;
    }

    /* ---- 缩略图（列表页用：四层拍平，一张图） ---- */
    const thumbOut = path.join(outDir, "thumb.webp");
    const newest = Math.max(...present.map((l) => fs.statSync(path.join(card.dir, `${l}.png`)).mtimeMs));
    if (FORCE || !fs.existsSync(thumbOut) || fs.statSync(thumbOut).mtimeMs < newest) {
      const base = await sharp(path.join(card.dir, "artwork.png"))
        .resize({ width: THUMB, withoutEnlargement: true })
        .toBuffer();
      const overlays = [];
      for (const layer of present) {
        if (layer === "artwork") continue; // 底图已单独处理
        overlays.push({
          input: await sharp(path.join(card.dir, `${layer}.png`))
            .resize({ width: THUMB, withoutEnlargement: true })
            .toBuffer(),
          blend: "over",
        });
      }
      const buf = await sharp(base)
        .composite(overlays)
        .webp({ quality: THUMB_Q, effort: 4 })
        .toBuffer();
      fs.writeFileSync(thumbOut, buf);
      thumbBytes += buf.length;
    } else {
      thumbBytes += fs.statSync(thumbOut).size;
    }
  }

  console.log(
    `✓ 塔罗分层已同步 → public/tarot/（${cards.length} 张 · ${WIDTH}px · q${QUALITY}）`,
  );
  console.log(
    `  分层：转换 ${converted} / 跳过 ${skipped} · ${(bytes / 1024 / 1024).toFixed(2)} MB`,
  );
  console.log(
    `  缩略图：${cards.length} 张 ${THUMB}px · ${(thumbBytes / 1024 / 1024).toFixed(2)} MB`,
  );
  console.log(
    `  层覆盖：${LAYERS.map((l) => `${l} ${layerStats[l]}`).join(" · ")}`,
  );
  console.log(
    `  合计：${((bytes + thumbBytes) / 1024 / 1024).toFixed(2)} MB`,
  );
}

main().catch((e) => {
  console.error("✗ 同步失败：", e);
  process.exit(1);
});
