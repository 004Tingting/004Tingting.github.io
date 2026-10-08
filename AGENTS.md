# AGENTS.md — personal-site 项目上下文

> 给 AI 助手（WorkBuddy / Codex / Claude Code 等）的项目级系统提示。
> **开工前先读本文件**，再按需查 `PLAN.md`、`DESIGN.md`、`PITFALLS.md`。

## 项目是什么

Ting 的个人网站——一本**双语（中文默认 + `/en`）的「个人杂志」**，五栏：研思 / 造物 / 游艺 / 纪事 / 关于。

- 线上地址：https://004tingting.github.io
- 部署方式：GitHub Pages，**gh-pages 分支模式**（`bash scripts/deploy.sh` 一键发布）；`.github/workflows/deploy.yml` 已降级为手动触发的备用通道
- 身份设定：作者自称 **Ting**（不实名、无照片），第一人称叙述

## 技术栈（勿擅自更换）

| 层 | 选型 | 要点 |
|---|---|---|
| 框架 | Next.js 15 App Router + TypeScript strict | 静态导出 `output: 'export'` + `trailingSlash: true` |
| 样式 | Tailwind CSS 4 | CSS-first：token 全在 `app/globals.css` 的 `@theme`，颜色变量化、组件零 `dark:` 前缀 |
| 字体 | fontsource 自托管 | Noto Serif SC 700（中文衬线）/ Playfair Display 600 / JetBrains Mono Variable |
| 内容 | Markdown + gray-matter | 构建时（fs）读取；渲染用 react-markdown + rehype-highlight |
| 排版 | @tailwindcss/typography | 用 `.prose` + globals.css 里的杂志风覆盖 |
| 部署 | GitHub Pages + Actions | workflow 模式（`build_type=workflow`），`public/.nojekyll` 必须在 |

## 目录结构

```
app/
├── (zh)/                 # 中文站（根 layout #1，html lang="zh-CN"）
│   ├── layout.tsx        # 含 SEO metadata + 主题防闪脚本 + Nav/Footer
│   ├── page.tsx          # 首页（门户型：hero + 最新文章 + 精选造物）
│   ├── research/         # 研思（列表 + [slug] 详情）
│   ├── chronicles/       # 纪事（列表 + [slug] 详情）
│   ├── works/            # 造物（列表 + [slug] 详情）
│   ├── arts/             # 游艺（总览 + music / games / screen / exercise）
│   └── about/
├── (en)/en/              # 英文站（根 layout #2，lang="en"）——目录结构与中文站镜像
├── globals.css           # 设计 token + prose 排版 + hljs 深浅适配
├── sitemap.ts / robots.ts
├── feed.xml/route.ts     # 中文 RSS（en 版在 (en)/en/feed.xml/route.ts）
└── favicon.svg
components/               # Nav / Footer / ThemeToggle / Kicker / ArticleList / ArticleDetail / WorkList / MarkdownBody / Giscus / NowPlayingLive / EmbedPlayer / LifeEntryList
content/
├── research/{zh,en}/*.md     # 研思文章
├── chronicles/{zh,en}/*.md   # 纪事文章
├── works/{zh,en}/*.md        # 造物（按 frontmatter order 排序）
└── arts/                     # 游艺
    ├── now.json              # 常驻歌单（网易云外链配置）
    ├── lastfm.json           # 构建时生成（实时收听快照，勿手改）
    ├── games/{zh,en}/*.md    # 游戏条目
    ├── screen/{zh,en}/*.md   # 影卷条目（剧 / 番 / 影 / 小说）
    ├── exercise/{zh,en}/*.md # 运动条目（跑步 / 徒手）
    └── covers/{zh,en}/*.md   # 音律 cover
lib/
├── i18n.ts               # UI 文案字典（zh/en，五栏 + 游艺内部）
├── site.ts               # 站点常量：URL、SEO 默认值、giscus、lastfm
├── article-shared.ts     # 客户端安全的文章类型与日期格式化
├── articles.ts           # 文章管道（研思 / 纪事，Section 维度）
├── works.ts              # 造物管道（order 排序）
├── arts-shared.ts        # 游艺客户端安全：类型、枚举、汇总统计
├── arts.ts               # 游艺管道（games / screen / exercise / covers / now + stats）
scripts/
├── preview.py            # 本地预览（支持 clean URL，对齐 GitHub Pages）
├── og.mjs                # 生成 public/og.png 分享卡片（sharp 渲染 SVG）
├── postbuild.mjs         # 构建后写定制 out/404.html + 22 个旧 URL 跳转页
├── fetch-now.mjs         # 构建前拉 Last.fm 快照 + 生成封面映射（prebuild 链路）
├── push-now.mjs          # 本机常驻：推送实时「正在听」到 now-data 分支（npm run live）
└── deploy.sh             # 一键发布：构建 → 推 gh-pages → 触发 Pages 构建
```

