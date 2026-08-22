"use client";

import * as Avatar from "@radix-ui/react-avatar";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useStatsStore } from "@/lib/stores/statsStore";
import { useTogglesStore } from "@/lib/stores/togglesStore";
import { useLanguageStore } from "@/lib/stores/languageStore";
import { getLocalizedPath } from "@/lib/utils";

interface BlogCardProps {
  title: string;
  date: string;
  summary: string;
  slug: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
  postId: string;
}

export default function BlogCard({
  title,
  date,
  summary,
  slug,
  image,
  author,
  postId,
}: BlogCardProps) {
  const { postStats, fetchPostStats } = useStatsStore();
  const { toggles, fetchToggles } = useTogglesStore();
  const { language } = useLanguageStore();

  useEffect(() => {
    fetchToggles();
    if (!useStatsStore.getState().postStats[postId]) {
      fetchPostStats(postId);
    }
  }, [fetchToggles, fetchPostStats, postId]);

  const stats = postStats[postId];

  return (
    <div className="flex gap-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-4 shadow-sm hover:shadow-md transition backdrop-blur-sm">
      <div className="relative h-28 aspect-[16/9] flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 768px) 144px, 100vw"
          className="object-cover rounded-md"
          priority
        />
      </div>

      <div className="flex flex-col justify-between flex-1">
        <div>
          <Link href={getLocalizedPath(`/blog/${slug}`, language)} passHref>
            <a className="block">
              <h3 className="text-xl font-bold hover:underline dark:text-gray-100">{title}</h3>
            </a>
          </Link>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{summary}</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar.Root className="inline-flex h-5 w-5 select-none items-center justify-center overflow-hidden rounded-full border shrink-0">
              <Avatar.Image
                className="h-full w-full object-cover"
                src={author.avatar}
                alt={author.name}
              />
              <Avatar.Fallback className="text-xs bg-gray-200 text-gray-600">
                {author.name[0]}
              </Avatar.Fallback>
            </Avatar.Root>
            <span className="text-sm text-gray-700 dark:text-gray-300">{author.name}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">· {date}</span>
          </div>
          {stats && (
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {toggles.totalViews && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{stats.views.toLocaleString()}</span>
                </div>
              )}
              {toggles.totalLikes && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{stats.likes}</span>
                </div>
              )}
              {toggles.totalComments && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03 8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{stats.comments}</span>
                </div>
              )}
              {toggles.aiQuestions && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>{stats.ai_questions}</span>
                </div>
              )}
              {toggles.aiSummaries && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{stats.ai_summaries || 0}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
