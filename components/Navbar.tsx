"use client";

import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguageStore } from "@/lib/stores/languageStore";
import { getLocalizedPath } from "@/lib/utils";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguageStore();
  const router = useRouter();
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/^\/cn/, "");

  const linkCls = (isActive: boolean) =>
    `relative pb-1 text-sm md:text-base font-medium transition-colors hover:text-indigo-600 ${isActive
      ? "text-indigo-600 font-bold after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-indigo-600 after:animate-underline"
      : "text-gray-700 dark:text-gray-300"
    }`;

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-[1200px] items-center px-6 py-3">
          <Link
            href={getLocalizedPath("/", language)}
            className="flex items-center flex-shrink-0"
          >
            <div className="flex items-center w-[100px] h-[30px]">
              <Image
                src="/images/nzlouis-logo.png"
                alt="NZLouis logo — Louis Lu"
                width={100}
                height={30}
                priority
                className="w-[100px] h-[30px] object-contain"
              />
            </div>
          </Link>

          <div className="flex-1"></div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <NavigationMenu.Root className="hidden md:flex">
              <NavigationMenu.List className="flex gap-6">
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/", language)}
                    className={linkCls(normalizedPath === "/")}
                  >
                    {language === "en" ? "All Posts" : "所有文章"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/blog/category/ai", language)}
                    className={linkCls(
                      normalizedPath.startsWith("/blog/category/ai")
                    )}
                  >
                    {language === "en" ? "AI" : "人工智能"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/blog/category/project", language)}
                    className={linkCls(
                      normalizedPath.startsWith("/blog/category/project")
                    )}
                  >
                    {language === "en" ? "Project" : "项目"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath(
                      "/blog/category/fullstack",
                      language
                    )}
                    className={linkCls(
                      normalizedPath.startsWith("/blog/category/fullstack")
                    )}
                  >
                    {language === "en" ? "FullStack" : "全栈"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/blog/category/insights", language)}
                    className={linkCls(
                      normalizedPath.startsWith("/blog/category/insights")
                    )}
                  >
                    {language === "en" ? "Insights" : "见解"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/blog/category/tech", language)}
                    className={linkCls(
                      normalizedPath.startsWith("/blog/category/tech")
                    )}
                  >
                    {language === "en" ? "Tech" : "科技"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/blog/category/life", language)}
                    className={linkCls(
                      normalizedPath.startsWith("/blog/category/life")
                    )}
                  >
                    {language === "en" ? "Life" : "生活"}
                  </Link>
                </NavigationMenu.Item>

                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/archive", language)}
                    className={linkCls(normalizedPath.startsWith("/archive"))}
                  >
                    {language === "en" ? "Archive" : "归档"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <a
                    href="https://nzlouis.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors"
                  >
                    {language === "en" ? "About me" : "关于我"}
                  </a>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/search", language)}
                    className={linkCls(normalizedPath.startsWith("/search"))}
                    title="Search"
                  >
                    <Search size={20} />
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <button
                    onClick={() => {
                      const newLang = language === "en" ? "zh" : "en";
                      const newPath =
                        newLang === "zh"
                          ? `/cn${pathname.replace(/^\/cn/, "")}`
                          : pathname.replace(/^\/cn/, "");
                      setLanguage(newLang);
                      router.push(newPath);
                    }}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors"
                  >
                    {language === "en" ? "中文" : "English"}
                  </button>
                </NavigationMenu.Item>
              </NavigationMenu.List>
            </NavigationMenu.Root>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 focus:outline-none"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-black/95">
            <NavigationMenu.Root>
              <NavigationMenu.List className="flex flex-col gap-4 p-4">
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/", language)}
                    className={linkCls(normalizedPath === "/")}
                    onClick={() => setOpen(false)}
                  >
                    {language === "en" ? "All Posts" : "所有文章"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/blog/category/ai", language)}
                    className={linkCls(
                      normalizedPath.startsWith("/blog/category/ai")
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {language === "en" ? "AI" : "人工智能"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/blog/category/project", language)}
                    className={linkCls(
                      normalizedPath.startsWith("/blog/category/project")
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {language === "en" ? "Project" : "项目"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/blog/category/fullstack", language)}
                    className={linkCls(
                      normalizedPath.startsWith("/blog/category/fullstack")
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {language === "en" ? "FullStack" : "全栈"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/blog/category/insights", language)}
                    className={linkCls(
                      normalizedPath.startsWith("/blog/category/insights")
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {language === "en" ? "Insights" : "见解"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/blog/category/tech", language)}
                    className={linkCls(
                      normalizedPath.startsWith("/blog/category/tech")
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {language === "en" ? "Tech" : "科技"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/archive", language)}
                    className={linkCls(normalizedPath.startsWith("/archive"))}
                    onClick={() => setOpen(false)}
                  >
                    {language === "en" ? "Archive" : "归档"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <a
                    href="https://nzlouis.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600"
                    onClick={() => setOpen(false)}
                  >
                    {language === "en" ? "About me" : "关于我"}
                  </a>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <Link
                    href={getLocalizedPath("/search", language)}
                    className={linkCls(normalizedPath.startsWith("/search"))}
                    onClick={() => setOpen(false)}
                  >
                    {language === "en" ? "Search" : "搜索"}
                  </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <button
                    onClick={() => {
                      const newLang = language === "en" ? "zh" : "en";
                      const newPath =
                        newLang === "zh"
                          ? `/cn${pathname.replace(/^\/cn/, "")}`
                          : pathname.replace(/^\/cn/, "");
                      setLanguage(newLang);
                      router.push(newPath);
                      setOpen(false);
                    }}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 text-left"
                  >
                    {language === "en" ? "中文" : "English"}
                  </button>
                </NavigationMenu.Item>
              </NavigationMenu.List>
            </NavigationMenu.Root>
          </div>
        )}
      </nav>
    </>
  );
}
