import { useState, useRef, useCallback } from "react";
import { blogImageService } from "../../../services/ImageService";
import toast from "react-hot-toast";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Heading1 as Heading1Icon,
  Heading2 as Heading2Icon,
  Heading3 as Heading3Icon,
  Link as LinkIcon,
  Image as ImageIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Quote as QuoteIcon,
  Code as CodeIcon,
  Minus as MinusIcon,
  Eye as EyeIcon,
  Pencil as PencilIcon,
  Upload as UploadIcon,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung bài viết...",
  minHeight = 400,
}) => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Insert text at cursor position
  const insertText = useCallback(
    (before: string, after: string = "", placeholder?: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const textToInsert = selectedText || placeholder || "";

      const newValue =
        value.substring(0, start) +
        before +
        textToInsert +
        after +
        value.substring(end);

      onChange(newValue);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + before.length + textToInsert.length;
        textarea.setSelectionRange(
          selectedText ? newCursorPos + after.length : start + before.length,
          selectedText
            ? newCursorPos + after.length
            : start + before.length + textToInsert.length
        );
      }, 0);
    },
    [value, onChange]
  );

  // Insert text on new line
  const insertOnNewLine = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const beforeCursor = value.substring(0, start);
      const afterCursor = value.substring(start);

      // Check if we need a newline
      const needsNewLine =
        beforeCursor.length > 0 && !beforeCursor.endsWith("\n");
      const newValue =
        beforeCursor + (needsNewLine ? "\n" : "") + prefix + afterCursor;

      onChange(newValue);

      setTimeout(() => {
        textarea.focus();
        const newPos = start + (needsNewLine ? 1 : 0) + prefix.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    },
    [value, onChange]
  );

  // Toolbar actions
  const toolbarActions = [
    {
      icon: BoldIcon,
      title: "Đậm (Ctrl+B)",
      action: () => insertText("**", "**", "chữ đậm"),
    },
    {
      icon: ItalicIcon,
      title: "Nghiêng (Ctrl+I)",
      action: () => insertText("*", "*", "chữ nghiêng"),
    },
    { type: "separator" },
    {
      icon: Heading1Icon,
      title: "Tiêu đề 1",
      action: () => insertOnNewLine("# "),
    },
    {
      icon: Heading2Icon,
      title: "Tiêu đề 2",
      action: () => insertOnNewLine("## "),
    },
    {
      icon: Heading3Icon,
      title: "Tiêu đề 3",
      action: () => insertOnNewLine("### "),
    },
    { type: "separator" },
    { icon: ListIcon, title: "Danh sách", action: () => insertOnNewLine("- ") },
    {
      icon: ListOrderedIcon,
      title: "Danh sách số",
      action: () => insertOnNewLine("1. "),
    },
    {
      icon: QuoteIcon,
      title: "Trích dẫn",
      action: () => insertOnNewLine("> "),
    },
    { type: "separator" },
    {
      icon: LinkIcon,
      title: "Link",
      action: () => insertText("[", "](url)", "tên link"),
    },
    {
      icon: ImageIcon,
      title: "Ảnh từ URL",
      action: () => insertText("![", "](url)", "mô tả ảnh"),
    },
    {
      icon: CodeIcon,
      title: "Code",
      action: () => insertText("`", "`", "code"),
    },
    {
      icon: MinusIcon,
      title: "Đường kẻ",
      action: () => insertOnNewLine("\n---\n"),
    },
  ];

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh tối đa là 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await blogImageService.uploadBlogContentImage(formData);
      const imageUrl = response.data.url;

      if (imageUrl) {
        const imageMarkdown = `![${file.name}](${imageUrl})`;
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const newValue =
            value.substring(0, start) + imageMarkdown + value.substring(start);
          onChange(newValue);
        } else {
          onChange(value + "\n" + imageMarkdown);
        }
        toast.success("Tải ảnh thành công");
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Không thể tải ảnh lên");
    } finally {
      setUploading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (imageFile) {
        await handleImageUpload(imageFile);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value]
  );

  // Handle paste image
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            await handleImageUpload(file);
          }
          break;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          insertText("**", "**", "chữ đậm");
          break;
        case "i":
          e.preventDefault();
          insertText("*", "*", "chữ nghiêng");
          break;
        case "k":
          e.preventDefault();
          insertText("[", "](url)", "tên link");
          break;
      }
    }
  };

  // Parse markdown to HTML for preview
  const parseMarkdown = (md: string): string => {
    let html = md
      // Escape HTML
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Headers
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>'
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>'
      )
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Images (must be before links to avoid conflict)
      .replace(
        /!\[(.*?)\]\((.*?)\)/g,
        '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />'
      )
      // Links
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" class="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      // Code blocks
      .replace(
        /```([\s\S]*?)```/g,
        '<pre class="bg-mono-100 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm"><code>$1</code></pre>'
      )
      // Inline code
      .replace(
        /`(.*?)`/g,
        '<code class="bg-mono-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
      )
      // Blockquotes
      .replace(
        /^&gt; (.*$)/gim,
        '<blockquote class="border-l-4 border-mono-300 pl-4 italic text-mono-600 my-4">$1</blockquote>'
      )
      // Horizontal rule
      .replace(/^---$/gim, '<hr class="border-t border-mono-300 my-6" />')
      // Lists
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
      // Line breaks
      .replace(/\n/g, "<br />");

    // Wrap consecutive list items
    html = html.replace(
      /(<li class="ml-6 list-disc">.*?<\/li>)(<br \/>)?/g,
      "$1"
    );
    html = html.replace(
      /(<li class="ml-6 list-decimal">.*?<\/li>)(<br \/>)?/g,
      "$1"
    );

    return html;
  };

  return (
    <div className="border border-mono-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-mono-50 border-b border-mono-200 flex-wrap">
        {toolbarActions.map((item, index) =>
          item.type === "separator" ? (
            <div key={index} className="w-px h-6 bg-mono-300 mx-1" />
          ) : (
            <button
              key={index}
              type="button"
              onClick={item.action}
              title={item.title}
              className="p-2 hover:bg-mono-200 rounded transition-colors"
            >
              {item.icon && <item.icon className="w-4 h-4 text-mono-700" />}
            </button>
          )
        )}

        {/* Upload Image Button */}
        <div className="w-px h-6 bg-mono-300 mx-1" />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = "";
          }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Tải ảnh lên"
          className="p-2 hover:bg-mono-200 rounded transition-colors flex items-center gap-1 text-sm disabled:opacity-50"
        >
          {uploading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <UploadIcon className="w-4 h-4" />
          )}
          <span className="text-mono-700">Upload ảnh</span>
        </button>

        {/* Tab Switcher */}
        <div className="ml-auto flex items-center gap-1 bg-mono-200 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-3 py-1 rounded text-sm font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "edit"
                ? "bg-white text-mono-900 shadow-sm"
                : "text-mono-600 hover:text-mono-900"
            }`}
          >
            <PencilIcon className="w-3.5 h-3.5" />
            Soạn thảo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1 rounded text-sm font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "preview"
                ? "bg-white text-mono-900 shadow-sm"
                : "text-mono-600 hover:text-mono-900"
            }`}
          >
            <EyeIcon className="w-3.5 h-3.5" />
            Xem trước
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div style={{ minHeight }}>
        {activeTab === "edit" ? (
          <div
            className={`relative h-full ${dragOver ? "bg-blue-50" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={placeholder}
              style={{ minHeight }}
              className="w-full h-full p-4 resize-y focus:outline-none font-mono text-sm"
            />

            {/* Drag overlay */}
            {dragOver && (
              <div className="absolute inset-0 bg-blue-50 border-2 border-dashed border-blue-400 rounded flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <p className="text-blue-600 font-medium">Thả ảnh vào đây</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="p-4 prose prose-sm max-w-none overflow-y-auto"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{
              __html:
                parseMarkdown(value) ||
                '<p class="text-mono-400">Chưa có nội dung...</p>',
            }}
          />
        )}
      </div>

      {/* Footer hints */}
      <div className="px-4 py-2 bg-mono-50 border-t border-mono-200 text-xs text-mono-500 flex justify-between">
        <span>
          <strong>Ctrl+B</strong> Đậm | <strong>Ctrl+I</strong> Nghiêng |{" "}
          <strong>Ctrl+K</strong> Link
        </span>
        <span>Kéo thả hoặc paste ảnh để tải lên</span>
      </div>
    </div>
  );
};

export default MarkdownEditor;
