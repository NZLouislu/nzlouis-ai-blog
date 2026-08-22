"use client";

import { useState, useEffect } from "react";
import AboutMe from "./AboutMe";
import { useTranslation } from "@/lib/i18n";

export default function Sidebar() {
  const { t, language } = useTranslation();
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const data = await response.json();
          setAllTags(data);
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };

    fetchTags();
  }, []);

  return (
    <div className="md:flex-[3] w-full md:sticky md:top-24 md:self-start space-y-8">
      <div className="hidden md:block">
        <AboutMe />
      </div>

      {allTags.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">{t('featuredTags')}</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 20).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-800 dark:text-blue-300 text-sm rounded-full hover:from-blue-200 hover:to-purple-200 dark:hover:from-blue-900/60 dark:hover:to-purple-900/60 transition-all duration-200 cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}