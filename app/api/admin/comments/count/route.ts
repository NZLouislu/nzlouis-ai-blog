import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { listPublished } from "@/lib/posts";

export async function GET() {
  try {
    const enPosts = listPublished("en");
    const zhPosts = listPublished("zh");

    const allPosts = [
      ...enPosts.map((post) => ({ ...post, language: "en" })),
      ...zhPosts.map((post) => ({ ...post, language: "zh" })),
    ];

    const postsWithCommentCounts = await Promise.all(
      allPosts.map(async (post) => {
        const result = await db
          .select({ count: count() })
          .from(comments)
          .where(
            and(
              eq(comments.postId, post.id),
              eq(comments.language, post.language)
            )
          )
          .then((rows) => rows[0]?.count || 0);

        return {
          id: post.id,
          post_id: post.id,
          title: post.title,
          language: post.language,
          _count: { comments: result },
        };
      })
    );

    return NextResponse.json(postsWithCommentCounts);
  } catch (error) {
    console.error("Failed to fetch comment counts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
