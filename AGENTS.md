# AGENTS.md — personal-site 项目上下文

> 给 AI 助手（WorkBuddy / Codex / Claude Code 等）的项目级系统提示。
> **开工前先读本文件**，再按需查 `PLAN.md`、`DESIGN.md`、`PITFALLS.md`。

## 项目是什么

Ting 的个人网站——一本**双语（中文默认 + `/en`）的「个人杂志」**：博客 + 作品集。

- 线上地址：https://004tingting.github.io
- 部署方式：GitHub Pages + GitHub Actions，**push `main` 即自动发布**（约 1 分钟）
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
│   ├── page.tsx          # 首页（门户型：hero + 最新文章 + 精选项目）
│   ├── blog/[slug]/      # 博客列表 + 详情
│   ├── projects/[slug]/  # 作品集列表 + 详情
│   └── about/
├── (en)/en/              # 英文站（根 layout #2，lang="en"）——目录结构与中文站镜像
├── globals.css           # 设计 token + prose 排版 + hljs 深浅适配
├── sitemap.ts / robots.ts
├── feed.xml/route.ts     # 中文 RSS（en 版在 (en)/en/feed.xml/route.ts）
└── favicon.svg
components/               # Nav / Footer / ThemeToggle / Kicker / BlogList / ProjectList / MarkdownBody / Giscus
content/
├── blog/{zh,en}/*.md
└── projects/{zh,en}/*.md
lib/
├── i18n.ts               # UI 文案字典（zh/en）
├── site.ts               # 站点常量：URL、SEO 默认值、giscus 配置
├── blog-shared.ts        # 客户端安全（无 node 依赖）的类型与纯函数
├── posts.ts              # 博客内容管道（fs + gray-matter，构建时执行）
└── projects.ts           # 作品集内容管道（按 frontmatter order 排序）
scripts/
├── preview.py            # 本地预览（支持 clean URL，对齐 GitHub Pages）
├── og.mjs                # 生成 public/og.png 分享卡片（sharp 渲染 SVG）
└── postbuild.mjs         # 构建后写定制 out/404.html
```

## 硬性约定

1. **双语架构**：UI 文案一律走 `lib/i18n.ts`；新增页面必须同时提供 `(zh)` 与 `(en)/en/` 两个版本（内容允许单语，框架必须双语）
2. **新增内容类型**：参照 `lib/posts.ts` / `lib/projects.ts` 的模式（fs + gray-matter，构建时读取，`generateStaticParams` 预生成 + `export const dynamicParams = false`）
3. **frontmatter 两个坑**：日期必须加引号（否则是 Date 实例）；值里含 ASCII 冒号+空格（`: `）必须整段加引号
4. **客户端边界**：`"use client"` 组件不得 import 含 `node:fs` 的模块——共享逻辑放 `lib/*-shared.ts`
5. **设计语言**：编辑杂志风——衬线大标题、纸色/墨色 + 唯一朱红强调色、1px hairline、kicker（`· 标签`）、条目序号。**不引入 UI 组件库**，样式用 Tailwind 原子类 + token
6. **不装多余依赖**：静态站优先零运行时依赖；需要新依赖先说清理由

## 常用命令

```bash
npm run dev                      # 开发（建议在普通终端跑，见环境注意）
npm run build                    # 构建（含 postbuild 生成 404.html）
python scripts/preview.py 8000   # 预览构建产物（clean URL）
npm run og                       # 重新生成分享卡片图
git add -A && git commit && git push   # 发布（Actions 自动部署）
```

## 环境注意事项（WorkBuddy 会话内，详细见 PITFALLS.md）

- **gh CLI 必须清代理调用**：`env -u HTTPS_PROXY -u HTTP_PROXY -u https_proxy -u http_proxy "/c/Program Files/GitHub CLI/gh.exe" ...`（平台内部代理 127.0.0.1:15422 会掐断 GitHub POST）
- **构建前先 `rm -rf .next`**：沙箱的 safe-delete shim 在回合内累计删除 ≥50 文件会拦杀进程
- **网络间歇性 EOF**：gh/git 操作套 3–5 次重试
- **Pages 若被重置为 legacy**：`gh api -X PUT repos/004Tingting/004Tingting.github.io/pages -f build_type=workflow`

## 内容策略

- **渐进式双语**：重要文章双语，随笔单语；未翻译内容在另一语言不显示空壳
- **博客分类**：科研笔记（FTSMC / CAV）/ 开发记录（OinO、本站）/ 游戏设计
- **作品集**：CAV 滑模控制（科研）/ 故障诊断与寿命预测（工程）/ OinO（软件）/ 游戏设计探索

## 文档地图

| 文件 | 内容 |
|---|---|
| `README.md` | 门面：地址、命令、发布流程、索引 |
| `PLAN.md` | 建站规划与里程碑（M0–M4 全部完成） |
| `DESIGN.md` | 设计规格：字体、色板、双语策略、页面线框、SEO、评论 |
| `PITFALLS.md` | 16 条踩坑记录 + 快速修复清单 |

## 当前状态 / 待办

- 全部里程碑 M0–M4 已完成，站点上线运行
- **giscus 评论**：Discussions 已开、ID 已填，等安装 giscus App 后把 `lib/site.ts` 的 `enabled` 改 `true`
- **作品集初稿**：OinO / 游戏设计两个页面内容偏框架性，待补真实细节
- **about 页**：仍是占位
