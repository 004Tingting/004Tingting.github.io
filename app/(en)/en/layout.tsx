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
  title: { default: SITE.en.title, template: "%s · Ting" },
  description: SITE.en.description,
  alternates: {
    canonical: "/en/",
    languages: { "zh-CN": "/", en: "/en/" },
  },
  openGraph: {
    type: "website",
    locale: SITE.en.locale,
    url: `${SITE.url}/en/`,
    siteName: SITE.name,
    title: SITE.en.title,
    description: SITE.en.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.en.title,
    description: SITE.en.description,
    images: [SITE.ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

const themeInit = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

/** 英文站根 layout：/en 起点的 html 根，lang="en"（多根模式） */
export default function EnLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="bg-paper font-sans text-ink antialiased">
        <Nav lang="en" />
        <main>{children}</main>
        <Footer lang="en" />
      </body>
    </html>
  );
}