## 硬性约定

1. **双语架构**：UI 文案一律走 `lib/i18n.ts`；新增页面必须同时提供 `(zh)` 与 `(en)/en/` 两个版本（内容允许单语，框架必须双语）
2. **新增内容类型**：参照 `lib/articles.ts`（Section 维度，研思 / 纪事共用）/ `lib/works.ts` / `lib/arts.ts` 的模式（fs + gray-matter，构建时读取，`generateStaticParams` 预生成 + `export const dynamicParams = false`）
3. **frontmatter 两个坑**：日期必须加引号（否则是 Date 实例）；值里含 ASCII 冒号+空格（`: `）必须整段加引号
4. **客户端边界**：`"use client"` 组件不得 import 含 `node:fs` 的模块——共享逻辑放 `lib/*-shared.ts`
5. **设计语言**：编辑杂志风——衬线大标题、纸色/墨色 + 唯一朱红强调色、1px hairline、kicker（`· 标签`）、条目序号。**不引入 UI 组件库**，样式用 Tailwind 原子类 + token
6. **不装多余依赖**：静态站优先零运行时依赖；需要新依赖先说清理由
7. **工作日志（必须）**：**每次完成实质性修改后**（建功能、改结构、修 bug、内容体系变化），往根目录 `WORKLOG.md` **顶部**追加一条日志——**单文件多条目、最新在最上面**。条目格式：`## YYYY-MM-DD HH:mm · 标题`，正文含「改了什么 / 关键决策与依据 / 涉及文件 / 状态与遗留」
8. **内容归属（按性质，不按题材）**：推导 / 方法 / 理论 / 复盘 → **研思**；过程叙事 / 感悟 / 生活切片 → **纪事**；做出来的东西（可交互 / 可下载）→ **造物**；作为消费者玩 / 看 / 听的内容 → **游艺**。同一作品可跨栏：写它的推导归研思，展示成品归造物
9. **每个栏目至少保留一篇文章/条目**：Next 静态导出要求动态路由至少有一个页面，空栏目会导致构建失败
10. **写作风格（去 AI 味）**：写任何站点内容（文章、页面文案、i18n）前先读 `STYLE.md`，写完按其自检清单过一遍——禁用 AI 过渡词（「说具体些」「说白了」）、对仗金句、三段排比、模板化结构；栏目首句用平行名词列表；术语与俗语必须用标准版。Ting 的每次批注都会沉淀进 `STYLE.md`（活文档）

## 常用命令

```bash
npm run dev                      # 开发（建议在普通终端跑，见环境注意）
npm run build                    # 构建（含 postbuild 生成 404.html）
python scripts/preview.py 8000   # 预览构建产物（clean URL）
npm run og                       # 重新生成分享卡片图
npm run live                     # 启动「正在听」实时推送（本机常驻，见下）
bash scripts/deploy.sh           # 一键发布（构建 → 推 gh-pages → 触发 Pages 构建）
```

## 「正在听」的数据链路（重要）

| 层 | 说明 |
|---|---|
| 实时源 | `now-data` 分支的 `now.json`，由**本机脚本** `scripts/push-now.mjs` 推送（读 Last.fm 曲目 + 查网易云封面），每 15 秒 |
| 传输通道 | 前端**多源依次尝试**：`gh-proxy.com` → `gh.llkk.cc`（国内 GitHub 直通代理，**无缓存** + 支持 CORS）→ jsDelivr（兜底）；端到端延迟上限 ~30 秒 |
| 前端 | `components/NowPlayingLive.tsx` 多源 + 三级降级：now-data → Last.fm 直连 + 构建映射表 → 构建快照 |
| 构建时 | `scripts/fetch-now.mjs` 生成快照与封面映射（`public/covers.json` + `public/covers/*.jpg`，最近 50 首） |
| 本机启动 | Ting 侧**双击 `start-live.cmd`**（Node 装在 WorkBuddy 隔离目录，其终端里没有 `npm`） |
| 为什么这么绕 | 浏览器无法直连网易云接口（无 CORS）、iTunes 等替代源对日韩文歌匹配不准、Last.fm 已停供封面；jsDelivr 的 purge 有 720 秒限流，不适合承载高频更新数据 |

