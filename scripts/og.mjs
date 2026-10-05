/**
 * 生成社交分享卡片图 public/og.png（1200×630）。
 * 运行：npm run og
 * 设计：对齐站点杂志风——纸色底、衬线大标题、单一朱红强调。
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FAF8F5"/>

  <circle cx="88" cy="128" r="7" fill="#B4432E"/>
  <text x="112" y="137" font-family="Georgia, serif" font-size="26" letter-spacing="6" fill="#8A8378">PERSONAL JOURNAL</text>

  <text x="74" y="392" font-family="Georgia, 'Times New Roman', serif" font-size="210" font-weight="bold" fill="#1A1A1A">Ting</text>

  <text x="86" y="462" font-family="Georgia, serif" font-size="36" fill="#B4432E">Control Science · Engineering · Design</text>

  <line x1="80" y1="536" x2="1120" y2="536" stroke="#1A1A1A" stroke-opacity="0.15" stroke-width="2"/>
  <text x="80" y="588" font-family="'Courier New', monospace" font-size="28" fill="#8A8378">004tingting.github.io</text>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile(path.join(root, "public", "og.png"));

console.log("✓ public/og.png generated (1200x630)");
