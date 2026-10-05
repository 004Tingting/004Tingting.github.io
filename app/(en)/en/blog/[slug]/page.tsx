import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts, fmtDate } from "@/lib/posts";
import MarkdownBody from "@/components/MarkdownBody";
import Kicker from "@/components/Kicker";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts("en").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost("en", slug);
  return post ? { title: post.title, description: post.summary } : {};
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost("en", slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-[68ch] px-6 py-16">
      <header>
        <Kicker>{post.tags.map((t) => `#${t}`).join("  ")}</Kicker>
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 font-mono text-sm text-muted">{fmtDate(post.date, "en")}</p>
      </header>

      <div className="mt-10">
        <MarkdownBody content={post.content} />
      </div>

      <p className="mt-16 border-t border-rule pt-6 font-mono text-sm">
        <Link href="/en/blog" className="hover:text-accent">
          ← Back to blog
        </Link>
      </p>
    </article>
  );
}
