import { useState, useEffect, useCallback } from "react";
import { adminBlogService } from "../../../services/BlogService";
import type {
  BlogPost,
  BlogCategory,
  BlogPostQueryParams,
} from "../../../types/blog";
import { useAuth } from "../../../hooks/useAuth";
import toast from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import BlogPostFormModal from "../../../components/Admin/Blog/BlogPostFormModal";
import BlogCategoryFormModal from "../../../components/Admin/Blog/BlogCategoryFormModal";

const AdminBlogPage = () => {
  const { canCreate, canUpdate, canDelete } = useAuth();

  // States
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "categories">("posts");

  // Post states
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postParams, setPostParams] = useState<BlogPostQueryParams>({
    page: 1,
    limit: 10,
  });
  const [postPagination, setPostPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Category states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(
    null
  );

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminBlogService.getAllPosts(postParams);
      setPosts(data.data.posts);
      setPostPagination(data.data.pagination);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, [postParams]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await adminBlogService.getAllCategories();
      setCategories(data.data.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle filter change
  const handleFilterChange = useCallback(() => {
    setPostParams((prev) => ({
      ...prev,
      page: 1,
      status:
        filterStatus !== "all"
          ? (filterStatus as "draft" | "published" | "archived")
          : undefined,
      categoryId: filterCategory !== "all" ? filterCategory : undefined,
      search: searchQuery || undefined,
    }));
  }, [filterStatus, filterCategory, searchQuery]);

  useEffect(() => {
    handleFilterChange();
  }, [handleFilterChange]);

  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    try {
      await adminBlogService.deletePost(postId);
      toast.success("Đã xóa bài viết");
      fetchPosts();
    } catch {
      toast.error("Không thể xóa bài viết");
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    try {
      await adminBlogService.deleteCategory(categoryId);
      toast.success("Đã xóa danh mục");
      fetchCategories();
    } catch {
      toast.error("Không thể xóa danh mục");
    }
  };

  // Publish/Archive post
  const handleToggleStatus = async (postId: string, currentStatus: string) => {
    try {
      if (currentStatus === "published") {
        await adminBlogService.archivePost(postId);
        toast.success("Đã lưu trữ bài viết");
      } else {
        await adminBlogService.publishPost(postId);
        toast.success("Đã xuất bản bài viết");
      }
      fetchPosts();
    } catch {
      toast.error("Không thể thay đổi trạng thái");
    }
  };

  return (
    <div className="min-h-screen bg-mono-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-mono-black mb-2">
            Quản lý Blog
          </h1>
          <p className="text-mono-600">
            Quản lý bài viết và danh mục blog của shop
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-mono-200">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "posts"
                ? "text-mono-black"
                : "text-mono-600 hover:text-mono-black"
            }`}
          >
            Bài viết ({postPagination.total})
            {activeTab === "posts" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mono-black" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "categories"
                ? "text-mono-black"
                : "text-mono-600 hover:text-mono-black"
            }`}
          >
            Danh mục ({categories.length})
            {activeTab === "categories" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mono-black" />
            )}
          </button>
        </div>

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <>
            {/* Filters & Actions */}
            <div className="bg-white border border-mono-200 rounded-xl p-6 mb-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-3 flex-wrap flex-1">
                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
                  />

                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="draft">Bản nháp</option>
                    <option value="archived">Đã lưu trữ</option>
                  </select>

                  {/* Category Filter */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
                  >
                    <option value="all">Tất cả danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Create Button */}
                {canCreate() && (
                  <button
                    onClick={() => {
                      setEditingPost(null);
                      setShowPostModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Tạo bài viết
                  </button>
                )}
              </div>
            </div>

            {/* Posts Table */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-2 border-mono-300 border-t-mono-black rounded-full animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white border border-mono-200 rounded-xl p-12 text-center">
                <p className="text-mono-600">Chưa có bài viết nào</p>
              </div>
            ) : (
              <>
                <div className="bg-white border border-mono-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-mono-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-mono-700 uppercase tracking-wider">
                          Bài viết
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-mono-700 uppercase tracking-wider">
                          Danh mục
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-mono-700 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-mono-700 uppercase tracking-wider">
                          Lượt xem
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-mono-700 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-mono-700 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-mono-100">
                      {posts.map((post) => (
                        <tr key={post._id} className="hover:bg-mono-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {post.featuredImage && (
                                <img
                                  src={post.featuredImage.url}
                                  alt={post.title}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <p className="font-medium text-mono-black">
                                  {post.title}
                                </p>
                                <p className="text-xs text-mono-500 line-clamp-1">
                                  {post.excerpt}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs bg-mono-100 text-mono-700 rounded">
                              {post.category.name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                post.status === "published"
                                  ? "bg-mono-200 text-mono-900"
                                  : post.status === "draft"
                                  ? "bg-mono-300 text-mono-900"
                                  : "bg-mono-100 text-mono-700"
                              }`}
                            >
                              {post.status === "published"
                                ? "Đã xuất bản"
                                : post.status === "draft"
                                ? "Bản nháp"
                                : "Lưu trữ"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-mono-600">
                            {post.viewCount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-mono-600">
                            {new Date(post.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-mono-600 hover:text-mono-black hover:bg-mono-100 rounded-lg transition-colors"
                                title="Xem"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </a>
                              {canUpdate() && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingPost(post);
                                      setShowPostModal(true);
                                    }}
                                    className="p-2 text-mono-600 hover:text-mono-black hover:bg-mono-100 rounded-lg transition-colors"
                                    title="Sửa"
                                  >
                                    <PencilIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleToggleStatus(post._id, post.status)
                                    }
                                    className="px-3 py-1 text-xs font-medium text-mono-700 bg-mono-100 hover:bg-mono-200 rounded transition-colors"
                                  >
                                    {post.status === "published"
                                      ? "Lưu trữ"
                                      : "Xuất bản"}
                                  </button>
                                </>
                              )}
                              {canDelete() && (
                                <button
                                  onClick={() => handleDeletePost(post._id)}
                                  className="p-2 text-mono-700 hover:text-mono-900 hover:bg-mono-100 rounded-lg transition-colors"
                                  title="Xóa"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {postPagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() =>
                        setPostParams((prev) => ({
                          ...prev,
                          page: prev.page! - 1,
                        }))
                      }
                      disabled={postPagination.page === 1}
                      className="px-4 py-2 text-sm font-medium text-mono-700 bg-white border border-mono-200 rounded-lg hover:bg-mono-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <span className="text-sm text-mono-700 px-4">
                      Trang {postPagination.page} / {postPagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPostParams((prev) => ({
                          ...prev,
                          page: prev.page! + 1,
                        }))
                      }
                      disabled={
                        postPagination.page >= postPagination.totalPages
                      }
                      className="px-4 py-2 text-sm font-medium text-mono-700 bg-white border border-mono-200 rounded-lg hover:bg-mono-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <>
            {/* Actions */}
            <div className="flex justify-end mb-6">
              {canCreate() && (
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setShowCategoryModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tạo danh mục
                </button>
              )}
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="bg-white border border-mono-200 rounded-xl p-6 hover:shadow-medium transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-mono-black mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-mono-600">
                        {category.description || "Chưa có mô tả"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        category.isActive
                          ? "bg-mono-200 text-mono-900"
                          : "bg-mono-100 text-mono-500"
                      }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-mono-100">
                    <span className="text-sm text-mono-600">
                      {category.postCount || 0} bài viết
                    </span>
                    <div className="flex items-center gap-2">
                      {canUpdate() && (
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setShowCategoryModal(true);
                          }}
                          className="p-2 text-mono-600 hover:text-mono-black hover:bg-mono-100 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      )}
                      {canDelete() && (
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="p-2 text-mono-700 hover:text-mono-900 hover:bg-mono-100 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modals */}
        {showPostModal && (
          <BlogPostFormModal
            post={editingPost}
            categories={categories}
            onClose={() => {
              setShowPostModal(false);
              setEditingPost(null);
            }}
            onSuccess={() => {
              setShowPostModal(false);
              setEditingPost(null);
              fetchPosts();
            }}
          />
        )}

        {showCategoryModal && (
          <BlogCategoryFormModal
            category={editingCategory}
            onClose={() => {
              setShowCategoryModal(false);
              setEditingCategory(null);
            }}
            onSuccess={() => {
              setShowCategoryModal(false);
              setEditingCategory(null);
              fetchCategories();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminBlogPage;

