import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出：产物 out/ 纯 HTML，GitHub Pages 直接部署
  output: "export",
};

export default nextConfig;
