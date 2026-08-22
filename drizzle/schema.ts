import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  unique,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  avatarUrl: varchar("avatarurl", { length: 500 }),
  languagePreferences: varchar("languagepreferences", { length: 50 })
    .default("both")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable(
  "posts",
  {
    id: varchar("id").primaryKey(),
    authorId: varchar("author_id")
      .notNull()
      .references(() => users.id),
    slug: varchar("slug", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    language: varchar("language", { length: 10 }).default("en").notNull(),
    status: varchar("status", { length: 50 }).default("published").notNull(),
    publishedAt: timestamp("publishedat"),
    coverImage: varchar("coverimage", { length: 500 }),
    tags: text("tags").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_posts_author_language").on(t.authorId, t.language),
    index("idx_posts_author_status").on(t.authorId, t.status),
    unique("idx_posts_slug_language").on(t.slug, t.language),
  ]
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: varchar("post_id").notNull(),
    authorName: varchar("authorname", { length: 255 }),
    authorEmail: varchar("authoremail", { length: 255 }),
    content: text("content").notNull(),
    isAnonymous: boolean("is_anonymous").default(false),
    language: varchar("language", { length: 10 }).default("en"),
    status: varchar("status", { length: 50 }).default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_comments_post_status").on(t.postId, t.status),
  ]
);

export const postStats = pgTable(
  "post_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: varchar("post_id").notNull(),
    title: varchar("title", { length: 255 }).default("Blog Post"),
    views: integer("views").default(0),
    likes: integer("likes").default(0),
    aiQuestions: integer("ai_questions").default(0),
    aiSummaries: integer("ai_summaries").default(0),
    language: varchar("language", { length: 10 }).default("en"),
    comments: integer("comments").default(0),
  },
  (t) => [
    unique("post_stats_postid_language_unique").on(t.postId, t.language),
  ]
);

export const dailyStats = pgTable(
  "daily_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("userid")
      .default("nzlouis")
      .notNull(),
    postId: varchar("post_id").notNull(),
    date: date("date").notNull(),
    language: varchar("language", { length: 10 }).default("en"),
    views: integer("views").default(0),
    likes: integer("likes").default(0),
    aiQuestions: integer("ai_questions").default(0),
    aiSummaries: integer("ai_summaries").default(0),
    pageViews: integer("pageviews").default(0),
    uniqueVisitors: integer("uniquevisitors").default(0),
    reads: integer("reads").default(0),
    comments: integer("comments").default(0),
  },
  (t) => [
    unique("daily_stats_userid_postid_date_language_unique").on(
      t.userId,
      t.postId,
      t.date,
      t.language
    ),
    index("idx_daily_stats_user_date").on(t.userId, t.date),
  ]
);

export const featureToggles = pgTable("feature_toggles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull(),
  totalViews: boolean("total_views").default(true),
  totalLikes: boolean("total_likes").default(true),
  totalComments: boolean("total_comments").default(true),
  aiSummaries: boolean("ai_summaries").default(true),
  aiQuestions: boolean("ai_questions").default(true),
  homeStatistics: boolean("home_statistics").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
