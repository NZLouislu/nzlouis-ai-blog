import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { postStats } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const statsByLanguage = await db
      .select({
        language: postStats.language,
        count: sql<number>`count(*)::int`,
        views: sql<number>`coalesce(sum(${postStats.views}), 0)::int`,
        likes: sql<number>`coalesce(sum(${postStats.likes}), 0)::int`,
      })
      .from(postStats)
      .groupBy(postStats.language);

    const overview: Record<string, { count: number; views: number; likes: number }> = {
      en: { count: 0, views: 0, likes: 0 },
      zh: { count: 0, views: 0, likes: 0 },
    };

    for (const stat of statsByLanguage) {
      if (stat.language === "en" || stat.language === "zh") {
        overview[stat.language] = {
          count: stat.count,
          views: stat.views,
          likes: stat.likes,
        };
      }
    }

    return NextResponse.json(overview);
  } catch (error) {
    console.error("Failed to fetch overview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
