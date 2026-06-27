"use client";

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/lib/stores/languageStore';
import { getLocalizedPath } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { useArchiveStore } from '@/lib/stores/archiveStore';

export default function ArchivePage() {
  const { language } = useLanguageStore();
  const { posts, loading, error, fetchPosts } = useArchiveStore();

  useEffect(() => {
    console.log('Archive: Language changed, fetching posts for:', language);
    const startTime = performance.now();
    fetchPosts(language).then(() => {
      const endTime = performance.now();
      console.log(`Archive: Total fetch and state update took ${endTime - startTime}ms`);
    });
  }, [language, fetchPosts]);

  const { postsByYear, sortedYears } = useMemo(() => {
    const grouped = posts.reduce((acc, post) => {
      const year = new Date(post.createdAt).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(post);
      return acc;
    }, {} as Record<number, typeof posts>);

    const sorted = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a);

    return { postsByYear: grouped, sortedYears: sorted };
  }, [posts]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="w-full px-6 py-12 mx-auto max-w-[1200px] pt-20">
          <div className="flex flex-col md:flex-row gap-12 md:justify-center">
            <div className="md:flex-[7] w-full max-w-[900px]">
              <div className="mb-12">
                <h1 className="text-4xl font-bold mb-4 dark:text-gray-100">
                  {language === 'en' ? 'Archive' : '归档'}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  {language === 'en' ? 'Loading posts...' : '正在加载文章...'}
                </p>
              </div>
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            </div>
            <Sidebar />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="w-full px-6 py-12 mx-auto max-w-[1200px] pt-20">
          <div className="flex flex-col md:flex-row gap-12 md:justify-center">
            <div className="md:flex-[7] w-full max-w-[900px]">
              <div className="mb-12">
                <h1 className="text-4xl font-bold mb-4">
                  {language === 'en' ? 'Archive' : '归档'}
                </h1>
                <p className="text-xl text-red-600">
                  {language === 'en' ? `Error loading posts: ${error}` : `加载文章出错: ${error}`}
                </p>
              </div>
            </div>
            <Sidebar />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="w-full px-6 py-12 mx-auto max-w-[1200px] pt-20">
        <div className="flex flex-col md:flex-row gap-12 md:justify-center">
          <div className="md:flex-[7] w-full max-w-[900px]">
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-4 dark:text-gray-100">
                {language === 'en' ? 'Archive' : '归档'}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {language === 'en' ? `All posts organized by year and date. (${posts.length} posts)` : `按年份和日期组织的所有文章。(${posts.length}篇文章)`}
              </p>
            </div>

            <div className="space-y-12">
              {sortedYears.map((year) => (
                <div key={year} className="space-y-4">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2">
                    {year}
                  </h2>
                  <div className="space-y-3">
                    {postsByYear[year]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((post) => {
                        const date = new Date(post.createdAt);
                        const dateStr = language === 'zh'
                          ? `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
                          : `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

                        return (
                          <div key={post.id} className="flex items-start gap-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-3 -mx-3 transition-colors">
                            <span className="text-gray-500 dark:text-gray-500 font-mono text-sm min-w-[60px]">
                              {dateStr} —
                            </span>
                            <Link
                              href={getLocalizedPath(`/blog/${post.slug}`, language)}
                              className="text-gray-900 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1"
                            >
                              <span className="text-lg font-semibold">{post.title}</span>
                            </Link>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Sidebar />
        </div>
      </div>
      <Footer />
    </>
  );
}