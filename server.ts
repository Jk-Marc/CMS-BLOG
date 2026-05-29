import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Initialize Gemini API
const genAiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (genAiKey) {
  ai = new GoogleGenAI({
    apiKey: genAiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is not defined.");
}

// REST API endpoint for the CMS AI Writing Assistant
app.post("/api/ai/cms-writer", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "O serviço de Inteligência Artificial não está configurado. Por favor, configure a chave GEMINI_API_KEY nos canais de configuração.",
      });
    }

    const { action, text, title, category, prompt, targetLanguage } = req.body;

    let systemInstruction = "";
    let contents = "";
    let responseMimeType: string | undefined = undefined;
    let responseSchema: any = undefined;

    switch (action) {
      case "generate_post":
        systemInstruction = "Você é um redator profissional especialista em SEO e marketing de conteúdo. Escreva um artigo completo e envolvente no formato Markdown com base no tema e instruções fornecidas. Inclua subtítulos (##, ###), introdução chamativa, desenvolvimento detalhado e uma conclusão com chamada para ação.";
        contents = `Escreva um artigo completo de blog em Português sobre o tema. Tema: "${title || "Tecnologia"}". Instruções/descrição: "${prompt || "Escreva um post inspirador e informativo."}". Categoria do post: ${category || "Geral"}.`;
        break;

      case "improve_text":
        systemInstruction = "Você é um revisor e editor de texto experiente. Melhore o texto fornecido corrigindo ortografia, gramática, pontuação e elevando o estilo para ser mais profissional, cativante e fluído. Mantenha o formato Markdown original.";
        contents = `Revise e melhore o seguinte texto em Português, devolvendo o resultado revisado:\n\n${text}`;
        break;

      case "summarize":
        systemInstruction = "Você é um assistente de conteúdo que resume artigos longos em parágrafos de resumo pequenos e diretos, perfeitos para newsletters, chamadas com posts anteriores, etc.";
        contents = `Faça um resumo executivo muito atraente com no máximo 3 frases sobre o seguinte artigo:\n\n${text}`;
        break;

      case "seo_suggest":
        systemInstruction = "Você é um especialista em SEO de nível sênior. Analise o título e o conteúdo e desenvolva títulos de SEO otimizados, uma meta descrição atraente (até 160 caracteres) que aumente o CTR, tags (palavras-chave separadas por vírgula), e uma nota breve com dicas de SEO para otimização futura.";
        contents = `Analise o seguinte conteúdo para gerar informações de SEO em formato JSON estruturado:\nTítulo original: "${title || ""}"\nConteúdo:\n${text}`;
        responseMimeType = "application/json";
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            seoTitle: {
              type: Type.STRING,
              description: "Título otimizado para o Google (máximo 60 caracteres).",
            },
            metaDescription: {
              type: Type.STRING,
              description: "Meta descrição chamativa para pesquisas, idealmente entre 120 e 160 caracteres.",
            },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 4 a 6 palavras-chave/tags relevantes extraídas do conteúdo.",
            },
            seoTips: {
              type: Type.STRING,
              description: "Uma dica rápida de SEO específica para esse tema.",
            },
          },
          required: ["seoTitle", "metaDescription", "suggestedTags", "seoTips"],
        };
        break;

      case "translate":
        const lang = targetLanguage || "Inglês";
        systemInstruction = `Você é um tradutor nativo especialista. Traduza de forma idiomática e fluída o seguinte texto mantendo a estrutura original do formato Markdown do texto original.`;
        contents = `Traduza o seguinte texto markdown para o idioma "${lang}":\n\n${text}`;
        break;

      case "tone_analyzer":
        systemInstruction = "Você é um analista de comunicação. Determine os tons dominantes do texto (ex: profissional, entusiasmado, amigável, técnico, dramático), estime o tempo de leitura e faça uma crítica construtiva amigável.";
        contents = `Analise o tom e legibilidade deste texto:\n\n${text}`;
        responseMimeType = "application/json";
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            tones: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Sentimentos/tons presentes no texto (ex: Informativo, Cativante, Técnico).",
            },
            readTimeMinutes: {
              type: Type.INTEGER,
              description: "Tempo estimado de leitura em minutos.",
            },
            constructiveCritique: {
              type: Type.STRING,
              description: "Uma crítica construtiva e breve sobre como tornar a leitura do texto ainda melhor.",
            },
          },
          required: ["tones", "readTimeMinutes", "constructiveCritique"],
        };
        break;

      default:
        return res.status(400).json({ error: "Ação de AI inválida ou não especificada." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: responseMimeType,
        responseSchema: responseSchema,
      },
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Erro na chamada do Gemini API:", error);
    res.status(500).json({
      error: "Ocorreu um erro ao processar o pedido na Inteligência Artificial.",
      details: error.message || error,
    });
  }
});

// Configure Vite middleware in development or direct static production assets
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Serve static frontend assets
    app.use(express.static(distPath));
    console.log("Serving static production files from:", distPath);

    // Fallback all other client navigation paths to index.html (SPA routing support)
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 [CMS SERVER] Running on environment [${process.env.NODE_ENV || "development"}]`);
    console.log(`🚀 [CMS SERVER] Access at http://0.0.0.0:${PORT}`);
  });
}

start();
