import type { Metadata } from "next";
import { getProjects, toProjectMeta } from "@/lib/projects";
import ProjectList from "@/components/ProjectList";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  const projects = getProjects("en").map(toProjectMeta);
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>Projects</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">Work</h1>
      <div className="mt-10">
        <ProjectList projects={projects} lang="en" />
      </div>
    </div>
  );
}
