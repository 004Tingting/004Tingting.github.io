# personal-site

Ting 的个人网站：主页 + 博客 + 作品集。

- **技术栈**：Next.js（App Router + TypeScript，静态导出）+ Tailwind CSS 4
- **部署**：GitHub Pages（GitHub Actions 自动构建部署）
- **双语**：中文（默认）+ `/en` 英文，内容渐进式对齐

## 本地开发

```bash
npm install
npm run dev                      # 开发服务器 http://localhost:3000
npm run build                    # 静态导出到 out/
python scripts/preview.py 8000   # 预览构建产物（支持 clean URL）
```

## 内容

- 博客：`content/blog/{zh,en}/*.md`
  - frontmatter：`title` / `date` / `tags` / `summary` / `draft`
- 作品集：`content/projects/{zh,en}/*.md`
  - frontmatter：`title` / `status` / `period` / `tags` / `order` / `summary`

> frontmatter 注意：日期要加引号；值里含 ASCII 冒号+空格（`: `）时整段加引号。

## 文档

- `PLAN.md` — 建站规划与里程碑
- `DESIGN.md` — 设计规格（字体、色板、双语策略、页面线框）
