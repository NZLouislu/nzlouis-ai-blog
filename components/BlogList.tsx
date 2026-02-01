"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, Box, Text, Avatar } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { Post } from "@/lib/types";
import { useStatsStore } from "@/lib/stores/statsStore";
import { useTogglesStore } from "@/lib/stores/togglesStore";
import { useLanguageStore } from "@/lib/stores/languageStore";
import { getLocalizedPath } from "@/lib/utils";

interface BlogListProps {
  posts?: Post[];
}

export default function BlogList({ posts: initialPosts }: BlogListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const { postStats, fetchPostStats } = useStatsStore();
  const { toggles, fetchToggles } = useTogglesStore();
  const { language } = useLanguageStore();

  useEffect(() => {
    if (!initialPosts) {
      const loadPosts = async () => {
        try {
          const postsResponse = await fetch(
            `/api/posts/published?language=${language}`
          );
          if (postsResponse.ok) {
            const postsData = await postsResponse.json();
            setPosts(postsData);
          }
        } catch (error) {
          console.error("Failed to load posts:", error);
        }
      };

      loadPosts();
    }
    fetchToggles();
  }, [fetchToggles, initialPosts, language]);

  useEffect(() => {
    const postsToFetch = posts.filter((post) => !postStats[post.id]);
    if (postsToFetch.length > 0) {
      postsToFetch.forEach((post) => {
        fetchPostStats(post.id);
      });
    }
  }, [posts, postStats, fetchPostStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={getLocalizedPath(`/blog/${post.slug}`, language)}
          className="block"
        >
          <Card className="rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 cursor-pointer h-full">
            <Box className="relative w-full aspect-[16/9]">
              <Image
                src={post.image || "/images/posts/truck.jpg"}
                alt={post.title}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </Box>

            <Box className="p-4 space-y-3 flex-1 flex flex-col">
              <h3 className="text-xl font-bold line-clamp-2 dark:text-gray-100">{post.title}</h3>
              <Text size="3" color="gray" className="dark:text-gray-400">
                {new Date(post.createdAt).toLocaleDateString(
                  language === "zh" ? "zh-CN" : "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
                <span className="text-gray-500 dark:text-gray-500"> • 5 min read</span>
              </Text>
              <Text size="3" color="gray" className="line-clamp-3 flex-1 dark:text-gray-300">
                {post.excerpt}
              </Text>

              <div className="pt-4 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 whitespace-nowrap">
                  <Avatar
                    src="/images/authors/l.ico"
                    fallback={(post.author || "L")[0]}
                    radius="full"
                    className="w-5 h-5 shrink-0"
                  />
                  <span className="text-sm dark:text-gray-300">{post.author || "Louis Lu"}</span>
                </div>
                {postStats[post.id] && (
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {toggles.totalViews && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>{postStats[post.id].views.toLocaleString()}</span>
                      </div>
                    )}
                    {toggles.totalLikes && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span>{postStats[post.id].likes}</span>
                      </div>
                    )}
                    {toggles.totalComments && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span>{postStats[post.id].comments}</span>
                      </div>
                    )}
                    {toggles.aiQuestions && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        <span>{postStats[post.id].ai_questions}</span>
                      </div>
                    )}
                    {toggles.aiSummaries && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>{postStats[post.id].ai_summaries || 0}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Box>
          </Card>
        </Link>
      ))}
    </div>
  );
}
