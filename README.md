# personal-site

Ting 的个人网站：主页 + 博客 + 作品集。

**线上地址：https://004tingting.github.io**

- **技术栈**：Next.js（App Router + TypeScript，静态导出）+ Tailwind CSS 4
- **部署**：GitHub Pages + GitHub Actions（push `main` 即自动发布，约 1 分钟）
- **双语**：中文（默认）+ `/en` 英文，内容渐进式对齐

## 本地开发

```bash
npm install
npm run dev                      # 开发服务器 http://localhost:3000
npm run build                    # 静态导出到 out/（含 sitemap/robots/RSS/404 生成）
python scripts/preview.py 8000   # 预览构建产物（支持 clean URL）
npm run og                       # 重新生成分享卡片图 public/og.png
```

## 内容

- 博客：`content/blog/{zh,en}/*.md`
  - frontmatter：`title` / `date` / `tags` / `summary` / `draft`
- 作品集：`content/projects/{zh,en}/*.md`
  - frontmatter：`title` / `status` / `period` / `tags` / `order` / `summary`

> frontmatter 注意：日期要加引号；值里含 ASCII 冒号+空格（`: `）时整段加引号。

## 发布流程

**当前使用「本地构建 + gh-pages 分支」部署**（2026-10-06 起，因 GitHub Actions 故障切换）：

```bash
bash scripts/deploy.sh   # 一键：构建 → 推 gh-pages 分支 → 触发 Pages 构建
```

> 旧的自动模式（push main 触发 Actions 构建部署）配置保留在 `.github/workflows/deploy.yml`，
> 但已改为仅手动触发。若日后切回：`gh api -X PUT repos/004Tingting/004Tingting.github.io/pages -f build_type=workflow`

**内容改动后**：改 `content/**` → 跑 `scripts/deploy.sh`（或让 Buddy 代跑）。
**只想本地看效果**：`python scripts/preview.py 8000`

## 实时「正在听」（本地脚本）

网站上的「正在听」曲目与封面，由**本机脚本**实时推送（浏览器无法直连网易云接口，所以这一步必须在本机完成）：

```bash
npm run live                # 启动监听：每 30 秒检查一次，Ctrl+C 退出
npm run live -- --interval 15   # 自定义间隔
```

**数据链路**：

```
本机脚本（每 30 秒）
  ├─ Last.fm：当前播放曲目
  ├─ 网易云：专辑封面（本机直连，无 CORS 限制）
  └─ GitHub API → now-data 分支 → 清除 jsDelivr 缓存
                    ↓
        网站前端读取（CORS 可用）→ 切歌后 ≤30 秒封面更新
```

- 配置：`.env.local` 需有 `LASTFM_API_KEY` / `LASTFM_USER` / `GITHUB_TOKEN`（`GITHUB_TOKEN` 用 `gh auth token` 获取）
- 脚本只在**切歌时**推送（无变化不产生提交），不会刷提交历史
- **不开脚本时**网站自动降级：Last.fm 直连取曲目 + 构建时封面映射表（`public/covers.json`）

## 文档

| 文件 | 内容 |
|---|---|
| `PLAN.md` | 建站规划与里程碑（M0 地基 → M4 打磨） |
| `DESIGN.md` | 设计规格：字体、色板、双语策略、页面线框、SEO |
| `PITFALLS.md` | 踩坑记录：环境 / 构建 / 部署 / 内容的全部坑与解法 |
