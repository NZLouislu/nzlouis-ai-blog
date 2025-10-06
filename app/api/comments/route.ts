import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const language = searchParams.get('language');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    let comments: any[] = [];
    let error: any = null;

    const camelRes = await supabase
      .from('comments')
      .select('*')
      .eq('postId', postId)
      .eq('language', language || 'en');

    comments = camelRes.data || [];
    error = camelRes.error;

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    const normalized = (comments || []).map((c: any) => ({
      id: c.id,
      postId: c.postId,
      authorName: c.authorName ?? c.authorname ?? null,
      authorEmail: c.authorEmail ?? c.authoremail ?? null,
      content: c.content,
      is_anonymous: c.is_anonymous,
      createdAt: c.createdAt
    }));
    normalized.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Comments API error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting comment submission...');
    const { postId, language, name, email, comment, isAnonymous } = await request.json();

    if (!postId || !comment) {
      return NextResponse.json({ error: 'Post ID and comment are required' }, { status: 400 });
    }

    console.log('Attempting to save to Supabase...');
    const startTime = Date.now();

    let newComment: any = null;
    let insertError: any = null;

    // Check if post exists before inserting comment
    const { data: postExists, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single();
    
    if (postError && postError.code === 'PGRST116') {
      // Post doesn't exist, create it
      const { error: createPostError } = await supabase
        .from('posts')
        .upsert({
          id: postId,
          authorId: 'admin-user-id', // Use admin user as default author
          slug: postId,
          title: 'Blog Post',
          content: '',
          language: language || 'en',
          status: 'published',
          tags: 'General', // Set default tags to avoid null value error
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { onConflict: 'id' });
    
      if (createPostError) {
        console.error('Failed to create post:', createPostError);
        return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 });
      }
    }
    
    // Now insert the comment
    const tryInsertCamel = await supabase
      .from('comments')
      .insert({
        postId: postId,
        language: language || 'en',
        authorName: isAnonymous ? null : name,
        authorEmail: isAnonymous ? null : email,
        content: comment,
        is_anonymous: isAnonymous
      })
      .select()
      .single();

    if (tryInsertCamel.error) {
      const code = tryInsertCamel.error.code;
      if (code === '23503') {
        const { error: upsertByIdErr } = await supabase
          .from('posts')
          .upsert({ id: postId, postId, title: postId, language: language || 'en' }, { onConflict: 'id' });

        if (upsertByIdErr) {
          await supabase
            .from('posts')
            .upsert({ postId, title: postId, language: language || 'en' }, { onConflict: 'postId' });
        }

        const retryCamel = await supabase
          .from('comments')
          .insert({
            postId: postId,
            language: language || 'en',
            authorName: isAnonymous ? null : name,
            authorEmail: isAnonymous ? null : email,
            content: comment,
            is_anonymous: isAnonymous
          })
          .select()
          .single();
        newComment = retryCamel.data;
        insertError = retryCamel.error;
      } else if (code === '42703' || code === 'PGRST204') {
        insertError = tryInsertCamel.error;
      } else {
        insertError = tryInsertCamel.error;
      }
    } else {
      newComment = tryInsertCamel.data;
    }

    if (insertError) {
      console.error('Supabase error:', insertError);
      return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 });
    }

    const { data: existingStats } = await supabase
      .from('post_stats')
      .select('id, comments')
      .eq('post_id', postId)
      .eq('language', language || 'en')
      .single();

    if (existingStats) {
      await supabase
        .from('post_stats')
        .update({ comments: (existingStats.comments || 0) + 1 })
        .eq('post_id', postId)
        .eq('language', language || 'en');
    } else {
      await supabase.from('post_stats').insert({
        post_id: postId,
        title: 'Blog Post',
        views: 0,
        likes: 0,
        comments: 1,
        ai_questions: 0,
        ai_summaries: 0,
        language: language || 'en',
      });
    }

    console.log(`Updated comment count for post ${postId} (${language})`);

    const endTime = Date.now();
    console.log(`Database operation completed in ${endTime - startTime}ms`);

    return NextResponse.json({
      id: newComment.id,
      postId: newComment.postId,
      authorName: newComment.authorName ?? newComment.authorname ?? null,
      authorEmail: newComment.authorEmail ?? newComment.authoremail ?? null,
      content: newComment.content,
      is_anonymous: newComment.is_anonymous,
      createdAt: newComment.createdAt
    });
  } catch (error) {
    console.error('Comments API error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 });
  }
}