export interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  categoryId: string;
  tags: string[];
  status: "draft" | "published";
  createdAt: string;
  publishedAt: string | null;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  views?: number;
  likes?: number;
  comments?: CommentItem[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string; // Tailwind class, e.g. "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
  description: string;
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  alt: string;
  size: string;
  type: string;
  createdAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: "draft" | "published";
  createdAt: string;
}

export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
  totalMedia: number;
  avgReadTime: number;
}
