BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS post_stats_post_id_key ON post_stats(post_id);
CREATE UNIQUE INDEX IF NOT EXISTS daily_stats_unique ON daily_stats(post_id, date, language);

INSERT INTO posts ("id","authorId","slug","title","content","language","status","publishedAt","coverImage","tags")
VALUES
('2025-11-01-ai-quiz-to-productization-practice-en','admin-user-id','2025-11-01-ai-quiz-to-productization-practice','AI Quiz: From Idea to Productization','', 'en'::"Language", 'published'::"PostStatus", NOW(), '/img/ai-quiz.png','ai,quiz,product'),
('2025-11-01-ai-quiz-to-productization-practice-zh','admin-user-id','2025-11-01-ai-quiz-to-productization-practice','AI 测验：从想法到产品化实践','', 'zh'::"Language", 'published'::"PostStatus", NOW(), '/img/ai-quiz.png','ai,quiz,product')
ON CONFLICT ("id") DO UPDATE SET
"authorId"=EXCLUDED."authorId",
"slug"=EXCLUDED."slug",
"title"=EXCLUDED."title",
"content"=EXCLUDED."content",
"language"=EXCLUDED."language",
"status"=EXCLUDED."status",
"publishedAt"=EXCLUDED."publishedAt",
"coverImage"=EXCLUDED."coverImage",
"tags"=EXCLUDED."tags",
"updatedAt"=NOW();

INSERT INTO post_stats (post_id, title, views, likes, ai_questions, ai_summaries, language, comments)
VALUES (
  '2025-11-01-ai-quiz-to-productization-practice',
  'AI Quiz: From Idea to Productization',
  0, 0, 0, 0,
  'en',
  0
)
ON CONFLICT (post_id) DO UPDATE SET
  title = EXCLUDED.title;

INSERT INTO daily_stats (
  post_id, date, views, likes, ai_questions, ai_summaries, language, "userId",
  "pageViews", "uniqueVisitors", reads, comments
) VALUES
(
  '2025-11-01-ai-quiz-to-productization-practice', CURRENT_DATE,
  0, 0, 0, 0,
  'en', 'nzlouis',
  0, 0, 0, 0
),
(
  '2025-11-01-ai-quiz-to-productization-practice', CURRENT_DATE,
  0, 0, 0, 0,
  'zh', 'nzlouis',
  0, 0, 0, 0
)
ON CONFLICT (post_id, date, language) DO UPDATE SET
  views = daily_stats.views + EXCLUDED.views,
  likes = daily_stats.likes + EXCLUDED.likes,
  ai_questions = daily_stats.ai_questions + EXCLUDED.ai_questions,
  ai_summaries = daily_stats.ai_summaries + EXCLUDED.ai_summaries,
  "pageViews" = daily_stats."pageViews" + EXCLUDED."pageViews",
  "uniqueVisitors" = daily_stats."uniqueVisitors" + EXCLUDED."uniqueVisitors",
  reads = daily_stats.reads + EXCLUDED.reads,
  comments = daily_stats.comments + EXCLUDED.comments;

INSERT INTO comments ("postId","authorName","authorEmail",content,"is_anonymous",language,status)
VALUES
('2025-11-01-ai-quiz-to-productization-practice-en','Guest','guest@example.com','Great post!',false,'en','approved'::"CommentStatus"),
('2025-11-01-ai-quiz-to-productization-practice-zh','访客','guest@example.com','很赞的文章！',false,'zh','approved'::"CommentStatus");

COMMIT;