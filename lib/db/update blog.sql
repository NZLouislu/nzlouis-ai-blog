BEGIN;

UPDATE posts SET "authorId"='admin-user-id',"slug"='2025-11-01-ai-quiz-to-productization-practice',"title"='AI Quiz: From Idea to Productization',"content"='',"language"='en'::"Language","status"='published'::"PostStatus","publishedAt"=NOW(),"coverImage"='/img/ai-quiz.png',"tags"='ai,quiz,product',"updatedAt"=NOW() WHERE "id"='2025-11-01-ai-quiz-to-productization-practice-en';
INSERT INTO posts ("id","authorId","slug","title","content","language","status","publishedAt","coverImage","tags")
SELECT '2025-11-01-ai-quiz-to-productization-practice-en','admin-user-id','2025-11-01-ai-quiz-to-productization-practice','AI Quiz: From Idea to Productization','', 'en'::"Language", 'published'::"PostStatus", NOW(), '/img/ai-quiz.png','ai,quiz,product'
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE "id"='2025-11-01-ai-quiz-to-productization-practice-en');

UPDATE posts SET "authorId"='admin-user-id',"slug"='2025-11-01-ai-quiz-to-productization-practice',"title"='AI 测验：从想法到产品化实践',"content"='',"language"='zh'::"Language","status"='published'::"PostStatus","publishedAt"=NOW(),"coverImage"='/img/ai-quiz.png',"tags"='ai,quiz,product',"updatedAt"=NOW() WHERE "id"='2025-11-01-ai-quiz-to-productization-practice-zh';
INSERT INTO posts ("id","authorId","slug","title","content","language","status","publishedAt","coverImage","tags")
SELECT '2025-11-01-ai-quiz-to-productization-practice-zh','admin-user-id','2025-11-01-ai-quiz-to-productization-practice','AI 测验：从想法到产品化实践','', 'zh'::"Language", 'published'::"PostStatus", NOW(), '/img/ai-quiz.png','ai,quiz,product'
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE "id"='2025-11-01-ai-quiz-to-productization-practice-zh');

UPDATE post_stats SET title='AI Quiz: From Idea to Productization' WHERE post_id='2025-11-01-ai-quiz-to-productization-practice';
INSERT INTO post_stats (post_id, title, views, likes, ai_questions, ai_summaries, language, comments)
SELECT '2025-11-01-ai-quiz-to-productization-practice','AI Quiz: From Idea to Productization',0,0,0,0,'en',0
WHERE NOT EXISTS (SELECT 1 FROM post_stats WHERE post_id='2025-11-01-ai-quiz-to-productization-practice');

UPDATE daily_stats SET views=views,likes=likes,ai_questions=ai_questions,ai_summaries=ai_summaries,"pageViews"="pageViews", "uniqueVisitors"="uniqueVisitors",reads=reads,comments=comments WHERE post_id='2025-11-01-ai-quiz-to-productization-practice' AND date=CURRENT_DATE AND language='en';
INSERT INTO daily_stats (post_id,date,views,likes,ai_questions,ai_summaries,language,"userId","pageViews","uniqueVisitors",reads,comments)
SELECT '2025-11-01-ai-quiz-to-productization-practice',CURRENT_DATE,0,0,0,0,'en','nzlouis',0,0,0,0
WHERE NOT EXISTS (SELECT 1 FROM daily_stats WHERE post_id='2025-11-01-ai-quiz-to-productization-practice' AND date=CURRENT_DATE AND language='en');

UPDATE daily_stats SET views=views,likes=likes,ai_questions=ai_questions,ai_summaries=ai_summaries,"pageViews"="pageViews", "uniqueVisitors"="uniqueVisitors",reads=reads,comments=comments WHERE post_id='2025-11-01-ai-quiz-to-productization-practice' AND date=CURRENT_DATE AND language='zh';
INSERT INTO daily_stats (post_id,date,views,likes,ai_questions,ai_summaries,language,"userId","pageViews","uniqueVisitors",reads,comments)
SELECT '2025-11-01-ai-quiz-to-productization-practice',CURRENT_DATE,0,0,0,0,'zh','nzlouis',0,0,0,0
WHERE NOT EXISTS (SELECT 1 FROM daily_stats WHERE post_id='2025-11-01-ai-quiz-to-productization-practice' AND date=CURRENT_DATE AND language='zh');

INSERT INTO comments ("postId","authorName","authorEmail",content,"is_anonymous",language,status)
SELECT '2025-11-01-ai-quiz-to-productization-practice-en','Guest','guest@example.com','Great post!',false,'en','approved'::"CommentStatus"
WHERE NOT EXISTS (SELECT 1 FROM comments WHERE "postId"='2025-11-01-ai-quiz-to-productization-practice-en' AND content='Great post!');
INSERT INTO comments ("postId","authorName","authorEmail",content,"is_anonymous",language,status)
SELECT '2025-11-01-ai-quiz-to-productization-practice-zh','访客','guest@example.com','很赞的文章！',false,'zh','approved'::"CommentStatus"
WHERE NOT EXISTS (SELECT 1 FROM comments WHERE "postId"='2025-11-01-ai-quiz-to-productization-practice-zh' AND content='很赞的文章！');

COMMIT;