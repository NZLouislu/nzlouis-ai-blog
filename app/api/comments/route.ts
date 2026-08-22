import { NextRequest, NextResponse } from "next/server";
import { getComments, createComment, upsertPostStats } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const language = searchParams.get("language");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const comments = await getComments(postId, language || "en");

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Comments API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { postId, language, name, email, comment, isAnonymous } =
      await request.json();

    if (!postId || !comment) {
      return NextResponse.json(
        { error: "Post ID and comment are required" },
        { status: 400 }
      );
    }

    const newComment = await createComment({
      postId,
      language: language || "en",
      authorName: isAnonymous ? null : name,
      authorEmail: isAnonymous ? null : email,
      content: comment,
      isAnonymous,
    });

    await upsertPostStats(postId, language || "en", { comments: 1 });

    return NextResponse.json({
      id: newComment.id,
      postId: newComment.postId,
      authorName: newComment.authorName,
      authorEmail: newComment.authorEmail,
      content: newComment.content,
      is_anonymous: newComment.isAnonymous,
      createdAt: newComment.createdAt,
    });
  } catch (error) {
    console.error("Comments API error:", error);
    return NextResponse.json(
      { error: "Failed to save comment" },
      { status: 500 }
    );
  }
}
