import { eq, and, desc, count, sql } from "drizzle-orm";
import { db } from "./index";
import {
  users,
  posts,
  postStats,
  dailyStats,
  comments,
  featureToggles,
} from "./schema";

export async function getUserByUsername(username: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.name, username))
    .limit(1);
  return result[0] || null;
}

export async function getUserById(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function getAllUsers() {
  return db.select().from(users);
}

export async function getPostStats(postId: string, language: string = "en") {
  const result = await db
    .select()
    .from(postStats)
    .where(and(eq(postStats.postId, postId), eq(postStats.language, language)))
    .limit(1);
  return result[0] || null;
}

export async function getAllPostStats(language?: string) {
  const whereClause = language ? eq(postStats.language, language) : undefined;
  return db.select().from(postStats).where(whereClause);
}

export async function upsertPostStats(
  postId: string,
  language: string,
  data: {
    views?: number;
    likes?: number;
    aiQuestions?: number;
    aiSummaries?: number;
    comments?: number;
    title?: string;
  }
) {
  const [row] = await db
    .insert(postStats)
    .values({
      postId,
      title: data.title || "Blog Post",
      views: data.views || 0,
      likes: data.likes || 0,
      aiQuestions: data.aiQuestions || 0,
      aiSummaries: data.aiSummaries || 0,
      comments: data.comments || 0,
      language,
    })
    .onConflictDoUpdate({
      target: [postStats.postId, postStats.language],
      set: {
        views: sql`${postStats.views} + ${data.views || 0}`,
        likes: sql`${postStats.likes} + ${data.likes || 0}`,
        aiQuestions: sql`${postStats.aiQuestions} + ${data.aiQuestions || 0}`,
        aiSummaries: sql`${postStats.aiSummaries} + ${data.aiSummaries || 0}`,
        comments: sql`${postStats.comments} + ${data.comments || 0}`,
        title: sql`coalesce(${postStats.title}, ${data.title || "Blog Post"})`,
      },
    })
    .returning();
  return row;
}

export async function getComments(postId: string, language: string = "en") {
  return db
    .select()
    .from(comments)
    .where(and(eq(comments.postId, postId), eq(comments.language, language)))
    .orderBy(desc(comments.createdAt));
}

export async function getAllComments(
  filters?: { postId?: string; language?: string }
) {
  const conditions = [];
  if (filters?.postId) conditions.push(eq(comments.postId, filters.postId));
  if (filters?.language)
    conditions.push(eq(comments.language, filters.language));

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(comments)
    .where(whereClause)
    .orderBy(desc(comments.createdAt));
}

export async function createComment(data: {
  postId: string;
  language?: string;
  authorName?: string;
  authorEmail?: string;
  content: string;
  isAnonymous?: boolean;
}) {
  const [newComment] = await db
    .insert(comments)
    .values({
      postId: data.postId,
      language: data.language || "en",
      authorName: data.authorName || null,
      authorEmail: data.authorEmail || null,
      content: data.content,
      isAnonymous: data.isAnonymous || false,
    })
    .returning();
  return newComment;
}

export async function deleteComment(id: string) {
  await db.delete(comments).where(eq(comments.id, id));
}

export async function getTotalStats() {
  const stats = await db.select().from(postStats);
  const totalCommentsResult = await db
    .select({ count: count() })
    .from(comments);

  const enPosts = stats.filter((s) => s.language === "en");
  const zhPosts = stats.filter((s) => s.language === "zh");

  return {
    totalViews: stats.reduce((sum, s) => sum + (s.views || 0), 0),
    totalLikes: stats.reduce((sum, s) => sum + (s.likes || 0), 0),
    totalAiQuestions: stats.reduce((sum, s) => sum + (s.aiQuestions || 0), 0),
    totalAiSummaries: stats.reduce((sum, s) => sum + (s.aiSummaries || 0), 0),
    totalComments: totalCommentsResult[0]?.count || 0,
    totalPosts: stats.length,
    totalPostsEnglish: enPosts.length,
    totalPostsChinese: zhPosts.length,
  };
}

export async function getPostsWithStats(language?: string) {
  const whereClause = language ? eq(posts.language, language) : undefined;
  const allPosts = await db.select().from(posts).where(whereClause);
  const stats = await db.select().from(postStats).where(whereClause);

  return allPosts.map((post) => {
    const stat = stats.find((s) => s.postId === post.id);
    return {
      ...post,
      views: stat?.views || 0,
      likes: stat?.likes || 0,
      aiQuestions: stat?.aiQuestions || 0,
      aiSummaries: stat?.aiSummaries || 0,
      comments: stat?.comments || 0,
    };
  });
}

export async function getFeatureToggles(userId: string) {
  const result = await db
    .select()
    .from(featureToggles)
    .where(eq(featureToggles.userId, userId))
    .limit(1);
  return result[0] || null;
}

export async function upsertFeatureToggles(
  userId: string,
  data: {
    totalViews?: boolean;
    totalLikes?: boolean;
    totalComments?: boolean;
    aiSummaries?: boolean;
    aiQuestions?: boolean;
    homeStatistics?: boolean;
  }
) {
  const existing = await getFeatureToggles(userId);

  if (existing) {
    await db
      .update(featureToggles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(featureToggles.userId, userId));
  } else {
    await db.insert(featureToggles).values({
      userId,
      ...data,
    });
  }
}

export async function getDailyStats(filters?: {
  userId?: string;
  language?: string;
  from?: string;
  to?: string;
}) {
  const conditions = [];
  if (filters?.userId)
    conditions.push(eq(dailyStats.userId, filters.userId));
  if (filters?.language)
    conditions.push(eq(dailyStats.language, filters.language));

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(dailyStats)
    .where(whereClause)
    .orderBy(desc(dailyStats.date))
    .limit(60);
}

export async function incrementPostStat(
  postId: string,
  language: string,
  field:
    | "views"
    | "likes"
    | "ai_questions"
    | "ai_summaries"
    | "comments"
) {
  const existing = await getPostStats(postId, language);

  if (existing) {
    const currentVal =
      field === "views"
        ? existing.views
        : field === "likes"
          ? existing.likes
          : field === "ai_questions"
            ? existing.aiQuestions
            : field === "ai_summaries"
              ? existing.aiSummaries
              : existing.comments;

    await db
      .update(postStats)
      .set({ [field]: (currentVal || 0) + 1 })
      .where(eq(postStats.id, existing.id));
  } else {
    await db.insert(postStats).values({
      postId,
      title: "Blog Post",
      [field]: 1,
      language,
    });
  }
}

export async function upsertDailyStat(data: {
  postId: string;
  date: string;
  language: string;
  userId?: string;
  views?: number;
  likes?: number;
  aiQuestions?: number;
  aiSummaries?: number;
}) {
  const [row] = await db
    .insert(dailyStats)
    .values({
      postId: data.postId,
      date: data.date,
      language: data.language,
      userId: data.userId || "nzlouis-user-id",
      views: data.views || 0,
      likes: data.likes || 0,
      aiQuestions: data.aiQuestions || 0,
      aiSummaries: data.aiSummaries || 0,
    })
    .onConflictDoUpdate({
      target: [
        dailyStats.userId,
        dailyStats.postId,
        dailyStats.date,
        dailyStats.language,
      ],
      set: {
        views: sql`${dailyStats.views} + ${data.views || 0}`,
        likes: sql`${dailyStats.likes} + ${data.likes || 0}`,
        aiQuestions: sql`${dailyStats.aiQuestions} + ${data.aiQuestions || 0}`,
        aiSummaries: sql`${dailyStats.aiSummaries} + ${data.aiSummaries || 0}`,
      },
    })
    .returning();
  return row;
}
