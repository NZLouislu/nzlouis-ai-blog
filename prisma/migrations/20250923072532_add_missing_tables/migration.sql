/*
  Warnings:

  - You are about to drop the column `comment` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `is_anonymous` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `post_id` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `ai_questions` on the `daily_stats` table. All the data in the column will be lost.
  - You are about to drop the column `ai_summaries` on the `daily_stats` table. All the data in the column will be lost.
  - You are about to drop the column `post_id` on the `daily_stats` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `daily_stats` table. All the data in the column will be lost.
  - Added the required column `authorEmail` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorName` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postId` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `daily_stats` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "avatarUrl" TEXT,
    "languagePreferences" TEXT NOT NULL DEFAULT 'both',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" DATETIME,
    "coverImage" TEXT,
    "tags" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "feature_toggles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "payload" TEXT,
    CONSTRAINT "feature_toggles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_comments" ("id") SELECT "id" FROM "comments";
DROP TABLE "comments";
ALTER TABLE "new_comments" RENAME TO "comments";
CREATE INDEX "comments_postId_status_idx" ON "comments"("postId", "status");
CREATE TABLE "new_daily_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "language" TEXT NOT NULL,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "reads" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "daily_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_daily_stats" ("date", "id", "language", "likes") SELECT "date", "id", "language", "likes" FROM "daily_stats";
DROP TABLE "daily_stats";
ALTER TABLE "new_daily_stats" RENAME TO "daily_stats";
CREATE INDEX "daily_stats_userId_date_idx" ON "daily_stats"("userId", "date");
CREATE UNIQUE INDEX "daily_stats_userId_date_language_key" ON "daily_stats"("userId", "date", "language");
CREATE TABLE "new_post_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Blog Post',
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "ai_questions" INTEGER NOT NULL DEFAULT 0,
    "ai_summaries" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'en',
    CONSTRAINT "post_stats_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_post_stats" ("ai_questions", "ai_summaries", "id", "language", "likes", "post_id", "title", "views") SELECT "ai_questions", "ai_summaries", "id", "language", "likes", "post_id", "title", "views" FROM "post_stats";
DROP TABLE "post_stats";
ALTER TABLE "new_post_stats" RENAME TO "post_stats";
CREATE UNIQUE INDEX "post_stats_post_id_key" ON "post_stats"("post_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "posts_authorId_language_idx" ON "posts"("authorId", "language");

-- CreateIndex
CREATE INDEX "posts_authorId_status_idx" ON "posts"("authorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "posts_authorId_slug_key" ON "posts"("authorId", "slug");

-- CreateIndex
CREATE INDEX "feature_toggles_userId_idx" ON "feature_toggles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "feature_toggles_userId_key_key" ON "feature_toggles"("userId", "key");
