import { dic, type Lang } from "@/lib/i18n";

export default function Footer({ lang }: { lang: Lang }) {
  const t = dic[lang].footer;
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto max-w-5xl px-6 py-8 font-mono text-sm text-muted">
        <p>© 2026 Ting</p>
        <p className="mt-1">{t.colophon}</p>
      </div>
    </footer>
  );
}
