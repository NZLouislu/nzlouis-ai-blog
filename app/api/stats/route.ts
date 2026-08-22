import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { postStats } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getPostStats,
  upsertPostStats,
  getAllPostStats,
  upsertDailyStat,
} from "@/lib/db/queries";
import { listPublished } from "@/lib/posts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const language = searchParams.get("language");
    const aggregate = searchParams.get("aggregate");

    if (postId) {
      const lang = language || "en";
      const stats = await getPostStats(postId, lang);

      if (!stats) {
        const defaultStats = {
          views: 1,
          likes: 1,
          comments: 0,
          ai_questions: 1,
          ai_summaries: 0,
        };

        await upsertPostStats(postId, lang, {
          views: 0,
          likes: 0,
          aiQuestions: 0,
          title: "Blog Post",
        });

        return NextResponse.json(defaultStats);
      }

      return NextResponse.json({
        views: stats.views,
        likes: stats.likes,
        comments: stats.comments || 0,
        ai_questions: stats.aiQuestions,
        ai_summaries: stats.aiSummaries || 0,
      });
    } else if (language && aggregate === "all") {
      const posts = listPublished(language as "en" | "zh");
      const postIds = posts.map((p) => p.id);

      if (postIds.length === 0) {
        return NextResponse.json({
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalAiQuestions: 0,
          totalAiSummaries: 0,
          posts: [],
        });
      }

      const stats = await getAllPostStats(language);

      const totalComments =
        stats.reduce((sum, stat) => sum + (stat.comments || 0), 0) || 0;
      const totalViews =
        stats.reduce((sum, stat) => sum + (stat.views || 0), 0) || 0;
      const totalLikes =
        stats.reduce((sum, stat) => sum + (stat.likes || 0), 0) || 0;
      const totalAiQuestions =
        stats.reduce((sum, stat) => sum + (stat.aiQuestions || 0), 0) || 0;
      const totalAiSummaries =
        stats.reduce((sum, stat) => sum + (stat.aiSummaries || 0), 0) || 0;

      const postsWithStats = posts.map((post) => {
        const stat = stats.find((s) => s.postId === post.id);
        return {
          slug: post.slug,
          views: stat?.views || 0,
          likes: stat?.likes || 0,
        };
      });

      return NextResponse.json({
        totalViews,
        totalLikes,
        totalComments: totalComments || 0,
        totalAiQuestions,
        totalAiSummaries,
        posts: postsWithStats,
      });
    } else {
      const allStats = await getAllPostStats();

      const totalViews =
        allStats.reduce((sum, stat) => sum + (stat.views || 0), 0) || 0;
      const totalLikes =
        allStats.reduce((sum, stat) => sum + (stat.likes || 0), 0) || 0;
      const totalAiQuestions =
        allStats.reduce((sum, stat) => sum + (stat.aiQuestions || 0), 0) || 0;
      const totalAiSummaries =
        allStats.reduce((sum, stat) => sum + (stat.aiSummaries || 0), 0) || 0;

      const langStats = allStats.filter(
        (s) => s.language === (language || "en")
      );
      const totalComments =
        langStats.reduce((sum, stat) => sum + (stat.comments || 0), 0) || 0;

      const enPosts = listPublished("en");
      const zhPosts = listPublished("zh");
      const totalPosts = enPosts.length + zhPosts.length;

      return NextResponse.json({
        totalViews,
        totalLikes,
        totalComments: totalComments || 0,
        totalAiQuestions,
        totalAiSummaries,
        totalPosts,
      });
    }
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { postId, action, language = "en" } = await request.json();

    if (!postId || !action) {
      return NextResponse.json(
        { error: "Post ID and action are required" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    if (action === "like") {
      await upsertPostStats(postId, language, { likes: 1 });
      await upsertDailyStat({ postId, date: today, language, likes: 1 });
      return NextResponse.json({ success: true });
    }

    if (action === "view") {
      await upsertPostStats(postId, language, { views: 1 });
      await upsertDailyStat({ postId, date: today, language, views: 1 });
      return NextResponse.json({ success: true });
    }

    if (action === "ai_question") {
      await upsertPostStats(postId, language, { aiQuestions: 1 });
      await upsertDailyStat({ postId, date: today, language, aiQuestions: 1 });
      return NextResponse.json({ success: true });
    }

    if (action === "ai_summary") {
      await upsertPostStats(postId, language, { aiSummaries: 1 });
      await upsertDailyStat({ postId, date: today, language, aiSummaries: 1 });
      return NextResponse.json({ success: true });
    }

    if (action === "comment") {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}
