import { Post } from "./types";
import matter from "gray-matter";
import fs from "fs";
import path from "path";

function getPostsDirectory(language: 'en' | 'zh' = 'en') {
  return path.join(process.cwd(), "lib/post", language);
}

function getPostSlugs(language: 'en' | 'zh' = 'en') {
  try {
    const postsDirectory = getPostsDirectory(language);
    const files = fs.readdirSync(postsDirectory);
    return files.filter((file: string) => file.endsWith(".md"));
  } catch (error) {
    console.error("Error reading posts directory:", error);
    return [];
  }
}

export function getPostBySlug(slug: string, language: 'en' | 'zh' = 'en'): Post | null {
  try {
    const realSlug = slug.replace(/\.md$/, "");
    const postsDirectory = getPostsDirectory(language);
    const fullPath = path.join(postsDirectory, `${realSlug}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const post: Post = {
      id: realSlug,
      slug: realSlug,
      title: data.title || "Untitled",
      subtitle: data.subtitle,
      description: data.description,
      excerpt: data.excerpt || data.description || "",
      tags: data.tags || [],
      categories: data.categories || [],
      status: data.published ? "published" : "draft",
      createdAt: data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
      updatedAt: data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
      publishedAt:
        data.published && data.date
          ? new Date(data.date).toISOString()
          : undefined,
      content: content,
      image: data.image,
      author: data.author,
    };

    return post;
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export function getAllPosts(language: 'en' | 'zh' = 'en', authorId?: string): Post[] {
  const slugs = getPostSlugs(language);
  let posts = slugs
    .map((slug: string) => getPostBySlug(slug.replace(/\.md$/, ""), language))
    .filter((post: Post | null): post is Post => post !== null)
    .sort(
      (a: Post, b: Post) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Filter by author if specified
  if (authorId) {
    posts = posts.filter(post => post.author === authorId || post.id.includes(authorId));
  }

  return posts;
}

export function listPublished(language: 'en' | 'zh' = 'en'): Post[] {
  return getAllPosts(language).filter((p) => p.status === "published");
}

export function getPostsByCategory(category: string, language: 'en' | 'zh' = 'en'): Post[] {
  return listPublished(language).filter((p) =>
    p.categories.some((cat) => cat.toLowerCase() === category.toLowerCase())
  );
}

export function getPostsByTag(tag: string, language: 'en' | 'zh' = 'en'): Post[] {
  return listPublished(language).filter((p) =>
    p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getAllCategories(language: 'en' | 'zh' = 'en'): string[] {
  const categories = new Set<string>();
  listPublished(language).forEach((post) => {
    post.categories.forEach((category) => categories.add(category));
  });
  return Array.from(categories).sort();
}

export function getAllTags(language: 'en' | 'zh' = 'en'): string[] {
  const tags = new Set<string>();
  listPublished(language).forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export function getBySlug(slug: string, language: 'en' | 'zh' = 'en'): Post | null {
  const post = getPostBySlug(slug, language);
  return post && post.status === "published" ? post : null;
}
