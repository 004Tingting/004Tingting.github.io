import type { Metadata } from "next";
import { getPosts, toMeta } from "@/lib/posts";
import BlogList from "@/components/BlogList";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "Blog" };

export default function BlogPage() {
  const posts = getPosts("en").map(toMeta);
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>Blog</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">Journal</h1>
      <div className="mt-10">
        <BlogList posts={posts} lang="en" allLabel="All" />
      </div>
    </div>
  );
}
