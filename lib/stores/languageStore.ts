import { create } from 'zustand';

interface LanguageState {
  language: 'en' | 'zh';
  setLanguage: (language: 'en' | 'zh') => void;
  syncLanguage: () => void;
}

function writeLangCookie(language: 'en' | 'zh') {
  document.cookie = `i18n_lang=${language}; path=/; max-age=${365 * 24 * 60 * 60}`;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',
  setLanguage: (language) => {
    set({ language });
    if (typeof window !== 'undefined') {
      writeLangCookie(language);
    }
  },
  syncLanguage: () => {
    if (typeof window === 'undefined') return;
    const pathname = window.location.pathname;
    const language: 'en' | 'zh' =
      pathname === '/cn' || pathname.startsWith('/cn/') ? 'zh' : 'en';
    writeLangCookie(language);
    set({ language });
  },
}));
