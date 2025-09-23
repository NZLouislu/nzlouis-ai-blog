import { create } from "zustand";
import { Post } from "@/lib/types";

interface ArchiveState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  language: "en" | "zh";
  fetchPosts: (language: "en" | "zh") => Promise<void>;
  setLanguage: (language: "en" | "zh") => void;
}

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  language: "en",

  fetchPosts: async (language: "en" | "zh") => {
    const { posts } = get();
    // If posts have already been loaded for the current language, return directly
    if (posts.length > 0 && get().language === language) {
      console.log("Archive: Posts already loaded for language:", language);
      return;
    }

    console.log("Archive: Starting to fetch posts for language:", language);
    set({ loading: true, error: null });

    try {
      const startTime = Date.now();
      const response = await fetch(
        `/api/posts/language?action=published&language=${language}`
      );
      const endTime = Date.now();
      console.log(`Archive: API call took ${endTime - startTime}ms`);

      if (response.ok) {
        const newPosts = await response.json();
        console.log(`Archive: Fetched ${newPosts.length} posts`);
        set({ posts: newPosts, loading: false, language });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Archive: Failed to load posts:", error);
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      });
    }
  },

  setLanguage: (language: "en" | "zh") => {
    console.log("Archive: Language changed to:", language);
    set({ language });
    // Automatically fetch posts for the new language
    get().fetchPosts(language);
  },
}));
