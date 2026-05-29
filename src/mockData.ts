import { Post, Category, Page, MediaItem } from "./types";

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Análises de Jogos",
    slug: "analises-games",
    color: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900",
    description: "Reviews minuciosos, notas de desempenho, mecânicas de gameplay e gráficos."
  },
  {
    id: "cat-2",
    name: "Hardwares & Setup",
    slug: "hardware-setup",
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900",
    description: "Consoles de última geração, GPUs potentes, teclados mecânicos e periféricos."
  },
  {
    id: "cat-3",
    name: "Cultura & Indie Dev",
    slug: "cultura-indie",
    color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900",
    description: "Jogos independentes criativos, pixel art, trilhas marcantes e história dos games."
  },
  {
    id: "cat-4",
    name: "eSports & Competitivo",
    slug: "esports-competitivo",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900",
    description: "Grandes campeonatos, equipes profissionais, e táticas do cenário pró."
  }
];

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: "med-1",
    title: "Game Pad Vermelho e Roxo",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800",
    alt: "Controle gamer moderno iluminado por neon vermelho e lilás em fundo escuro",
    size: "215 KB",
    type: "image/jpeg",
    createdAt: "2026-05-20T14:32:00Z"
  },
  {
    id: "med-2",
    title: "Teclado Mecânico RGB Gamer",
    url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800",
    alt: "Teclado mecânico retroiluminado com cores RGB cyberpunk",
    size: "310 KB",
    type: "image/jpeg",
    createdAt: "2026-05-21T09:15:00Z"
  },
  {
    id: "med-3",
    title: "Setup Gamer Neon Minimalista",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    alt: "Computador com iluminação azul e violeta e cadeira ergonômica",
    size: "265 KB",
    type: "image/jpeg",
    createdAt: "2026-05-22T11:45:00Z"
  },
  {
    id: "med-4",
    title: "Console Arcade Retrô Clássico",
    url: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800",
    alt: "Gabinete de arcade clássico com botões acesos na penumbra",
    size: "198 KB",
    type: "image/jpeg",
    createdAt: "2026-05-23T10:00:00Z"
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: "post-1",
    title: "Análise: Como Elden Ring revolucionou o design de Mundos Abertos",
    slug: "como-elden-ring-revolucionou-jogos-mundo-aberto",
    content: `# Como Elden Ring revolucionou o design de Mundos Abertos

Lançado com aplausos mundiais, o título da FromSoftware não seguiu apenas a fórmula convencional de colocar listas de tarefas intermináveis em um mapa gigante. Ele resgatou o senso de **descoberta orgânica**, transformando a curiosidade genuína no motor da jornada do jogador.

## 1. O Fim dos Marcadores de Mapa Excessivos

Diferente de outros jogos do gênero, este título não enche a tela de pontos de interrogação em 3D. O jogador avança olhando para o horizonte:

* **Uma coluna de fumaça** indica uma fogueira de acampamento inimigo;
* **Uma torre inclinada** sugere uma masmorra opcional de alto desafio;
* **Constelações de ruínas** oferecem fragmentos de lore para os mais atentos.

\`\`\`typescript
// Tabela de Notas de Atributo de Gameplay:
interface GameReview {
  titulo: string;
  direcaoDeArte: number; // Max 10
  jogabilidade: number;
  fatorReplay: number;
}

const eldenRingReview: GameReview = {
  titulo: "Elden Ring: Shadow of the Erdtree",
  direcaoDeArte: 10,
  jogabilidade: 9.8,
  fatorReplay: 9.5
};
\`\`\`

## 2. A Sensibilidade do Level Design Vertical

As rotas não são planas. A FromSoftware conectou o mundo em camadas verticais profundas. É comum descer por um elevador e descobrir uma cidade inteira subterrânea brilhando sob estrelas artificiais (o Rio Siofra). Essa quebra de expectativa faz com que o senso de escala se multiplique infinitamente.

## 3. O Legado Deixado na Indústria

Após o lançamento deste épico, desenvolvedores de todas as frentes estão repensando como dão autonomia aos jogadores. O ensinamento ficou claro: **confie na inteligência e na sede de exploração do seu jogador**, e ele responderá mergulhando centenas de horas em seu universo.`,
    summary: "Seja pela verticalidade brutal de suas masmorras ou raras diretrizes no mapa, saiba como este jogo da FromSoftware marcou um antes e depois no design de mundos virtuais.",
    categoryId: "cat-1",
    tags: ["Análise", "Elden Ring", "Mundo Aberto", "RPG"],
    status: "published",
    createdAt: "2026-05-20T14:40:00Z",
    publishedAt: "2026-05-20T16:00:00Z",
    coverImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800",
    seoTitle: "Análise de Elden Ring e o Level Design de Mundo Aberto",
    seoDescription: "Confira por que Elden Ring mudou as regras de desenvolvimento de mundos virtuais, dando autonomia total ao jogador sem entulhar o mapa de marcadores."
  },
  {
    id: "post-2",
    title: "Guia de Hardware: O impacto do Polling Rate de 8000Hz nos mouses competitivos",
    slug: "impacto-polling-rate-8000hz-mouses-gamer",
    content: `# O impacto do Polling Rate de 8000Hz nos mouses competitivos

Se você joga eSports em níveis competitivos rápidos (como Counter-Strike 2 ou Valorant), a última revolução no hardware gamer já bateu à sua porta. Mouses modernos agora suportam **taxas de atualização (polling rate) de até 8000Hz**. Mas será que esse incremento realmente muda a mira ou é apenas marketing?

## O que é o Polling Rate?

O Polling Rate é a frequência com que o mouse envia informações de posição e clique para o seu computador. 

* **125Hz**: Envia dados a cada 8ms.
* **1000Hz** (Padrão ouro clássico): Envia dados a cada 1ms.
* **8000Hz** (Estado da arte): Envia dados a cada **0.125ms**!

### O Impacto na Fluidez visível em Monitores High-End
A diferença é imperceptível em monitores comuns de 60Hz. Porém, quando associada a monitores de **240Hz, 360Hz ou até 540Hz**, a taxa de 8000Hz elimina as quebras (*micro-stuttering*) do cursor na tela durante movimentos amplos de mira rápida. O resultado é um rastro de mira perfeitamente uniforme e preciso.

## Considerações Importantes antes de Comprar:
1. **Consumo de CPU**: Processar 8000 relatórios de dados por segundo exige alto desempenho de CPU. Se o seu processador for intermediário, você pode notar quedas de FPS no jogo (*frame drops*).
2. **Duração de Bateria**: Em mouses sem fio, habilitar 8000Hz reduz drasticamente o tempo de uso contínuo (frequentemente caindo de 80 horas para apenas 15 horas).`,
    summary: "Fomos a fundo testar o limite dos mouses gamers ultrarápidos de 0.125ms de latência. Vale a pena o investimento ou sua CPU vai gargalar nos jogos pesados?",
    categoryId: "cat-2",
    tags: ["Hardware", "Guia Gamer", "Periféricos", "eSports"],
    status: "published",
    createdAt: "2026-05-22T10:00:00Z",
    publishedAt: "2026-05-22T10:30:00Z",
    coverImage: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800",
    seoTitle: "Mouses Gamer 8000Hz: Vale a pena para jogos competitivos?",
    seoDescription: "Explicamos tecnicamente o que muda na mira ao saltar de 1000Hz para 8000Hz em jogos de tiro de alta velocidade de resposta."
  },
  {
    id: "post-3",
    title: "Por que os jogos Indie estão salvando a inovação na indústria",
    slug: "por-que-jogos-indie-salvam-inovacao",
    content: `# Por que os jogos Indie estão salvando a inovação na indústria

Enquanto grandes orçamentos de jogos AAA (triplo A) muitas vezes hesitam em assumir riscos criativos em prol de fórmulas consagradas, os desenvolvedores de **jogos independentes** tornaram-se o laboratório de testes da indústria de entretenimento interativo.

## O Risco Criativo como Diferencial

No desenvolvimento indie, falhar com uma ideia bizarra é menos assustador do que fazer um jogo entediante e idêntico a todos os outros. Foi esse espírito de risco que produziu jogos emblemáticos como:

* **Hollow Knight**: Redefinindo o que um gênero de Metroidvania atmosférico e com trilha majestosa pode alcançar.
* **Celeste**: Dominando o design preciso de plataformas enquanto tece uma crítica íntima e metafórica sobre ansiedade e superação.
* **Outer Wilds**: Onde o progresso é puramente guiado pelo conhecimento do jogador sobre as leis físicas do sistema planetário.

> "Jogos indie desafiam as normas do design convencional de entretenimento."

## Conclusão de Tendência

Se mantendo financeiramente enxutos, estes estúdios pequenos de apenas 3 a 10 criadores continuam a ser a verdadeira fagulha de inovação artística e de gameplay que inspira as grandes gigantes no futuro.`,
    summary: "Enquanto franquias milionárias dependem de sequências previsíveis, os estúdios independentes entregam mecânicas e narrativas que redefinem nossa visão de arte digital.",
    categoryId: "cat-3",
    tags: ["Indie Games", "Inovação", "Opinião", "Cultura"],
    status: "draft",
    createdAt: "2026-05-23T11:00:00Z",
    publishedAt: null,
    coverImage: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800",
    seoTitle: "A Revolução Silenciosa dos Desenvolvedores de Jogos Indie",
    seoDescription: "Explore como a audácia criativa e os estúdios enxutos de jogos indie estão injetando nova vida no universo dos games e influenciando os jogos AAA."
  }
];

