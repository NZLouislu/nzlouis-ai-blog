import { NextRequest, NextResponse } from "next/server";
import { getFeatureToggles, upsertFeatureToggles } from "@/lib/db/queries";
import { getServerSession } from "@/lib/auth/server-session";

async function getUserId() {
  try {
    const sessionUser = await getServerSession();
    if (sessionUser && sessionUser.username) {
      const userMap: Record<string, string> = {
        nzlouis: "user_nzlouis",
        nzmarie: "user_nzmarie",
        admin: "user_admin",
      };
      return userMap[sessionUser.username] || "user_default";
    }

    return "user_default";
  } catch (error) {
    console.error("Error getting user ID:", error);
    return "user_default";
  }
}

export async function GET() {
  try {
    const userId = await getUserId();

    const existing = await getFeatureToggles(userId);

    const defaultToggles = {
      totalViews: true,
      totalLikes: true,
      totalComments: true,
      aiSummaries: true,
      aiQuestions: true,
      homeStatistics: true,
    };

    if (!existing) {
      await upsertFeatureToggles(userId, defaultToggles);

      return NextResponse.json({
        totalViews: defaultToggles.totalViews,
        totalLikes: defaultToggles.totalLikes,
        totalComments: defaultToggles.totalComments,
        aiSummaries: defaultToggles.aiSummaries,
        aiQuestions: defaultToggles.aiQuestions,
        homeStatistics: defaultToggles.homeStatistics,
      });
    }

    return NextResponse.json({
      totalViews: existing.totalViews,
      totalLikes: existing.totalLikes,
      totalComments: existing.totalComments,
      aiSummaries: existing.aiSummaries,
      aiQuestions: existing.aiQuestions,
      homeStatistics: existing.homeStatistics,
    });
  } catch (error) {
    console.error("Toggles API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch toggles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();

    const updateData: { [key: string]: boolean } = {};

    const columnMap: { [key: string]: string } = {
      totalViews: "totalViews",
      totalLikes: "totalLikes",
      totalComments: "totalComments",
      aiSummaries: "aiSummaries",
      aiQuestions: "aiQuestions",
      homeStatistics: "homeStatistics",
    };

    for (const [feature, enabled] of Object.entries(body)) {
      const columnName = columnMap[feature];
      if (columnName && typeof enabled === "boolean") {
        updateData[columnName] = enabled;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid toggle data provided" },
        { status: 400 }
      );
    }

    await upsertFeatureToggles(userId, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Toggles API error:", error);
    return NextResponse.json(
      { error: "Failed to update toggles" },
      { status: 500 }
    );
  }
}
