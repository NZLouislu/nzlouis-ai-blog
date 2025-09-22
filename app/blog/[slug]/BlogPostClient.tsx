"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Box, Avatar } from "@radix-ui/themes";
import Markdown from "@/lib/markdown";
import TableOfContents from "@/components/TableOfContents";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Post } from "@/lib/types";
import { useStatsStore } from "@/lib/stores/statsStore";
import { useTogglesStore } from "@/lib/stores/togglesStore";
import { useLanguageStore } from "@/lib/stores/languageStore";
import { useTranslation } from "@/lib/i18n";

interface Comment {
  id: string;
  postId: string;
  authorName?: string;
  authorEmail?: string;
  content: string;
  is_anonymous: boolean;
  createdAt: string;
}

// Comments Section Component
function CommentsSection({ postId }: { postId: string }) {
  const { language } = useLanguageStore();
  const { t } = useTranslation();
  const { incrementComments } = useStatsStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: "",
    isAnonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments on component mount
  React.useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await fetch(
          `/api/comments?postId=${postId}&language=${language}`
        );
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (error) {
        console.error("Failed to load comments:", error);
      }
    };

    loadComments();
  }, [postId, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Optimistic update
    incrementComments(postId);

    // Create optimistic comment
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      postId: postId,
      authorName: formData.name,
      authorEmail: formData.email,
      content: formData.comment,
      is_anonymous: formData.isAnonymous,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [optimisticComment, ...prev]);
    setShowForm(false);
    const currentFormData = { ...formData };
    setFormData({ name: "", email: "", comment: "", isAnonymous: false });

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          language,
          ...currentFormData,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        // Replace optimistic comment with real comment
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === optimisticComment.id ? newComment : comment
          )
        );

        // Track comment in database
        await fetch("/api/stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId: postId,
            action: "comment",
            language: language,
          }),
        });
      } else {
        // Revert optimistic update on failure
        incrementComments(postId, true);
        setComments((prev) =>
          prev.filter((comment) => comment.id !== optimisticComment.id)
        );
        setShowForm(true);
        setFormData(currentFormData);
        const errorData = await response.json();
        alert(
          `${t("failedToSubmit")}: ${errorData.error || t("unknownError")}`
        );
      }
    } catch (error) {
      // Revert optimistic update on failure
      incrementComments(postId, true);
      setComments((prev) =>
        prev.filter((comment) => comment.id !== optimisticComment.id)
      );
      setShowForm(true);
      setFormData(currentFormData);
      console.error("Comment submission error:", error);
      alert(t("networkError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          {t("comments")} ({comments.length})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? t("cancel") : t("leaveComment")}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-gray-50 rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("name")}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={!formData.isAnonymous}
                disabled={formData.isAnonymous}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("email")}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={!formData.isAnonymous}
                disabled={formData.isAnonymous}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) =>
                  setFormData({ ...formData, isAnonymous: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-600">
                {t("commentAnonymously")}
              </span>
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("comment")}
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t("submitting") : t("submitComment")}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t("noComments")}</p>
        ) : (
          comments.map((comment, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-2">
                <Avatar
                  src=""
                  fallback={
                    comment.is_anonymous ? "A" : (comment.authorName || "U")[0]
                  }
                  radius="full"
                  className="w-8 h-8"
                />
                <div>
                  <span className="font-medium text-gray-900">
                    {comment.is_anonymous ? t("anonymous") : comment.authorName}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(comment.createdAt).toLocaleDateString(
                      language === "zh" ? "zh-CN" : "en-US"
                    )}
                  </span>
                </div>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// AI Chatbot Component

function AIChatbot({
  postContent,
  postId,
}: {
  postContent: string;
  postId: string;
}) {
  const { language } = useLanguageStore();
  const { t } = useTranslation();
  const { incrementAiQuestions } = useStatsStore();
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, content: input };
    const currentInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Optimistic update
    incrementAiQuestions(postId);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentInput,
          context: postContent,
          postId: postId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);

        // Track AI question in database
        await fetch("/api/stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId: postId,
            action: "ai_question",
            language: language,
          }),
        });
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: t("sorryError") },
        ]);
        // Revert optimistic update on failure
        incrementAiQuestions(postId, true);
      }
    } catch (error) {
      console.error("AI assistant error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("sorryError") },
      ]);
      // Revert optimistic update on failure
      incrementAiQuestions(postId, true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        {t("askAiAboutArticle")}
      </h3>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="h-64 overflow-y-auto mb-4 p-2 border border-gray-100 rounded">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">{t("askMeAnything")}</p>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span>{t("thinking")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("askQuestionPlaceholder")}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("ask")}
          </button>
        </form>
      </div>
    </div>
  );
}

interface BlogPostClientProps {
  post: Post;
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const { language } = useLanguageStore();
  const { t } = useTranslation();
  const [summary, setSummary] = useState(post?.description || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  const {
    postStats,
    incrementPostViews,
    togglePostLike,
    fetchPostStats,
    incrementAiSummaries,
  } = useStatsStore();
  const { toggles, fetchToggles } = useTogglesStore();

  const stats = postStats[post.id] || {
    views: 0,
    likes: 0,
    comments: 0,
    ai_questions: 0,
    ai_summaries: 0,
  };
  const originalSummary = post?.description || "";

  useEffect(() => {
    fetchToggles();
    if (!postStats[post.id]) {
      fetchPostStats(post.id);
    }
  }, [fetchToggles, fetchPostStats, post.id, postStats]);

  // Load stats and increment view count on component mount
  React.useEffect(() => {
    const loadStatsAndIncrementView = async () => {
      incrementPostViews(post.id);

      try {
        // First increment the view count
        await fetch("/api/stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId: post.id,
            action: "view",
            language: language,
          }),
        });

        // Then load the updated stats
        fetchPostStats(post.id);
      } catch (error) {
        console.error("Failed to load stats:", error);
        fetchPostStats(post.id);
      }
    };

