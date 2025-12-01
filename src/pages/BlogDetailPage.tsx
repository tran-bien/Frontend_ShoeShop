import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { publicBlogService } from "../services/BlogService";
import MarkdownRenderer from "../components/Blog/MarkdownRenderer";
import type { BlogPost } from "../types/blog";
import {
  ClockIcon,
  TagIcon,
  UserIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        const { data } = await publicBlogService.getPostBySlug(slug);
        // BE returns { success, post }
        setPost(data.post || data.data);

        // Fetch related posts (same category, exclude current post)
        if (data.post?._id || data.data?._id) {
          const postData = data.post || data.data;
          try {
            const relatedRes = await publicBlogService.getPosts({
              category: postData.category?._id,
              limit: 3,
            });
            // Filter out current post and limit to 3
            const related = (relatedRes.data.data || [])
              .filter((p: BlogPost) => p._id !== postData._id)
              .slice(0, 3);
            setRelatedPosts(related);
          } catch (err) {
            console.error("Failed to fetch related posts:", err);
          }
        }
      } catch (error) {
        console.error("Failed to fetch blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mono-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-mono-300 border-t-mono-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-mono-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-mono-black mb-4">
            Không tìm thấy bài viết
          </h2>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-mono-700 hover:text-mono-black hover:underline"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mono-50 py-12">
      <article className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-mono-700 hover:text-mono-black hover:underline mb-8"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Quay lại
        </Link>

        {/* Header */}
        <header className="mb-8">
          {/* Category */}
          <span className="inline-block px-3 py-1 text-xs font-medium bg-mono-100 text-mono-700 rounded-full mb-4">
            {post.category.name}
          </span>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-mono-black mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-mono-600">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              <span>
                {new Date(
                  post.publishedAt || post.createdAt
                ).toLocaleDateString("vi-VN")}
              </span>
            </div>
            {post.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <TagIcon className="w-5 h-5" />
                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-mono-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="aspect-video rounded-2xl overflow-hidden bg-mono-100 mb-12">
            <img
              src={post.featuredImage.url}
              alt={post.featuredImage.alt || post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        {post.content ? (
          // Render Markdown content (from BE content field)
          <MarkdownRenderer
            content={post.content}
            className="prose prose-lg max-w-none mb-12"
          />
        ) : post.contentBlocks && post.contentBlocks.length > 0 ? (
          // Fallback to HTML contentBlocks (legacy)
          <div
            className="prose prose-lg max-w-none prose-mono
            prose-headings:text-mono-black prose-headings:font-bold
            prose-p:text-mono-700 prose-p:leading-relaxed
            prose-a:text-mono-black prose-a:underline hover:prose-a:no-underline
            prose-strong:text-mono-black prose-strong:font-semibold
            prose-blockquote:border-l-4 prose-blockquote:border-mono-black prose-blockquote:pl-6 prose-blockquote:italic
            prose-code:bg-mono-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-mono-black
            mb-12"
          >
            {post.contentBlocks.map((block, index) => {
              if (block.type === "paragraph") {
                return (
                  <p
                    key={index}
                    dangerouslySetInnerHTML={{ __html: block.content }}
                  />
                );
              } else if (block.type === "heading") {
                const HeadingTag = `h${
                  block.level || 2
                }` as keyof JSX.IntrinsicElements;
                return (
                  <HeadingTag
                    key={index}
                    dangerouslySetInnerHTML={{ __html: block.content }}
                  />
                );
              } else if (block.type === "image") {
                return (
                  <img
                    key={index}
                    src={block.url}
                    alt={block.alt || ""}
                    className="rounded-lg"
                  />
                );
              } else if (block.type === "list") {
                const ListTag = block.ordered ? "ol" : "ul";
                return (
                  <ListTag key={index}>
                    {block.items?.map((item, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ListTag>
                );
              }
              return null;
            })}
          </div>
        ) : (
          <p className="text-mono-600">Nội dung đang được cập nhật...</p>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-mono-200">
            <h2 className="text-2xl font-bold text-mono-black mb-8">
              Bài viết liên quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost._id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group bg-white rounded-xl overflow-hidden border border-mono-200 hover:shadow-medium transition-all"
                >
                  {relatedPost.featuredImage && (
                    <div className="aspect-video overflow-hidden bg-mono-100">
                      <img
                        src={relatedPost.featuredImage.url}
                        alt={relatedPost.featuredImage.alt || relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-mono-black group-hover:underline line-clamp-2">
                      {relatedPost.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default BlogDetailPage;
