import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { postStats, dailyStats } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { listPublished } from "@/lib/posts";

export async function POST(request: NextRequest) {
  try {
    const { language = "zh" } = await request.json();

    if (language !== "zh") {
      return NextResponse.json(
        { error: "Only Chinese language initialization is supported" },
        { status: 400 }
      );
    }

    const zhPosts = listPublished("zh");

    if (zhPosts.length === 0) {
      return NextResponse.json(
        { error: "No Chinese posts found" },
        { status: 404 }
      );
    }

    const results = [];

    for (const post of zhPosts) {
      const existingStats = await db
        .select()
        .from(postStats)
        .where(
          and(eq(postStats.postId, post.id), eq(postStats.language, "zh"))
        )
        .limit(1)
        .then((rows) => rows[0]);

      if (!existingStats) {
        try {
          const [newStats] = await db
            .insert(postStats)
            .values({
              postId: post.id,
              title: post.title,
              views: Math.floor(Math.random() * 200) + 50,
              likes: Math.floor(Math.random() * 30) + 5,
              aiQuestions: Math.floor(Math.random() * 15) + 1,
              aiSummaries: Math.floor(Math.random() * 20) + 2,
              language: "zh",
            })
            .returning();

          results.push({ post_id: post.id, status: "created", data: newStats });
        } catch (err: any) {
          results.push({ post_id: post.id, status: "error", error: err.message });
        }

        const today = new Date().toISOString().split("T")[0];
        await db.insert(dailyStats).values({
          postId: post.id,
          date: today,
          language: "zh",
          views: Math.floor(Math.random() * 20) + 5,
          likes: Math.floor(Math.random() * 5) + 1,
          aiQuestions: Math.floor(Math.random() * 3),
          aiSummaries: Math.floor(Math.random() * 4) + 1,
        });
      } else {
        results.push({ post_id: post.id, status: "exists" });
      }
    }

    return NextResponse.json({
      message: `Processed ${zhPosts.length} Chinese posts`,
      results,
    });
  } catch (error) {
    console.error("Init Chinese posts error:", error);
    return NextResponse.json(
      { error: "Failed to initialize Chinese posts" },
      { status: 500 }
    );
  }
}
