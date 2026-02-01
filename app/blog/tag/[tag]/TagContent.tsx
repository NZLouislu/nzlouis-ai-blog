"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { Post } from '@/lib/types';
import { useLanguageStore } from '@/lib/stores/languageStore';
import { useStatsStore } from '@/lib/stores/statsStore';
import { useTogglesStore } from '@/lib/stores/togglesStore';
import BlogList from '@/components/BlogList';

interface TagContentProps {
  tag: string;
  posts: Post[];
}

export default function TagContent({ tag, posts: initialPosts }: TagContentProps) {
  const { language } = useLanguageStore();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const { postStats, fetchPostStats } = useStatsStore();
  const { fetchToggles } = useTogglesStore();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch(`/api/posts/language?action=byTag&tag=${encodeURIComponent(tag)}&language=${language}`);
        if (response.ok) {
          const newPosts = await response.json();
          setPosts(newPosts);
        }
      } catch (error) {
        console.error('Failed to load posts:', error);
      }
    };

    loadPosts();
  }, [language, tag]);

  useEffect(() => {
    fetchToggles();
    posts.forEach((post) => {
      if (!postStats[post.id]) {
        fetchPostStats(post.id);
      }
    });
  }, [posts, postStats, fetchPostStats, fetchToggles]);

  return (
    <>
      <Navbar />
      <div className="w-full px-6 py-12 mx-auto max-w-[1200px] pt-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 capitalize dark:text-gray-100">{tag} Posts</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Discover all articles tagged with {tag}.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 md:justify-center">
          <div className="md:flex-[7] w-full max-w-[900px]">
            <BlogList posts={posts} />
          </div>
          <Sidebar />
        </div>
      </div>
      <Footer />
    </>
  );
}