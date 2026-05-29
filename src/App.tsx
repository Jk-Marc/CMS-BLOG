import React, { useState, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Minus,
  Palette,
  FileText,
  Eye,
  Edit,
  Layers,
  Image as ImageIcon,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Loader2,
  Upload,
  ExternalLink,
  ChevronRight,
  Search,
  BookOpen,
  CheckCircle2,
  Settings,
  AlertTriangle,
  X,
  Type as FontIcon,
  HelpCircle,
  Undo2,
  Moon,
  Sun,
  Minimize2,
  ListFilter,
  Copy,
  FolderOpen,
  User,
  Lock,
  Shield,
  LogOut,
  Newspaper,
  ArrowRight,
  BarChart2,
  ThumbsUp,
  MessageSquare
} from "lucide-react";
import { Post, Category, MediaItem, Page, DashboardStats } from "./types";
import { getSavedCMSData, saveCMSData } from "./mockData";
import DashboardStatsCards from "./components/DashboardStatsCards";
import BlogPreviewMode from "./components/BlogPreviewMode";
import MarkdownPreview from "./components/MarkdownPreview";
import LoginScreen from "./components/LoginScreen";
import RichVisualEditor, { RichVisualEditorRef } from "./components/RichVisualEditor";

export default function App() {
  // Theme Management
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("cms_theme") === "dark";
  });

  // Authentication & Role State
  const [userRole, setUserRole] = useState<"admin" | "reader" | null>(() => {
    return (localStorage.getItem("news_hub_role") as "admin" | "reader") || null;
  });
  const [isUserRegistered, setIsUserRegistered] = useState<boolean>(() => {
    return localStorage.getItem("news_hub_registered") === "true";
  });
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [readerName, setReaderName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeLoginMethod, setActiveLoginMethod] = useState<"admin" | "reader">("admin");

  // Force readers to only access the reader portal
  useEffect(() => {
    if (userRole === "reader") {
      setViewMode("blog_preview");
    }
  }, [userRole]);

  // State Management
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pages, setPages] = useState<Page[]>([]);

  // Navigation states
  const [viewMode, setViewMode] = useState<"admin" | "blog_preview">("admin");
  const [adminTab, setAdminTab] = useState<"dashboard" | "posts" | "pages" | "categories" | "media" | "analytics">("dashboard");

  // Search History tracking for Admins
  const [searchHistory, setSearchHistory] = useState<Array<{ term: string; count: number; date: string }>>(() => {
    const saved = localStorage.getItem("news_hub_searches");
    if (saved) return JSON.parse(saved);
    return [
      { term: "Elden Ring", count: 42, date: new Date().toISOString() },
      { term: "mouses 8000Hz", count: 28, date: new Date().toISOString() },
      { term: "indie games", count: 19, date: new Date().toISOString() },
      { term: "hardware", count: 12, date: new Date().toISOString() },
      { term: "setup gamer", count: 8, date: new Date().toISOString() }
    ];
  });

  const handleSearched = (term: string) => {
    if (!term || term.trim().length < 2) return;
    setSearchHistory(prev => {
      const cleanTerm = term.trim().toLowerCase();
      const existingIdx = prev.findIndex(item => item.term.toLowerCase() === cleanTerm);
      let updated;
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          count: updated[existingIdx].count + 1,
          date: new Date().toISOString()
        };
      } else {
        updated = [
          ...prev,
          { term: term.trim(), count: 1, date: new Date().toISOString() }
        ];
      }
      localStorage.setItem("news_hub_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const handlePostViewed = (postId: string) => {
    setPosts(prevPosts => {
      const updated = prevPosts.map(post => {
        if (post.id === postId) {
          return { ...post, views: (post.views || 0) + 1 };
        }
        return post;
      });
      saveCMSData({ posts: updated, categories, media, pages });
      return updated;
    });
  };

  const handlePostLiked = (postId: string) => {
    const currentUser = localStorage.getItem("news_hub_username") || "Visitante";
    const userRoleKey = localStorage.getItem("news_hub_role");
    const isUserRegistered = localStorage.getItem("news_hub_registered") === "true";
    const canInteract = userRoleKey === "admin" || isUserRegistered;

    if (!canInteract) {
      triggerNotification("Apenas leitores cadastrados com nome podem curtir artigos.", "error");
      return;
    }

    const likeKey = `liked_${currentUser}_${postId}`;
    if (localStorage.getItem(likeKey) === "true") {
      triggerNotification("Você já curtiu esta publicação! O voto é único por usuário.", "error");
      return;
    }

    setPosts(prevPosts => {
      const updated = prevPosts.map(post => {
        if (post.id === postId) {
          return { ...post, likes: (post.likes || 0) + 1 };
        }
        return post;
      });
      saveCMSData({ posts: updated, categories, media, pages });
      return updated;
    });

    localStorage.setItem(likeKey, "true");
    triggerNotification("Artigo curtido com sucesso! Obrigado pelo feedback.", "success");
  };

  const handleAddComment = (postId: string, authorName: string, content: string) => {
    const userRoleKey = localStorage.getItem("news_hub_role");
    const isUserRegistered = localStorage.getItem("news_hub_registered") === "true";
    const canInteract = userRoleKey === "admin" || isUserRegistered;

    if (!canInteract) {
      triggerNotification("Apenas usuários com cadastro ativo podem comentar.", "error");
      return;
    }

    setPosts(prevPosts => {
      const updated = prevPosts.map(post => {
        if (post.id === postId) {
          const freshComments = post.comments ? [...post.comments] : [];
          freshComments.push({
            id: `comm-${Date.now()}`,
            authorName: authorName || "Anônimo",
            content,
            createdAt: new Date().toISOString()
          });
          return { ...post, comments: freshComments };
        }
        return post;
      });
      saveCMSData({ posts: updated, categories, media, pages });
      return updated;
    });
    triggerNotification("Comentário publicado!", "success");
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts(prevPosts => {
      const updated = prevPosts.map(post => {
        if (post.id === postId) {
          const freshComments = (post.comments || []).filter(c => c.id !== commentId);
          return { ...post, comments: freshComments };
        }
        return post;
      });
      saveCMSData({ posts: updated, categories, media, pages });
      return updated;
    });
    triggerNotification("Comentário excluído pelo administrador.", "info");
  };

  // Editorial flow states
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  // New Category Modal / form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatColor, setNewCatColor] = useState("bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300");

  // New Media addition form
  const [showMediaForm, setShowMediaForm] = useState(false);
  const [newMediaTitle, setNewMediaTitle] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newMediaAlt, setNewMediaAlt] = useState("");

  // Post editor input sync targets
  const [postTitle, setPostTitle] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postSummary, setPostSummary] = useState("");
  const [postCategoryId, setPostCategoryId] = useState("");
  const [postTagsString, setPostTagsString] = useState("");
  const [postStatus, setPostStatus] = useState<"draft" | "published">("draft");
  const [postCoverImage, setPostCoverImage] = useState("");
  const [postSeoTitle, setPostSeoTitle] = useState("");
  const [postSeoDescription, setPostSeoDescription] = useState("");

  // Page editor input sync targets
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [pageStatus, setPageStatus] = useState<"draft" | "published">("published");

  // Core Editor Modes
  const [postEditorMode, setPostEditorMode] = useState<"visual" | "code">("visual");
  const [pageEditorMode, setPageEditorMode] = useState<"visual" | "code">("visual");

  const markdownToHtml = (md: string): string => {
    if (!md) return "";
    const trimmed = md.trim();
    if (trimmed.startsWith("<") || trimmed.includes("style=\"color:") || trimmed.includes("</p>") || trimmed.includes("</div>") || trimmed.includes("</span>")) {
      return md;
    }
    
    let html = md;
    // Simple custom tag replacements
    html = html.replace(/\{color:([^}]+)\}(.*?)\{\/color\}/g, '<span style="color: $1">$2</span>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/^---$/gm, '<hr />');

    const lines = html.split("\n");
    let inList = false;
    const processed = lines.map(l => {
      const t = l.trim();
      if (t.startsWith("- ") || t.startsWith("* ")) {
        const item = t.replace(/^[-*]\s+/, "");
        if (!inList) {
          inList = true;
          return `<ul><li>${item}</li>`;
        }
        return `<li>${item}</li>`;
      } else {
        let prefix = "";
        if (inList) {
          inList = false;
          prefix = "</ul>";
        }
        if (t === "" || t.startsWith("<h") || t.startsWith("<block") || t.startsWith("<hr") || t.startsWith("<ul") || t.startsWith("<li")) {
          return prefix + l;
        }
        return `${prefix}<p>${l}</p>`;
      }
    });
    if (inList) {
      processed.push("</ul>");
    }
    return processed.join("\n");
  };

  // Rich Text Markup helper refs and handles
  const postContentRef = useRef<HTMLTextAreaElement>(null);
  const pageContentRef = useRef<HTMLTextAreaElement>(null);
  const visualPostRef = useRef<RichVisualEditorRef>(null);
  const visualPageRef = useRef<RichVisualEditorRef>(null);

  const insertFormat = (type: "bold" | "italic" | "bullet" | "number" | "line" | "quote" | "color" | "h1" | "h2" | "p", param?: string) => {
    const textarea = postContentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let insertion = "";
    let newCursorPosition = start;

    switch (type) {
      case "bold":
        insertion = `**${selected || "texto"}**`;
        newCursorPosition = start + insertion.length - (selected ? 0 : 2);
        break;
      case "italic":
        insertion = `*${selected || "texto"}*`;
        newCursorPosition = start + insertion.length - (selected ? 0 : 1);
        break;
      case "bullet":
        insertion = `\n- ${selected || "Item"}`;
        newCursorPosition = start + insertion.length;
        break;
      case "number":
        insertion = `\n1. ${selected || "Item"}`;
        newCursorPosition = start + insertion.length;
        break;
      case "line":
        insertion = start === 0 || text.charAt(start - 1) === "\n" ? "---" : "\n---";
        newCursorPosition = start + insertion.length;
        break;
      case "quote":
        insertion = `\n> ${selected || "Citação"}`;
        newCursorPosition = start + insertion.length;
        break;
      case "h1":
        insertion = `\n# ${selected || "Título"}`;
        newCursorPosition = start + insertion.length;
        break;
      case "h2":
        insertion = `\n## ${selected || "Subtítulo"}`;
        newCursorPosition = start + insertion.length;
        break;
      case "p":
        insertion = `\n${selected || "Texto"}`;
        newCursorPosition = start + insertion.length;
        break;
      case "color":
        const color = param || "#ef4444";
        insertion = `{color:${color}}${selected || "texto"}{/color}`;
        newCursorPosition = start + insertion.length - (selected ? 0 : 8);
        break;
    }

    const updatedText = text.substring(0, start) + insertion + text.substring(end);
    setPostContent(updatedText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 50);
  };

  const insertPageFormat = (type: "bold" | "italic" | "bullet" | "number" | "line" | "quote" | "color" | "h1" | "h2" | "p", param?: string) => {
    const textarea = pageContentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let insertion = "";
    let newCursorPosition = start;

    switch (type) {
      case "bold":
        insertion = `**${selected || "texto"}**`;
        newCursorPosition = start + insertion.length - (selected ? 0 : 2);
        break;
      case "italic":
        insertion = `*${selected || "texto"}*`;
        newCursorPosition = start + insertion.length - (selected ? 0 : 1);
        break;
      case "bullet":
        insertion = `\n- ${selected || "Item"}`;
        newCursorPosition = start + insertion.length;
        break;
      case "number":
        insertion = `\n1. ${selected || "Item"}`;
        newCursorPosition = start + insertion.length;
        break;
      case "line":
        insertion = start === 0 || text.charAt(start - 1) === "\n" ? "---" : "\n---";
        newCursorPosition = start + insertion.length;
        break;
      case "quote":
        insertion = `\n> ${selected || "Citação"}`;
        newCursorPosition = start + insertion.length;
        break;
      case "h1":
        insertion = `\n# ${selected || "Título"}`;
        newCursorPosition = start + insertion.length;
        break;
      case "h2":
        insertion = `\n## ${selected || "Subtítulo"}`;
        newCursorPosition = start + insertion.length;
        break;
      case "p":
        insertion = `\n${selected || "Texto"}`;
        newCursorPosition = start + insertion.length;
        break;
      case "color":
        const color = param || "#ef4444";
        insertion = `{color:${color}}${selected || "texto"}{/color}`;
        newCursorPosition = start + insertion.length - (selected ? 0 : 8);
        break;
    }

    const updatedText = text.substring(0, start) + insertion + text.substring(end);
    setPageContent(updatedText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 50);
  };

  const handleFormatAction = (type: "bold" | "italic" | "bullet" | "number" | "line" | "quote" | "color" | "h1" | "h2" | "p", isPage: boolean = false, colorValue?: string) => {
    const isVisual = isPage ? pageEditorMode === "visual" : postEditorMode === "visual";
    
    if (isVisual) {
      const editorRefInstance = isPage ? visualPageRef.current : visualPostRef.current;
      if (editorRefInstance) {
        editorRefInstance.execFormat(type, colorValue);
      }
    } else {
      // Code mode fallback
      if (isPage) {
        insertPageFormat(type, colorValue);
      } else {
        insertFormat(type, colorValue);
      }
    }
  };

  // Search in Admin tabs
  const [adminSearch, setAdminSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // AI Assistant Drawer states
  const [aiAction, setAiAction] = useState<"generate" | "improve" | "seo" | "translate" | "tone" | "summarize">("generate");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTargetLanguage, setAiTargetLanguage] = useState("Inglês");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiStructuredSeo, setAiStructuredSeo] = useState<{
    seoTitle?: string;
    metaDescription?: string;
    suggestedTags?: string[];
    seoTips?: string;
  } | null>(null);
  const [aiStructuredTone, setAiStructuredTone] = useState<{
    tones?: string[];
    readTimeMinutes?: number;
    constructiveCritique?: string;
  } | null>(null);

  // Notifications or toast simulation
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);

  // Auto Dismiss Notification
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  function triggerNotification(text: string, type: "success" | "info" | "error" = "success") {
    setToastMessage({ text, type });
  }

  // Session login / logout Handlers
  const handleLoginSuccess = (role: "admin" | "reader", name?: string, isRegistered?: boolean) => {
    localStorage.setItem("news_hub_role", role);
    if (name) {
      localStorage.setItem("news_hub_username", name);
    } else {
      localStorage.setItem("news_hub_username", role === "admin" ? "Administrador" : "Leitor");
    }
    const registeredVal = role === "admin" || isRegistered === true;
    localStorage.setItem("news_hub_registered", registeredVal ? "true" : "false");
    
    setUserRole(role);
    setIsUserRegistered(registeredVal);
    triggerNotification(`Sessão iniciada com sucesso como ${role === "admin" ? "Administrador" : (registeredVal ? "Leitor Cadastrado" : "Leitor Sem Cadastro")}! 🔓`, "success");
  };

  const handleLogout = () => {
    localStorage.removeItem("news_hub_role");
    localStorage.removeItem("news_hub_username");
    localStorage.removeItem("news_hub_registered");
    setUserRole(null);
    setIsUserRegistered(false);
    triggerNotification("Sessão finalizada com sucesso! 👋", "info");
  };

  // Initial Load from LocalStorage
  useEffect(() => {
    const data = getSavedCMSData();
    // Se a primeira categoria for "Tecnologia" (do mock antigo legado de TI), limpamos o storage antigo para Games
    if (data.categories.length > 0 && data.categories[0].name === "Tecnologia") {
      localStorage.removeItem("cms_posts");
      localStorage.removeItem("cms_categories");
      localStorage.removeItem("cms_media");
      localStorage.removeItem("cms_pages");
      const gamesData = getSavedCMSData();
      setPosts(gamesData.posts);
      setCategories(gamesData.categories);
      setMedia(gamesData.media);
      setPages(gamesData.pages);
    } else {
      setPosts(data.posts);
      setCategories(data.categories);
      setMedia(data.media);
      setPages(data.pages);
    }
  }, []);

  // Sync to LocalStorage
  const handlePersistAll = (updatedPosts = posts, updatedCats = categories, updatedMedia = media, updatedPages = pages) => {
    saveCMSData({
      posts: updatedPosts,
      categories: updatedCats,
      media: updatedMedia,
      pages: updatedPages
    });
  };

  // Reset to Games default theme data preset
  const resetToGamesPreset = () => {
    localStorage.removeItem("cms_posts");
    localStorage.removeItem("cms_categories");
    localStorage.removeItem("cms_media");
    localStorage.removeItem("cms_pages");

    const gamesData = getSavedCMSData();
    setPosts(gamesData.posts);
    setCategories(gamesData.categories);
    setMedia(gamesData.media);
    setPages(gamesData.pages);

    triggerNotification("Banco editorial redefinido para a temática de Games, eSports & Cultura Indie! 🎮", "success");
  };

  // HTML Theme Sync
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("cms_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("cms_theme", "light");
    }
  }, [isDarkMode]);

  // Handle post slug auto generation
  useEffect(() => {
    if (isCreatingPost && !postSlug) {
      const genSlug = postTitle
        .toLowerCase()
        .replace(/[^a-z0-0\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 50);
      setPostSlug(genSlug);
    }
  }, [postTitle, isCreatingPost]);

  // Handle page slug auto generation
  useEffect(() => {
    if (isCreatingPage && !pageSlug) {
      const genSlug = pageTitle
        .toLowerCase()
        .replace(/[^a-z0-0\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 50);
      setPageSlug(genSlug);
    }
  }, [pageTitle, isCreatingPage]);

  // Calculations
  const getDashboardStats = (): DashboardStats => {
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(p => p.status === "published").length;
    const draftPosts = posts.filter(p => p.status === "draft").length;
    const totalCategories = categories.length;
    const totalMedia = media.length;

    // Avg Read time based on words count
    let totalWords = 0;
    posts.forEach(p => {
      totalWords += p.content.split(/\s+/).filter(Boolean).length;
    });
    const avgWords = totalPosts > 0 ? totalWords / totalPosts : 0;
    const avgReadTime = Math.max(1, Math.ceil(avgWords / 200)); // 200 wpm average speed

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalCategories,
      totalMedia,
      avgReadTime
    };
  };

  const currentStats = getDashboardStats();

  // Create or Update Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName,
      slug,
      color: newCatColor,
      description: newCatDesc
    };

    const updated = [...categories, newCategory];
    setCategories(updated);
    handlePersistAll(posts, updated, media, pages);
    setNewCatName("");
    setNewCatDesc("");
    setShowCategoryForm(false);
    triggerNotification(`Categoria "${newCatName}" criada com sucesso.`);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    // Check if category is used in posts
    const isUsed = posts.some(p => p.categoryId === id);
    if (isUsed) {
      triggerNotification(`Erro: A categoria "${name}" não pode ser excidida porque existem posts associados a ela.`, "error");
      return;
    }

    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    handlePersistAll(posts, updated, media, pages);
    triggerNotification(`Categoria "${name}" removida.`);
  };

  // Create or Update Media Item
  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaTitle.trim() || !newMediaUrl.trim()) return;

    const newMedia: MediaItem = {
      id: `med-${Date.now()}`,
      title: newMediaTitle,
      url: newMediaUrl,
      alt: newMediaAlt || newMediaTitle,
      size: `${Math.floor(Math.random() * 300) + 100} KB`,
      type: "image/jpeg",
      createdAt: new Date().toISOString()
    };

    const updated = [newMedia, ...media];
    setMedia(updated);
    handlePersistAll(posts, categories, updated, pages);
    setNewMediaTitle("");
    setNewMediaUrl("");
    setNewMediaAlt("");
    setShowMediaForm(false);
    triggerNotification(`Elemento de mídia "${newMediaTitle}" adicionado.`);
  };

  const handleDeleteMedia = (id: string, title: string) => {
    const updated = media.filter(m => m.id !== id);
    setMedia(updated);
    handlePersistAll(posts, categories, updated, pages);
    triggerNotification(`Mídia "${title}" removida.`);
  };

  // Delete Post
  const handleDeletePost = (id: string, title: string) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    handlePersistAll(updated, categories, media, pages);
    triggerNotification(`Artigo "${title}" excluído do CMS.`);
  };

  // Delete static page
  const handleDeletePage = (id: string, title: string) => {
    const updated = pages.filter(p => p.id !== id);
    setPages(updated);
    handlePersistAll(posts, categories, media, updated);
    triggerNotification(`Página estática "${title}" removida.`);
  };

  // Start creating new post
  const triggerNewPostForm = () => {
    // Select first category default
    const firstCat = categories.length > 0 ? categories[0].id : "";

    setPostTitle("");
    setPostSlug("");
    setPostContent("");
    setPostSummary("");
    setPostCategoryId(firstCat);
    setPostTagsString("");
    setPostStatus("draft");
    setPostCoverImage("");
    setPostSeoTitle("");
    setPostSeoDescription("");

    setPostEditorMode("visual");
    setIsCreatingPost(true);
    setEditingPost(null);
  };

  // Save/Publish Post Process
  const handleSavePost = () => {
    if (!postTitle.trim()) {
      triggerNotification("O título do artigo é obrigatório.", "error");
      return;
    }

    const tagsArray = postTagsString
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const targetSlug = postSlug.trim() || postTitle.toLowerCase().replace(/[^a-z0-9]/g, "-");

    const payload: Post = {
      id: isCreatingPost ? `post-${Date.now()}` : (editingPost?.id || ""),
      title: postTitle,
      slug: targetSlug,
      content: postContent,
      summary: postSummary || (postContent ? postContent.substring(0, 140) + "..." : ""),
      categoryId: postCategoryId,
      tags: tagsArray,
      status: postStatus,
      createdAt: editingPost ? editingPost.createdAt : new Date().toISOString(),
      publishedAt: postStatus === "published"
        ? (editingPost?.publishedAt || new Date().toISOString())
        : null,
      coverImage: postCoverImage,
      seoTitle: postSeoTitle || postTitle,
      seoDescription: postSeoDescription || postSummary
    };

    let updatedPosts: Post[] = [];
    let isNewlyPublished = false;

    if (isCreatingPost) {
      updatedPosts = [payload, ...posts];
      triggerNotification(`Artigo "${postTitle}" criado com sucesso.`);
      if (payload.status === "published") {
        isNewlyPublished = true;
      }
    } else {
      const wasPublished = editingPost?.status === "published";
      if (!wasPublished && payload.status === "published") {
        isNewlyPublished = true;
      }
      updatedPosts = posts.map(p => p.id === payload.id ? payload : p);
      triggerNotification(`Alterações salvas no artigo "${postTitle}".`);
    }

    // Process notification dispatch to subscribed readers
    if (isNewlyPublished) {
      try {
        const usersData = localStorage.getItem("news_hub_registered_users") || "[]";
        const registeredUsers = JSON.parse(usersData);
        const subscribers = registeredUsers.filter((u: any) => u.receiveNotifications);
        if (subscribers.length > 0) {
          const namesStr = subscribers.map((s: any) => s.name).join(", ");
          setTimeout(() => {
            triggerNotification(
              `📢 E-mail enviado para os ${subscribers.length} inscritos (${namesStr}) sobre a nova publicação "${postTitle}"! 📬`,
              "info"
            );
          }, 1500);
        }
      } catch (e) {
        console.error("Falha ao notificar inscritos:", e);
      }
    }

    setPosts(updatedPosts);
    handlePersistAll(updatedPosts, categories, media, pages);
    setIsCreatingPost(false);
    setEditingPost(null);
  };

  // Save static page process
  const triggerNewPageForm = () => {
    setPageTitle("");
    setPageSlug("");
    setPageContent("");
    setPageStatus("published");
    setPageEditorMode("visual");
    setIsCreatingPage(true);
    setEditingPage(null);
  };

  const handleSavePage = () => {
    if (!pageTitle.trim()) {
      triggerNotification("O título da página é obrigatório.", "error");
      return;
    }

    const targetSlug = pageSlug.trim() || pageTitle.toLowerCase().replace(/[^a-z0-0]/g, "-");

    const payload: Page = {
      id: isCreatingPage ? `page-${Date.now()}` : (editingPage?.id || ""),
      title: pageTitle,
      slug: targetSlug,
      content: pageContent,
      status: pageStatus,
      createdAt: editingPage ? editingPage.createdAt : new Date().toISOString()
    };

    let updatedPages: Page[] = [];
    if (isCreatingPage) {
      updatedPages = [payload, ...pages];
      triggerNotification(`Página "${pageTitle}" criada com sucesso.`);
    } else {
      updatedPages = pages.map(p => p.id === payload.id ? payload : p);
      triggerNotification(`Página "${pageTitle}" atualizada.`);
    }

    setPages(updatedPages);
    handlePersistAll(posts, categories, media, updatedPages);
    setIsCreatingPage(false);
    setEditingPage(null);
  };

  // Start editing existing post
  const triggerEditPost = (post: Post) => {
    setPostTitle(post.title);
    setPostSlug(post.slug);
    setPostContent(markdownToHtml(post.content));
    setPostSummary(post.summary);
    setPostCategoryId(post.categoryId);
    setPostTagsString(post.tags.join(", "));
    setPostStatus(post.status);
    setPostCoverImage(post.coverImage);
    setPostSeoTitle(post.seoTitle);
    setPostSeoDescription(post.seoDescription);

    setPostEditorMode("visual");
    setEditingPost(post);
    setIsCreatingPost(false);
  };

  // Start editing existing static page
  const triggerEditPage = (p: Page) => {
    setPageTitle(p.title);
    setPageSlug(p.slug);
    setPageContent(markdownToHtml(p.content));
    setPageStatus(p.status);

    setPageEditorMode("visual");
    setEditingPage(p);
    setIsCreatingPage(false);
  };

  // Call Server-side AI route `/api/ai/cms-writer`
  const runAiAssistant = async () => {
    setAiLoading(true);
    setAiError("");
    setAiResult("");
    setAiStructuredSeo(null);
    setAiStructuredTone(null);

    try {
      const response = await fetch("/api/ai/cms-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: aiAction,
          text: postContent,
          title: postTitle,
          category: categories.find(c => c.id === postCategoryId)?.name,
          prompt: aiPrompt,
          targetLanguage: aiTargetLanguage
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Operação falhou na inteligência artificial.");
      }

      if (aiAction === "seo_suggest") {
        const parsed = JSON.parse(data.result);
        setAiStructuredSeo(parsed);
      } else if (aiAction === "tone_analyzer") {
        const parsed = JSON.parse(data.result);
        setAiStructuredTone(parsed);
      } else {
        setAiResult(data.result);
      }
      triggerNotification("AI concluiu a redação com sucesso!", "success");
    } catch (err: any) {
      setAiError(err.message || "Não foi possível contatar o servidor.");
      triggerNotification("Erro na escrita por IA.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // Apply AI result back to CMS inputs
  const applyAiResultToEditor = () => {
    if (aiAction === "generate") {
      setPostContent(aiResult);
    } else if (aiAction === "improve") {
      setPostContent(aiResult);
    } else if (aiAction === "summarize") {
      setPostSummary(aiResult);
    } else if (aiAction === "translate") {
      setPostContent(aiResult);
    } else if (aiAction === "seo_suggest" && aiStructuredSeo) {
      if (aiStructuredSeo.seoTitle) setPostSeoTitle(aiStructuredSeo.seoTitle);
      if (aiStructuredSeo.metaDescription) setPostSeoDescription(aiStructuredSeo.metaDescription);
      if (aiStructuredSeo.suggestedTags) {
        const tagsCombo = [...new Set([...postTagsString.split(",").map(t => t.trim()).filter(Boolean), ...aiStructuredSeo.suggestedTags])].join(", ");
        setPostTagsString(tagsCombo);
      }
    }
    // clear result
    setAiResult("");
    setAiStructuredSeo(null);
    triggerNotification("Inserido com sucesso no documento editor.");
  };

  // Helper colors list for select category decoration
  const colorOptions = [
    { className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900", label: "Azul Oceano" },
    { className: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900", label: "Roxo Lavanda" },
    { className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900", label: "Verde Esmeralda" },
    { className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900", label: "Laranja Ambar" },
    { className: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900", label: "Rosa Coral" },
    { className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-750", label: "Cinza Standard" }
  ];

  // Filters for lists inside admin panel
  const filteredPostsList = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
                          p.slug.toLowerCase().includes(adminSearch.toLowerCase());
    const matchesCat = categoryFilter === "all" || p.categoryId === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredPagesList = pages.filter(p =>
    p.title.toLowerCase().includes(adminSearch.toLowerCase()) || p.slug.toLowerCase().includes(adminSearch.toLowerCase())
  );

  if (userRole === null) {
    return (
      <div className={`min-h-screen ${isDarkMode ? "dark bg-slate-950" : "bg-slate-50"}`}>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
        {/* Toast simulated notifications */}
        {toastMessage && (
          <div id="toast-wrapper" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-4 py-3 rounded-lg shadow-xl animate-bounce-short border border-slate-800/40 select-none">
            {toastMessage.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toastMessage.type === "error" && <AlertTriangle className="w-5 h-5 text-rose-500" />}
            <span className="text-xs font-medium">{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="hover:opacity-70 p-0.5 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200`}>

      {/* Dynamic Top Navigation Bar */}
      <nav id="cms_navbar" className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Studio title */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-9 md:w-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm md:text-lg shadow-sm shrink-0">
                <Newspaper className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs md:text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1 md:gap-2 font-display">
                  NewsHub
                </span>
                <span className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-400 block -mt-1 font-sans truncate max-w-[120px] sm:max-w-none">
                  Gerenciador Editorial
                </span>
              </div>
            </div>

            {/* Toggle Dual View Controls */}
            <div className="flex items-center gap-1.5 md:gap-3">
              {userRole === "admin" && (
                <div className="bg-slate-100 dark:bg-slate-800 p-0.5 md:p-1 rounded-lg flex gap-0.5 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <button
                    id="btn-admin-mode"
                    onClick={() => setViewMode("admin")}
                    className={`px-2 md:px-3 py-1.5 text-[11px] md:text-xs font-semibold rounded-md flex items-center gap-1 md:gap-1.5 cursor-pointer transition-all ${
                      viewMode === "admin"
                        ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                    }`}
                    title="Painel Administrativo"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Painel Administrativo</span>
                    <span className="inline md:hidden text-[10px]">Painel</span>
                  </button>
                  <button
                    id="btn-leitor-mode"
                    onClick={() => {
                      setViewMode("blog_preview");
                      setIsCreatingPost(false);
                      setEditingPost(null);
                      setIsCreatingPage(false);
                      setEditingPage(null);
                    }}
                    className={`px-2 md:px-3 py-1.5 text-[11px] md:text-xs font-semibold rounded-md flex items-center gap-1 md:gap-1.5 cursor-pointer transition-all ${
                      viewMode === "blog_preview"
                        ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                    }`}
                    title="Portal do Leitor Live"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Portal do Leitor Live</span>
                    <span className="inline md:hidden text-[10px]">Leitor</span>
                  </button>
                </div>
              )}

              {/* Theme switch button */}
              <button
                id="btn-theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 md:p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                title="Alternar Tema Escuro"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
              </button>

              {/* Divider */}
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

              {/* Role badge and Logout button */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {localStorage.getItem("news_hub_username") || "Visitante"}
                  </span>
                  <span className="text-[9px] uppercase font-mono text-slate-450 dark:text-slate-400">
                    {userRole === "admin"
                      ? "🛡️ Administrador"
                      : isUserRegistered
                      ? "📖 Leitor Cadastrado"
                      : "📖 Leitor Anônimo"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                  title="Sair (Logout)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </nav>

      {/* Toast simulated notifications */}
      {toastMessage && (
        <div id="toast-wrapper" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-4 py-3 rounded-lg shadow-xl animate-bounce-short border border-slate-800/40 select-none">
          {toastMessage.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toastMessage.type === "error" && <AlertTriangle className="w-5 h-5 text-rose-500" />}
          <span className="text-xs font-medium">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-70 p-0.5 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Dynamic Workspace Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {viewMode === "blog_preview" ? (
          /* Public simulated viewport */
          <div className="space-y-4">
            {userRole === "admin" && (
              <div className="bg-yellow-500/10 text-yellow-800 border border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/40 p-3.5 rounded-lg flex items-center justify-between text-xs font-sans">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                  Dica de Produção: Altere o status de qualquer post modificado no painel administrativo para <strong>&quot;Publicado&quot;</strong> para vê-lo imediatamente simulado aqui.
                </span>
                <button
                  onClick={() => setViewMode("admin")}
                  className="text-yellow-900 dark:text-yellow-300 hover:underline font-bold"
                >
                  Voltar ao Painel &rarr;
                </button>
              </div>
            )}
            <BlogPreviewMode
              posts={posts}
              categories={categories}
              pages={pages}
              userRole={userRole}
              isRegistered={isUserRegistered}
              onPostViewed={handlePostViewed}
              onPostLiked={handlePostLiked}
              onCommentAdded={handleAddComment}
              onCommentDeleted={handleDeleteComment}
              onSearched={handleSearched}
            />
          </div>
        ) : (
          /* Admin View Mode with Tabs */
          <div className="space-y-6">

            {/* Inner Dashboard View / Tab Layout */}
            {!isCreatingPost && !editingPost && !isCreatingPage && !editingPage && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Stats cards overview at top always visible */}
                <DashboardStatsCards stats={currentStats} />

                {/* Sub Administration Panel Container with list side menu */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  
                  {/* Left Tab navigation */}
                  <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0 select-none lg:col-span-1 whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3 mb-2 hidden lg:block">
                      Menu de Gestão
                    </span>
                    <button
                      onClick={() => setAdminTab("dashboard")}
                      className={`w-auto lg:w-full shrink-0 flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                        adminTab === "dashboard"
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs animate-pulse-short"
                          : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:border-slate-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Editorial Geral
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60 hidden lg:block" />
                    </button>

                    <button
                      onClick={() => setAdminTab("posts")}
                      className={`w-auto lg:w-full shrink-0 flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                        adminTab === "posts"
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:border-slate-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Artigos de Blog ({posts.length})
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60 hidden lg:block" />
                    </button>

                    <button
                      onClick={() => setAdminTab("pages")}
                      className={`w-auto lg:w-full shrink-0 flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                        adminTab === "pages"
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:border-slate-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" /> Páginas Estáticas ({pages.length})
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60 hidden lg:block" />
                    </button>

                    <button
                      onClick={() => setAdminTab("categories")}
                      className={`w-auto lg:w-full shrink-0 flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                        adminTab === "categories"
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:border-slate-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Categorias ({categories.length})
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60 hidden lg:block" />
                    </button>

                    <button
                      onClick={() => setAdminTab("media")}
                      className={`w-auto lg:w-full shrink-0 flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                        adminTab === "media"
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:border-slate-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Mídias & Envios ({media.length})
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60 hidden lg:block" />
                    </button>

                    <button
                      onClick={() => setAdminTab("analytics")}
                      className={`w-auto lg:w-full shrink-0 flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                        adminTab === "analytics"
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:border-slate-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4" /> Relatórios de Desempenho
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60 hidden lg:block" />
                    </button>
                  </div>

                  {/* Right Content View Area depending on chosen tab */}
                  <div className="lg:col-span-3">
                    
                    {/* Editorial Dashboard tab */}
                    {adminTab === "dashboard" && (
                      <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                              Visão Editorial & Ações Rápidas
                            </h2>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => triggerNewPostForm()}
                                className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-xs cursor-pointer select-none"
                              >
                                <Plus className="w-4 h-4" /> Novo Artigo
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                                <BarChart2 className="w-4 h-4 text-blue-500" />
                                Feed de Métricas & Desempenho
                              </h3>
                              <p className="text-xs text-slate-500 leading-normal mb-3">
                                Consulte o retorno das buscas efetuadas pelos leitores, estatísticas de curtidas, moderação direta de comentários e relatórios em tempo real.
                              </p>
                              <button
                                onClick={() => setAdminTab("analytics")}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                              >
                                Acessar Relatórios &larr;
                              </button>
                            </div>

                            <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.55">
                                <ImageIcon className="w-4 h-4 text-emerald-500" />
                                Mídia de Alta Qualidade
                              </h3>
                              <p className="text-xs text-slate-500 leading-normal mb-3">
                                Utilize assets visuais ou links externos para as capas de seus posts. Acesse nossa biblioteca local para atribuir fotos de alta resolução.
                              </p>
                              <button
                                onClick={() => setAdminTab("media")}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                              >
                                Organizar Biblioteca &rarr;
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Recent Drafts or Articles Lists directly detailed here */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 select-none">
                            Últimos Artigos Editados
                          </h3>
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {posts.slice(0, 5).map(post => {
                              const cat = categories.find(c => c.id === post.categoryId);
                              return (
                                <div key={post.id} className="py-3 flex items-center justify-between text-xs gap-3">
                                  <div className="truncate flex-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cat?.color || "bg-slate-100 text-slate-700"}`}>
                                        {cat?.name || "Sem categoria"}
                                      </span>
                                      <span className={`text-[9px] font-semibold px-1 rounded-full ${post.status === "published" ? "bg-emerald-100/10 text-emerald-600" : "bg-amber-100/10 text-amber-600"}`}>
                                        {post.status === "published" ? "Publicado" : "Rascunho"}
                                      </span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white block truncate">
                                      {post.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => triggerEditPost(post)}
                                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                                      title="Editar Artigo"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeletePost(post.id, post.title)}
                                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded-lg cursor-pointer"
                                      title="Excluir Artigo"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Posts Administrador Tab */}
                    {adminTab === "posts" && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            Artigos de Blog
                          </h2>
                          <div className="flex items-center gap-2 select-none">
                            <select
                              value={categoryFilter}
                              onChange={e => setCategoryFilter(e.target.value)}
                              className="text-xs bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-slate-600 dark:bg-slate-800 dark:border-slate-750 dark:text-gray-300 outline-none"
                            >
                              <option value="all">Filtrar Categoria (Todas)</option>
                              {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => triggerNewPostForm()}
                              className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-xs cursor-pointer font-sans"
                            >
                              <Plus className="w-4 h-4" /> Novo Artigo
                            </button>
                          </div>
                        </div>

                        {/* Search in posts */}
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={adminSearch}
                            onChange={e => setAdminSearch(e.target.value)}
                            placeholder="Pesquisar por título ou slug..."
                            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 dark:bg-slate-800 dark:border-slate-750 dark:text-white outline-none transition-colors font-sans"
                          />
                        </div>

                        {filteredPostsList.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            Nenhum artigo encontrado para a pesquisa/filtro atual.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredPostsList.map(post => {
                              const cat = categories.find(c => c.id === post.categoryId);
                              return (
                                <div
                                  key={post.id}
                                  className="p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 flex flex-wrap md:flex-nowrap justify-between items-center gap-4 text-xs font-sans hover:shadow-2xs transition-shadow"
                                >
                                  <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${cat?.color || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                                        {cat?.name || "Sem categoria"}
                                      </span>
                                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${post.status === "published" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}>
                                        {post.status === "published" ? "Publicado" : "Rascunho"}
                                      </span>
                                      <span className="text-[10px] text-slate-400 truncate">
                                        Slug: /{post.slug}
                                      </span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white block text-sm tracking-tight truncate">
                                      {post.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 max-w-3xl">
                                      {post.summary}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 select-none">
                                    <button
                                      onClick={() => triggerEditPost(post)}
                                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-slate-800 font-semibold py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
                                    >
                                      <Edit className="w-3.5 h-3.5" /> Editar
                                    </button>
                                    <button
                                      onClick={() => handleDeletePost(post.id, post.title)}
                                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded-lg cursor-pointer border border-transparent hover:border-rose-100 dark:hover:border-rose-900/40"
                                      title="Excluir Artigo"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Static Pages tab */}
                    {adminTab === "pages" && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            Páginas Estáticas Estilo Site (Ex: Sobre, Contato)
                          </h2>
                          <button
                            onClick={() => triggerNewPageForm()}
                            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-xs cursor-pointer select-none"
                          >
                            <Plus className="w-4 h-4" /> Nova Página
                          </button>
                        </div>

                        {filteredPagesList.length === 0 ? (
                          <p className="py-6 text-center text-xs text-slate-400">Nenhuma página encontrada.</p>
                        ) : (
                          <div className="space-y-3">
                            {filteredPagesList.map(page => (
                              <div
                                key={page.id}
                                className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                                      {page.title}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      /{page.slug}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-none">
                                    Criado em: {new Date(page.createdAt).toLocaleDateString("pt-BR")}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => triggerEditPage(page)}
                                    className="flex items-center gap-1 py-1.5 px-3 text-xs bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-850 rounded-lg cursor-pointer font-semibold"
                                  >
                                    <Edit className="w-3.5 h-3.5" /> Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeletePage(page.id, page.title)}
                                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 border border-transparent rounded-lg cursor-pointer"
                                    title="Remover Página"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Categories Administration */}
                    {adminTab === "categories" && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            Categorias Editoriais
                          </h2>
                          <button
                            onClick={() => setShowCategoryForm(!showCategoryForm)}
                            className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline cursor-pointer select-none"
                          >
                            {showCategoryForm ? "Fechar Form" : "Criar Nova Categoria"}
                          </button>
                        </div>

                        {showCategoryForm && (
                          <form onSubmit={handleSaveCategory} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-3 font-sans max-w-lg">
                            <h3 className="text-xs font-bold text-slate-800 dark:text-white">Nova Categoria</h3>
                            
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Nome</label>
                              <input
                                type="text"
                                value={newCatName}
                                onChange={e => setNewCatName(e.target.value)}
                                placeholder="Design, UX, IA..."
                                className="w-full text-xs p-2 border border-slate-200 rounded bg-white dark:bg-slate-900 dark:border-slate-750 dark:text-white outline-none"
                                required
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Descrição Curta</label>
                              <input
                                type="text"
                                value={newCatDesc}
                                onChange={e => setNewCatDesc(e.target.value)}
                                placeholder="Posts sobre..."
                                className="w-full text-xs p-2 border border-slate-200 rounded bg-white dark:bg-slate-900 dark:border-slate-750 dark:text-white outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Paleta de Cor Badge</label>
                              <div className="grid grid-cols-2 gap-2">
                                {colorOptions.map((opt, i) => (
                                  <label
                                    key={i}
                                    onClick={() => setNewCatColor(opt.className)}
                                    className={`p-2 rounded border text-[10px] font-bold text-center cursor-pointer transition-all ${opt.className} ${newCatColor === opt.className ? "ring-2 ring-blue-500 border-transparent scale-102" : "opacity-80 border-slate-200 dark:border-slate-800"}`}
                                  >
                                    {opt.label}
                                  </label>
                                ))}
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold rounded cursor-pointer select-none"
                            >
                              Adicionar Categoria
                            </button>
                          </form>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categories.map(cat => (
                            <div
                              key={cat.id}
                              className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-32"
                            >
                              <div>
                                <div className="flex justify-between items-start">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${cat.color}`}>
                                    {cat.name}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/25 text-rose-600 rounded cursor-pointer"
                                    title="Remover Categoria"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                                  {cat.description || "Nenhuma descrição fornecida para esta categoria editorial."}
                                </p>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Slug: /{cat.slug}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Media Library tab */}
                    {adminTab === "media" && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 font-sans">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            Mídias & Central de Envios
                          </h2>
                          <button
                            onClick={() => setShowMediaForm(!showMediaForm)}
                            className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 px-3 rounded-lg cursor-pointer shadow-xs select-none"
                          >
                            <Upload className="w-3.5 h-3.5" /> Cadastrar Novo Link
                          </button>
                        </div>

                        {showMediaForm && (
                          <form onSubmit={handleSaveMedia} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-755 space-y-3 max-w-lg">
                            <h3 className="text-xs font-bold text-slate-800 dark:text-white">Cadastrar Mídia Base</h3>
                            <p className="text-[10px] text-slate-400">Use URLs diretas no Unsplash ou localmente para ilustrar seus artigos e cabeçalhos.</p>
                            
                            <div>
                              <label className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest mb-1">Título</label>
                              <input
                                type="text"
                                value={newMediaTitle}
                                onChange={e => setNewMediaTitle(e.target.value)}
                                placeholder="Ex: Macbook no sofa moderno"
                                className="w-full text-xs p-2 border border-slate-250 rounded bg-white dark:bg-slate-900 dark:border-slate-750 dark:text-white outline-none"
                                required
                              />
                            </div>

                            <div>
                              <label className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest mb-1">URL Direta da Imagem</label>
                              <input
                                type="url"
                                value={newMediaUrl}
                                onChange={e => setNewMediaUrl(e.target.value)}
                                placeholder="https://images.unsplash.com/photo-..."
                                className="w-full text-xs p-2 border border-slate-250 rounded bg-white dark:bg-slate-900 dark:border-slate-750 dark:text-white outline-none"
                                required
                              />
                            </div>

                            <div>
                              <label className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest mb-1">Texto Alternativo (Acessibilidade)</label>
                              <input
                                type="text"
                                value={newMediaAlt}
                                onChange={e => setNewMediaAlt(e.target.value)}
                                placeholder="Descrição detalhada do que a imagem contém"
                                className="w-full text-xs p-2 border border-slate-250 rounded bg-white dark:bg-slate-900 dark:border-slate-750 dark:text-white outline-none"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 text-xs font-bold rounded cursor-pointer transition-all shadow-xs"
                            >
                              Salvar Mídia na Biblioteca
                            </button>
                          </form>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 select-none">
                          {media.map(item => (
                            <div
                              key={item.id}
                              className="group bg-slate-50 dark:bg-slate-850/40 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
                            >
                              <div className="aspect-video h-28 relative overflow-hidden bg-slate-200 dark:bg-slate-800">
                                <img
                                  src={item.url}
                                  alt={item.alt}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                                />
                                <div className="absolute top-2 right-2 flex gap-1 transform opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.url);
                                      triggerNotification("Link copiado para a área de transferência!");
                                    }}
                                    className="p-1.5 bg-white text-slate-800 dark:bg-slate-900 dark:text-white hover:bg-slate-100 rounded-md shadow-lg cursor-pointer"
                                    title="Copiar link exato"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMedia(item.id, item.title)}
                                    className="p-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-md shadow-lg cursor-pointer"
                                    title="Excluir Mídia"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="p-3">
                                <span className="font-bold text-[11px] block text-slate-800 dark:text-white truncate" title={item.title}>
                                  {item.title}
                                </span>
                                <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1 font-mono">
                                  <span>{item.size}</span>
                                  <span className="truncate max-w-[80px]" title={item.url}>
                                    {item.url.slice(-15)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Performance & Analytics tab */}
                    {adminTab === "analytics" && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 font-sans">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Relatórios de Engajamento & Feedback
                          </h2>
                          <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-bold px-2 py-1 rounded">
                            Dados Simulados e em Tempo Real
                          </span>
                        </div>

                        {/* Top metric overview cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/20 dark:border-blue-900/40 dark:bg-blue-950/25">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total de Visualizações</span>
                            <div className="flex items-center gap-2">
                              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <span className="text-2xl font-bold">{posts.reduce((sum, p) => sum + (p.views || 0), 0)}</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/20 dark:border-rose-900/40 dark:bg-rose-950/25">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total de Curtidas</span>
                            <div className="flex items-center gap-2">
                              <ThumbsUp className="w-5 h-5 text-rose-500" />
                              <span className="text-2xl font-bold">{posts.reduce((sum, p) => sum + (p.likes || 0), 0)}</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/25">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total de Comentários</span>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-2xl font-bold">{posts.reduce((sum, p) => sum + (p.comments || []).length, 0)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Rank stats grids */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Rank views */}
                          <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-55 dark:border-slate-800 pb-2">
                              <Eye className="w-3.5 h-3.5" /> Artigos Mais Acessados (Visualizações)
                            </h3>
                            <div className="space-y-3">
                              {[...posts].sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((p, idx) => (
                                <div key={p.id} className="space-y-1">
                                  <div className="flex justify-between text-xs font-semibold">
                                    <span className="truncate flex-1 text-slate-800 dark:text-slate-200">#{idx + 1} {p.title}</span>
                                    <span className="text-slate-500 shrink-0 select-none ml-2">{p.views || 0} views</span>
                                  </div>
                                  <div className="w-full bg-slate-150 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-blue-600 h-full rounded-full" 
                                      style={{ width: `${Math.min(100, Math.round(((p.views || 0) / Math.max(1, Math.max(...posts.map(x => x.views || 0)))) * 100))}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Rank likes */}
                          <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-55 dark:border-slate-800 pb-2">
                              <ThumbsUp className="w-3.5 h-3.5" /> Artigos Mais Curtidos
                            </h3>
                            <div className="space-y-3">
                              {[...posts].sort((a,b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5).map((p, idx) => (
                                <div key={p.id} className="space-y-1">
                                  <div className="flex justify-between text-xs font-semibold">
                                    <span className="truncate flex-1 text-slate-800 dark:text-slate-200">#{idx + 1} {p.title}</span>
                                    <span className="text-slate-500 shrink-0 select-none ml-2">{p.likes || 0} curtidas</span>
                                  </div>
                                  <div className="w-full bg-slate-150 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-rose-500 h-full rounded-full" 
                                      style={{ width: `${Math.min(100, Math.round(((p.likes || 0) / Math.max(1, Math.max(...posts.map(x => x.likes || 0)))) * 100))}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>

                        {/* Search Queries Feed */}
                        <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <Search className="w-3.5 h-3.5" /> Pesquisas Efetuadas pelos Leitores (Retorno das buscas)
                            </h3>
                            <button
                              onClick={() => {
                                setSearchHistory([]);
                                localStorage.removeItem("news_hub_searches");
                                triggerNotification("Histórico de pesquisas limpo!", "info");
                              }}
                              className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer"
                            >
                              Limpar Tudo
                            </button>
                          </div>
                          {searchHistory.length === 0 ? (
                            <p className="text-xs text-slate-400 py-3 text-center">Nenhuma palavra pesquisada ainda nesta sessão.</p>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {[...searchHistory].sort((a,b) => b.count - a.count).map((sh, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-850/40 p-2.5 rounded-lg border border-slate-150 dark:border-slate-800 flex justify-between items-center text-xs">
                                  <div className="truncate pr-1">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate" title={sh.term}>
                                      &quot;{sh.term}&quot;
                                    </span>
                                    <span className="text-[10px] text-slate-400 block font-light">última busca realizada</span>
                                  </div>
                                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold px-2 py-0.5 rounded shrink-0">
                                    {sh.count}x
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Global Comments Moderation Section */}
                        <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-50 dark:border-slate-800 pb-2">
                            Módulo de Moderação de Comentários (Ação Direta)
                          </h3>
                          
                          {/* Fetch all comments */}
                          {(() => {
                            const allComments: Array<{ postTitle: string; postId: string; comment: any }> = [];
                            posts.forEach(p => {
                              (p.comments || []).forEach(c => {
                                allComments.push({ postTitle: p.title, postId: p.id, comment: c });
                              });
                            });

                            if (allComments.length === 0) {
                              return <p className="text-xs text-slate-400 py-4 text-center">Nenhum comentário publicado no portal.</p>;
                            }

                            // Sort by date desc
                            allComments.sort((a,b) => new Date(b.comment.createdAt).getTime() - new Date(a.comment.createdAt).getTime());

                            return (
                              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-1">
                                {allComments.map(({ postTitle, postId, comment }) => (
                                  <div key={comment.id} className="py-3 flex justify-between items-start text-xs gap-4">
                                    <div className="space-y-1 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                          {comment.authorName}
                                        </span>
                                        <span className="text-[9px] text-slate-400">
                                          {new Date(comment.createdAt).toLocaleDateString("pt-BR")}
                                        </span>
                                        <span className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200/40 dark:border-slate-700/50 px-1.5 py-0.5 rounded italic truncate max-w-[150px]" title={postTitle}>
                                          No post: {postTitle}
                                        </span>
                                      </div>
                                      <p className="text-slate-600 dark:text-slate-300 leading-normal font-sans italic p-1 bg-slate-50/40 dark:bg-slate-900/40 rounded border border-slate-100/30 dark:border-slate-805/30">
                                        &ldquo;{comment.content}&rdquo;
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteComment(postId, comment.id)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded cursor-pointer"
                                      title="Excluir Comentário"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            )}

            {/* ARTIGO EDITOR - Dynamic Full Workspace */}
            {(isCreatingPost || editingPost) && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in font-sans">
                
                {/* Visual Editor Toolbar at top */}
                <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setIsCreatingPost(false);
                        setEditingPost(null);
                      }}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md cursor-pointer"
                      title="Sair do editor sem salvar"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>
                    <div>
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none select-none">
                        Editor de Blog
                      </h2>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                        {isCreatingPost ? "Criando Novo Artigo" : `Editando: ${postTitle || "Artigo"}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 select-none">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                      <button
                        onClick={() => setPostStatus("draft")}
                        className={`px-3 py-1 font-semibold rounded-md cursor-pointer transition-colors ${
                          postStatus === "draft"
                            ? "bg-white text-amber-600 dark:bg-slate-900"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        Salvar como Rascunho
                      </button>
                      <button
                        onClick={() => setPostStatus("published")}
                        className={`px-3 py-1 font-semibold rounded-md cursor-pointer transition-colors ${
                          postStatus === "published"
                            ? "bg-white text-emerald-600 dark:bg-slate-900"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        Publicar no Portal Live
                      </button>
                    </div>

                    <button
                      onClick={handleSavePost}
                      className="px-4 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-lg cursor-pointer shadow-xs font-sans"
                    >
                      Salvar Artigo
                    </button>
                  </div>
                </div>

                {/* Left Inputs Columns split form */}
                <div className="lg:col-span-12 space-y-4">
                  
                  {/* General details Card of form */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div>
                      <label className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest mb-1.5">Título do Post</label>
                      <input
                        type="text"
                        value={postTitle}
                        onChange={e => setPostTitle(e.target.value)}
                        placeholder="Insira um título chamativo..."
                        className="w-full p-2.5 text-sm font-semibold bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-lg dark:bg-slate-800/40 dark:border-slate-750 dark:text-white outline-none transition-colors"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
                      <div>
                        <label className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest mb-1.5">slug/rota-amigavel</label>
                        <input
                          type="text"
                          value={postSlug}
                          onChange={e => setPostSlug(e.target.value)}
                          placeholder="como-ia-esta-remodelando..."
                          className="w-full p-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg dark:bg-slate-800/40 dark:border-slate-755 dark:text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest mb-1.5">Categoria do Artigo</label>
                        <select
                          value={postCategoryId}
                          onChange={e => setPostCategoryId(e.target.value)}
                          className="w-full p-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg dark:bg-slate-800/40 dark:border-slate-750 dark:text-white outline-none"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest mb-1.5">Image de Capa (URL)</label>
                        <input
                          type="url"
                          value={postCoverImage}
                          onChange={e => setPostCoverImage(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full p-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg dark:bg-slate-800/40 dark:border-slate-755 dark:text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tags/Palavras-chave (Livre - Separado por Vírgula)</label>
                        <input
                          type="text"
                          value={postTagsString}
                          onChange={e => setPostTagsString(e.target.value)}
                          placeholder="Iniciacao, IA, UX, Tech, Design"
                          className="w-full p-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg dark:bg-slate-800/40 dark:border-slate-755 dark:text-white outline-none animate-fade-in"
                        />
                      </div>
                    </div>

                    {postCoverImage && (
                      <div className="rounded-lg overflow-hidden border border-slate-100 max-h-28 relative select-none">
                        <img src={postCoverImage} alt="Cover preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setPostCoverImage("")}
                          className="absolute top-2 right-2 p-1.5 bg-slate-900/60 text-white rounded-full hover:bg-slate-900 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Quick copy links helper from media library */}
                    <div className="bg-blue-50/50 dark:bg-slate-850 p-2.5 rounded-lg border border-blue-100/40 flex items-center justify-between text-[11px] text-blue-800 dark:text-blue-300 select-none">
                      <span>Deseja atribuir imagens da biblioteca cadastrada?</span>
                      <button
                        onClick={() => {
                          const randomMedia = media[Math.floor(Math.random() * media.length)];
                          if (randomMedia) {
                            setPostCoverImage(randomMedia.url);
                            triggerNotification("Capa carregada a partir da mídias gerais!");
                          } else {
                            triggerNotification("Cadastre ou utilize uma capa primeiro na Aba Mídias.", "info");
                          }
                        }}
                        className="font-bold underline text-[10px] cursor-pointer"
                      >
                        Carregar Mídia Aleatória
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest mb-1.5">Resumo Curto (Para Meta Description e Vitrines de busca)</label>
                      <textarea
                        value={postSummary}
                        onChange={e => setPostSummary(e.target.value)}
                        placeholder="Escreva uma breve sinopse de 2 a 3 frases sobre o artigo..."
                        rows={2}
                        className="w-full p-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg dark:bg-slate-800/40 dark:border-slate-755 dark:text-white outline-none font-sans"
                      />
                    </div>
                  </div>

                  {/* Body Editor with split side Live Preview */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col">
                    <div className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-xs select-none">
                      <span className="font-bold text-slate-600 dark:text-slate-350 flex items-center gap-1.5">
                        <FontIcon className="w-4 h-4 text-slate-400" />
                        Conteúdo do Artigo
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {postContent.length} Caracteres | ~{postContent.split(/\s+/).filter(Boolean).length} palavras
                      </span>
                    </div>

                    {/* Dual Mode Switcher Tab */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 p-1 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPostEditorMode("visual");
                          triggerNotification("Modo Editor Visual Ativado!");
                        }}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          postEditorMode === "visual"
                            ? "bg-white text-blue-600 dark:bg-slate-800 dark:text-blue-400 border border-slate-200/60 dark:border-slate-700 shadow-xs"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Editor Visual (Livre de Códigos)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPostEditorMode("code");
                          triggerNotification("Modo Código / Markdown Ativado.");
                        }}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          postEditorMode === "code"
                            ? "bg-white text-blue-600 dark:bg-slate-800 dark:text-blue-400 border border-slate-100 dark:border-slate-700 shadow-xs"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                        }`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Editor Código (Markdown)
                      </button>
                    </div>

                    {/* Rich Formatting Toolbar */}
                    <div className="bg-slate-50/80 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                      {/* Basic styles group */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 mr-1 select-none flex items-center gap-1">
                          Estilos:
                        </span>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormatAction("bold")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 font-bold cursor-pointer transition-colors shadow-xs"
                          title="Negrito (**texto**)"
                        >
                          <Bold className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="hidden sm:inline text-[11px]">Negrito</span>
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormatAction("italic")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 italic cursor-pointer transition-colors shadow-xs"
                          title="Itálico (*texto*)"
                        >
                          <Italic className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="hidden sm:inline text-[11px]">Itálico</span>
                        </button>

                        <span className="h-4 w-px bg-slate-250 dark:bg-slate-700 mx-1 block" />

                        {/* Format headings options */}
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormatAction("h1")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 font-extrabold cursor-pointer transition-colors shadow-xs text-[11px]"
                          title="Título Principal"
                        >
                          Título
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormatAction("h2")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 font-bold cursor-pointer transition-colors shadow-xs text-[11px]"
                          title="Subtítulo"
                        >
                          Subtítulo
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormatAction("p")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 font-normal cursor-pointer transition-colors shadow-xs text-[11px]"
                          title="Texto Normal"
                        >
                          Texto Normal
                        </button>

                        <span className="h-4 w-px bg-slate-250 dark:bg-slate-700 mx-1 block" />

                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormatAction("bullet")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-745 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          title="Lista Marcadores (- Item)"
                        >
                          <List className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="hidden sm:inline text-[11px]">Lista</span>
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormatAction("number")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-745 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          title="Lista Numérica (1. Item)"
                        >
                          <ListOrdered className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="hidden sm:inline text-[11px]">Numeração</span>
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormatAction("line")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-745 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          title="Linha Divisória (---)"
                        >
                          <Minus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="hidden sm:inline text-[11px]">Linha</span>
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleFormatAction("quote")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-745 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          title="Citação (> Texto)"
                        >
                          <Quote className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="hidden sm:inline text-[11px]">Citação</span>
                        </button>
                      </div>

                      {/* Color palette group */}
                      <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                        <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 hidden md:flex select-none">
                          <Palette className="w-3 h-3" /> Cores:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 overflow-visible">
                          {[
                            { color: "#ef4444", label: "Vermelho", bgClass: "bg-red-500" },
                            { color: "#10b981", label: "Verde", bgClass: "bg-emerald-500" },
                            { color: "#3b82f6", label: "Azul", bgClass: "bg-blue-500" },
                            { color: "#f59e0b", label: "Laranja", bgClass: "bg-amber-500" },
                            { color: "#8b5cf6", label: "Roxo", bgClass: "bg-purple-500" },
                            { color: "#ec4899", label: "Rosa", bgClass: "bg-pink-500" },
                            { color: "inherit", label: "Cor Padrão (Auto)", bgClass: "bg-gradient-to-r from-white via-slate-400 to-black border-slate-300 dark:border-slate-600" },
                          ].map((c) => (
                            <button
                              key={c.color}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleFormatAction("color", false, c.color)}
                              className={`w-5 h-5 rounded-full ${c.bgClass} border border-white dark:border-slate-850 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs`}
                              title={`Colorir em ${c.label}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
 
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                      
                      {/* Editor Fields Zone block based on toggled Mode */}
                      {postEditorMode === "visual" ? (
                        <div className="p-5 w-full">
                          <RichVisualEditor
                            ref={visualPostRef}
                            value={postContent}
                            onChange={setPostContent}
                            placeholder="Comece a escrever seu artigo aqui..."
                            className="text-sm"
                          />
                        </div>
                      ) : (
                        <textarea
                          ref={postContentRef}
                          value={postContent}
                          onChange={e => setPostContent(e.target.value)}
                          placeholder="# Escreva seu título aqui&#10;&#10;Use subtítulos para organizar suas seções (Ex: ## 1. Introdução).&#10;&#10;* Use itens de lista;&#10;* Adicione blocos de códigos TypeScript usando triplo crase;&#10;* Faça anotações e citações com o sinal > antes do texto."
                          rows={22}
                          className="p-4 text-xs font-mono bg-white text-slate-800 border-none outline-none dark:bg-slate-900 dark:text-slate-100 placeholder-slate-400 font-normal focus:ring-0 leading-relaxed resize-y select-text min-h-[460px]"
                        />
                      )}

                      {/* Side-by-Side Dynamic Markdown / HTML Preview */}
                      <div className="p-4 bg-slate-50/30 dark:bg-slate-900/20 overflow-y-auto max-h-[460px] md:max-h-[580px] min-h-[460px]" select-text="true">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-3 select-none">Pré-Visualização ao Vivo</span>
                        <div className="prose dark:prose-invert max-w-none">
                          <MarkdownPreview content={postContent} forceHtml={postEditorMode === "visual"} />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Manual SEO Fields section */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5 select-none">
                      <Settings className="w-4 h-4 opacity-70" /> tags de otimização de busca seo (google)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] block font-bold text-slate-450 uppercase tracking-widest mb-1.5">Seo Title &lt;title&gt;</label>
                        <input
                          type="text"
                          value={postSeoTitle}
                          onChange={e => setPostSeoTitle(e.target.value)}
                          placeholder="Insira um título otimizado para as buscas Google"
                          className="w-full p-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg dark:bg-slate-800/40 dark:border-slate-755 dark:text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] block font-bold text-slate-450 uppercase tracking-widest mb-1.5">Meta Description</label>
                        <input
                          type="text"
                          value={postSeoDescription}
                          onChange={e => setPostSeoDescription(e.target.value)}
                          placeholder="Insira uma síntese para pesquisas (máximo 160 caracteres)"
                          className="w-full p-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg dark:bg-slate-800/40 dark:border-slate-755 dark:text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column: AI Writing Assistant Tools Panel (Disabled on request) */}
                <div className="hidden">
                  
                  <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-6 space-y-5 shadow-lg relative overflow-hidden select-none">
                    
                    {/* Glowing aesthetic vector banner background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full filter blur-xl select-none" />

                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                      <div>
                        <h3 className="text-sm font-bold tracking-tight uppercase">Copiloto Gemini AI</h3>
                        <p className="text-[10px] text-slate-400">Escreva, otimize e analise com Inteligência</p>
                      </div>
                    </div>

                    {/* AI Actions selector tabs */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Escolha a Rotina da IA</label>
                      <div className="grid grid-cols-2 gap-1 bg-slate-800 p-1 rounded-lg text-[10px]">
                        <button
                          onClick={() => { setAiAction("generate"); setAiResult(""); }}
                          className={`py-1.5 text-center font-bold rounded cursor-pointer ${aiAction === "generate" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                        >
                          Gerar Artigo
                        </button>
                        <button
                          onClick={() => { setAiAction("improve"); setAiResult(""); }}
                          className={`py-1.5 text-center font-bold rounded cursor-pointer ${aiAction === "improve" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                        >
                          Melhorar Texto
                        </button>
                        <button
                          onClick={() => { setAiAction("summarize"); setAiResult(""); }}
                          className={`py-1.5 text-center font-bold rounded cursor-pointer ${aiAction === "summarize" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                        >
                          Gerar Resumo
                        </button>
                        <button
                          onClick={() => { setAiAction("seo_suggest"); setAiResult(""); }}
                          className={`py-1.5 text-center font-bold rounded cursor-pointer ${aiAction === "seo_suggest" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                        >
                          Audit SEO
                        </button>
                        <button
                          onClick={() => { setAiAction("translate"); setAiResult(""); }}
                          className={`py-1.5 text-center font-bold rounded cursor-pointer ${aiAction === "translate" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                        >
                          Traduzir
                        </button>
                        <button
                          onClick={() => { setAiAction("tone"); setAiResult(""); }}
                          className={`py-1.5 text-center font-bold rounded cursor-pointer ${aiAction === "tone" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                        >
                          Tom & Ritmo
                        </button>
                      </div>
                    </div>

                    {/* Dynamic prompts input according to action */}
                    {aiAction === "generate" && (
                      <div className="space-y-2 animate-fade-in">
                        <label className="text-[10px] font-bold text-slate-400 block">Qual tema ou instrução deseja que a IA desenhe?</label>
                        <textarea
                          value={aiPrompt}
                          onChange={e => setAiPrompt(e.target.value)}
                          placeholder="Ex: Crie um artigo explicando de forma simples a Lei de Moore e o futuro dos semicondutores. Escreva com subtítulos e dê exemplos didáticos."
                          rows={4}
                          className="w-full p-2.5 text-xs bg-slate-800 text-white rounded-lg border border-slate-700 outline-none"
                        />
                      </div>
                    )}

                    {aiAction === "translate" && (
                      <div className="space-y-2 animate-fade-in">
                        <label className="text-[10px] font-bold text-slate-400 block">Idioma de Destino</label>
                        <select
                          value={aiTargetLanguage}
                          onChange={e => setAiTargetLanguage(e.target.value)}
                          className="w-full text-xs p-2 bg-slate-800 text-white rounded border border-slate-700"
                        >
                          <option value="Inglês">Inglês (Standard)</option>
                          <option value="Espanhol">Espanhol (Castelhano)</option>
                          <option value="Francês">Francês</option>
                          <option value="Alemão">Alemão</option>
                          <option value="Italiano">Italiano</option>
                        </select>
                        <p className="text-[9px] text-slate-500">A IA lerá o texto do editor de posts e recriará uma cópia completa no idioma acima.</p>
                      </div>
                    )}

                    {aiAction === "improve" && (
                      <p className="text-[10px] text-slate-400 leading-normal animate-fade-in">
                        A IA irá reescrever o conteúdo presente no editor principal corrigindo falhas de português, polindo a retórica e refinando o tom para ser altamente profissional.
                      </p>
                    )}

                    {aiAction === "summarize" && (
                      <p className="text-[10px] text-slate-400 leading-normal animate-fade-in">
                        Gere um resumo executivo chamativo e perfeito de no máximo 3 frases com base no seu artigo atual para preencher o campo Resumo.
                      </p>
                    )}

                    {aiAction === "seo_suggest" && (
                      <p className="text-[10px] text-slate-400 leading-normal animate-fade-in">
                        O Gemini analisará as palavras do seu artigo e sugerirá termos-chave estratégicos, títulos que aumentem cliques no Google e dicas estruturais de conteúdo.
                      </p>
                    )}

                    {aiAction === "tone" && (
                      <p className="text-[10px] text-slate-400 leading-normal animate-fade-in">
                        Realize um scan expressivo para descobrir os sentimentos transmitidos pela sua escrita, tempo previsto de leitura para os visitantes e pontos a otimizar.
                      </p>
                    )}

                    {/* Submit Button Trigger */}
                    <button
                      onClick={runAiAssistant}
                      disabled={aiLoading}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-blue-800 disabled:opacity-50 transition-colors select-none font-sans"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Redigindo Inteligência...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Acionar Assistente Editorial
                        </>
                      )}
                    </button>

                    {/* Show results card inside pane */}
                    {(aiResult || aiStructuredSeo || aiStructuredTone || aiError) && (
                      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 text-xs space-y-3 animate-fade-in max-h-72 overflow-y-auto">
                        <div className="flex justify-between items-center select-none">
                          <span className="font-mono text-[9px] font-bold text-blue-400 uppercase tracking-widest">Resultado do Processamento</span>
                          <button
                            onClick={() => {
                              setAiResult("");
                              setAiStructuredSeo(null);
                              setAiStructuredTone(null);
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {aiError && (
                          <div className="text-rose-450 p-2 border border-rose-900 bg-rose-950/20 rounded">
                            {aiError}
                          </div>
                        )}

                        {aiResult && (
                          <div className="space-y-2 select-text">
                            <pre className="bg-slate-930 p-2.5 rounded text-[10px] font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto text-slate-200">
                              {aiResult}
                            </pre>
                            <button
                              onClick={applyAiResultToEditor}
                              className="w-full py-1.5 bg-slate-700 hover:bg-slate-650 text-[10px] font-bold text-white rounded cursor-pointer select-none font-sans"
                            >
                              Aplicar Alterações ao Artigo &darr;
                            </button>
                          </div>
                        )}

                        {/* Structured SEO Output design representation */}
                        {aiAction === "seo_suggest" && aiStructuredSeo && (
                          <div className="space-y-3 select-text">
                            <div>
                              <span className="text-[9px] block text-slate-400 uppercase font-mono font-bold">Título Sugerido</span>
                              <span className="font-semibold text-slate-200 text-[11px] block mt-0.5">{aiStructuredSeo.seoTitle}</span>
                            </div>
                            <div>
                              <span className="text-[9px] block text-slate-400 uppercase font-mono font-bold">Meta-Descrição</span>
                              <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">{aiStructuredSeo.metaDescription}</p>
                            </div>
                            <div>
                              <span className="text-[9px] block text-slate-400 uppercase font-mono font-bold">Palavras-chave extraídas</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {aiStructuredSeo.suggestedTags?.map((t, idx) => (
                                  <span key={idx} className="bg-blue-950/40 text-blue-300 border border-blue-900 text-[9px] px-1.5 py-0.5 rounded">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="p-2 border border-yellow-900/40 bg-yellow-950/10 rounded-md text-[10px] text-yellow-300">
                              <strong>Dica SEO:</strong> {aiStructuredSeo.seoTips}
                            </div>
                            <button
                              onClick={applyAiResultToEditor}
                              className="w-full py-1.5 bg-slate-700 hover:bg-slate-650 text-[10px] font-bold text-white rounded cursor-pointer select-none font-sans"
                            >
                              Aplicar Metatags geradas ao Post
                            </button>
                          </div>
                        )}

                        {/* Structured Tone outputs representation */}
                        {aiAction === "tone" && aiStructuredTone && (
                          <div className="space-y-3 select-text">
                            <div>
                              <span className="text-[9px] block text-slate-400 uppercase font-mono font-bold">Tons Sentimentais Declarados</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {aiStructuredTone.tones?.map((t, idx) => (
                                  <span key={idx} className="bg-purple-950/40 text-purple-300 border border-purple-900 text-[10px] px-2 py-0.5 rounded-full">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-700">
                              <span className="text-slate-450">Tempo Estimado de Leitura:</span>
                              <span className="font-bold text-slate-200">{aiStructuredTone.readTimeMinutes} min</span>
                            </div>
                            <div className="pt-1.5">
                              <span className="text-[9px] block text-slate-400 uppercase font-mono font-bold">Feedback e Crítica Construtiva</span>
                              <p className="text-slate-300 leading-normal mt-1">{aiStructuredTone.constructiveCritique}</p>
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}

            {/* STATIC PAGE EDITOR VIEW */}
            {(isCreatingPage || editingPage) && (
              <div className="space-y-6 animate-fade-in font-sans">
                
                {/* Visual Editor Toolbar at top */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3 select-none">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsCreatingPage(false);
                        setEditingPage(null);
                      }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded cursor-pointer"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>
                    <div>
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                        Editor de Página Estática
                      </h2>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                        {isCreatingPage ? "Instanciando Nova Página" : `Modificando: ${pageTitle || "Página"}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSavePage}
                      className="px-4 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-lg cursor-pointer shadow-xs"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest mb-1.5">Título da Página</label>
                      <input
                        type="text"
                        value={pageTitle}
                        onChange={e => setPageTitle(e.target.value)}
                        placeholder="Ex: Sobre o Projeto"
                        className="w-full p-2.5 text-sm font-semibold bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-lg dark:bg-slate-800/40 dark:border-slate-750 dark:text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest mb-1.5">URL Rota Amigável</label>
                      <input
                        type="text"
                        value={pageSlug}
                        onChange={e => setPageSlug(e.target.value)}
                        placeholder="sobre-o-projeto"
                        className="w-full p-2.5 text-sm bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-lg dark:bg-slate-800/40 dark:border-slate-755 dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest">Conteúdo do Artigo / Página</label>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col bg-white dark:bg-slate-900">
                      
                      {/* Dual Mode Switcher Tab */}
                      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPageEditorMode("visual");
                            triggerNotification("Modo Editor Visual Ativado!");
                          }}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            pageEditorMode === "visual"
                              ? "bg-white text-blue-600 dark:bg-slate-800 dark:text-blue-400 border border-slate-200/60 dark:border-slate-700 shadow-xs"
                              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Editor Visual (Livre de Códigos)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPageEditorMode("code");
                            triggerNotification("Modo Código / Markdown Ativado.");
                          }}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            pageEditorMode === "code"
                              ? "bg-white text-blue-600 dark:bg-slate-800 dark:text-blue-400 border border-slate-100 dark:border-slate-700 shadow-xs"
                              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                          }`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Editor Código (Markdown)
                        </button>
                      </div>

                      {/* Rich Formatting Toolbar */}
                      <div className="bg-slate-50/80 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                        {/* Basic styles group */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase text-slate-400 mr-1 select-none flex items-center gap-1">
                            Estilos:
                          </span>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleFormatAction("bold", true)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 font-bold cursor-pointer transition-colors shadow-xs"
                            title="Negrito (**texto**)"
                          >
                            <Bold className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="hidden sm:inline text-[11px]">Negrito</span>
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleFormatAction("italic", true)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 italic cursor-pointer transition-colors shadow-xs"
                            title="Itálico (*texto*)"
                          >
                            <Italic className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="hidden sm:inline text-[11px]">Itálico</span>
                          </button>

                          <span className="h-4 w-px bg-slate-250 dark:bg-slate-700 mx-1 block" />

                          {/* Font Size Headings block */}
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleFormatAction("h1", true)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 font-extrabold cursor-pointer transition-colors shadow-xs text-[11px]"
                            title="Título Principal"
                          >
                            Título
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleFormatAction("h2", true)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 font-bold cursor-pointer transition-colors shadow-xs text-[11px]"
                            title="Subtítulo"
                          >
                            Subtítulo
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleFormatAction("p", true)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 font-normal cursor-pointer transition-colors shadow-xs text-[11px]"
                            title="Texto Normal"
                          >
                            Texto Normal
                          </button>

                          <span className="h-4 w-px bg-slate-250 dark:bg-slate-700 mx-1 block" />

                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleFormatAction("bullet", true)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-745 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                            title="Lista Marcadores (- Item)"
                          >
                            <List className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="hidden sm:inline text-[11px]">Lista</span>
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleFormatAction("number", true)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-745 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                            title="Lista Numérica (1. Item)"
                          >
                            <ListOrdered className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="hidden sm:inline text-[11px]">Numeração</span>
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleFormatAction("line", true)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-745 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                            title="Linha Divisória (---)"
                          >
                            <Minus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="hidden sm:inline text-[11px]">Linha</span>
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleFormatAction("quote", true)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-745 border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                            title="Citação (> Texto)"
                          >
                            <Quote className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="hidden sm:inline text-[11px]">Citação</span>
                          </button>
                        </div>

                        {/* Color palette group */}
                        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 hidden md:flex select-none">
                            <Palette className="w-3 h-3" /> Cores:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 overflow-visible">
                            {[
                              { color: "#ef4444", label: "Vermelho", bgClass: "bg-red-500" },
                              { color: "#10b981", label: "Verde", bgClass: "bg-emerald-500" },
                              { color: "#3b82f6", label: "Azul", bgClass: "bg-blue-500" },
                              { color: "#f59e0b", label: "Laranja", bgClass: "bg-amber-500" },
                              { color: "#8b5cf6", label: "Roxo", bgClass: "bg-purple-500" },
                              { color: "#ec4899", label: "Rosa", bgClass: "bg-pink-500" },
                              { color: "inherit", label: "Cor Padrão (Auto)", bgClass: "bg-gradient-to-r from-white via-slate-400 to-black border-slate-300 dark:border-slate-600" },
                            ].map((c) => (
                              <button
                                key={c.color}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleFormatAction("color", true, c.color)}
                                className={`w-5 h-5 rounded-full ${c.bgClass} border border-white dark:border-slate-850 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs`}
                                title={`Colorir em ${c.label}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
   
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-150 dark:divide-slate-800">
                        {pageEditorMode === "visual" ? (
                          <div className="p-5 w-full">
                            <RichVisualEditor
                              ref={visualPageRef}
                              value={pageContent}
                              onChange={setPageContent}
                              placeholder="Comece a escrever sua página..."
                              className="text-sm"
                            />
                          </div>
                        ) : (
                          <textarea
                            ref={pageContentRef}
                            value={pageContent}
                            onChange={e => setPageContent(e.target.value)}
                            placeholder="# Sobre Nossa Empresa&#10;&#10;Escreva informações institucionais, valores e links comerciais utilizando formatação de listas ou títulos tradicionais."
                            rows={16}
                            className="p-4 text-xs font-mono bg-white text-slate-800 border-none outline-none dark:bg-slate-900 dark:text-slate-100 placeholder-slate-400 font-normal focus:ring-0 leading-relaxed resize-y select-text min-h-[360px]"
                          />
                        )}
                        <div className="p-4 bg-slate-50/20 dark:bg-slate-900/10 overflow-y-auto max-h-[360px]" select-text="true">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 select-none">Pré-visualização da Página</span>
                          <MarkdownPreview content={pageContent} forceHtml={pageEditorMode === "visual"} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Humble Elegant Footer bar representation */}
      <footer id="cms_footer" className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-12 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          <p className="font-sans">
            &copy; 2026 NewsHub. Todos os direitos reservados. Alimentado por <strong>GCP e React</strong>.
          </p>
        </div>
      </footer>

    </div>
  );
}
