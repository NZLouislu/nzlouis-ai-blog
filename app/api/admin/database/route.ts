import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments, postStats, dailyStats, featureToggles, users, posts } from "@/lib/db/schema";
import { count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const action = searchParams.get("action");

    if (!table) {
      return NextResponse.json(
        { error: "Table parameter is required" },
        { status: 400 }
      );
    }

    if (action === "count") {
      let result;
      switch (table) {
        case "comments":
          result = await db.select({ count: count() }).from(comments);
          break;
        case "post_stats":
          result = await db.select({ count: count() }).from(postStats);
          break;
        case "daily_stats":
          result = await db.select({ count: count() }).from(dailyStats);
          break;
        case "feature_toggles":
          result = await db.select({ count: count() }).from(featureToggles);
          break;
        case "users":
          result = await db.select({ count: count() }).from(users);
          break;
        case "posts":
          result = await db.select({ count: count() }).from(posts);
          break;
        default:
          return NextResponse.json({ error: "Invalid table" }, { status: 400 });
      }
      return NextResponse.json({ table, count: result?.[0]?.count || 0 });
    }

    if (action === "all") {
      let data;
      switch (table) {
        case "comments":
          data = await db.select().from(comments).limit(100);
          break;
        case "post_stats":
          data = await db.select().from(postStats).limit(100);
          break;
        case "daily_stats":
          data = await db.select().from(dailyStats).limit(100);
          break;
        case "feature_toggles":
          data = await db.select().from(featureToggles).limit(100);
          break;
        case "users":
          data = await db.select().from(users).limit(100);
          break;
        case "posts":
          data = await db.select().from(posts).limit(100);
          break;
        default:
          return NextResponse.json({ error: "Invalid table" }, { status: 400 });
      }
      return NextResponse.json({ table, data });
    }

    let data;
    switch (table) {
      case "comments":
        data = await db.select().from(comments).limit(10);
        break;
      case "post_stats":
        data = await db.select().from(postStats).limit(10);
        break;
      case "daily_stats":
        data = await db.select().from(dailyStats).limit(10);
        break;
      case "feature_toggles":
        data = await db.select().from(featureToggles).limit(10);
        break;
      case "users":
        data = await db.select().from(users).limit(10);
        break;
      case "posts":
        data = await db.select().from(posts).limit(10);
        break;
      default:
        return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }
    return NextResponse.json({ table, data });
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Failed to query database" },
      { status: 500 }
    );
  }
}
