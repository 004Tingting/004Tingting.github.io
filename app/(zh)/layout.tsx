import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource-variable/jetbrains-mono";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.zh.title, template: "%s · Ting" },
  description: SITE.zh.description,
  alternates: {
    canonical: "/",
    languages: { "zh-CN": "/", en: "/en/" },
  },
  openGraph: {
    type: "website",
    locale: SITE.zh.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.zh.title,
    description: SITE.zh.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.zh.title,
    description: SITE.zh.description,
    images: [SITE.ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
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
