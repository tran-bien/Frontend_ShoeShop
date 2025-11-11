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
import type { BlogPost, BlogPostStatus } from "../../../types/blog";

const BlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | "all">(
    "all"
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

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
        setPosts(response.data.data.posts);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    try {
      await adminBlogService.deletePost(id);
      toast.success("Xóa bài viết thành công");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Không thể xóa bài viết");
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchPosts();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: "bg-gray-200 text-gray-700",
      published: "bg-black text-white",
      archived: "bg-gray-400 text-white",
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Quản Lý Blog</h1>
        <p className="text-gray-600">Quản lý bài viết và nội dung blog</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
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
            Tìm
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
            <option value="all">Tất cả</option>
            <option value="draft">Nháp</option>
            <option value="published">Đã xuất bản</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
        </div>

        {/* Create Button */}
        <button
          onClick={() => (window.location.href = "/admin/blogs/create")}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Tạo bài viết
        </button>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">Chưa có bài viết nào</p>
          <button
            onClick={() => (window.location.href = "/admin/blogs/create")}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Tạo bài viết đầu tiên
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
                      {post.status === "draft" && "Nháp"}
                      {post.status === "published" && "Đã xuất bản"}
                      {post.status === "archived" && "Đã lưu trữ"}
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
                    <span>{post.viewCount} lượt xem</span>
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
                    onClick={() =>
                      (window.location.href = `/admin/blogs/edit/${post._id}`)
                    }
                    className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors border-r border-gray-200"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span className="text-sm">Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors text-red-600"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span className="text-sm">Xóa</span>
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
                Trước
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
    </div>
  );
};

export default BlogManagement;
