import { create } from "zustand";
import { useLanguageStore } from "./languageStore";

interface TotalStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalAiQuestions: number;
  totalAiSummaries: number;
  totalPosts: number;
  totalPostsEnglish: number;
  totalPostsChinese: number;
}

export interface PostStats {
  views: number;
  likes: number;
  comments: number;
  ai_questions: number;
  ai_summaries: number;
}

interface LanguageStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalAiQuestions: number;
  totalAiSummaries: number;
  posts: Array<{ slug: string; views: number; likes: number }>;
}

interface StatsState {
  totalStats: TotalStats;
  postStats: Record<string, PostStats>;
  isLoading: boolean;
  error: string | null;

  setTotalStats: (stats: TotalStats) => void;
  setPostStats: (postId: string, stats: PostStats) => void;
  updatePostViews: (postId: string, views: number) => void;
  updatePostLikes: (postId: string, likes: number) => void;
  incrementPostViews: (postId: string) => void;
  togglePostLike: (postId: string) => void;
  incrementComments: (postId: string, decrement?: boolean) => void;
  incrementAiQuestions: (postId: string, decrement?: boolean) => void;
  incrementAiSummaries: (postId: string, decrement?: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchTotalStats: () => Promise<void>;
  fetchPostStats: (postId: string) => Promise<void>;
  enStats: LanguageStats;
  zhStats: LanguageStats;
  fetchStats: (
    language: "en" | "zh",
    aggregate?: "all" | "single",
    userId?: string
  ) => Promise<void>;
}

const fetchedOrInflight = new Set<string>();

export const useStatsStore = create<StatsState>((set, get) => ({
  totalStats: {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalAiQuestions: 0,
    totalAiSummaries: 0,
    totalPosts: 0,
    totalPostsEnglish: 0,
    totalPostsChinese: 0,
  },
  postStats: {},
  isLoading: false,
  error: null,
  enStats: {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalAiQuestions: 0,
    totalAiSummaries: 0,
    posts: [] as LanguageStats["posts"],
  },
  zhStats: {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalAiQuestions: 0,
    totalAiSummaries: 0,
    posts: [] as LanguageStats["posts"],
  },

  setTotalStats: (stats) => set({ totalStats: stats }),

  setPostStats: (postId, stats) =>
    set((state) => ({
      postStats: { ...state.postStats, [postId]: stats },
    })),

  updatePostViews: (postId, views) =>
    set((state) => ({
      postStats: {
        ...state.postStats,
        [postId]: { ...state.postStats[postId], views },
      },
    })),

  updatePostLikes: (postId, likes) =>
    set((state) => ({
      postStats: {
        ...state.postStats,
        [postId]: { ...state.postStats[postId], likes },
      },
    })),

  incrementPostViews: (postId) =>
    set((state) => {
      const currentStats = state.postStats[postId] || {
        views: 0,
        likes: 0,
        comments: 0,
        aiQuestions: 0,
        aiSummaries: 0,
      };
      return {
        postStats: {
          ...state.postStats,
          [postId]: { ...currentStats, views: currentStats.views + 1 },
        },
      };
    }),

  togglePostLike: (postId) =>
    set((state) => {
      const currentStats = state.postStats[postId] || {
        views: 0,
        likes: 0,
        comments: 0,
        ai_questions: 0,
        ai_summaries: 0,
      };
      const newLikes = currentStats.likes + 1;
      return {
        postStats: {
          ...state.postStats,
          [postId]: { ...currentStats, likes: newLikes },
        },
      };
    }),

  incrementComments: (postId, decrement = false) =>
    set((state) => {
      const currentStats = state.postStats[postId] || {
        views: 0,
        likes: 0,
        comments: 0,
        ai_questions: 0,
        ai_summaries: 0,
      };
      const increment = decrement ? -1 : 1;
      return {
        postStats: {
          ...state.postStats,
          [postId]: {
            ...currentStats,
            comments: Math.max(0, currentStats.comments + increment),
          },
        },
      };
    }),

  incrementAiQuestions: (postId, decrement = false) =>
    set((state) => {
      const currentStats = state.postStats[postId] || {
        views: 0,
        likes: 0,
        comments: 0,
        ai_questions: 0,
        ai_summaries: 0,
      };
      const increment = decrement ? -1 : 1;
      return {
        postStats: {
          ...state.postStats,
          [postId]: {
            ...currentStats,
            ai_questions: Math.max(0, currentStats.ai_questions + increment),
          },
        },
      };
    }),

  incrementAiSummaries: (postId, decrement = false) =>
    set((state) => {
      const currentStats = state.postStats[postId] || {
        views: 0,
        likes: 0,
        comments: 0,
        ai_questions: 0,
        ai_summaries: 0,
      };
      const increment = decrement ? -1 : 1;
      return {
        postStats: {
          ...state.postStats,
          [postId]: {
            ...currentStats,
            ai_summaries: Math.max(0, currentStats.ai_summaries + increment),
          },
        },
      };
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  fetchTotalStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/admin/analytics");
      if (response.ok) {
        const data = await response.json();
        set({ totalStats: data.totals });
      } else {
        set({ error: "Failed to fetch total stats" });
      }
    } catch {
      set({ error: "Failed to fetch total stats" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPostStats: async (postId) => {
    if (fetchedOrInflight.has(postId)) return;
    fetchedOrInflight.add(postId);
    try {
      const { language } = useLanguageStore.getState();
      const response = await fetch(
        `/api/stats?postId=${postId}&language=${language}`
      );
      if (response.ok) {
        const stats = await response.json();
        get().setPostStats(postId, stats);
      } else {
        fetchedOrInflight.delete(postId);
      }
    } catch (error) {
      fetchedOrInflight.delete(postId);
      console.error("Failed to fetch post stats:", error);
    }
  },

  fetchStats: async (
    language: "en" | "zh",
    aggregate: "all" | "single" = "all",
    userId?: string
  ) => {
    try {
      set({ isLoading: true, error: null });
      const userParam = userId ? `&userId=${userId}` : "";
      const res = await fetch(
        `/api/stats?language=${language}&aggregate=${aggregate}${userParam}`
      );
      if (res.ok) {
        const data = await res.json();
        set((state: StatsState) => {
          const currentStats = state[`${language}Stats`];
          if (JSON.stringify(currentStats) !== JSON.stringify(data)) {
            set((state: StatsState) => ({
              ...state,
              [`${language}Stats`]: data,
            }));
          }
          return {
            ...state,
            [`${language}Stats`]: data,
          };
        });
      } else {
        set({ error: "Failed to fetch language stats" });
      }
    } catch {
      set({ error: "Failed to fetch language stats" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
