"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCheck from "./auth-check";
import AdminNavbar from "../../../components/AdminNavbar";
import InitializeChineseData from "../../../components/InitializeChineseData";
import { useStatsStore } from "../../../lib/stores/statsStore";
import { useAuthStore } from "../../../lib/store/auth";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchStats, enStats, zhStats, totalStats, fetchTotalStats } =
    useStatsStore();
  const { selectUser, selectedUserId } = useAuthStore();

  useEffect(() => {
    const uid = searchParams.get('uid');
    if (uid && uid !== selectedUserId) {
      selectUser(uid);
    }
  }, [searchParams, selectUser, selectedUserId]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const enPromise = fetchStats("en", "all", selectedUserId || undefined);
        const zhPromise = fetchStats("zh", "all", selectedUserId || undefined);
        const totalPromise = fetchTotalStats();
        await Promise.all([enPromise, zhPromise, totalPromise]);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [fetchStats, fetchTotalStats, selectedUserId]);

  const getStats = (language: "en" | "zh") => {
    return language === "en" ? enStats : zhStats;
  };

  if (loading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-gray-50">
          <AdminNavbar />
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 w-full bg-gray-200 animate-pulse rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white shadow-sm sm:shadow rounded-lg">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">
                  Overall Statistics
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">
                  Total blog statistics across all languages
                </p>
              </div>
              <div className="px-4 sm:px-6 py-4 sm:py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4">
                  <div className="bg-indigo-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-sm sm:text-lg font-medium text-indigo-900 mb-1 sm:mb-2">
                      Total Posts
                    </h3>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600">
                      {(totalStats.totalPostsEnglish + totalStats.totalPostsChinese).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-sm sm:text-lg font-medium text-blue-900 mb-1 sm:mb-2">
                      Posts English
                    </h3>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                      {totalStats.totalPostsEnglish.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-sm sm:text-lg font-medium text-red-900 mb-1 sm:mb-2">
                      Posts Chinese
                    </h3>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">
                      {totalStats.totalPostsChinese.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                  <div className="bg-green-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-sm sm:text-lg font-medium text-green-900 mb-1 sm:mb-2">
                      Total Views
                    </h3>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">
                      {totalStats.totalViews.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-sm sm:text-lg font-medium text-blue-900 mb-1 sm:mb-2">
                      Total Likes
                    </h3>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                      {totalStats.totalLikes.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-sm sm:text-lg font-medium text-purple-900 mb-1 sm:mb-2">
                      Total Comments
                    </h3>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">
                      {totalStats.totalComments.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-sm sm:text-lg font-medium text-orange-900 mb-1 sm:mb-2">
                      AI Summaries
                    </h3>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">
                      {totalStats.totalAiSummaries.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-sm sm:text-lg font-medium text-teal-900 mb-1 sm:mb-2">
                      AI Questions
                    </h3>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-600">
                      {totalStats.totalAiQuestions.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-sm sm:shadow rounded-lg">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">
                  Language Statistics
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">
                  Blog statistics by language
                </p>
              </div>
              <div className="px-4 sm:px-6 py-4 sm:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-sm sm:text-lg font-medium text-blue-900 mb-2">
                      English Blogs
                    </h3>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-blue-700">
                          Number of Posts
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {getStats("en").posts?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-blue-700">
                          Total Views
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {getStats("en").totalViews?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-blue-700">
                          Total Likes
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {getStats("en").totalLikes?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-blue-700">
                          Total Comments
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {getStats("en").totalComments?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-blue-700">
                          AI Questions
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {getStats("en").totalAiQuestions?.toLocaleString() ||
                            0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-blue-700">
                          AI Summaries
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {getStats("en").totalAiSummaries?.toLocaleString() ||
                            0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-sm sm:text-lg font-medium text-red-900 mb-2">
                      Chinese Blogs
                    </h3>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-red-700">
                          Number of Posts
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {getStats("zh").posts?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-red-700">
                          Total Views
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {getStats("zh").totalViews?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-red-700">
                          Total Likes
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {getStats("zh").totalLikes?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-red-700">
                          Total Comments
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {getStats("zh").totalComments?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-red-700">
                          AI Questions
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {getStats("zh").totalAiQuestions?.toLocaleString() ||
                            0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-red-700">
                          AI Summaries
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {getStats("zh").totalAiSummaries?.toLocaleString() ||
                            0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <InitializeChineseData />

            <div className="bg-white shadow-sm sm:shadow rounded-lg">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">
                  Quick Links
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">
                  Navigate to management sections
                </p>
              </div>
              <div className="px-4 sm:px-6 py-4 sm:py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <button
                    onClick={() => router.push("/admin/manage/analytics")}
                    className="bg-indigo-50 rounded-lg p-4 text-center hover:bg-indigo-100 transition-colors"
                  >
                    <h3 className="text-sm sm:text-base font-medium text-indigo-900">
                      Analytics
                    </h3>
                    <p className="text-xs sm:text-sm text-indigo-700">
                      View detailed statistics
                    </p>
                  </button>
                  <button
                    onClick={() => router.push("/admin/manage/comments")}
                    className="bg-green-50 rounded-lg p-4 text-center hover:bg-green-100 transition-colors"
                  >
                    <h3 className="text-sm sm:text-base font-medium text-green-900">
                      Comments
                    </h3>
                    <p className="text-xs sm:text-sm text-green-700">
                      Manage comments
                    </p>
                  </button>
                  <button
                    onClick={() => router.push("/admin/manage/toggles")}
                    className="bg-purple-50 rounded-lg p-4 text-center hover:bg-purple-100 transition-colors"
                  >
                    <h3 className="text-sm sm:text-base font-medium text-purple-900">
                      Feature Toggles
                    </h3>
                    <p className="text-xs sm:text-sm text-purple-700">
                      Control features
                    </p>
                  </button>
                  <button
                    onClick={() => router.push("/admin/manage/supabase")}
                    className="bg-yellow-50 rounded-lg p-4 text-center hover:bg-yellow-100 transition-colors"
                  >
                    <h3 className="text-sm sm:text-base font-medium text-yellow-900">
                      Database
                    </h3>
                    <p className="text-xs sm:text-sm text-yellow-700">
                      View database data
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
