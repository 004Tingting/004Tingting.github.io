import Link from "next/link";
import type { ProjectMeta } from "@/lib/projects";
import type { Lang } from "@/lib/i18n";

/** 项目列表（服务端组件，双语复用；首页与 /projects 共用） */
export default function ProjectList({
  projects,
  lang,
}: {
  projects: ProjectMeta[];
  lang: Lang;
}) {
  const base = lang === "zh" ? "/projects" : "/en/projects";

  return (
    <ul className="divide-y divide-rule">
      {projects.map((p, i) => (
        <li key={p.slug} className="py-6">
          <Link href={`${base}/${p.slug}`} className="group block">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-serif text-2xl font-semibold leading-snug group-hover:text-accent">
                {p.title}
              </h2>
              <span className="ml-auto shrink-0 font-mono text-sm text-muted">
                {[p.status, p.period].filter(Boolean).join(" · ")}
              </span>
            </div>
            <p className="mt-2 pl-10 text-muted">{p.summary}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
