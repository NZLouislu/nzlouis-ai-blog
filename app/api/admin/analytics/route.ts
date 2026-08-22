import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { postStats, comments, dailyStats } from "@/lib/db/schema";
import { eq, desc, count, and, gte, lt } from "drizzle-orm";
import {
  getAllPostStats,
  getTotalStats,
} from "@/lib/db/queries";
import { getBySlug, listPublished } from "@/lib/posts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const aggregate = searchParams.get("aggregate");

    if (aggregate === "all") {
      const stats = await getAllPostStats(language || undefined);

      const totals = {
        totalViews:
          stats.reduce((sum, stat) => sum + (stat.views || 0), 0) || 0,
        totalLikes:
          stats.reduce((sum, stat) => sum + (stat.likes || 0), 0) || 0,
      };

      return NextResponse.json(totals);
    } else if (aggregate === "single") {
      if (!language) {
        return NextResponse.json(
          { error: "Language required for single" },
          { status: 400 }
        );
      }

      const posts = listPublished(language as "en" | "zh");
      const postStatsResult = await Promise.all(
        posts.map(async (post) => {
          const stat = await db
            .select()
            .from(postStats)
            .where(
              and(
                eq(postStats.postId, post.id),
                eq(postStats.language, language)
              )
            )
            .limit(1)
            .then((rows) => rows[0]);

          return {
            slug: post.slug,
            views: stat ? stat.views || 0 : 0,
            likes: stat ? stat.likes || 0 : 0,
          };
        })
      );

      return NextResponse.json(postStatsResult);
    } else {
      const totalStatsResult = await getTotalStats();

      const allPostStats = await db
        .select()
        .from(postStats)
        .orderBy(postStats.language);

      const individualStats =
        allPostStats.map((stat) => {
          const post =
            stat.language === "zh"
              ? getBySlug(stat.postId, "zh")
              : getBySlug(stat.postId, "en");
          return {
            postId: stat.postId,
            title: post ? post.title : "Unknown Post",
            language: stat.language,
            views: stat.views || 0,
            likes: stat.likes || 0,
            aiQuestions: stat.aiQuestions || 0,
            aiSummaries: stat.aiSummaries || 0,
          };
        }) || [];

      const individualStatsWithComments = await Promise.all(
        individualStats.map(async (stat) => {
          const commentCount = await db
            .select({ count: count() })
            .from(comments)
            .where(eq(comments.postId, stat.postId))
            .then((rows) => rows[0]?.count || 0);

          return {
            ...stat,
            comments: commentCount,
          };
        })
      );

      const dailyResult = await db
        .select()
        .from(dailyStats)
        .orderBy(desc(dailyStats.date), dailyStats.language)
        .limit(60);

      interface DailyAggregate {
        date: string;
        language: string;
        views: number;
        likes: number;
        comments: number;
        aiQuestions: number;
        aiSummaries: number;
      }

      const dailyAggregates = dailyResult.reduce(
        (acc: Record<string, DailyAggregate>, stat) => {
          const date = stat.date;
          const key = `${date}-${stat.language}`;

          if (!acc[key]) {
            acc[key] = {
              date,
              language: stat.language!,
              views: 0,
              likes: 0,
              comments: 0,
              aiQuestions: 0,
              aiSummaries: 0,
            };
          }
          acc[key].views += stat.views || 0;
          acc[key].likes += stat.likes || 0;
          acc[key].aiQuestions += stat.aiQuestions || 0;
          acc[key].aiSummaries += stat.aiSummaries || 0;
          return acc;
        },
        {} as Record<string, DailyAggregate>
      );

      const dailyStatsArray = Object.values(dailyAggregates).sort(
        (a: DailyAggregate, b: DailyAggregate) => {
          const dateCompare =
            new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateCompare === 0) {
            return a.language.localeCompare(b.language);
          }
          return dateCompare;
        }
      );

      const dailyStatsWithComments = await Promise.all(
        dailyStatsArray.map(async (dayStat) => {
          const dayComments = await db
            .select({ count: count() })
            .from(comments)
            .where(
              and(
                gte(
                  comments.createdAt,
                  new Date(`${dayStat.date}T00:00:00.000Z`)
                ),
                lt(
                  comments.createdAt,
                  new Date(`${dayStat.date}T23:59:59.999Z`)
                )
              )
            )
            .then((rows) => rows[0]?.count || 0);

          return {
            ...dayStat,
            comments: dayComments,
          };
        })
      );

      return NextResponse.json({
        totals: {
          totalViews: totalStatsResult.totalViews,
          totalLikes: totalStatsResult.totalLikes,
          totalAiQuestions: totalStatsResult.totalAiQuestions,
          totalAiSummaries: totalStatsResult.totalAiSummaries,
          totalComments: totalStatsResult.totalComments,
          totalPosts: totalStatsResult.totalPosts,
          totalPostsEnglish: totalStatsResult.totalPostsEnglish,
          totalPostsChinese: totalStatsResult.totalPostsChinese,
        },
        individualStats: individualStatsWithComments,
        dailyStats: dailyStatsWithComments,
      });
    }
  } catch (error) {
    const err = error as Error;
    console.error("Analytics API error:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch analytics data",
      },
      { status: 500 }
    );
  }
}
