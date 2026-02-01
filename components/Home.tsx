"use client";

import { Box, Heading, Text, Flex } from "@radix-ui/themes";
import BlogList from "@/components/BlogList";
import Sidebar from "./Sidebar";
import { useEffect } from "react";
import { useStatsStore } from "@/lib/stores/statsStore";
import { useTogglesStore } from "@/lib/stores/togglesStore";
import { useTranslation } from "@/lib/i18n";

export default function HomePage() {
  const { totalStats, fetchTotalStats } = useStatsStore();
  const { toggles, fetchToggles } = useTogglesStore();
  const { language } = useTranslation();

  useEffect(() => {
    fetchTotalStats();
    fetchToggles();
  }, [fetchTotalStats, fetchToggles]);
  return (
    <Box className="w-full px-6 py-12">
      <div className="flex flex-col items-center mb-20">
        <Heading
          size="6"
          className="text-5xl md:text-6xl font-extrabold -mt-10 mb-3 leading-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-sm"
        >
          NZLouis&apos; Blog
        </Heading>
        <Text
          size="4"
          className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 text-center font-medium max-w-2xl mb-10 italic"
        >
          {language === "zh"
            ? "自强不息，知行合一"
            : "If you never try, you will never know."}
        </Text>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-full max-w-6xl mb-12">
          {toggles.homeStatistics && (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-center mb-2">
                  <svg
                    className="w-6 h-6 text-blue-600 mr-2"
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
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalStats.totalViews.toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Total Views</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-center mb-2">
                  <svg
                    className="w-6 h-6 text-red-600 mr-2"
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
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalStats.totalLikes.toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Total Likes</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-center mb-2">
                  <svg
                    className="w-6 h-6 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03 8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalStats.totalComments.toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Total Comments</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-center mb-2">
                  <svg
                    className="w-6 h-6 text-indigo-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03 8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalStats.totalAiSummaries.toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">AI Summaries</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-center mb-2">
                  <svg
                    className="w-6 h-6 text-purple-600 mr-2"
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
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalStats.totalAiQuestions.toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">AI Questions</p>
              </div>
            </>
          )}
        </div>
      </div>

      <Flex className="flex flex-col md:flex-row gap-12 md:justify-center mt-12">
        <Box className="md:flex-[7] w-full max-w-[900px]">
          <BlogList />
        </Box>
        <Sidebar />
      </Flex>
    </Box>
  );
}
