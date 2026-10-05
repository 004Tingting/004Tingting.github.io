# personal-site 建站规划

> 2026-10-05 · Buddy 起草 · Ting 拍板

## 0. 决策记录

| 项 | 决定 | 备注 |
|---|---|---|
| 定位 | 个人主页 + 博客 + 作品集 | 内容型站点 |
| 技术栈 | Next.js（App Router + TypeScript，静态导出） | `output: 'export'`，产物纯 HTML |
| 样式 | Tailwind CSS + 暗色模式 | 暗色为一等公民 |
| 部署 | GitHub Pages + Actions | 仓库名建议 `<用户名>.github.io` |
| 内容格式 | Markdown + frontmatter | 博客和作品集都是写文件即内容 |
| 站点语言 | 中英双语 | zh 默认 + /en，渐进式：框架双语、内容允许单语 |
| 视觉主调 | 编辑杂志风 | 设计规格详见 DESIGN.md |
| 身份 | Ting（不实名、无照片） | about 第一人称 |
| 首页形态 | 门户型 | 介绍 + 最新文章 + 精选项目 |

## 1. 站点地图

```
                    ┌──────────┐
                    │  首页  / │
                    └────┬─────┘
         ┌──────────┬───┴────┬──────────┐
         ▼          ▼        ▼          
      /about      /blog   /projects     
      关于我      博客     作品集        
                    │        │           
                    ▼        ▼           
              /blog/[slug]  /projects/[slug]
               文章详情      项目详情      
```

- 首页 = 网络名片：一句话自我介绍 + 最新文章 + 精选项目
- `/about`：教育背景（控制科学与工程硕士在读）、研究方向、联系方式（GitHub / 邮箱）
- 博客和作品集共用一套「列表 + 详情」模式，做一次模板两处复用

## 2. 内容规划（初版）

**博客分类**（写文章时选一个挂上）：

| 分类 | 写什么 |
|---|---|
| 科研笔记 | FTSMC / CAV / 论文阅读（Deng et al. 2024 这类） |
| 开发记录 | OinO、本网站的搭建过程 |
| 游戏设计 | 设计域随笔 |

**作品集初版条目**：

| 项目 | 状态 | 详情页素材 |
|---|---|---|
| CAV 有限时间滑模控制 | 研究方向在读 | 研究问题、方法、仿真结果 |
| 故障诊断与寿命预测 | 工程项目进行中 | 任务背景、方法、实验/应用结果 |
| OinO 表情包管理 | 开发中 | 截图、功能清单 |
| 游戏设计探索 | 探索中 | 设计笔记 |

> 原则：先有骨架再填肉，每个详情页先放占位内容，不长草。

## 3. 技术架构

```
content/*.md ──► lib/readContent() ──► app/[route]/page.tsx
(Markdown+     (frontmatter 解析      (generateStaticParams
 frontmatter)   + markdown 渲染)       逐篇静态生成)
                                          │
                                          ▼
                            npm run build ──► out/ (纯静态)
                                          │
                                          ▼
                              GitHub Actions 部署 Pages
```

- **Next.js + App Router + TypeScript**：只用 SSG 能力（`generateStaticParams`），不用 API routes / middleware（静态导出不支持，展示站也不需要）
- **博客引擎**：`content/blog/*.md`，frontmatter 含 `title / date / tags / summary / draft`；draft 文章构建时跳过
- **markdown 渲染**：MDX 或 react-markdown（M0 时定，倾向先 react-markdown 简单直接，以后要嵌组件再换 MDX）
- **SEO**：静态导出下手写 metadata + sitemap 生成；RSS 后置到 M4

## 4. 目录结构

```
personal-site/
├── app/                      # 页面
│   ├── layout.tsx            # 全局布局（导航/页脚）
│   ├── page.tsx              # 首页
│   ├── about/page.tsx
│   ├── blog/
│   │   ├── page.tsx          # 文章列表
│   │   └── [slug]/page.tsx   # 文章详情
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── globals.css
├── components/               # Nav、PostCard、TagList...
├── content/
│   ├── blog/                 # 文章 .md
│   └── projects/             # 项目 .md
├── lib/                      # 读内容、解析、工具函数
├── public/                   # 图片、favicon
├── .github/workflows/        # Pages 部署流水线
├── next.config.ts            # output: 'export'
└── package.json
```

## 5. 里程碑

| 阶段 | 内容 | 验收标准 |
|---|---|---|
| M0 地基 | 初始化 + 布局 + 导航 + 首页占位 | `npm run dev` 本地可跑 |
| M1 博客 | 列表 + 详情 + 标签 | 发出第一篇真文章 |
| M2 作品集 | 项目列表 + 详情 | 4 个条目就位 |
| M3 上线 | GitHub 仓库 + Actions + Pages | `https://<用户名>.github.io` 可访问 ✅ 已上线 https://004tingting.github.io |
| M4 打磨 | SEO/OG 分享卡片、sitemap、双语 RSS、定制 404、giscus 评论 | ✅ 已上线（giscus 待安装 App 后启用） |
| M5 生活板块 | 音乐 / 游戏 / 记录三个子模块 + 首页 Now Playing | 规格见 `DESIGN.md` §8；双语，一次全做 |

每个里程碑结束站点都处于可用状态，随时可以停。

## 6. GitHub Pages 部署方案

```
push main ──► Actions 触发 ──► npm ci && npm run build ──► out/ ──► deploy-pages
                                                                        │
                                                          https://<用户名>.github.io
```

- 仓库名用 `<你的GitHub用户名>.github.io`：域名最干净，且免 `basePath` 配置
  （若用别的仓库名，需在 `next.config.ts` 配 `basePath: '/仓库名'`）
- 用官方 `actions/deploy-pages`，workflow 我来写
- 预留自定义域名：以后买域名，仓库加一个 CNAME 文件即可

## 7. 风险与对策

| 风险 | 对策 |
|---|---|
| Next.js 学习曲线比 Astro 陡 | 我出代码，你评审；每阶段只引入必要概念，不提前堆料 |
| 静态导出不支持动态功能 | 展示站不需要；评论用 giscus（基于 GitHub Discussions，纯前端） |
| 国内访问 GitHub Pages 偶尔慢 | 可接受；以后绑域名 + 国内 CDN 解决 |
| 博客烂尾 | M1 就强制发一篇真文章，破掉"完美主义启动压力" |

## 8. 下一步

- ~~M0–M4~~ 已全部完成，站点上线运行：https://004tingting.github.io
- **进行中：M5 生活板块**——音乐 / 游戏 / 记录三个子模块 + 首页 Now Playing 状态带
  - 完整规格（页面线框、数据结构、组件、风险）见 `DESIGN.md` §8
  - 范围决议：双语、一次全做
