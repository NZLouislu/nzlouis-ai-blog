-- Backup existing tables just in case
CREATE TABLE IF NOT EXISTS post_stats_backup AS SELECT * FROM post_stats;
CREATE TABLE IF NOT EXISTS daily_stats_backup AS SELECT * FROM daily_stats;

-- Add language column to post_stats table, default 'en' without affecting existing data
ALTER TABLE post_stats ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';

-- Add language column to daily_stats table, default 'en'
ALTER TABLE daily_stats ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';

-- Update existing post_stats records language to 'en' (assuming existing are English)
UPDATE post_stats SET language = 'en' WHERE language IS NULL OR language = '';

-- Update existing daily_stats records language to 'en'
UPDATE daily_stats SET language = 'en' WHERE language IS NULL OR language = '';

-- Verify changes (optional)
SELECT COUNT(*) FROM post_stats WHERE language = 'en';
SELECT COUNT(*) FROM daily_stats WHERE language = 'en';