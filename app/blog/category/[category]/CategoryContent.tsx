"use client";

import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { Post } from '@/lib/types';
import { useStatsStore } from '@/lib/stores/statsStore';
import { useTogglesStore } from '@/lib/stores/togglesStore';
import BlogList from '@/components/BlogList';

export interface CategoryContentProps {
  category: string;
  posts: Post[];
  language: 'en' | 'zh';
}

export default function CategoryContent({ category, posts, language }: CategoryContentProps) {
  const { postStats, fetchPostStats } = useStatsStore();
  const { fetchToggles } = useTogglesStore();

  useEffect(() => {
    fetchToggles();
    posts.forEach((post) => {
      if (!postStats[post.id]) {
        fetchPostStats(post.id);
      }
    });
  }, [posts, postStats, fetchPostStats, fetchToggles]);

  const titleText = language === 'zh' ? `${category} 类别文章` : `${category} Category Posts`;
  const descriptionText = language === 'zh' ? `发现 ${category} 类别的所有文章。` : `Discover all articles in the ${category} category.`;

  return (
    <>
      <Navbar />
      <div className="w-full px-6 py-12 mx-auto max-w-[1200px] pt-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 capitalize dark:text-gray-100">{titleText}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {descriptionText}
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