    loadStatsAndIncrementView();
  }, [post.id, incrementPostViews, fetchPostStats, language]);

  const handleLike = async () => {
    const newIsLiked = !isLiked;

    setIsLiked(newIsLiked);
    togglePostLike(post.id);

    try {
      const response = await fetch("/api/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: post.id,
          action: "like",
          language: language,
        }),
      });

      if (!response.ok) {
        setIsLiked(!newIsLiked);
        togglePostLike(post.id);
      }
    } catch (error) {
      console.error("Error updating like:", error);
      setIsLiked(!newIsLiked);
      togglePostLike(post.id);
    }
  };

  const generateAISummary = async (content: string) => {
    setIsLoading(true);
    setError("");

    // Optimistic update
    incrementAiSummaries(post.id);

    try {
      const response = await fetch("/api/ai-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, postId: post.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);

        // Track AI summary in database
        await fetch("/api/stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId: post.id,
            action: "ai_summary",
            language: language,
          }),
        });
      } else {
        setSummary(originalSummary);
        setError(t("generationFailed"));
        // Revert optimistic update on failure
        incrementAiSummaries(post.id, true);
      }
    } catch (error) {
      console.error("Error generating AI summary:", error);
      setSummary(originalSummary);
      setError(t("generationFailed"));
      // Revert optimistic update on failure
      incrementAiSummaries(post.id, true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!post) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <Box className="w-full px-6 py-12 mx-auto max-w-[1200px] pt-20">
        {/* Hero Image */}
        <div className="relative w-full aspect-[16/9] mb-12 rounded-3xl overflow-hidden">
          <Image
            src={post.image || "/images/posts/truck.jpg"}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Main Content */}
          <div className="flex-1 max-w-full lg:max-w-[900px]">
            <div className="mb-6 lg:mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 lg:mb-4">
                {post.title}
              </h1>
              {post.subtitle && (
                <h2 className="text-lg lg:text-xl text-gray-600 mb-4 italic">
                  {post.subtitle}
                </h2>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-gray-600 mb-4 lg:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src="/images/authors/l.ico"
                      fallback={(post.author || "L")[0]}
                      radius="full"
                      className="w-8 h-8"
                    />
                    <span className="font-medium">
                      {post.author || "Louis Lu"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>
                      {new Date(post.createdAt).toLocaleDateString(
                        language === "zh" ? "zh-CN" : "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                    <span>•</span>
                    <span>5 min read</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {toggles.totalViews && (
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>{stats.views.toLocaleString()}</span>
                    </div>
                  )}
                  {toggles.totalLikes && (
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-1 transition-colors ${
                        isLiked ? "text-red-500" : "hover:text-red-500"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={isLiked ? "currentColor" : "none"}
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
                      <span>{stats.likes}</span>
                    </button>
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
                      <span>{stats.comments}</span>
                    </div>
                  )}
                  {toggles.aiQuestions && (
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
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      <span>{stats.ai_questions}</span>
                    </div>
                  )}
                  {toggles.aiSummaries && (
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>{stats.ai_summaries}</span>
                    </div>
                  )}
                </div>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 lg:mb-6">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {toggles.aiSummaries && (
              <div className="mb-6 lg:mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => generateAISummary(post.content)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-lg border border-blue-700 shadow-lg text-sm font-semibold text-white hover:text-blue-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <svg
                      className={`w-5 h-5 ${
                        isLoading ? "text-blue-200 animate-pulse" : "text-white"
                      }`}
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
                    <span>{isLoading ? t("generating") : t("aiSummary")}</span>
                  </button>
                </div>
                {error && (
                  <div className="mb-2 text-sm text-red-700 bg-red-50 px-4 py-2 rounded-lg border border-red-300 shadow-sm">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}
                <div
                  id="summary-content"
                  className="p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500 min-h-[80px] flex items-center shadow-sm"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3 w-full">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-blue-700 font-medium">
                        {t("generatingSummary")}
                      </span>
                    </div>
                  ) : (
                    <p className="text-base lg:text-lg text-gray-700 leading-relaxed w-full">
                      {summary}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="prose prose-base lg:prose-lg max-w-none">
              <Markdown content={post.content} />
            </div>
          </div>

          {/* Table of Contents - Hidden on mobile, shown on lg screens */}
          <div className="hidden lg:block w-full lg:w-[300px] lg:sticky lg:top-24 lg:self-start">
            <TableOfContents content={post.content} />
          </div>
        </div>

        {/* Like Section */}
        {toggles.totalLikes && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                  isLiked
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill={isLiked ? "currentColor" : "none"}
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
                <span className="text-lg font-medium">{stats.likes}</span>
              </button>
            </div>
          </div>
        )}

        {/* Comments Section */}
        {toggles.totalComments && <CommentsSection postId={post.id} />}

        {/* AI Chatbot */}
        {toggles.aiQuestions && (
          <AIChatbot postContent={post.content} postId={post.id} />
        )}
      </Box>
      <Footer />
    </>
  );
}
