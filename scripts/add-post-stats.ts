import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL as string
const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string
if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(url, key)

const posts = [
    {
        id: '2026-01-16-ai-dev-future-from-road-to-civilization-en',
        slug: '2026-01-16-ai-dev-future-from-road-to-civilization',
        title: 'Transitioning as a Developer in the AI Era: From Road Building to Building Civilizations',
        language: 'en',
        authorId: 'admin-user-id',
        tags: 'AI, Developers, Future Trends, 3D Development, Robotics'
    },
    {
        id: '2026-01-16-ai-dev-future-from-road-to-civilization-zh',
        slug: '2026-01-16-ai-dev-future-from-road-to-civilization',
        title: 'AI 时代开发者的命运与出路：从修路到建设文明',
        language: 'zh',
        authorId: 'admin-user-id',
        tags: 'AI, 开发者, 未来趋势, 三维开发, 机器人'
    }
]

async function main() {
    // 0. Ensure User exists
    const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('id', 'admin-user-id')
        .maybeSingle()

    if (!userData) {
        console.log('Inserting default admin user...')
        await supabase.from('users').insert({
            id: 'admin-user-id',
            email: 'nzlouis@example.com',
            name: 'Louis Lu',
            role: 'admin'
        })
    }

    for (const post of posts) {
        console.log(`Processing ${post.slug} (${post.language})...`)

        // 1. Ensure post exists in 'posts' table
        const { data: existingPost } = await supabase
            .from('posts')
            .select('id')
            .eq('id', post.id)
            .maybeSingle()

        if (!existingPost) {
            const { error: postInsertError } = await supabase
                .from('posts')
                .insert({
                    id: post.id,
                    slug: post.slug,
                    title: post.title,
                    content: 'Full content in MD file...',
                    language: post.language,
                    status: 'published',
                    publishedAt: '2026-01-16T00:00:00Z',
                    authorId: post.authorId,
                    tags: post.tags,
                    coverImage: '/img/ai-dev-future.png'
                })
            if (postInsertError) console.error('Error inserting post:', postInsertError)
            else console.log('Inserted post entry into Supabase posts table')
        } else {
            console.log('Post entry already exists in Supabase posts table')
        }

        // 2. Ensure post_stats exists
        const { data: existingStat } = await supabase
            .from('post_stats')
            .select('*')
            .eq('post_id', post.slug)
            .eq('language', post.language)
            .maybeSingle()

        if (!existingStat) {
            await supabase.from('post_stats').insert({
                post_id: post.slug,
                title: post.title,
                views: 1,
                likes: 0,
                ai_questions: 0,
                ai_summaries: 0,
                language: post.language,
                comments: 0
            })
            console.log('Inserted post_stats')
        }

        // 3. Ensure daily_stats exists for today
        const today = new Date().toISOString().split('T')[0]
        const { data: existingDaily } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('post_id', post.slug)
            .eq('date', today)
            .eq('language', post.language)
            .maybeSingle()

        if (!existingDaily) {
            await supabase.from('daily_stats').insert({
                post_id: post.slug,
                date: today,
                userId: 'nzlouis',
                language: post.language,
                views: 1,
                likes: 0,
                ai_questions: 0,
                ai_summaries: 0,
                pageViews: 1,
                uniqueVisitors: 1,
                reads: 0,
                comments: 0
            })
            console.log('Inserted daily_stats')
        }
    }
}

main().catch(console.error)
