/** 站点级常量：URL、名称、SEO 默认值、第三方集成 */
export const SITE = {
  url: "https://004tingting.github.io",
  name: "Ting",
  ogImage: "/og.png",

  zh: {
    title: "Ting · 个人杂志",
    description: "Ting 的个人杂志：控制科学研究、工程实践与设计的交叉地带。",
    locale: "zh_CN",
    lang: "zh-CN",
  },
  en: {
    title: "Ting · A Personal Journal",
    description: "Ting's personal journal at the crossing of control research, engineering and design.",
    locale: "en_US",
    lang: "en",
  },

  links: {
    github: "https://github.com/004Tingting",
    // TODO(Ting): 邮箱确认后填写
  },
} as const;

/**
 * giscus 评论配置（基于 GitHub Discussions）。
 * 生效条件：① repoId / categoryId 已填 ✅ ② giscus GitHub App 已安装到本仓库（enabled 改 true）。
 * 安装入口：https://github.com/apps/giscus/installations/new
 */
export const GISCUS = {
  enabled: false,
  repo: "004Tingting/004Tingting.github.io",
  repoId: "R_kgDOU9Csyg",
  category: "Announcements",
  categoryId: "DIC_kwDOU9Csys4DHHG9",
};