export const INITIAL_PAGES: Page[] = [
  {
    id: "page-1",
    title: "Quem Somos",
    slug: "quem-somos",
    content: `# Sobre o Content Studio Games

Nascemos da paixão genuína pelas narrativas maduras, pela precisão mecânica competitiva e pelo design artístico de entretenimento eletrônico.

Nossa missão é trazer conteúdo sério, análises de hardware sem rodeios e uma cobertura sincera do cenário internacional e nacional de eSports.

## Nossos Pilares Editoriais

* **Zero sensacionalismo**: Nossas notas e opiniões são independentes e francas;
* **Foco na inovação**: Damos o mesmo valor e respeito aos estúdios indie modestos e aos gigantes do mercado;
* **Cultura gamer autêntica**: O jogo como forma de arte e plataforma de conexão humana.`,
    status: "published",
    createdAt: "2026-05-18T10:00:00Z"
  },
  {
    id: "page-2",
    title: "Anuncie no Portal",
    slug: "anuncie",
    content: `# Oportunidades Comerciais

Gostaria de colocar sua marca frente a uma das maiores e mais qualificadas audiências de apaixonados por tecnologia e jogos do Brasil?

### Nossos Formatados de Anúncio:

* **Artigos Patrocinados**: Elaboração profunda de posts sobre novos mouses ou hardwares com total integridade e link building;
* **Banners exclusivos**: Localizados no Portal do Leitor;
* **Contato comercial:** parcerias@contentstudiogames.com`,
    status: "published",
    createdAt: "2026-05-18T10:15:00Z"
  }
];

