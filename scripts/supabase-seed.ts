import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL as string
const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

async function upsertPosts() {
  const rows = [
    { id: '2025-11-01-ai-quiz-to-productization-practice-en', authorId: 'admin-user-id', slug: '2025-11-01-ai-quiz-to-productization-practice', title: 'AI Quiz: From Idea to Productization', content: '', language: 'en', status: 'published', publishedAt: new Date().toISOString(), coverImage: '/img/ai-quiz.png', tags: 'ai,quiz,product' },
    { id: '2025-11-01-ai-quiz-to-productization-practice-zh', authorId: 'admin-user-id', slug: '2025-11-01-ai-quiz-to-productization-practice', title: 'AI 测验：从想法到产品化实践', content: '', language: 'zh', status: 'published', publishedAt: new Date().toISOString(), coverImage: '/img/ai-quiz.png', tags: 'ai,quiz,product' }
  ]
  const { error } = await supabase.from('posts').upsert(rows, { onConflict: 'id' })
  if (error) throw error
}

async function ensurePostStats() {
  const post_id = '2025-11-01-ai-quiz-to-productization-practice'
  const title = 'AI Quiz: From Idea to Productization'
  const { data, error } = await supabase.from('post_stats').select('id').eq('post_id', post_id).limit(1).maybeSingle()
  if (error) throw error
  if (data) {
    const { error: e2 } = await supabase.from('post_stats').update({ title }).eq('post_id', post_id)
    if (e2) throw e2
  } else {
    const { error: e3 } = await supabase.from('post_stats').insert({ post_id, title, views: 0, likes: 0, ai_questions: 0, ai_summaries: 0, language: 'en', comments: 0 })
    if (e3) throw e3
  }
}

async function upsertDaily(language: 'en'|'zh') {
  const post_id = '2025-11-01-ai-quiz-to-productization-practice'
  const date = new Date().toISOString().slice(0,10)
  const payload = { post_id, date, views: 0, likes: 0, ai_questions: 0, ai_summaries: 0, language, userId: 'nzlouis', pageViews: 0, uniqueVisitors: 0, reads: 0, comments: 0 }
  const { data, error } = await supabase.from('daily_stats').select('post_id').eq('post_id', post_id).eq('date', date).eq('language', language).limit(1)
  if (error) throw error
  if (data && data.length) {
    const { error: e2 } = await supabase.from('daily_stats').update(payload).eq('post_id', post_id).eq('date', date).eq('language', language)
    if (e2) throw e2
  } else {
    const { error: e3 } = await supabase.from('daily_stats').insert(payload)
    if (e3) throw e3
  }
}

async function insertComments() {
  const rows = [
    { postId: '2025-11-01-ai-quiz-to-productization-practice-en', authorName: 'Guest', authorEmail: 'guest@example.com', content: 'Great post!', is_anonymous: false, language: 'en', status: 'approved' },
    { postId: '2025-11-01-ai-quiz-to-productization-practice-zh', authorName: '访客', authorEmail: 'guest@example.com', content: '很赞的文章！', is_anonymous: false, language: 'zh', status: 'approved' }
  ]
  const { error } = await supabase.from('comments').insert(rows)
  if (error) throw error
}

async function main() {
  await upsertPosts()
  await ensurePostStats()
  await upsertDaily('en')
  await upsertDaily('zh')
  await insertComments()
  console.log('Done')
}

main().catch(e => { console.error(e); process.exit(1) })