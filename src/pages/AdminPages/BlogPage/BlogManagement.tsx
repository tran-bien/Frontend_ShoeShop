import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { adminBlogService } from "../../../services/BlogService";
import BlogPostFormModal from "../../../components/Admin/Blog/BlogPostFormModal";
import type {
  BlogPost,
  BlogPostStatus,
  BlogCategory,
} from "../../../types/blog";

const BlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | "all">(
    "all"
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const fetchCategories = async () => {
    try {
      const response = await adminBlogService.getAllCategories();
      if (response.data.success) {
        // Handle both response formats: { data: { categories } } or { data: [] }
        const cats = response.data.data;
        if (Array.isArray(cats)) {
          setCategories(cats);
        } else if (cats && "categories" in cats) {
          setCategories(
            (cats as { categories: BlogCategory[] }).categories || []
          );
        } else {
          setCategories([]);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: {
        page: number;
        limit: number;
        status?: BlogPostStatus;
        search?: string;
      } = {
        page,
        limit: 12,
      };
      if (statusFilter !== "all") params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await adminBlogService.getAllPosts(params);
      if (response.data.success) {
        // paginate helper returns { success, data, totalPages, ... }
        setPosts(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("KhÃ´ng thá»ƒ táº£i danh sÃ¡ch bÃ i viáº¿t");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a bÃ i viáº¿t nÃ y?")) return;

    try {
      await adminBlogService.deletePost(id);
      toast.success("XÃ³a bÃ i viáº¿t thÃ nh cÃ´ng");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("KhÃ´ng thá»ƒ xÃ³a bÃ i viáº¿t");
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchPosts();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: "bg-gray-200 text-gray-700",
      PUBLISHED: "bg-black text-white",
      ARCHIVED: "bg-gray-400 text-white",
    };
    return styles[status as keyof typeof styles] || styles.DRAFT;
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Äang táº£i...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Quáº£n LÃ½ Blog</h1>
        <p className="text-gray-600">Quáº£n lÃ½ bÃ i viáº¿t vÃ  ná»™i dung blog</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="TÃ¬m kiáº¿m bÃ i viáº¿t..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            TÃ¬m
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as BlogPostStatus | "all");
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">Táº¥t cáº£</option>
            <option value="DRAFT">NhÃ¡p</option>
            <option value="PUBLISHED">ÄÃ£ xuáº¥t báº£n</option>
            <option value="ARCHIVED">ÄÃ£ lÆ°u trá»¯</option>
          </select>
        </div>

        {/* Create Button */}
        <button
          onClick={() => {
            setSelectedPost(null);
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Táº¡o bÃ i viáº¿t
        </button>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">ChÆ°a cÃ³ bÃ i viáº¿t nÃ o</p>
          <button
            onClick={() => {
              setSelectedPost(null);
              setShowModal(true);
            }}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Táº¡o bÃ i viáº¿t Ä‘áº§u tiÃªn
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Thumbnail */}
                <div className="h-48 bg-gray-100 overflow-hidden">
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage.url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FiEye className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        post.status
                      )}`}
                    >
                      {post.status === "DRAFT" && "NhÃ¡p"}
                      {post.status === "PUBLISHED" && "ÄÃ£ xuáº¥t báº£n"}
                      {post.status === "ARCHIVED" && "ÄÃ£ lÆ°u trá»¯"}
                    </span>
                    {typeof post.category === "object" && post.category && (
                      <span className="text-xs text-gray-500">
                        {post.category.name}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-black mb-2 line-clamp-2">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{post.viewCount} lÆ°á»£t xem</span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-gray-200">
                  <button
                    onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors border-r border-gray-200"
                  >
                    <FiEye className="w-4 h-4" />
                    <span className="text-sm">Xem</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPost(post);
                      setShowModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors border-r border-gray-200"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span className="text-sm">Sá»­a</span>
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors text-mono-700"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span className="text-sm">XÃ³a</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                TrÆ°á»›c
              </button>

              <span className="text-gray-600">
                Trang {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <BlogPostFormModal
          post={selectedPost}
          categories={categories}
          onClose={() => {
            setShowModal(false);
            setSelectedPost(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setSelectedPost(null);
            fetchPosts();
          }}
        />
      )}
    </div>
  );
};

export default BlogManagement;


