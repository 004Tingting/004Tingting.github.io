import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource-variable/jetbrains-mono";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "Ting · A Personal Journal", template: "%s · Ting" },
  description: "Ting's personal journal at the crossing of control research, engineering and design.",
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
