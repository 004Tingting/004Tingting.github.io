import type { Metadata } from "next";
import { getPosts, toMeta } from "@/lib/posts";
import BlogList from "@/components/BlogList";
import Kicker from "@/components/Kicker";

export const metadata: Metadata = { title: "博客" };

export default function BlogPage() {
  const posts = getPosts("zh").map(toMeta);
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Kicker>博客</Kicker>
      <h1 className="mt-4 font-serif text-5xl font-bold">Blog</h1>
      <div className="mt-10">
        <BlogList posts={posts} lang="zh" allLabel="全部" />
      </div>
    </div>
  );
}
