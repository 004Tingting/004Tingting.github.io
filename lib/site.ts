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

  /**
   * Last.fm 实时「正在听」：前端每 60 秒直连 Last.fm API（该接口开放 CORS）。
   * API key 经 NEXT_PUBLIC_LASTFM_API_KEY 注入（本地 .env.local / CI GitHub Secrets），不写在仓库里。
   */
  lastfm: {
    user: "Ting04",
    apiKey: process.env.NEXT_PUBLIC_LASTFM_API_KEY ?? "",
  },
} as const;

/**
 * giscus 评论配置（基于 GitHub Discussions）。
 * 已启用：repoId / categoryId 已填，giscus GitHub App 已安装。
 * 映射方式 pathname：中英文文章各成一条讨论线。
 */
export const GISCUS = {
  enabled: true,
  repo: "004Tingting/004Tingting.github.io",
  repoId: "R_kgDOU9Csyg",
  category: "Announcements",
  categoryId: "DIC_kwDOU9Csys4DHHG9",
};
