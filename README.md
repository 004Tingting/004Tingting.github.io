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
npm run build                    # 静态导出到 out/（fetch-now → fetch-monthly → fetch-playlist → fetch-token-stats → next build → postbuild；含 sitemap/robots/RSS/404 生成）
python scripts/preview.py 8000   # 预览构建产物（支持 clean URL）
npm run og                       # 重新生成分享卡片图 public/og.png
```

## 站点结构（五栏）

| 栏目 | URL | 内容 |
|---|---|---|
| **研思** | `/research` | 推导、方法、文献研读与复盘 |
| **造物** | `/works` | 软件、项目与实验成果 |
| **游艺** | `/arts` | 音律 `/arts/music` · 游戏 `/arts/games` · 影卷 `/arts/screen` · 运动 `/arts/exercise` · 看板 `/arts/stats` |
| **纪事** | `/chronicles` | 时间切片、复盘与随笔 |
| **关于** | `/about` | 履历与站务 |

英文站镜像于 `/en/*`。旧 URL（`/blog` `/life/*` `/projects/*`）自动跳转到新路径。

## 内容

- 研思 / 纪事：`content/{research,chronicles}/{zh,en}/*.md`
  - frontmatter：`title` / `date` / `tags` / `summary` / `draft`
- 造物：`content/works/{zh,en}/*.md`
  - frontmatter：`title` / `status` / `period` / `tags` / `order` / `summary`
- 游艺：`content/arts/{games,screen,exercise,covers}/{zh,en}/*.md`
  - 游戏：`status`（playing/completed/dropped）/ `rating`（10 分制）/ `hours` / `designStudy` / `review`
  - 影卷：`type`（tv/anime/movie/novel）/ `status` / `rating` / `hours` / `review`
  - 运动：`kind`（run/bodyweight/other）/ `duration`（分钟）/ `distance`（公里）/ `note`
  - 音律 cover：`instrument` / `bilibili`（BV 号）/ `date` / `order`（展示顺序，升序）
- 常驻歌单：`content/arts/now.json`（分区标签与外链配置）+ `content/arts/playlist.json`（全量曲目，`scripts/fetch-playlist.mjs` 构建时拉取，勿手改）
- Token 用量：`content/arts/token-monitor.json`（hub 实时快照，构建时拉取）+ `content/arts/token-monitor-history.json`（静态全量基线，每周导出刷新）——详见下文「Token 用量」节

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

- 配置：`.env.local` 需有 `LASTFM_API_KEY` / `LASTFM_USER` / `GITHUB_TOKEN`（`GITHUB_TOKEN` 用 `gh auth token` 获取）；另含 `NETEASE_MUSIC_U`（听歌统计）、`STEAM_API_KEY` / `STEAM_ID`（游戏时长）
- 脚本只在**切歌时**推送（无变化不产生提交），不会刷提交历史
- **不开脚本时**网站自动降级：Last.fm 直连取曲目 + 构建时封面映射表（`public/covers.json`）

## Token 用量（hub 实时聚合）

关于页摘要、首页侧栏与看板子页 `/arts/stats/tokens` 的「TOKEN 用量」，展示两台电脑上各 AI 工具用量的**多端聚合**——数据来自 Ting 自建的 Cloudflare Worker hub（上游项目 [Javis603/token-monitor](https://github.com/Javis603/token-monitor)）：

- **云端优先**：页面加载时先显示骨架，随即直拉 hub 公开端点 `/api/public/stats`（免密钥、CORS 开放、服务端缓存 15 秒）；拉到才显示数字，拉不到则显示构建快照并标注数据时间——不会先闪旧值再跳新值。加载成功后每 90 秒刷新一次
- **构建时快照**：`scripts/fetch-token-stats.mjs` 每次构建拉一次写 `content/arts/token-monitor.json`（拉取失败保留旧文件，不阻断构建）
- **全量历史**：`content/arts/token-monitor-history.json`（日序列 370 天滚动窗口）由本机脚本 `dump-hub-history.ps1`（带密钥）每周导出，**建议每周重新生成并提交一次**；超窗历史靠每周刷新 + localStorage 累积不丢
- **口径**：token 用 M/B 紧凑显示（悬停看精确值）；货币英文页为美元、中文页为人民币折算（1 美元 = 7.2 元，仅供参考）；时间英文页为美国东部（EDT/EST）、中文页为北京时间
- **安全**：hub 密钥只在本机脚本与 widget 里，不进前端、不进仓库；公开端点已剥离设备与账号标识

> hub 部署全过程、凭据存档与维护命令见 `.workbuddy/token-monitor-kit/`（本地目录，含密钥文件，**勿提交**）。