## 环境注意事项（WorkBuddy 会话内，详细见 PITFALLS.md）

- **gh CLI 必须清代理调用**：`env -u HTTPS_PROXY -u HTTP_PROXY -u https_proxy -u http_proxy "/c/Program Files/GitHub CLI/gh.exe" ...`（平台内部代理 127.0.0.1:15422 会掐断 GitHub POST）
- **git push 必须禁用 credential helper**：系统级 `credential.helper=helper-selector`（PortableGit 注入）会弹 GUI 或导致卡死 → 一律用 `git -c credential.helper= push ...`（`scripts/deploy.sh` 已内置）
- **Node spawn 子进程受限**：`execFileSync('git')` 在沙箱内报 EBUSY → 脚本里改用 HTTP API
- **构建前先 `rm -rf .next`**：沙箱的 safe-delete shim 在回合内累计删除 ≥50 文件会拦杀进程
- **网络间歇性 EOF**：gh/git 操作套 3–5 次重试
- **Pages 当前为 legacy 模式**（source: `gh-pages` 分支）—— 这是刻意选择，用于绕开 Actions 排队；切回 workflow 模式：`gh api -X PUT repos/004Tingting/004Tingting.github.io/pages -f build_type=workflow`
- **jsDelivr 的 purge 会被限流**：响应出现 `{"throttled":true,"throttlingReset":720}` 即已限流；高频更新的数据不要走 jsDelivr（详见 PITFALLS #19）

## 内容策略

- **渐进式双语**：重要文章双语，随笔单语；未翻译内容在另一语言不显示空壳
- **五栏信息架构**（2026-10-06 重构）：
  | 栏目 | 中文 | 英文 URL | 内容 |
  |---|---|---|---|
  | 研思 | 研思 | `/research` | 推导、方法、文献与复盘 |
  | 造物 | 造物 | `/works` | 软件、项目与实验成果 |
  | 游艺 | 游艺 | `/arts` | 音律（`/arts/music`）/ 游戏（`/arts/games`）/ 影卷（`/arts/screen`）/ 运动（`/arts/exercise`）/ 看板（`/arts/stats`，待开发）|
  | 纪事 | 纪事 | `/chronicles` | 时间切片、复盘与随笔 |
  | 关于 | 关于 | `/about` | 履历与站务 |
- 旧 URL（`/blog` `/life/*` `/projects/*`）由 `scripts/postbuild.mjs` 生成 meta-refresh 跳转页

## 文档地图

| 文件 | 内容 |
|---|---|
| `STYLE.md` | **去 AI 味写作指南（活文档）——写站点内容前必读，硬性约定 #10** |
| `HANDOFF.md` | **会话交接：最新状态、待办、环境注意（根目录，本地不入库）** |
| `WORKLOG.md` | 工作日志（单文件多条目，最新在上；根目录，本地不入库） |
| `.workbuddy/memory/YYYY-MM-DD.md` | 当日详细档案（完整调研过程与细节） |
| `.workbuddy/memory/MEMORY.md` | 项目长期记忆（技术决策、待办、环境注意） |
| `README.md` | 门面：地址、命令、发布流程、文档导航 |
| `PLAN.md` | 建站规划与里程碑（历史文档，IA 已按 M6 演进） |
| `DESIGN.md` | 设计规格：字体、色板、双语策略、页面线框、SEO、五栏体系 |
| `PITFALLS.md` | 踩坑记录 + 快速修复清单 |

## 当前状态 / 待办

- 里程碑 **M0–M6 全部完成**（M6 = 五栏信息架构重构）；站点已上线运行
- **最新状态与待办以根目录 `HANDOFF.md` 为准**
- 待办主线：**内容替换**（研思示例文章、游艺示例条目（13 个 + 运动开篇）、OinO / 游戏设计 项目页偏框架、about 页仍是占位）；**开篇《写在开始》逐句审稿进行中**（沉淀至 `STYLE.md`）；**游艺 / 看板** `/arts/stats` 统计图表（已确认后置）
- **giscus 评论已启用**（App 已装、`enabled=true`）；Discussions 分类用 Announcements
