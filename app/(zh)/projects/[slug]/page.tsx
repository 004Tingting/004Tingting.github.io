import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/projects";
import MarkdownBody from "@/components/MarkdownBody";
import Kicker from "@/components/Kicker";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects("zh").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject("zh", slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject("zh", slug);
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-[68ch] px-6 py-16">
      <header>
        <Kicker>{project.tags.map((t) => `#${t}`).join("  ")}</Kicker>
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 font-mono text-sm text-muted">
          {[project.status, project.period].filter(Boolean).join(" · ")}
        </p>
      </header>

      <div className="mt-10">
        <MarkdownBody content={project.content} />
      </div>

      <p className="mt-16 border-t border-rule pt-6 font-mono text-sm">
        <Link href="/projects" className="hover:text-accent">
          ← 返回项目
        </Link>
      </p>
    </article>
  );
}
