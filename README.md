# personal-site

Ting 的个人网站——一本双语「个人杂志」，五栏：研思 / 造物 / 游艺 / 纪事 / 关于。

**线上地址：https://004tingting.github.io**

## 文档导航

| 文件 | 内容 |
|---|---|
| `AGENTS.md` | **项目上下文与硬性约定（AI 助手开工先读）** |
| `STYLE.md` | **去 AI 味写作指南（活文档）——写站点内容前必读** |
| `HANDOFF.md` | 会话交接：最新状态、待办、环境注意（本地文档，不入库） |
| `WORKLOG.md` | 工作日志（单文件多条目，最新在上；本地文档，不入库） |
| `PLAN.md` | 建站规划与里程碑（历史文档，信息架构已按 M6 演进） |
| `DESIGN.md` | 设计规格：字体、色板、双语策略、页面线框、五栏体系 |
| `PITFALLS.md` | 踩坑记录：环境 / 构建 / 部署 / 内容的全部坑与解法 |
| `.workbuddy/memory/` | AI 会话的当日详细档案与项目长期记忆（本地） |

- **技术栈**：Next.js（App Router + TypeScript，静态导出）+ Tailwind CSS 4
- **部署**：GitHub Pages，**gh-pages 分支模式**（`bash scripts/deploy.sh` 一键发布）
- **双语**：中文（默认）+ `/en` 英文，内容渐进式对齐

## 本地开发

```bash
npm install
npm run dev                      # 开发服务器 http://localhost:3000
npm run build                    # 静态导出到 out/（含 sitemap/robots/RSS/404 生成）
python scripts/preview.py 8000   # 预览构建产物（支持 clean URL）
npm run og                       # 重新生成分享卡片图 public/og.png
```

## 站点结构（五栏）

| 栏目 | URL | 内容 |
|---|---|---|
| **研思** | `/research` | 推导、方法、文献研读与复盘 |
| **造物** | `/works` | 软件、项目与实验成果 |
| **游艺** | `/arts` | 音律 `/arts/music` · 游戏 `/arts/games` · 影卷 `/arts/screen` · 运动 `/arts/training` · 看板（待开发）|
| **纪事** | `/chronicles` | 时间切片、复盘与随笔 |
| **关于** | `/about` | 履历与站务 |

英文站镜像于 `/en/*`。旧 URL（`/blog` `/life/*` `/projects/*`）自动跳转到新路径。

## 内容

- 研思 / 纪事：`content/{research,chronicles}/{zh,en}/*.md`
  - frontmatter：`title` / `date` / `tags` / `summary` / `draft`
- 造物：`content/works/{zh,en}/*.md`
  - frontmatter：`title` / `status` / `period` / `tags` / `order` / `summary`
- 游艺：`content/arts/{games,screen,training,covers}/{zh,en}/*.md`
  - 游戏：`status`（playing/completed/dropped）/ `rating`（10 分制）/ `hours` / `designStudy` / `review`
  - 影卷：`type`（tv/anime/movie/novel）/ `status` / `rating` / `hours` / `review`
  - 运动：`kind`（run/bodyweight/other）/ `duration`（分钟）/ `distance`（公里）/ `note`
  - 音律 cover：`instrument` / `bilibili`（BV 号）/ `date`
- 常驻歌单：`content/arts/now.json`

> frontmatter 注意：日期要加引号；值里含 ASCII 冒号+空格（`: `）时整段加引号。
> 「按性质不按题材」归栏：推导/复盘→研思，叙事/随笔→纪事，产物→造物，消费文娱→游艺。

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
npm run live                    # 启动监听：每 15 秒检查一次，Ctrl+C 退出
npm run live -- --interval 10   # 自定义间隔
```

> **Windows 用户注意**：Node 装在 WorkBuddy 的隔离目录里，**你自己的终端（CMD/PowerShell）里 `npm` 不在 PATH 中**，直接跑会提示"命令未找到"。
> **推荐做法：双击项目根目录的 `start-live.cmd`** —— 它会自动找 Node、校验配置、启动监听。
>
> 想用命令行也行（完整路径）：
> ```cmd
> cd /d P:\personal-site
> "C:\Users\SaiKo\.workbuddy\binaries\node\versions\22.22.2-6\npm.cmd" run live
> ```

**数据链路**：

```
本机脚本（每 15 秒）
  ├─ Last.fm：当前播放曲目
  ├─ 网易云：专辑封面（本机直连，无 CORS 限制）
  └─ GitHub API → now-data 分支（另每 ≥10 分钟 purge 一次 jsDelivr 作兜底）
                    ↓
  前端经国内 GitHub 直通代理读取（**无缓存**）→ 切歌后 ≤30 秒更新
  尝试顺序：gh-proxy.com → gh.llkk.cc → jsDelivr（兜底）
```

> 为什么 jsDelivr 只作兜底：它的 purge 有 **720 秒限流窗口**，频繁 purge 会导致之后全部失效、缓存永久停在旧版本（实测数据滞后 20+ 分钟）。

- 配置：`.env.local` 需有 `LASTFM_API_KEY` / `LASTFM_USER` / `GITHUB_TOKEN`（`GITHUB_TOKEN` 用 `gh auth token` 获取）
- 脚本只在**切歌时**推送（无变化不产生提交），不会刷提交历史
- **不开脚本时**网站自动降级：Last.fm 直连取曲目 + 构建时封面映射表（`public/covers.json`）
