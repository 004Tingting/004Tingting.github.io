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

/**
 * Token Monitor hub（Cloudflare Worker，多端 AI 工具用量聚合）。
 * 公开端点 /api/public/stats 免密钥、CORS *、cache-control max-age=15——前端轮询与
 * 构建时拉取（scripts/fetch-token-stats.mjs）都用它；带密钥的 /api/history 不进前端，
 * 全量基线由 dump-hub-history.ps1 每周导出（content/arts/token-monitor-history.json）。
 * hub 部署与凭据存档：.workbuddy/token-monitor-kit/（本地，勿入公开仓库）。
 */
export const TOKEN_MONITOR = {
  hub: "https://token-monitor-hub.saikouting004.workers.dev",
  /** 前端轮询间隔（毫秒）——服务端缓存 15s，30s 轮询为「准实时」且温和 */
  pollMs: 30_000,
} as const;

/**
 * Microsoft Clarity 访客统计（不在站点上呈现，仅后台可见）。
 * projectId 为公开值（会出现在页面源码中），非密钥；留空则不埋点。
 * 获取：https://clarity.microsoft.com → 新建项目 → Settings → 复制 Project ID。
 */
export const CLARITY = {
  enabled: true,
  projectId: "yx0nnrlyns",
} as const;
