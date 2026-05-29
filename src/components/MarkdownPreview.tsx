import React from "react";

interface MarkdownPreviewProps {
  content: string;
  forceHtml?: boolean;
}

export default function MarkdownPreview({ content, forceHtml = false }: MarkdownPreviewProps) {
  if (!content) {
    return <p className="text-gray-400 italic font-sans">Sem conteúdo para pré-visualizar.</p>;
  }

  const trimmed = content.trim();
  const isHtml = forceHtml ||
                 trimmed.startsWith("<") || 
                 trimmed.includes("<p>") || 
                 trimmed.includes("</p>") || 
                 trimmed.includes("</div>") || 
                 trimmed.includes("<span style=") ||
                 trimmed.includes("font-size:") ||
                 trimmed.includes("</h1>") ||
                 trimmed.includes("</h2>") ||
                 trimmed.includes("</h3>");

  if (isHtml) {
    return (
      <div 
        className="space-y-1 prose prose-slate dark:prose-invert max-w-none select-text" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];
  let currentListItems: string[] = [];
  let listType: "bullet" | "number" | null = null;
  let inCodeBlock = false;
  let codeBlockLanguage = "";
  let codeBlockLines: string[] = [];

  const flushList = (key: string) => {
    if (currentListItems.length > 0) {
      if (listType === "bullet") {
        renderedElements.push(
          <ul key={`ul-${key}`} className="list-disc pl-6 mb-4 space-y-1 text-gray-700 dark:text-gray-300 font-sans leading-relaxed">
            {currentListItems.map((item, i) => (
              <li key={i}>{parseInlineFormatting(item)}</li>
            ))}
          </ul>
        );
      } else if (listType === "number") {
        renderedElements.push(
          <ol key={`ol-${key}`} className="list-decimal pl-6 mb-4 space-y-1 text-gray-700 dark:text-gray-300 font-sans leading-relaxed">
            {currentListItems.map((item, i) => (
              <li key={i}>{parseInlineFormatting(item)}</li>
            ))}
          </ol>
        );
      }
      currentListItems = [];
      listType = null;
    }
  };

  // Helper inside to parse **bold**, *italic*, and `code`
  function parseInlineFormatting(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    let currentString = text;
    let idx = 0;

    // RegEx for bold, italic, code, colors
    // We do a simple sequential token parser or character inspection for robust nesting
    while (currentString.length > 0) {
      const boldMatch = currentString.match(/^\*\*([^*]+)\*\*/);
      const italicMatch = currentString.match(/^\*([^*]+)\*/);
      const codeMatch = currentString.match(/^`([^`]+)`/);
      const colorMatch = currentString.match(/^\{color:([^}]+)\}(.*?)\{\/color\}/);

      if (boldMatch) {
        parts.push(<strong key={idx++} className="font-semibold text-gray-900 dark:text-white">{boldMatch[1]}</strong>);
        currentString = currentString.substring(boldMatch[0].length);
      } else if (italicMatch) {
        parts.push(<em key={idx++} className="italic text-gray-800 dark:text-gray-200">{italicMatch[1]}</em>);
        currentString = currentString.substring(italicMatch[0].length);
      } else if (codeMatch) {
        parts.push(
          <code key={idx++} className="px-1.5 py-0.5 bg-gray-100 text-red-600 dark:bg-gray-800 dark:text-red-400 rounded font-mono text-xs">
            {codeMatch[1]}
          </code>
        );
        currentString = currentString.substring(codeMatch[0].length);
      } else if (colorMatch) {
        parts.push(
          <span key={idx++} style={{ color: colorMatch[1] }}>
            {parseInlineFormatting(colorMatch[2])}
          </span>
        );
        currentString = currentString.substring(colorMatch[0].length);
      } else {
        // Find next trigger
        const nextBold = currentString.indexOf("**");
        const nextItalic = currentString.indexOf("*");
        const nextCode = currentString.indexOf("`");
        const nextColor = currentString.indexOf("{color:");

        const indices = [nextBold, nextItalic, nextCode, nextColor].filter(i => i !== -1);
        if (indices.length === 0) {
          parts.push(<span key={idx++}>{currentString}</span>);
          break;
        }

        const nextCut = Math.min(...indices);
        if (nextCut === 0) {
          // If the parsed trigger resides at position 0 but failed to match a pair above,
          // consume exactly 1 character/token to avoid infinite parser hangs.
          parts.push(<span key={idx++}>{currentString[0]}</span>);
          currentString = currentString.substring(1);
        } else {
          parts.push(<span key={idx++}>{currentString.substring(0, nextCut)}</span>);
          currentString = currentString.substring(nextCut);
        }
      }
    }

    return parts;
  }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const trimmed = line.trim();

    // 1. Code block handling
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        // Close code block
        inCodeBlock = false;
        renderedElements.push(
          <div key={`code-block-${index}`} className="my-5 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 font-mono text-sm shadow-sm">
            {codeBlockLanguage && (
              <div className="bg-gray-100 dark:bg-gray-900 px-4 py-1.5 text-xs text-gray-500 font-sans border-b border-gray-200 dark:border-gray-800 flex justify-between items-center select-none">
                <span>{codeBlockLanguage.toUpperCase()}</span>
                <span className="text-[10px] text-gray-400">Código</span>
              </div>
            )}
            <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-xs leading-relaxed leading-normal select-text">
              <code>{codeBlockLines.join("\n")}</code>
            </pre>
          </div>
        );
        codeBlockLines = [];
        codeBlockLanguage = "";
      } else {
        // Open code block
        flushList(String(index));
        inCodeBlock = true;
        codeBlockLanguage = trimmed.substring(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // 2. Headings
    if (trimmed.startsWith("# ")) {
      flushList(String(index));
      renderedElements.push(
        <h1 key={index} className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mt-6 mb-4 font-sans border-b border-gray-100 dark:border-gray-800 pb-2">
          {parseInlineFormatting(trimmed.substring(2))}
        </h1>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList(String(index));
      renderedElements.push(
        <h2 key={index} className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-gray-100 mt-6 mb-3 font-sans">
          {parseInlineFormatting(trimmed.substring(3))}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushList(String(index));
      renderedElements.push(
        <h3 key={index} className="text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-100 mt-5 mb-2 font-sans">
          {parseInlineFormatting(trimmed.substring(4))}
        </h3>
      );
      continue;
    }

    // 3. Blockquotes
    if (trimmed.startsWith("> ")) {
      flushList(String(index));
      renderedElements.push(
        <blockquote key={index} className="border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-3 my-4 italic text-gray-600 dark:text-gray-400 font-sans text-sm rounded-r-lg">
          {parseInlineFormatting(trimmed.substring(2))}
        </blockquote>
      );
      continue;
    }

    // 4. Bullet lists
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      if (listType !== "bullet") {
        flushList(String(index));
        listType = "bullet";
      }
      currentListItems.push(trimmed.substring(2));
      continue;
    }

    // 4.5. Horizontal lines
    if (trimmed === "---") {
      flushList(String(index));
      renderedElements.push(<hr key={`hr-${index}`} className="my-6 border-gray-200 dark:border-gray-800" />);
      continue;
    }

    // 5. Numbered lists
    const numberMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (numberMatch) {
      if (listType !== "number") {
        flushList(String(index));
        listType = "number";
      }
      currentListItems.push(numberMatch[2]);
      continue;
    }

    // Empty lines trigger flushing of lists
    if (trimmed === "") {
      flushList(String(index));
      continue;
    }

    // 6. Regular paragraphs
    flushList(String(index));
    renderedElements.push(
      <p key={index} className="text-gray-600 dark:text-gray-300 font-sans leading-relaxed mb-4 text-base tracking-normal">
        {parseInlineFormatting(line)}
      </p>
    );
  }

  // Flush any remaining list at the end
  flushList("end");

  return <div className="space-y-1 prose prose-slate dark:prose-invert max-w-none">{renderedElements}</div>;
}
