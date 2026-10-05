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

```bash
git add -A && git commit -m "post: 新文章标题" && git push
# GitHub Actions 自动构建部署，约 1 分钟后线上更新
```

## 文档

| 文件 | 内容 |
|---|---|
| `PLAN.md` | 建站规划与里程碑（M0 地基 → M4 打磨） |
| `DESIGN.md` | 设计规格：字体、色板、双语策略、页面线框、SEO |
| `PITFALLS.md` | 踩坑记录：环境 / 构建 / 部署 / 内容的全部坑与解法 |
