import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "@/lib/auth/server-session";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

    const { data: existing } = await supabase
      .from("feature_toggles")
      .select(
        "total_views,total_likes,total_comments,ai_summaries,ai_questions,home_statistics"
      )
      .eq("user_id", userId)
      .maybeSingle();

    const defaultToggles = {
      total_views: true,
      total_likes: true,
      total_comments: true,
      ai_summaries: true,
      ai_questions: true,
      home_statistics: true,
    };

    if (!existing) {
      const insertData = {
        user_id: userId,
        ...defaultToggles,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("feature_toggles")
        .insert([insertData]);

      if (insertError) {
        console.error("Error creating default toggles:", insertError);
        return NextResponse.json(
          { error: "Failed to create toggles" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        totalViews: defaultToggles.total_views,
        totalLikes: defaultToggles.total_likes,
        totalComments: defaultToggles.total_comments,
        aiSummaries: defaultToggles.ai_summaries,
        aiQuestions: defaultToggles.ai_questions,
        homeStatistics: defaultToggles.home_statistics,
      });
    }

    return NextResponse.json({
      totalViews: existing.total_views,
      totalLikes: existing.total_likes,
      totalComments: existing.total_comments,
      aiSummaries: existing.ai_summaries,
      aiQuestions: existing.ai_questions,
      homeStatistics: existing.home_statistics,
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

    // Build fields to update
    const updateData: { [key: string]: boolean } = {};

    // Map frontend field names to database field names
    const columnMap: { [key: string]: string } = {
      totalViews: "total_views",
      totalLikes: "total_likes",
      totalComments: "total_comments",
      aiSummaries: "ai_summaries",
      aiQuestions: "ai_questions",
      homeStatistics: "home_statistics",
    };

    // Process incoming data
    for (const [feature, enabled] of Object.entries(body)) {
      const columnName = columnMap[feature];
      if (columnName && typeof enabled === "boolean") {
        updateData[columnName] = enabled;
      }
    }

    // If no valid update data, return error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid toggle data provided" },
        { status: 400 }
      );
    }

    // First check if record exists
    const { data: existing } = await supabase
      .from("feature_toggles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let resultError: Error | null = null;
    if (existing) {
      // Try normal update
      const updatePayload = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("feature_toggles")
        .update(updatePayload)
        .eq("user_id", userId);

      // If it's a trigger error, try updating only business fields
      if (error && error.message.includes("updatedAt")) {
        console.log(
          "Trigger error detected, retrying with business fields only..."
        );
        const { error: retryError } = await supabase
          .from("feature_toggles")
          .update(updateData) // Without timestamp
          .eq("user_id", userId);
        resultError = retryError;
      } else {
        resultError = error;
      }
    } else {
      // Create new record with all fields
      const insertData = {
        user_id: userId,
        total_views: true,
        total_likes: true,
        total_comments: true,
        ai_summaries: true,
        ai_questions: true,
        home_statistics: true,
        ...updateData, // Override default values
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("feature_toggles")
        .insert([insertData]);
      resultError = error || null;
    }

    if (resultError) {
      console.error("Error updating toggles:", resultError);
      // If it's a trigger error, return more specific error message
      if (resultError.message.includes("updatedAt")) {
        return NextResponse.json(
          {
            error:
              "Database trigger error - please contact system administrator",
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: "Failed to update toggles: " + resultError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Toggles API error:", error);
    return NextResponse.json(
      { error: "Failed to update toggles" },
      { status: 500 }
    );
  }
}
