import { getArticles, SECTIONS } from "@/lib/articles";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** English feed (statically generated to out/en/feed.xml at build time) */
export function GET() {
  const articles = SECTIONS.flatMap((section) => getArticles("en", section)).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const items = articles
    .map(
      (a) => `    <item>
      <title>${esc(a.title)}</title>
      <link>${SITE.url}/en/${a.section}/${a.slug}/</link>
      <guid isPermaLink="true">${SITE.url}/en/${a.section}/${a.slug}/</guid>
      <pubDate>${new Date(`${a.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(a.summary)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.en.title)}</title>
    <link>${SITE.url}/en/</link>
    <description>${esc(SITE.en.description)}</description>
    <language>en</language>
    <atom:link href="${SITE.url}/en/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
