-- SQL to create all tables in Supabase
-- Run this in your Supabase SQL editor

-- Drop existing tables if they exist
DROP TABLE IF EXISTS daily_stats;
DROP TABLE IF EXISTS post_stats;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS feature_toggles;

-- Create feature_toggles table
CREATE TABLE feature_toggles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_views BOOLEAN DEFAULT true,
  total_likes BOOLEAN DEFAULT true,
  total_comments BOOLEAN DEFAULT true,
  ai_summaries BOOLEAN DEFAULT true,
  ai_questions BOOLEAN DEFAULT true,
  home_statistics BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default values for feature_toggles
INSERT INTO feature_toggles (total_views, total_likes, total_comments, ai_summaries, ai_questions, home_statistics)
VALUES (true, true, true, true, true, true);

-- Create updated_at trigger function (drop if exists first)
DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for feature_toggles
DROP TRIGGER IF EXISTS update_feature_toggles_updated_at ON feature_toggles;

CREATE TRIGGER update_feature_toggles_updated_at
    BEFORE UPDATE ON feature_toggles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  comment TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- Create post_stats table
CREATE TABLE post_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT UNIQUE NOT NULL,
  title TEXT DEFAULT 'Blog Post',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  ai_questions INTEGER DEFAULT 0,
  ai_summaries INTEGER DEFAULT 0
);

-- Create daily_stats table
CREATE TABLE daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT NOT NULL,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  ai_questions INTEGER DEFAULT 0,
  ai_summaries INTEGER DEFAULT 0,
  UNIQUE(post_id, date)
);

-- Insert sample post stats data
INSERT INTO post_stats (post_id, title, views, likes, ai_questions, ai_summaries) VALUES
('2024-03-10-java-and-spring-in-depth-understanding', 'Java and Spring: In-Depth Analysis and Comprehensive Understanding', 150, 25, 8, 12),
('2024-03-02-the-trio-of-frontend-development', 'The Trio of Frontend Development', 120, 18, 6, 9),
('2024-02-24-backend-tech-the-foundation-of-software', 'Backend Tech: The Foundation of Software', 95, 15, 4, 7),
('2024-02-17-react-18-typescript-powerful-combination-frontend', 'React 18 & TypeScript: Powerful Combination for Frontend', 110, 22, 7, 10),
('2024-02-11-react-a-powerhouse-in-front-end-development-for-job-security', 'React: A Powerhouse in Front-End Development for Job Security', 85, 12, 3, 5),
('2024-02-04-front-end-development-in-2024-trends-and-future-directions', 'Front-End Development in 2024: Trends and Future Directions', 140, 28, 9, 14),
('2024-01-28-microservices-architecture-empowering-online-banking-services', 'Microservices Architecture: Empowering Online Banking Services', 75, 10, 2, 4),
('2024-01-20-new_zealand_paradise_for_children', 'New Zealand: Paradise for Children', 200, 35, 15, 20),
('2024-01-10-will-ai-replace-human-developers', 'Will AI Replace Human Developers?', 180, 30, 12, 16);

-- Insert sample comments data
INSERT INTO comments (post_id, name, email, comment, is_anonymous) VALUES
('2024-03-10-java-and-spring-in-depth-understanding', 'John Doe', 'john@example.com', 'Great article! Very comprehensive explanation of Java and Spring.', false),
('2024-03-10-java-and-spring-in-depth-understanding', 'Jane Smith', 'jane@example.com', 'Thanks for sharing this detailed guide. Helped me a lot!', false),
('2024-03-10-java-and-spring-in-depth-understanding', 'Alex Chen', 'alex@example.com', 'Perfect explanation of Spring framework features. Really helpful for enterprise development.', false),
('2024-03-10-java-and-spring-in-depth-understanding', 'Maria Rodriguez', 'maria@example.com', 'Excellent breakdown of Java evolution and Spring ecosystem. Bookmarked for reference!', false),
('2024-03-02-the-trio-of-frontend-development', NULL, NULL, 'Excellent overview of frontend technologies!', true),
('2024-02-24-backend-tech-the-foundation-of-software', 'Mike Johnson', 'mike@example.com', 'Backend development is indeed the foundation. Well explained!', false),
('2024-01-20-new_zealand_paradise_for_children', 'Sarah Wilson', 'sarah@example.com', 'Beautiful article about New Zealand. The photos are amazing!', false),
('2024-01-10-will-ai-replace-human-developers', NULL, NULL, 'Interesting perspective on AI and development. Looking forward to more articles!', true);

-- Insert sample daily stats data
INSERT INTO daily_stats (post_id, date, views, likes, ai_questions, ai_summaries) VALUES
('2024-03-10-java-and-spring-in-depth-understanding', CURRENT_DATE, 15, 3, 1, 2),
('2024-03-02-the-trio-of-frontend-development', CURRENT_DATE, 12, 2, 1, 1),
('2024-02-24-backend-tech-the-foundation-of-software', CURRENT_DATE, 9, 2, 0, 1),
('2024-02-17-react-18-typescript-powerful-combination-frontend', CURRENT_DATE, 11, 2, 1, 1),
('2024-01-20-new_zealand_paradise_for_children', CURRENT_DATE, 20, 4, 2, 3),
('2024-01-10-will-ai-replace-human-developers', CURRENT_DATE, 18, 3, 1, 2);