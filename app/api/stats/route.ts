import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { listPublished } from "@/lib/posts";
// removed unused imports

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const language = searchParams.get("language");
    const aggregate = searchParams.get("aggregate");

    if (postId) {
      const { data: stats, error: statsError } = await supabase
        .from("post_stats")
        .select("*")
        .eq("post_id", postId)
        .eq("language", language || "en")
        .single();

      const { data: commentsStat } = await supabase
        .from("post_stats")
        .select("comments")
        .eq("post_id", postId)
        .eq("language", language || "en")
        .single();

      if (statsError && statsError.code !== "PGRST116") {
        console.error("Stats error:", statsError);
        return NextResponse.json(
          { error: "Failed to fetch stats" },
          { status: 500 }
        );
      }

      const defaultStats = {
        views: 1,
        likes: 1,
        comments: commentsStat?.comments || 0,
        ai_questions: 1,
        ai_summaries: 0,
      };

      if (!stats) {
        const { error: createError } = await supabase
          .from("post_stats")
          .insert({
            post_id: postId,
            title: "Blog Post",
            views: defaultStats.views,
            likes: defaultStats.likes,
            ai_questions: 0,
            language: language || "en",
          });

        if (createError) {
          console.error("Create stats error:", createError);
        }

        return NextResponse.json(defaultStats);
      }

      return NextResponse.json({
        views: stats.views,
        likes: stats.likes,
        comments: stats.comments || 0,
        ai_questions: stats.ai_questions,
        ai_summaries: stats.ai_summaries || 0,
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

      const { data: stats, error: statsError } = await supabase
        .from("post_stats")
        .select("*")
        .in("post_id", postIds)
        .eq("language", language);

      if (statsError) {
        console.error("Language stats error:", statsError);
        return NextResponse.json({
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalAiQuestions: 0,
          totalAiSummaries: 0,
          posts: [],
        });
      }

      const totalComments =
        stats?.reduce((sum, stat) => sum + (stat.comments || 0), 0) || 0;

      const totalViews =
        stats?.reduce((sum, stat) => sum + (stat.views || 0), 0) || 0;
      const totalLikes =
        stats?.reduce((sum, stat) => sum + (stat.likes || 0), 0) || 0;
      const totalAiQuestions =
        stats?.reduce((sum, stat) => sum + (stat.ai_questions || 0), 0) || 0;
      const totalAiSummaries =
        stats?.reduce((sum, stat) => sum + (stat.ai_summaries || 0), 0) || 0;

      const postsWithStats = posts.map((post) => {
        const stat = stats?.find((s) => s.post_id === post.id);
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
      const { data: stats, error: statsError } = await supabase
        .from("post_stats")
        .select("views, likes, ai_questions, ai_summaries");

      if (statsError) {
        console.error("Total stats error:", statsError);
        return NextResponse.json({
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalAiQuestions: 0,
          totalAiSummaries: 0,
        });
      }

      const totalViews =
        stats?.reduce((sum, stat) => sum + (stat.views || 0), 0) || 0;
      const totalLikes =
        stats?.reduce((sum, stat) => sum + (stat.likes || 0), 0) || 0;
      const totalAiQuestions =
        stats?.reduce((sum, stat) => sum + (stat.ai_questions || 0), 0) || 0;
      const totalAiSummaries =
        stats?.reduce((sum, stat) => sum + (stat.ai_summaries || 0), 0) || 0;

      const { data: allStats } = await supabase
        .from("post_stats")
        .select("comments")
        .eq("language", language || "en");

      const totalComments =
        allStats?.reduce((sum, stat) => sum + (stat.comments || 0), 0) || 0;

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

    if (action === "like") {
      // Increment likes
      const { error: likeError } = await supabase.rpc("increment_likes", {
        post_id_param: postId,
        language_param: language
      });

      if (likeError) {
        // Fallback: manual update
        const { data: existing } = await supabase
          .from("post_stats")
          .select("likes")
          .eq("post_id", postId)
          .eq("language", language)
          .single();

        if (existing) {
          await supabase
            .from("post_stats")
            .update({ likes: (existing.likes || 0) + 1 })
            .eq("post_id", postId)
            .eq("language", language);
        } else {
          await supabase.from("post_stats").insert({
            post_id: postId,
            title: "Blog Post",
            likes: 1,
            views: 0,
            ai_questions: 0,
            language: language,
          });
        }
      }

      // Update daily stats
      const today = new Date().toISOString().split("T")[0];

      const { data: existingDaily } = await supabase
        .from("daily_stats")
        .select("likes")
        .eq("post_id", postId)
        .eq("date", today)
        .eq("language", language)
        .single();

      if (existingDaily) {
        await supabase
          .from("daily_stats")
          .update({ likes: (existingDaily.likes || 0) + 1 })
          .eq("post_id", postId)
          .eq("date", today)
          .eq("language", language);
      } else {
        await supabase.from("daily_stats").insert({
          post_id: postId,
          date: today,
          views: 0,
          likes: 1,
          ai_questions: 0,
          language: language,
        });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "view") {
      // Increment views
      const { data: existing } = await supabase
        .from("post_stats")
        .select("views")
        .eq("post_id", postId)
        .eq("language", language)
        .single();

      if (existing) {
        await supabase
          .from("post_stats")
          .update({ views: (existing.views || 0) + 1 })
          .eq("post_id", postId)
          .eq("language", language);
      } else {
        await supabase.from("post_stats").insert({
          post_id: postId,
          title: "Blog Post",
          views: 1,
          likes: 0,
          ai_questions: 0,
          language: language,
        });
      }

      // Update daily stats
      const today = new Date().toISOString().split("T")[0];

      const { data: existingDaily } = await supabase
        .from("daily_stats")
        .select("views")
        .eq("post_id", postId)
        .eq("date", today)
        .eq("language", language)
        .single();

      if (existingDaily) {
        await supabase
          .from("daily_stats")
          .update({ views: (existingDaily.views || 0) + 1 })
          .eq("post_id", postId)
          .eq("date", today)
          .eq("language", language);
      } else {
        await supabase.from("daily_stats").insert({
          post_id: postId,
          date: today,
          views: 1,
          likes: 0,
          ai_questions: 0,
          language: language,
        });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "ai_question") {
      // Increment AI questions
      const { data: existing } = await supabase
        .from("post_stats")
        .select("ai_questions")
        .eq("post_id", postId)
        .eq("language", language)
        .single();

      if (existing) {
        await supabase
          .from("post_stats")
          .update({ ai_questions: (existing.ai_questions || 0) + 1 })
          .eq("post_id", postId)
          .eq("language", language);
      } else {
        await supabase.from("post_stats").insert({
          post_id: postId,
          title: "Blog Post",
          views: 0,
          likes: 0,
          ai_questions: 1,
          ai_summaries: 0,
          language: language,
        });
      }

      // Update daily stats
      const today = new Date().toISOString().split("T")[0];

      const { data: existingDaily } = await supabase
        .from("daily_stats")
        .select("ai_questions")
        .eq("post_id", postId)
        .eq("date", today)
        .eq("language", language)
        .single();

      if (existingDaily) {
        await supabase
          .from("daily_stats")
          .update({ ai_questions: (existingDaily.ai_questions || 0) + 1 })
          .eq("post_id", postId)
          .eq("date", today)
          .eq("language", language);
      } else {
        await supabase.from("daily_stats").insert({
          post_id: postId,
          date: today,
          views: 0,
          likes: 0,
          ai_questions: 1,
          ai_summaries: 0,
          language: language,
        });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "ai_summary") {
      // Increment AI summaries
      const { data: existing } = await supabase
        .from("post_stats")
        .select("ai_summaries")
        .eq("post_id", postId)
        .eq("language", language)
        .single();

      if (existing) {
        await supabase
          .from("post_stats")
          .update({ ai_summaries: (existing.ai_summaries || 0) + 1 })
          .eq("post_id", postId)
          .eq("language", language);
      } else {
        await supabase.from("post_stats").insert({
          post_id: postId,
          title: "Blog Post",
          views: 0,
          likes: 0,
          ai_questions: 0,
          ai_summaries: 1,
          language: language,
        });
      }

      // Update daily stats
      const today = new Date().toISOString().split("T")[0];

      const { data: existingDaily } = await supabase
        .from("daily_stats")
        .select("ai_summaries")
        .eq("post_id", postId)
        .eq("date", today)
        .eq("language", language)
        .single();

      if (existingDaily) {
        await supabase
          .from("daily_stats")
          .update({ ai_summaries: (existingDaily.ai_summaries || 0) + 1 })
          .eq("post_id", postId)
          .eq("date", today)
          .eq("language", language);
      } else {
        await supabase.from("daily_stats").insert({
          post_id: postId,
          date: today,
          views: 0,
          likes: 0,
          ai_questions: 0,
          ai_summaries: 1,
          language: language,
        });
      }

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
