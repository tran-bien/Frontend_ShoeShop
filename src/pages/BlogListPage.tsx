import { useState, useEffect } from "react";
import { publicBlogService } from "../services/BlogService";
import type { BlogPost, BlogCategory } from "../types/blog";
import { Link } from "react-router-dom";
import { ClockIcon, TagIcon } from "@heroicons/react/24/outline";

const BlogListPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postsRes, categoriesRes] = await Promise.all([
          publicBlogService.getPosts({
            status: "PUBLISHED",
            category: selectedCategory || undefined,
          }),
          publicBlogService.getCategories({ isActive: true }),
        ]);

        // BE returns { success, data, ... } from paginate helper
        setPosts(postsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch blog data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mono-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-mono-300 border-t-mono-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mono-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-mono-black mb-4">Blog</h1>
          <p className="text-lg text-mono-600 max-w-2xl mx-auto">
            Khám phá xu hướng thời trang, cách phối đồ và bí quyết chọn giày
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
              !selectedCategory
                ? "bg-mono-black text-white"
                : "bg-white text-mono-700 border border-mono-200 hover:border-mono-black"
            }`}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category._id)}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
                selectedCategory === category._id
                  ? "bg-mono-black text-white"
                  : "bg-white text-mono-700 border border-mono-200 hover:border-mono-black"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-mono-600">Chưa có bài viết nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post._id}
                to={`/blog/${post.slug}`}
                className="group bg-white rounded-xl overflow-hidden border border-mono-200 hover:shadow-luxury transition-all"
              >
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="aspect-video overflow-hidden bg-mono-100">
                    <img
                      src={post.featuredImage.url}
                      alt={post.featuredImage.alt || post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-mono-100 text-mono-700 rounded-full mb-3">
                    {post.category.name}
                  </span>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-mono-black mb-2 group-hover:underline line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm text-mono-600 line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-mono-500">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>
                        {new Date(
                          post.publishedAt || post.createdAt
                        ).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <TagIcon className="w-4 h-4" />
                        <span>{post.tags[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogListPage;
