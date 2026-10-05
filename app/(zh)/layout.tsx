import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource-variable/jetbrains-mono";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "Ting · 个人杂志", template: "%s · Ting" },
  description: "Ting 的个人杂志：控制科学研究、工程实践与设计的交叉地带。",
};

/** 防主题 FOUC 的内联脚本：localStorage 优先，默认跟随系统 */
const themeInit = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

/** 中文站根 layout（多根模式：与 (en)/en/layout.tsx 各持一个 html 根） */
export default function ZhLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="bg-paper font-sans text-ink antialiased">
        <Nav lang="zh" />
        <main>{children}</main>
        <Footer lang="zh" />
      </body>
    </html>
  );
}
