import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出：产物 out/ 纯 HTML，GitHub Pages 直接部署
  output: "export",
  // 目录式导出（/blog/x/index.html）：URL 规范统一，GitHub Pages 兼容性最好
  trailingSlash: true,
};

export default nextConfig;
