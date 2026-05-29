import React from "react";
import { FileText, Eye, Edit, Layers, Image, Clock } from "lucide-react";
import { DashboardStats } from "../types";

interface DashboardStatsCardsProps {
  stats: DashboardStats;
}

export default function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  const cards = [
    {
      title: "Total de Posts",
      value: stats.totalPosts,
      icon: <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bg: "bg-blue-50 dark:bg-blue-950/40",
      border: "border-blue-100 dark:border-blue-900/40",
      description: "Artigos catalogados no banco"
    },
    {
      title: "Artigos Publicados",
      value: stats.publishedPosts,
      icon: <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-100 dark:border-emerald-900/40",
      description: "Visíveis no blog de leitores"
    },
    {
      title: "Rascunhos Ativos",
      value: stats.draftPosts,
      icon: <Edit className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-100 dark:border-amber-900/40",
      description: "Em fase de produção ou revisão"
    },
    {
      title: "Categorias Ativas",
      value: stats.totalCategories,
      icon: <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bg: "bg-purple-50 dark:bg-purple-950/40",
      border: "border-purple-100 dark:border-purple-900/40",
      description: "Segmentos editoriais organizados"
    },
    {
      title: "Biblioteca de Mídia",
      value: stats.totalMedia,
      icon: <Image className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      border: "border-indigo-100 dark:border-indigo-900/30",
      description: "Imagens e capturas anexadas"
    },
    {
      title: "Leitura Estimada",
      value: `${stats.avgReadTime} min`,
      icon: <Clock className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-100 dark:border-rose-900/30",
      description: "Média de leitura por post"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 select-none">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`flex flex-col justify-between p-4 rounded-xl border ${card.bg} ${card.border} hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {card.title}
            </span>
            <div className="p-1.5 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
              {card.icon}
            </div>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-gray-800 dark:text-white font-sans antialiased">
              {card.value}
            </span>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-normal line-clamp-1">
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
