"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>("");
  const [tocHeight, setTocHeight] = useState<string>("max-h-96");

  useEffect(() => {
    const extractHeadings = (content: string): TocItem[] => {
      const headingRegex = /^(#{1,6})\s+(.+)$/gm;
      const headings: TocItem[] = [];
      let match;

      while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();

        headings.push({
          id,
          text,
          level,
        });
      }

      return headings;
    };

    setHeadings(extractHeadings(content));
  }, [content]);

  useEffect(() => {
    const updateTocHeight = () => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        // Non-mobile users: screen height minus 32px (16px each for top and bottom)
        const availableHeight = window.innerHeight - 32;
        setTocHeight(`max-h-[${availableHeight}px]`);
      } else {
        // Mobile users: keep original height
        setTocHeight("max-h-96");
      }
    };

    updateTocHeight();
    window.addEventListener("resize", updateTocHeight);
    return () => window.removeEventListener("resize", updateTocHeight);
  }, []);

  const scrollToHeading = (id: string) => {
    setActiveHeading(id);
    const element = document.getElementById(id);
    if (element) {
      // Calculate responsive offset for sticky navbar
      const isMobile = window.innerWidth < 768;
      const offset = isMobile ? 120 : 100; // Larger offset on mobile for navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Clear active state after animation
      setTimeout(() => setActiveHeading(""), 1000);
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Table of Contents</h3>
      <nav className={`space-y-2 overflow-y-auto ${tocHeight}`}>
        {headings.map((heading, index) => (
          <button
            key={index}
            onClick={() => scrollToHeading(heading.id)}
            className={`block text-left text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 py-1 rounded px-2 ${activeHeading === heading.id
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              } ${heading.level === 1
                ? "font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider text-xs mb-1 mt-2 first:mt-0"
                : heading.level === 2
                  ? "font-semibold ml-2"
                  : heading.level === 3
                    ? "font-medium ml-4"
                    : heading.level === 4
                      ? "ml-6"
                      : heading.level === 5
                        ? "ml-8"
                        : "ml-10"
              }`}
          >
            {heading.text}
          </button>
        ))}
      </nav>
    </div>
  );
}
