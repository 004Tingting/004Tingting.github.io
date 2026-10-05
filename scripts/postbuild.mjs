/**
 * 构建后处理：为 GitHub Pages 生成定制的 404.html。
 * 多根 layout 架构下 Next 的自定义 not-found 不落到根级 404.html，
 * 因此在这里用内联样式的杂志风 404 页面覆盖默认产物。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");

if (!fs.existsSync(outDir)) {
  console.error("✗ out/ not found — run `next build` first");
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>404 · Ting</title>
<style>
  :root{--paper:#faf8f5;--ink:#1a1a1a;--muted:rgba(26,26,26,.55);--accent:#b4432e}
  @media (prefers-color-scheme: dark){:root{--paper:#141414;--ink:#edeae4;--muted:rgba(237,234,228,.55);--accent:#d0604a}}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--paper);color:var(--ink);min-height:100vh;display:flex;flex-direction:column;justify-content:center;
       padding:0 8vw;font-family:-apple-system,"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif}
  .kicker{font-family:"Courier New",monospace;font-size:.85rem;letter-spacing:.35em;color:var(--muted);margin-bottom:1.75rem}
  .kicker b{color:var(--accent);font-weight:400}
  h1{font-family:Georgia,"Noto Serif SC","Songti SC",serif;font-weight:700;font-size:clamp(2.2rem,7vw,5.5rem);line-height:1.15;letter-spacing:.01em}
  p{margin-top:1.5rem;color:var(--muted);font-size:1.05rem;line-height:1.8}
  a{margin-top:2.5rem;font-family:"Courier New",monospace;font-size:.9rem;color:var(--accent);text-decoration:none;width:fit-content}
  a:hover{text-decoration:underline}
</style>
</head>
<body>
  <p class="kicker"><b>·</b> 404 — NOT TYPESET</p>
  <h1>这一页还没有被排版。</h1>
  <p>你要找的内容不存在，或者已经搬走了。<br/>This page has not been typeset — nothing lives here.</p>
  <a href="/">← 回到首页 / Back home</a>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, "404.html"), html);
console.log("✓ out/404.html written");
