import { NextRequest, NextResponse } from "next/server";
import { withAuth, getUserIdFromRequest } from "../../../../lib/middleware/auth";
import { getDailyStats } from "@/lib/db/queries";

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const urlUserId = searchParams.get("userId") || undefined;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const language = searchParams.get("language") || "en";

    const userId = getUserIdFromRequest(
      req as any,
      urlUserId
    );

    const dailyStats = await getDailyStats({
      userId,
      language,
      from: from || undefined,
      to: to || undefined,
    });

    const data = dailyStats.map((stat) => ({
      date: stat.date,
      pageViews: stat.pageViews || 0,
      uniqueVisitors: stat.uniqueVisitors || 0,
      reads: stat.reads || 0,
      likes: stat.likes || 0,
      comments: stat.comments || 0,
    }));

    const totals = data.reduce(
      (acc, day) => ({
        pageViews: acc.pageViews + day.pageViews,
        uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
        reads: acc.reads + day.reads,
        likes: acc.likes + day.likes,
        comments: acc.comments + day.comments,
      }),
      { pageViews: 0, uniqueVisitors: 0, reads: 0, likes: 0, comments: 0 }
    );

    return NextResponse.json({
      userId,
      period: from && to ? `${from}-${to}` : "week",
      language,
      data,
      totals,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
});
