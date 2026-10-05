export type Lang = "zh" | "en";

export const zh = {
  nav: { about: "关于", blog: "博客", projects: "项目" },
  home: {
    kicker: "个人杂志",
    identity: "控制科学与工程硕士在读",
    interests: ["CAV 滑模控制", "故障诊断与寿命预测", "游戏设计", "独立软件"],
    latest: "最新文章",
    viewAll: "全部 →",
    projects: "精选项目",
    empty: "第一篇文章在路上。",
  },
  about: {
    title: "关于",
    placeholder: "Ting。这一页在等它的内容——稍后再来。",
  },
  footer: {
    colophon: "由 Next.js 构建 · 部署于 GitHub Pages",
  },
} as const;

export const en = {
  nav: { about: "About", blog: "Blog", projects: "Work" },
  home: {
    kicker: "A Personal Journal",
    identity: "M.Sc. student in Control Science and Engineering",
    interests: ["CAV & sliding mode control", "Fault diagnosis & prognostics", "Game design", "Indie software"],
    latest: "Latest Posts",
    viewAll: "All →",
    projects: "Selected Projects",
    empty: "The first post is on its way.",
  },
  about: {
    title: "About",
    placeholder: "Ting. This page is waiting for its content — check back later.",
  },
  footer: {
    colophon: "Built with Next.js · Hosted on GitHub Pages",
  },
} as const;

export const dic = { zh, en };
