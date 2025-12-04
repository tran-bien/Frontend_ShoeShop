import React, { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { Category } from "../../../types/category";
import { categoryApi } from "../../../services/CategoryService";
import AddCategoryPage from "./AddCategories";
import { useAuth } from "../../../hooks/useAuth";

interface CategoryPageCategory extends Category {
  deletedAt?: string | null;
  deletedBy?: string | { _id: string; name?: string } | null;
}

// ViewDetailModal component
const ViewDetailModal: React.FC<{
  category: CategoryPageCategory;
  onClose: () => void;
}> = ({ category, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-mono-black to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Chi tiết Danh mục</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-mono-200 text-3xl font-bold leading-none"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-mono-500 font-medium">ID</p>
              <p className="text-mono-800 font-mono text-sm">{category._id}</p>
            </div>
            <div>
              <p className="text-sm text-mono-500 font-medium">Tên danh mục</p>
              <p className="text-mono-800 font-semibold">{category.name}</p>
            </div>
            <div>
              <p className="text-sm text-mono-500 font-medium">Slug</p>
              <p className="text-mono-800 font-mono text-sm">{category.slug}</p>
            </div>
            <div>
              <p className="text-sm text-mono-500 font-medium">Trạng thái</p>
              <div className="mt-1">
                {category.isActive ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    Không hoạt động
                  </span>
                )}
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-mono-500 font-medium">Mô tả</p>
            <p className="text-mono-800 mt-1">
              {category.description || "Không có mô tả"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-mono-500 font-medium">Ngày tạo</p>
              <p className="text-mono-800 text-sm">
                {category.createdAt
                  ? new Date(category.createdAt).toLocaleString("vi-VN")
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-mono-500 font-medium">
                Cập nhật lần cuối
              </p>
              <p className="text-mono-800 text-sm">
                {category.updatedAt
                  ? new Date(category.updatedAt).toLocaleString("vi-VN")
                  : "N/A"}
              </p>
            </div>
          </div>
          {category.deletedAt && (
            <div className="pt-4 border-t">
              <p className="text-sm text-mono-500 font-medium">Ngày xóa</p>
              <p className="text-mono-800 text-sm">
                {new Date(category.deletedAt).toLocaleString("vi-VN")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EditCategoryModal: React.FC<{
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await categoryApi.update(category._id, formData);
      onSuccess();
      onClose();
    } catch {
      setError("Cập nhật danh mục thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-mono-300 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md relative text-black">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-mono-500 hover:text-mono-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">
          Cập nhật Danh Mục
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-black">
              Tên Danh Mục
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              Mô Tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
            />
          </div>
          {error && <div className="text-mono-800 text-sm">{error}</div>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-mono-500 text-white px-4 py-2 rounded-md hover:bg-mono-black transition"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ListCategoriesPage: React.FC = () => {
  const {
    canCreate,
    canUpdate,
    canDelete,
    canToggleStatus,
    hasStaffAccess,
    hasAdminOnlyAccess,
  } = useAuth();
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categories, setCategories] = useState<CategoryPageCategory[]>([]);
  const [deletedCategories, setDeletedCategories] = useState<
    CategoryPageCategory[]
  >([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryPageCategory | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sorting state
  const [sortOption, setSortOption] = useState<string>("created_at_desc");

  // Stats states
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  // Detail modal state
  const [viewDetailCategory, setViewDetailCategory] =
    useState<CategoryPageCategory | null>(null);

  const fetchCategories = async (page: number = 1) => {
    try {
      const params = {
        page,
        limit: 10,
        ...(searchQuery && { name: searchQuery }),
        sort: sortOption,
      };
      const res = await categoryApi.getAll(params);
      setCategories(res.data.data || []);
      setCurrentPage(res.data.currentPage || 1);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    } catch {
      setCategories([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalCount(0);
    }
  };

  const fetchDeletedCategories = async (page: number = 1) => {
    try {
      const params = {
        page,
        limit: 10,
        ...(searchQuery && { name: searchQuery }),
        sort: sortOption,
      };
      const res = await categoryApi.getDeleted(params);
      setDeletedCategories(res.data.data || []);
      setCurrentPage(res.data.currentPage || 1);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    } catch {
      setDeletedCategories([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalCount(0);
    }
  };

  // Fetch stats with limit=100 for estimation
  const fetchStats = async () => {
    try {
      const statsResponse = await categoryApi.getAll({ page: 1, limit: 100 });
      const statsData = statsResponse.data.data || [];
      const totalFromAPI = statsResponse.data.total || 0;

      if (totalFromAPI <= 100) {
        // 100% accurate for ≤100 items
        const active = statsData.filter((c: Category) => c.isActive).length;
        const inactive = statsData.filter((c: Category) => !c.isActive).length;
        setActiveCount(active);
        setInactiveCount(inactive);
      } else {
        // Estimate for >100 items
        const sampleActive = statsData.filter(
          (c: Category) => c.isActive
        ).length;
        const sampleInactive = statsData.filter(
          (c: Category) => !c.isActive
        ).length;
        const ratio = totalFromAPI / statsData.length;
        setActiveCount(Math.round(sampleActive * ratio));
        setInactiveCount(Math.round(sampleInactive * ratio));
      }
    } catch {
      setActiveCount(0);
      setInactiveCount(0);
    }
  };

  useEffect(() => {
    if (showDeleted) {
      fetchDeletedCategories(currentPage);
    } else {
      fetchCategories(currentPage);
      fetchStats();
    }
  }, [showDeleted, currentPage, searchQuery, sortOption]);

  const handleBack = () => {
    setIsSearchVisible(false);
    setSearchQuery("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const toggleSearchVisibility = () => {
    setIsSearchVisible(true);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryApi.delete(id);
      if (showDeleted) {
        fetchDeletedCategories(currentPage);
      } else {
        fetchCategories(currentPage);
      }
      fetchStats();
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  const handleRestoreCategory = async (id: string) => {
    try {
      await categoryApi.restore(id);
      fetchDeletedCategories(currentPage);
      fetchCategories(currentPage);
      fetchStats();
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  const handleUpdateStatus = async (id: string, isActive: boolean) => {
    try {
      await categoryApi.updateStatus(id, { isActive });
      fetchCategories(currentPage);
      fetchStats();
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  const displayedCategories = showDeleted ? deletedCategories : categories;

  return (
    <div className="p-6 w-full font-sans">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-mono-800 tracking-tight leading-snug">
          Danh Sách Danh Mục
        </h2>
        {!isSearchVisible ? (
          <button
            onClick={toggleSearchVisibility}
            className="flex items-center gap-2 border border-mono-300 bg-white hover:bg-mono-100 text-mono-700 px-5 py-2 rounded-3xl shadow transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-mono-400 active:bg-mono-200"
          >
            <IoIosSearch className="text-xl text-mono-500" />
            <span className="font-medium">Tìm kiếm</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 w-full max-w-md">
            <IoIosSearch
              onClick={handleBack}
              className="text-mono-400 cursor-pointer text-xl"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm theo tên danh mục..."
              className="w-full px-4 py-2 border border-mono-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-mono-600"
            />
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {!showDeleted && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-mono-50 to-mono-100 rounded-xl p-6 shadow-sm border border-mono-200">
            <h3 className="text-sm font-medium text-mono-black mb-1">
              Tổng số danh mục
            </h3>
            <p className="text-3xl font-bold text-blue-900">{totalCount}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200">
            <h3 className="text-sm font-medium text-mono-800 mb-1">
              Đang hoạt động
            </h3>
            <p className="text-3xl font-bold text-green-900">{activeCount}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 shadow-sm border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-600 mb-1">
              Không hoạt động
            </h3>
            <p className="text-3xl font-bold text-yellow-900">
              {inactiveCount}
            </p>
          </div>
        </div>
      )}

      {/* Tab chuyển đổi và Sort */}
      <div className="flex items-center justify-between border-b mb-4">
        <div className="flex">
          <button
            onClick={() => {
              setShowDeleted(false);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
              !showDeleted
                ? "text-mono-black border-mono-black"
                : "text-mono-500 border-transparent hover:text-mono-black"
            }`}
          >
            Danh mục đang hoạt động
          </button>
          {hasStaffAccess() && (
            <button
              onClick={() => {
                setShowDeleted(true);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
                showDeleted
                  ? "text-mono-black border-mono-black"
                  : "text-mono-500 border-transparent hover:text-mono-black"
              }`}
            >
              Danh mục đã xóa
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mb-2">
          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-mono-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-600"
          >
            <option value="created_at_desc">Mới nhất</option>
            <option value="created_at_asc">Cũ nhất</option>
            <option value="name_asc">Tên A-Z</option>
            <option value="name_desc">Tên Z-A</option>
          </select>
          {!showDeleted && canCreate() && (
            <button
              className="px-4 py-2 bg-gradient-to-r from-mono-black to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
              onClick={() => setShowAddCategory(true)}
            >
              + Thêm Danh Mục
            </button>
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <AddCategoryPage
          handleClose={() => setShowAddCategory(false)}
          onSuccess={fetchCategories}
        />
      )}
      {/* Edit Category Modal */}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={fetchCategories}
        />
      )}

      {/* Categories Table */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-md overflow-hidden border">
          <thead className="bg-mono-50 text-mono-700 text-sm font-semibold uppercase">
            <tr>
              <th className="py-3 px-4 text-left border-b">ID</th>
              <th className="py-3 px-4 text-left border-b">Tên Danh Mục</th>
              <th className="py-3 px-4 text-left border-b">Slug</th>
              <th className="py-3 px-4 text-left border-b">Mô Tả</th>
              <th className="py-3 px-4 text-center border-b">Trạng Thái</th>

              <th className="py-3 px-4 text-center border-b">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {displayedCategories.map((item) => (
              <tr key={item._id} className="hover:bg-mono-50 border-t">
                <td className="px-4 py-3 font-mono text-xs">
                  {item._id.slice(-8)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold">{item.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{item.slug}</td>
                <td className="px-4 py-3 text-sm">
                  {item.description && item.description.length > 50
                    ? `${item.description.substring(0, 50)}...`
                    : item.description || "Không có mô tả"}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.deletedAt ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      Đã xóa
                    </span>
                  ) : item.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      Không hoạt động
                    </span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5 justify-center min-w-[140px]">
                    <button
                      onClick={() => setViewDetailCategory(item)}
                      className="px-3 py-1.5 bg-mono-50 hover:bg-mono-100 text-blue-700 text-xs font-medium rounded-lg border border-mono-200 transition-colors flex items-center gap-1.5"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Xem
                    </button>
                    {!showDeleted ? (
                      <>
                        {canUpdate() && (
                          <button
                            onClick={() => setEditingCategory(item)}
                            className="px-3 py-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 text-xs font-medium rounded-lg border border-mono-200 transition-colors flex items-center gap-1.5"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Sửa
                          </button>
                        )}
                        {canDelete() && (
                          <button
                            onClick={() => handleDeleteCategory(item._id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg border border-red-200 transition-colors flex items-center gap-1.5"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Xóa
                          </button>
                        )}
                        {canToggleStatus() && (
                          <button
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                              item.isActive
                                ? "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            }`}
                            onClick={() =>
                              handleUpdateStatus(item._id, !item.isActive)
                            }
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            {item.isActive ? "Tắt" : "Bật"}
                          </button>
                        )}
                      </>
                    ) : (
                      hasAdminOnlyAccess() && (
                        <button
                          onClick={() => handleRestoreCategory(item._id)}
                          className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-lg border border-green-200 transition-colors flex items-center gap-1.5"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Khôi phục
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-mono-600">
          Trang {currentPage} / {totalPages} • Tổng: {totalCount} danh mục
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === 1
                ? "bg-mono-300 text-mono-500 cursor-not-allowed"
                : "bg-mono-200 text-mono-700 hover:bg-mono-300"
            }`}
          >
            Trước
          </button>

          {/* Page Numbers */}
          {(() => {
            const pages = [];
            const showPages = 5; // Number of page buttons to show
            let startPage = Math.max(
              1,
              currentPage - Math.floor(showPages / 2)
            );
            const endPage = Math.min(totalPages, startPage + showPages - 1);

            // Adjust start if we're near the end
            if (endPage - startPage < showPages - 1) {
              startPage = Math.max(1, endPage - showPages + 1);
            }

            // First page
            if (startPage > 1) {
              pages.push(
                <button
                  key={1}
                  onClick={() => setCurrentPage(1)}
                  className="px-3 py-2 rounded-lg font-medium bg-mono-200 text-mono-700 hover:bg-mono-300 transition-all"
                >
                  1
                </button>
              );
              if (startPage > 2) {
                pages.push(
                  <span key="ellipsis1" className="px-2 text-mono-500">
                    ...
                  </span>
                );
              }
            }

            // Middle pages
            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    i === currentPage
                      ? "bg-mono-black text-white"
                      : "bg-mono-200 text-mono-700 hover:bg-mono-300"
                  }`}
                >
                  {i}
                </button>
              );
            }

            // Last page
            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(
                  <span key="ellipsis2" className="px-2 text-mono-500">
                    ...
                  </span>
                );
              }
              pages.push(
                <button
                  key={totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-2 rounded-lg font-medium bg-mono-200 text-mono-700 hover:bg-mono-300 transition-all"
                >
                  {totalPages}
                </button>
              );
            }

            return pages;
          })()}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === totalPages
                ? "bg-mono-300 text-mono-500 cursor-not-allowed"
                : "bg-mono-200 text-mono-700 hover:bg-mono-300"
            }`}
          >
            Tiếp
          </button>
        </div>
      </div>

      {/* View Detail Modal */}
      {viewDetailCategory && (
        <ViewDetailModal
          category={viewDetailCategory}
          onClose={() => setViewDetailCategory(null)}
        />
      )}
    </div>
  );
};

export default ListCategoriesPage;
