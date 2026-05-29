import React, { useState, useEffect } from "react";
import { 
  Search, 
  ChevronLeft, 
  ArrowRight, 
  BookOpen, 
  Calendar, 
  HelpCircle, 
  User, 
  Award, 
  Home, 
  FileText, 
  Heart, 
  MessageSquare, 
  Eye 
} from "lucide-react";
import { Post, Category, Page } from "../types";
import MarkdownPreview from "./MarkdownPreview";

interface BlogPreviewModeProps {
  posts: Post[];
  categories: Category[];
  pages?: Page[];
  userRole?: "admin" | "reader" | null;
  isRegistered?: boolean;
  onPostViewed?: (postId: string) => void;
  onPostLiked?: (postId: string) => void;
  onCommentAdded?: (postId: string, authorName: string, content: string) => void;
  onCommentDeleted?: (postId: string, commentId: string) => void;
  onSearched?: (term: string) => void;
}

export default function BlogPreviewMode({ 
  posts, 
  categories, 
  pages = [], 
  userRole = null,
  isRegistered = false,
  onPostViewed,
  onPostLiked,
  onCommentAdded,
  onCommentDeleted,
  onSearched 
}: BlogPreviewModeProps) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Comment subfields holding draft inputs
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");

  // Only show published articles in the main blog preview stream
  const publishedPosts = posts.filter(p => p.status === "published");
  // Only show published pages
  const publishedPages = pages.filter(p => p.status === "published");

  // Automatically log reader searches with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    const handler = setTimeout(() => {
      onSearched?.(searchQuery);
    }, 1250);
    return () => clearTimeout(handler);
  }, [searchQuery, onSearched]);

  // Filter list
  const filteredPosts = publishedPosts.filter(post => {
    const matchesCategory = selectedCategoryId === "all" || post.categoryId === selectedCategoryId;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategory = (catId: string) => categories.find(c => c.id === catId);

  const activePost = publishedPosts.find(p => p.id === selectedPostId);
  const activePage = publishedPages.find(p => p.id === selectedPageId);

  const currentUser = localStorage.getItem("news_hub_username") || "Visitante";
  const userRoleKey = localStorage.getItem("news_hub_role");
  const isUserRegistered = localStorage.getItem("news_hub_registered") === "true";
  const canInteract = userRoleKey === "admin" || isUserRegistered;

  const likeKey = activePost ? `liked_${currentUser}_${activePost.id}` : "";
  const alreadyLiked = activePost ? localStorage.getItem(likeKey) === "true" : false;

  const selectPost = (postId: string) => {
    setSelectedPostId(postId);
    onPostViewed?.(postId);
    
    // Auto populate logged in username if available
    const loggedName = localStorage.getItem("news_hub_username");
    if (loggedName && loggedName !== "Visitante" && loggedName !== "Visitante Anônimo") {
      setCommentAuthor(loggedName);
    } else if (!commentAuthor) {
      setCommentAuthor("");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen rounded-xl border border-gray-100 dark:border-gray-900 overflow-hidden shadow-sm flex flex-col font-sans select-none">
      {/* Blog Simulator Header Bar */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-40 select-none">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-lg shadow-xs select-none">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-display">
              NewsHub Portal do Leitor
            </h1>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
              PREVIEW DA PÁGINA PÚBLICA (Simulação de Leitor)
            </p>
          </div>
        </div>

        {!selectedPostId && !selectedPageId && (
          <div className="flex items-center gap-2 max-w-xs w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Pesquisar artigos..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-lg outline-none transition-colors"
              />
            </div>
          </div>
        )}
      </header>

      {/* Blog Simulator Secondary Navigation Menu for Pages */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800 px-6 py-2 flex items-center justify-between text-xs select-none flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setSelectedPageId(null);
              setSelectedPostId(null);
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition-all ${
              !selectedPostId && !selectedPageId
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs scale-102"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Vitrinas / Blog
          </button>

          {publishedPages.map(page => (
            <button
              key={page.id}
              onClick={() => {
                setSelectedPageId(page.id);
                setSelectedPostId(null);
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition-all ${
                selectedPageId === page.id
                  ? "bg-blue-600 text-white shadow-xs scale-102"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {page.title}
            </button>
          ))}
        </div>

        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded border border-emerald-500/20 flex items-center gap-1.5 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 inline-block" />
          Modo Leitor Ativo 🌐
        </span>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full select-text">
        {activePage ? (
          // Static Page Render View
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-in p-6 md:p-10 space-y-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest pl-1 block mb-1 font-mono">
                Página Estática (/p/{activePage.slug})
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight leading-tight">
                {activePage.title}
              </h2>
            </div>
            
            <div className="prose prose-blue dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed font-sans">
              <MarkdownPreview content={activePage.content} />
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center flex-wrap gap-2">
              <button
                onClick={() => setSelectedPageId(null)}
                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 font-bold py-1.5 px-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar à Vitrine Principal
              </button>
              
              <span className="text-[10px] text-gray-400 font-mono">
                Criada via painel administrativo
              </span>
            </div>
          </div>
        ) : activePost ? (
          // Individual View
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-in">
            {/* Top Toolbar / Go Back */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex justify-between items-center">
              <button
                onClick={() => setSelectedPostId(null)}
                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 font-semibold py-1 px-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar à vitrine
              </button>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                <span>Slug: /{activePost.slug}</span>
              </div>
            </div>

            {/* Cover Image Banner */}
            {activePost.coverImage ? (
              <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <img
                   src={activePost.coverImage}
                   alt={activePost.title}
                   referrerPolicy="no-referrer"
                   className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-gray-950/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  {getCategory(activePost.categoryId) && (
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-2 ${getCategory(activePost.categoryId)?.color}`}>
                      {getCategory(activePost.categoryId)?.name}
                    </span>
                  )}
                  <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight drop-shadow-sm leading-tight">
                    {activePost.title}
                  </h2>
                </div>
              </div>
            ) : (
              <div className="p-8 border-b border-gray-100 dark:border-gray-800">
                {getCategory(activePost.categoryId) && (
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-2 ${getCategory(activePost.categoryId)?.color}`}>
                    {getCategory(activePost.categoryId)?.name}
                  </span>
                )}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {activePost.title}
                </h2>
              </div>
            )}

            {/* Metadata and Content Layout Split */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-6 md:p-8">
              {/* Sidebar metadata */}
              <div className="lg:border-r lg:border-gray-100 lg:dark:border-gray-800 lg:pr-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-550 font-semibold text-sm">
                    R
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">Redação Editorial</span>
                    <span className="text-[10px] text-gray-400 block uppercase">Produtor Autorizado</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-gray-5 border-slate-100 dark:border-gray-800">
                    <span className="text-gray-400 flex items-center gap-1 font-normal"><Calendar className="w-3.5 h-3.5" /> Publicado em</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {activePost.publishedAt ? new Date(activePost.publishedAt).toLocaleDateString("pt-BR") : "Recentemente"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-5 border-slate-100 dark:border-gray-800">
                    <span className="text-gray-400 flex items-center gap-1 font-normal"><BookOpen className="w-3.5 h-3.5" /> Estimativa</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">~{Math.ceil(activePost.content.split(/\s+/).length / 200)} min de leitura</span>
                  </div>
                  {userRoleKey === "admin" && (
                    <div className="flex justify-between py-1.5 border-b border-gray-5 border-slate-100 dark:border-gray-800">
                      <span className="text-gray-400 flex items-center gap-1 font-normal"><Eye className="w-3.5 h-3.5" /> Visualizações</span>
                      <span className="text-gray-700 dark:text-gray-300 font-bold">{activePost.views || 0}</span>
                    </div>
                  )}
                </div>

                {activePost.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 select-none">Palavras-chave</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activePost.tags.map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-[10px] px-2 py-0.5 rounded font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Simulated SEO Card - Informational metadata for authors safety */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-lg border border-gray-150 dark:border-gray-800/50">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-widest mb-1 select-none">SEO Meta Tag Preview</span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block line-clamp-1 select-text">
                    {activePost.seoTitle || activePost.title}
                  </span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 select-text">
                    {activePost.seoDescription || activePost.summary}
                  </p>
                </div>
              </div>

              {/* Central Content Area */}
              <div className="lg:col-span-3 space-y-8">
                <div className="prose prose-blue dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                  <MarkdownPreview content={activePost.content} />
                </div>

                {/* Likes Action Bar & Statistics */}
                <div className="pt-6 border-t border-gray-150 dark:border-gray-850 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1 text-slate-800 dark:text-slate-100">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> 
                      {activePost.likes || 0} curtiram isto
                    </span>
                  </div>

                  {!canInteract ? (
                    <button
                      disabled
                      className="flex items-center gap-2 text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-bold px-4 py-2 rounded-lg cursor-not-allowed select-none border border-gray-200/50 dark:border-gray-750"
                      title="Registre seu nome na tela de login para curtir"
                    >
                      <Heart className="w-4 h-4 text-gray-400" /> Curtida indisponível (Sem Cadastro)
                    </button>
                  ) : alreadyLiked ? (
                    <button
                      disabled
                      className="flex items-center gap-2 text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold px-4 py-2 rounded-lg cursor-default select-none border border-emerald-100/30"
                      title="Você já curtiu este artigo"
                    >
                      <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" /> Você já curtiu!
                    </button>
                  ) : (
                    <button
                      onClick={() => onPostLiked?.(activePost.id)}
                      className="flex items-center gap-2 text-xs bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold px-4 py-2 rounded-lg cursor-pointer transition select-none border border-rose-100/30"
                    >
                      <Heart className="w-4 h-4 text-rose-500" /> Curtir Artigo
                    </button>
                  )}
                </div>

                {/* Comments Section */}
                <div className="pt-8 border-t border-gray-150 dark:border-gray-850 space-y-6">
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <MessageSquare className="w-4  h-4 text-emerald-500" />
                    Comentários dos Leitores ({(activePost.comments || []).length})
                  </h3>

                  {/* Add comment Form */}
                  {!canInteract ? (
                    <div className="bg-amber-500/10 dark:bg-amber-950/10 p-5 rounded-xl border border-amber-500/20 text-center space-y-2">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-400 font-display">
                        ⚠️ Modo de Leitura Privada (Sem Cadastro)
                      </p>
                      <p className="text-[11px] text-amber-700/90 dark:text-amber-300 max-w-md mx-auto leading-relaxed">
                        Sua sessão foi aberta sem cadastro. Para poder curtir artigos e publicar comentários transparentes, lembre-se de sair da sessão e usar a opção <strong>"Criar Cadastro"</strong> identificada!
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-150 dark:border-gray-850 space-y-3">
                      <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Escrever um Comentário</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-gray-400 block mb-1 font-bold uppercase tracking-widest flex items-center gap-1">
                            Seu Nome / Identificação <span className="text-emerald-600 font-bold">(🔒 Validado & Vinculado)</span>
                          </label>
                          <input
                            type="text"
                            required
                            disabled
                            value={currentUser}
                            className="w-full text-xs p-2 rounded border border-gray-200 dark:border-gray-800 bg-gray-200/60 dark:bg-slate-900/80 font-bold text-gray-650 dark:text-gray-300 outline-none cursor-not-allowed select-none"
                            title="Seu nome está validado e vinculado ao seu cadastro ativo de leitor."
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-400 block mb-1 font-bold uppercase tracking-widest">Comentário</label>
                        <textarea
                          required
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          placeholder="O que achou desta publicação? Publique seu comentário transparente..."
                          rows={3}
                          className="w-full text-xs p-2 rounded border border-gray-250 dark:border-gray-750 bg-white dark:bg-gray-900 dark:text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (!commentText.trim()) return;
                          onCommentAdded?.(activePost.id, currentUser, commentText.trim());
                          setCommentText("");
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer select-none transition-all active:scale-98"
                      >
                        Enviar Comentário
                      </button>
                    </div>
                  )}

                  {/* Comments Feed list */}
                  <div className="space-y-3">
                    {(!activePost.comments || activePost.comments.length === 0) ? (
                      <p className="text-xs text-gray-400 italic py-2 pl-1">Nenhum comentário enviado ainda. Seja o primeiro a opinar!</p>
                    ) : (
                      [...activePost.comments].map(comm => (
                        <div key={comm.id} className="p-4 bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-850 rounded-xl flex justify-between items-start gap-4 shadow-3xs hover:shadow-2xs transition">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 font-bold text-xs">
                              <span className="text-gray-800 dark:text-gray-100">{comm.authorName}</span>
                              <span className="text-[9px] text-gray-400 font-mono font-light">
                                {comm.createdAt ? new Date(comm.createdAt).toLocaleDateString("pt-BR") : "Recentemente"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-655 dark:text-gray-350 leading-relaxed font-sans italic pl-1 border-l-2 border-slate-300 dark:border-slate-700">
                              &ldquo;{comm.content}&rdquo;
                            </p>
                          </div>
                          {userRole === "admin" && (
                            <button
                              onClick={() => {
                                if (window.confirm("Deseja realmente excluir este comentário?")) {
                                  onCommentDeleted?.(activePost.id, comm.id);
                                }
                              }}
                              className="text-[10px] text-rose-500 hover:underline hover:text-rose-700 font-bold cursor-pointer shrink-0"
                            >
                              Excluir Comentário (Moderação)
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Stream Display
          <div className="space-y-6">
            {/* Category Filtration Bar */}
            <div className="flex flex-wrap items-center gap-2 select-none">
              <button
                onClick={() => setSelectedCategoryId("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedCategoryId === "all"
                    ? "bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900"
                    : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 border border-gray-150 dark:border-gray-800"
                }`}
              >
                Todas as categorias
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                    selectedCategoryId === cat.id
                      ? `${cat.color} opacity-100 shadow-xs scale-102`
                      : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 border-gray-150 dark:border-gray-800 opacity-70"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {filteredPosts.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-800">
                <HelpCircle className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">Nenhum artigo publicado encontrado</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                  Apenas artigos com status setado como &quot;Publicado&quot; são visíveis nesta simulação da vitrine pública de leitores. Crie ou publique um post para vê-lo aqui!
                </p>
              </div>
            ) : (
              // Posts List Feed
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map(post => {
                  const cat = getCategory(post.categoryId);
                  return (
                    <article
                      key={post.id}
                      onClick={() => selectPost(post.id)}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        {/* Cover image thumbnail */}
                        {post.coverImage ? (
                          <div className="h-44 w-full overflow-hidden relative">
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                            />
                            {cat && (
                              <span className={`absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shadow-sm ${cat.color}`}>
                                {cat.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="h-44 w-full bg-linear-to-br from-blue-50 to-indigo-50 dark:from-sky-950/20 dark:to-indigo-950/20 flex flex-col justify-center p-6 relative">
                            {cat && (
                              <span className={`absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-gray-100 ${cat.color}`}>
                                {cat.name}
                              </span>
                            )}
                            <div className="text-blue-500/10 dark:text-blue-400/5 font-bold text-4xl leading-none italic font-serif">
                              Layout
                            </div>
                          </div>
                        )}

                        {/* Article Intro Content */}
                        <div className="p-5">
                          <h3 className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight line-clamp-2 leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-3 font-normal leading-relaxed">
                            {post.summary}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer info with Likes, Comments count & Views */}
                      <div className="px-5 pb-5 pt-3 border-t border-gray-50 dark:border-gray-800/40 flex justify-between items-center text-[10px] text-gray-400">
                        <div className="flex items-center gap-2.5 font-mono">
                          {userRoleKey === "admin" && (
                            <span className="flex items-center gap-1" title="Visualizações"><Eye className="w-3.5 h-3.5" /> {post.views || 0}</span>
                          )}
                          <span className="flex items-center gap-0.5" title="Curtidas"><Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" /> {post.likes || 0}</span>
                          <span className="flex items-center gap-1" title="Comentários"><MessageSquare className="w-3.5 h-3.5" /> {(post.comments || []).length}</span>
                        </div>
                        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                          Ler artigo <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
