import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Simple Markdown Renderer without external dependencies
 * Supports: headings, bold, italic, links, lists, code blocks, blockquotes
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  const renderMarkdown = (text: string) => {
    // Split by code blocks first to preserve them
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: { type: string; content: string; lang?: string }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        });
      }
      // Add code block
      parts.push({
        type: "code",
        content: match[2],
        lang: match[1],
      });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.substring(lastIndex) });
    }

    return parts.map((part, idx) => {
      if (part.type === "code") {
        return (
          <pre
            key={idx}
            className="bg-mono-900 text-white p-4 rounded-lg overflow-x-auto my-4"
          >
            <code className="text-sm font-mono">{part.content}</code>
          </pre>
        );
      }

      // Process text markdown
      const lines = part.content.split("\n");
      const elements: JSX.Element[] = [];
      let listItems: string[] = [];
      let inList = false;

      lines.forEach((line, lineIdx) => {
        // Headings
        if (line.startsWith("### ")) {
          if (inList) {
            elements.push(renderList(listItems, elements.length));
            listItems = [];
            inList = false;
          }
          elements.push(
            <h3
              key={`${idx}-${lineIdx}`}
              className="text-2xl font-bold text-mono-black mt-8 mb-4"
            >
              {processInline(line.substring(4))}
            </h3>
          );
        } else if (line.startsWith("## ")) {
          if (inList) {
            elements.push(renderList(listItems, elements.length));
            listItems = [];
            inList = false;
          }
          elements.push(
            <h2
              key={`${idx}-${lineIdx}`}
              className="text-3xl font-bold text-mono-black mt-10 mb-6"
            >
              {processInline(line.substring(3))}
            </h2>
          );
        } else if (line.startsWith("# ")) {
          if (inList) {
            elements.push(renderList(listItems, elements.length));
            listItems = [];
            inList = false;
          }
          elements.push(
            <h1
              key={`${idx}-${lineIdx}`}
              className="text-4xl font-bold text-mono-black mt-12 mb-8"
            >
              {processInline(line.substring(2))}
            </h1>
          );
        }
        // Blockquote
        else if (line.startsWith("> ")) {
          if (inList) {
            elements.push(renderList(listItems, elements.length));
            listItems = [];
            inList = false;
          }
          elements.push(
            <blockquote
              key={`${idx}-${lineIdx}`}
              className="border-l-4 border-mono-black pl-6 italic text-mono-700 my-4"
            >
              {processInline(line.substring(2))}
            </blockquote>
          );
        }
        // List items
        else if (line.match(/^[-*]\s/)) {
          inList = true;
          listItems.push(line.substring(2));
        }
        // Ordered list
        else if (line.match(/^\d+\.\s/)) {
          inList = true;
          listItems.push(line.replace(/^\d+\.\s/, ""));
        }
        // Empty line
        else if (line.trim() === "") {
          if (inList) {
            elements.push(renderList(listItems, elements.length));
            listItems = [];
            inList = false;
          }
        }
        // Paragraph
        else if (line.trim()) {
          if (inList) {
            elements.push(renderList(listItems, elements.length));
            listItems = [];
            inList = false;
          }
          elements.push(
            <p
              key={`${idx}-${lineIdx}`}
              className="text-mono-700 leading-relaxed my-4"
            >
              {processInline(line)}
            </p>
          );
        }
      });

      // Close any remaining list
      if (inList) {
        elements.push(renderList(listItems, elements.length));
      }

      return <React.Fragment key={idx}>{elements}</React.Fragment>;
    });
  };

  const renderList = (items: string[], key: number) => {
    return (
      <ul key={`list-${key}`} className="list-disc list-inside space-y-2 my-4">
        {items.map((item, idx) => (
          <li key={idx} className="text-mono-700">
            {processInline(item)}
          </li>
        ))}
      </ul>
    );
  };

  const processInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    // Process bold, italic, inline code, links
    const inlineRegex =
      /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
    let match;
    let lastIndex = 0;

    while ((match = inlineRegex.exec(remaining)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(remaining.substring(lastIndex, match.index));
      }

      if (match[1]) {
        // Bold **text**
        parts.push(
          <strong key={key++} className="font-semibold text-mono-black">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Italic *text*
        parts.push(
          <em key={key++} className="italic">
            {match[4]}
          </em>
        );
      } else if (match[5]) {
        // Inline code `text`
        parts.push(
          <code
            key={key++}
            className="bg-mono-100 px-2 py-1 rounded text-mono-black text-sm font-mono"
          >
            {match[6]}
          </code>
        );
      } else if (match[7]) {
        // Link [text](url)
        parts.push(
          <a
            key={key++}
            href={match[9]}
            className="text-mono-black underline hover:no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {match[8]}
          </a>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < remaining.length) {
      parts.push(remaining.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return <div className={className}>{renderMarkdown(content)}</div>;
};

export default MarkdownRenderer;
