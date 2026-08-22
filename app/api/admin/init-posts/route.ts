import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { postStats, posts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { listPublished } from "@/lib/posts";

export async function POST() {
  try {
    const enPosts = listPublished("en");
    const zhPosts = listPublished("zh");

    let initialized = 0;
    let updated = 0;

    // First, ensure all posts exist in the posts table
    for (const post of enPosts) {
      const existing = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, post.id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!existing) {
        await db.insert(posts).values({
          id: post.id,
          authorId: "nzlouis",
          slug: post.id,
          title: post.title,
          content: "Blog post content",
          language: "en",
          status: "published",
          publishedAt: new Date(),
          coverImage: "",
          tags: "",
        });
        console.log("Inserted post:", post.id);
      }
    }

    for (const post of zhPosts) {
      const existing = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, post.id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!existing) {
        await db.insert(posts).values({
          id: post.id,
          authorId: "nzlouis",
          slug: post.id,
          title: post.title,
          content: "Blog post content",
          language: "zh",
          status: "published",
          publishedAt: new Date(),
          coverImage: "",
          tags: "",
        });
        console.log("Inserted post:", post.id);
      }
    }

    // Now initialize post stats
    for (const post of enPosts) {
      const existing = await db
        .select()
        .from(postStats)
        .where(
          and(eq(postStats.postId, post.id), eq(postStats.language, "en"))
        )
        .limit(1)
        .then((rows) => rows[0]);

      if (!existing) {
        await db.insert(postStats).values({
          postId: post.id,
          title: post.title,
          views: 0,
          likes: 0,
          aiQuestions: 0,
          aiSummaries: 0,
          language: "en",
        });
        initialized++;
      } else {
        await db
          .update(postStats)
          .set({ title: post.title })
          .where(eq(postStats.id, existing.id));
        updated++;
      }
    }

    for (const post of zhPosts) {
      const existing = await db
        .select()
        .from(postStats)
        .where(
          and(eq(postStats.postId, post.id), eq(postStats.language, "zh"))
        )
        .limit(1)
        .then((rows) => rows[0]);

      if (!existing) {
        await db.insert(postStats).values({
          postId: post.id,
          title: post.title,
          views: 0,
          likes: 0,
          aiQuestions: 0,
          aiSummaries: 0,
          language: "zh",
        });
        initialized++;
      } else {
        await db
          .update(postStats)
          .set({ title: post.title })
          .where(eq(postStats.id, existing.id));
        updated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Post initialization complete: ${initialized} new posts initialized, ${updated} posts updated`,
      initialized,
      updated,
      totalEnglish: enPosts.length,
      totalChinese: zhPosts.length,
    });
  } catch (error) {
    console.error("Failed to initialize posts:", error);
    return NextResponse.json(
      { error: "Failed to initialize posts", details: error },
      { status: 500 }
    );
  }
}