// LocalStorage managers to load and save
export function getSavedCMSData() {
  const postsJson = localStorage.getItem("cms_posts");
  const categoriesJson = localStorage.getItem("cms_categories");
  const mediaJson = localStorage.getItem("cms_media");
  const pagesJson = localStorage.getItem("cms_pages");

  let parsedPosts: Post[] = postsJson ? JSON.parse(postsJson) : INITIAL_POSTS;
  
  // Ensure every post has views, likes, and comments
  parsedPosts = parsedPosts.map(post => {
    let views = post.views;
    let likes = post.likes;
    let comments = post.comments;

    if (views === undefined) {
      if (post.id === "post-1") views = 342;
      else if (post.id === "post-2") views = 189;
      else if (post.id === "post-3") views = 54;
      else views = 0;
    }
    
    if (likes === undefined) {
      if (post.id === "post-1") likes = 64;
      else if (post.id === "post-2") likes = 28;
      else if (post.id === "post-3") likes = 7;
      else likes = 0;
    }

    if (!comments) {
      if (post.id === "post-1") {
        comments = [
          {
            id: "comm-1",
            authorName: "GamerPro99",
            content: "Excelente análise! Achei fantástica a forma como Elden Ring nos deixa desbravar o mapa livremente.",
            createdAt: "2026-05-24T10:15:00Z"
          },
          {
            id: "comm-2",
            authorName: "Aline Costa",
            content: "A verticalidade do Rio Siofra explodiu minha mente na primeira vez que desci lá.",
            createdAt: "2026-05-24T12:30:00Z"
          }
        ];
      } else if (post.id === "post-2") {
        comments = [
          {
            id: "comm-3",
            authorName: "Lucas FPS",
            content: "De fato, 8000Hz exige muita CPU. No meu setup com i5 senti perdas de frames e acabei voltando para 2000Hz.",
            createdAt: "2026-05-25T14:45:00Z"
          }
        ];
      } else {
        comments = [];
      }
    }

    return {
      ...post,
      views,
      likes,
      comments
    };
  });

  return {
    posts: parsedPosts,
    categories: categoriesJson ? JSON.parse(categoriesJson) : INITIAL_CATEGORIES,
    media: mediaJson ? JSON.parse(mediaJson) : INITIAL_MEDIA,
    pages: pagesJson ? JSON.parse(pagesJson) : INITIAL_PAGES
  };
}

export function saveCMSData(data: {
  posts: Post[];
  categories: Category[];
  media: MediaItem[];
  pages: Page[];
}) {
  localStorage.setItem("cms_posts", JSON.stringify(data.posts));
  localStorage.setItem("cms_categories", JSON.stringify(data.categories));
  localStorage.setItem("cms_media", JSON.stringify(data.media));
  localStorage.setItem("cms_pages", JSON.stringify(data.pages));
}
