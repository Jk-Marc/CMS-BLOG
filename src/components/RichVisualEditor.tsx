import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface RichVisualEditorRef {
  focus: () => void;
  execFormat: (type: string, param?: string) => void;
}

interface RichVisualEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

const RichVisualEditor = forwardRef<RichVisualEditorRef, RichVisualEditorProps>(
  ({ value, onChange, placeholder = "Comece a escrever aqui...", className = "" }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isTypingRef = useRef(false);

    // Sync input internally, sanitizing HTML entities like &nbsp; on the way to the parent state
    const cleanAndSync = (html: string) => {
      // Replace all forms of non-breaking spaces (HTML entity &nbsp;, escaped &nbsp;, unicode \u00a0, hex/dec entities) with standard spaces
      let cleaned = html;
      cleaned = cleaned.replace(/&nbsp;/g, " ");
      cleaned = cleaned.replace(/&amp;nbsp;/g, " ");
      cleaned = cleaned.replace(/\u00a0/g, " ");
      cleaned = cleaned.replace(/&#160;/g, " ");
      cleaned = cleaned.replace(/&#x00a0;/g, " ");
      onChange(cleaned);
    };

    // Keep inner content updated ONLY when the user does not have active focus on this editor.
    // This allows the browser to natively manage typing, cursor, and space inputs without jumping.
    useEffect(() => {
      if (editorRef.current) {
        let cleanHtml = value || "";
        // Safely parse old bracket formatting
        cleanHtml = cleanHtml.replace(/\{color:([^}]+)\}(.*?)\{\/color\}/g, '<span style="color: $1">$2</span>');

        const isCurrentFocused = document.activeElement === editorRef.current;
        if (!isCurrentFocused) {
          if (editorRef.current.innerHTML !== cleanHtml) {
            editorRef.current.innerHTML = cleanHtml;
          }
        }
      }
    }, [value]);

    // Handle formatting actions imperatively from the parent component.
    // Exposing this avoids refocusing issues and focus resets.
    useImperativeHandle(ref, () => ({
      focus() {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      },
      execFormat(type: string, param?: string) {
        if (!editorRef.current) return;
        editorRef.current.focus();

        switch (type) {
          case "bold":
            document.execCommand("bold", false);
            break;
          case "italic":
            document.execCommand("italic", false);
            break;
          case "bullet":
            document.execCommand("insertUnorderedList", false);
            break;
          case "number":
            document.execCommand("insertOrderedList", false);
            break;
          case "line":
            document.execCommand("insertHorizontalRule", false);
            break;
          case "quote":
            document.execCommand("formatBlock", false, "<blockquote>");
            break;
          case "h1":
            document.execCommand("formatBlock", false, "<h1>");
            break;
          case "h2":
            document.execCommand("formatBlock", false, "<h2>");
            break;
          case "p":
            document.execCommand("formatBlock", false, "<p>");
            break;
          case "color":
            if (param === "inherit") {
              // Ensure we are working with CSS style mode to get styled spans
              document.execCommand("styleWithCSS", false, "true");
              // Paint the selection with an extremely distinct dummy color
              document.execCommand("foreColor", false, "#010203");
              
              // Traverse and unwrap spans with this dummy color style
              const spans = editorRef.current.querySelectorAll("span");
              spans.forEach((span) => {
                const colorValue = span.style.color.replace(/\s+/g, "").toLowerCase();
                if (colorValue === "rgb(1,2,3)" || colorValue === "#010203") {
                  if (span.style.length > 1) {
                    span.style.color = "";
                  } else {
                    const parent = span.parentNode;
                    if (parent) {
                      while (span.firstChild) {
                        parent.insertBefore(span.firstChild, span);
                      }
                      parent.removeChild(span);
                    }
                  }
                }
              });

              // Clean up any stray legacy font elements
              const fonts = editorRef.current.querySelectorAll("font");
              fonts.forEach((font) => {
                const colorAttr = font.getAttribute("color");
                if (colorAttr === "#010203" || colorAttr === "rgb(1,2,3)") {
                  const parent = font.parentNode;
                  if (parent) {
                    while (font.firstChild) {
                      parent.insertBefore(font.firstChild, font);
                    }
                    parent.removeChild(font);
                  }
                }
              });
            } else {
              if (param) {
                document.execCommand("styleWithCSS", false, "true");
                document.execCommand("foreColor", false, param);
              }
            }
            break;
        }

        // Trigger safe state update immediately following layout action
        const currentHtml = editorRef.current.innerHTML;
        cleanAndSync(currentHtml);
      },
    }));

    const handleInput = () => {
      if (editorRef.current) {
        isTypingRef.current = true;
        const currentHtml = editorRef.current.innerHTML;
        cleanAndSync(currentHtml);
      }
    };

    const handleBlur = () => {
      isTypingRef.current = false;
      if (editorRef.current) {
        const currentHtml = editorRef.current.innerHTML;
        cleanAndSync(currentHtml);
      }
    };

    const handleFocus = () => {
      isTypingRef.current = true;
    };

    return (
      <div className="relative min-h-[460px] cursor-text">
        <div
          ref={editorRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onInput={handleInput}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={`rich-content-area outline-none focus:outline-none select-text ${className}`}
          style={{ minHeight: "460px" }}
        />
        {/* Render placeholder visually when markup contains no real text */}
        {(!value || value === "" || value === "<p></p>" || value === "<p><br></p>" || value === "<br>") && (
          <div className="absolute top-5 left-5 text-slate-400 dark:text-slate-500 font-sans text-sm pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>
    );
  }
);

RichVisualEditor.displayName = "RichVisualEditor";

export default RichVisualEditor;
