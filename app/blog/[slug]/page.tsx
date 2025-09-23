import React from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Post } from "@/lib/types";
import BlogPostClient from "./BlogPostClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;

  const h = await headers();
  const lang = h.get("x-locale") || "en";

  try {
    const { getBySlug } = await import("@/lib/posts");
    const post = getBySlug(slug, lang as "en" | "zh");
    if (!post) {
      notFound();
    }
    return <BlogPostClient post={post} />;
  } catch (error) {
    console.error("Failed to get post:", error);
  }

  notFound();
}

export async function generateStaticParams() {
  try {
    const { listPublished } = await import("@/lib/posts");
    // Generate static paths for all languages
    const enPosts = listPublished("en");
    const zhPosts = listPublished("zh");
    const posts = [...enPosts, ...zhPosts];
    return posts.map((post: Post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Failed to get posts:", error);
  }

  return [];
}
