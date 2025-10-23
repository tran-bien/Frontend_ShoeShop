import React, { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { sizeApi } from "../../../services/SizeService";
import AddSize from "./AddSixe";
import { useAuth } from "../../../hooks/useAuth";

interface Size {
  _id: string;
  value: number;
  type: "EU" | "US" | "UK" | "VN" | "CM" | "INCHES";
  description: string;
  deletedAt: string | null;
  deletedBy: string | { _id: string; name?: string } | null;
  createdAt: string;
  updatedAt: string;
}

// ViewDetailModal component
const ViewDetailModal: React.FC<{
  size: Size;
  onClose: () => void;
}> = ({ size, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Chi tiết Kích thước</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">ID</p>
              <p className="text-gray-800 font-mono text-sm">{size._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Giá trị size</p>
              <p className="text-gray-800 font-bold text-2xl">{size.value}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Loại size</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  size.type === "EU"
                    ? "bg-blue-100 text-blue-800"
                    : size.type === "US"
                    ? "bg-purple-100 text-purple-800"
                    : size.type === "UK"
                    ? "bg-green-100 text-green-800"
                    : size.type === "VN"
                    ? "bg-red-100 text-red-800"
                    : size.type === "CM"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {size.type}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Mô tả</p>
            <p className="text-gray-800 mt-1">
              {size.description || "Không có mô tả"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500 font-medium">Ngày tạo</p>
              <p className="text-gray-800 text-sm">
                {new Date(size.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Cập nhật lần cuối
              </p>
              <p className="text-gray-800 text-sm">
                {new Date(size.updatedAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
          {size.deletedAt && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 font-medium">Ngày xóa</p>
              <p className="text-gray-800 text-sm">
                {new Date(size.deletedAt).toLocaleString("vi-VN")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EditSizeModal: React.FC<{
  size: Size;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ size, onClose, onSuccess }) => {
  const [value, setValue] = useState<number>(size.value);
  const [type, setType] = useState<string>(size.type);
  const [description, setDescription] = useState(size.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sizeApi.update(size._id, { value, type, description });
      onSuccess();
      onClose();
    } catch {
      setError("Cập nhật size thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-300 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md relative text-black">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">Cập nhật Size</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-600">
              Giá trị size
            </label>
            <input
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              placeholder="Nhập giá trị size (VD: 41.5)"
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-600">
              Loại size
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="EU">EU (European)</option>
              <option value="US">US (United States)</option>
              <option value="UK">UK (United Kingdom)</option>
              <option value="VN">VN (Vietnam)</option>
              <option value="CM">CM (Centimeters)</option>
              <option value="INCHES">INCHES</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-600">
              Mô tả
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả"
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SizePage: React.FC = () => {
  const { canDelete, canCreate, canUpdate } = useAuth();
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sizes, setSizes] = useState<Size[]>([]);
  const [deletedSizes, setDeletedSizes] = useState<Size[]>([]);
  const [showAddSize, setShowAddSize] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sorting state
  const [sortOption, setSortOption] = useState<string>("created_at_desc");

  // Filter by type state
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Stats states
  const [activeCount, setActiveCount] = useState(0);
  const [deletedCount, setDeletedCount] = useState(0);

  // Detail modal state
  const [viewDetailSize, setViewDetailSize] = useState<Size | null>(null);

  const fetchSizes = async (page: number = 1) => {
    try {
      const params = {
        page,
        limit: 10,
        ...(searchQuery && { name: searchQuery }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        sort: sortOption,
      };
      const res = await sizeApi.getAll(params);
      setSizes(res.data.data || []);
      setCurrentPage(res.data.currentPage || 1);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    } catch {
      setSizes([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalCount(0);
    }
  };

  const fetchDeletedSizes = async (page: number = 1) => {
    try {
      const params = {
        page,
        limit: 10,
        ...(searchQuery && { name: searchQuery }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        sort: sortOption,
      };
      const res = await sizeApi.getDeleted(params);
      setDeletedSizes(res.data.data || []);
      setCurrentPage(res.data.currentPage || 1);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    } catch {
      setDeletedSizes([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalCount(0);
    }
  };

  // Fetch stats with limit=100 for estimation
  const fetchStats = async () => {
    try {
      const statsResponse = await sizeApi.getAll({ page: 1, limit: 100 });
      const statsData = statsResponse.data.data || [];
      const totalFromAPI = statsResponse.data.total || 0;

      if (totalFromAPI <= 100) {
        setActiveCount(statsData.length);
      } else {
        const ratio = totalFromAPI / statsData.length;
        setActiveCount(Math.round(statsData.length * ratio));
      }
    } catch {
      setActiveCount(0);
    }
  };

  const fetchDeletedStats = async () => {
    try {
      const deletedResponse = await sizeApi.getDeleted({ page: 1, limit: 100 });
      const totalDeleted = deletedResponse.data.total || 0;
      setDeletedCount(totalDeleted);
    } catch {
      setDeletedCount(0);
    }
  };

  useEffect(() => {
    if (showDeleted) {
      fetchDeletedSizes(currentPage);
      fetchDeletedStats();
    } else {
      fetchSizes(currentPage);
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDeleted, currentPage, searchQuery, sortOption, typeFilter]);

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

  const handleDeleteSize = async (_id: string) => {
    try {
      await sizeApi.delete(_id);
      if (showDeleted) {
        fetchDeletedSizes(currentPage);
      } else {
        fetchSizes(currentPage);
      }
      fetchStats();
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  const handleRestoreSize = async (_id: string) => {
    try {
      await sizeApi.restore(_id);
      fetchDeletedSizes(currentPage);
      fetchSizes(currentPage);
      fetchStats();
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  const displayedSizes = showDeleted ? deletedSizes : sizes;

  return (
    <div className="p-6 w-full font-sans">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight leading-snug">
          Danh Sách Kích Thước
        </h2>
        {!isSearchVisible ? (
          <button
            onClick={toggleSearchVisibility}
            className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 px-5 py-2 rounded-3xl shadow transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 active:bg-gray-200"
          >
            <IoIosSearch className="text-xl text-gray-500" />
            <span className="font-medium">Tìm kiếm</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 w-full max-w-md">
            <IoIosSearch
              onClick={handleBack}
              className="text-gray-400 cursor-pointer text-xl"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm theo mô tả..."
              className="w-full px-4 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {!showDeleted ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm border border-blue-200">
            <h3 className="text-sm font-medium text-blue-600 mb-1">
              Tổng số kích thước
            </h3>
            <p className="text-3xl font-bold text-blue-900">{totalCount}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200">
            <h3 className="text-sm font-medium text-green-600 mb-1">
              Đang hoạt động
            </h3>
            <p className="text-3xl font-bold text-green-900">{activeCount}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-sm border border-red-200">
            <h3 className="text-sm font-medium text-red-600 mb-1">
              Tổng số kích thước đã xóa
            </h3>
            <p className="text-3xl font-bold text-red-900">{deletedCount}</p>
          </div>
        </div>
      )}

      {/* Tab chuyển đổi và Sort */}
      <div className="flex items-center justify-between border-b mb-4">
        <div className="flex">
          <button
            className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
              !showDeleted
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-blue-600"
            }`}
            onClick={() => {
              setShowDeleted(false);
              setCurrentPage(1);
            }}
          >
            Size đang hoạt động
          </button>
          <button
            className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
              showDeleted
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-blue-600"
            }`}
            onClick={() => {
              setShowDeleted(true);
              setCurrentPage(1);
            }}
          >
            Size đã xóa
          </button>
        </div>
        <div className="flex items-center gap-3 mb-2">
          {/* Type Filter Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">Tất cả loại</option>
            <option value="EU">EU</option>
            <option value="US">US</option>
            <option value="UK">UK</option>
            <option value="VN">VN</option>
            <option value="CM">CM</option>
            <option value="INCHES">INCHES</option>
          </select>
          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="created_at_desc">Mới nhất</option>
            <option value="created_at_asc">Cũ nhất</option>
            <option value="name_asc">Size tăng dần</option>
            <option value="name_desc">Size giảm dần</option>
          </select>
          {!showDeleted && canCreate() && (
            <button
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
              onClick={() => setShowAddSize(true)}
            >
              + Thêm Kích Thước
            </button>
          )}
        </div>
      </div>
      {/* Hiển thị modal thêm size */}
      {showAddSize && (
        <AddSize
          handleClose={() => setShowAddSize(false)}
          onSuccess={fetchSizes}
        />
      )}
      {/* Hiển thị modal sửa size */}
      {editingSize && (
        <EditSizeModal
          size={editingSize}
          onClose={() => setEditingSize(null)}
          onSuccess={fetchSizes}
        />
      )}
      {/* Sizes Table */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-md overflow-hidden border">
          <thead className="bg-gray-50 text-gray-700 text-sm font-semibold uppercase">
            <tr>
              <th className="py-3 px-4 text-left border-b">ID</th>
              <th className="py-3 px-4 text-left border-b">Giá Trị</th>
              <th className="py-3 px-4 text-left border-b">Loại</th>
              <th className="py-3 px-4 text-left border-b">Mô Tả</th>
              <th className="py-3 px-4 text-center border-b">Trạng Thái</th>
              <th className="py-3 px-4 text-center border-b">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {displayedSizes.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 border-t">
                <td className="py-2 px-4 border-b font-mono text-xs">
                  {item._id.slice(-8)}
                </td>
                <td className="py-2 px-4 border-b text-lg font-bold">
                  {item.value}
                </td>
                <td className="py-2 px-4 border-b">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      item.type === "EU"
                        ? "bg-blue-100 text-blue-800"
                        : item.type === "US"
                        ? "bg-purple-100 text-purple-800"
                        : item.type === "UK"
                        ? "bg-green-100 text-green-800"
                        : item.type === "VN"
                        ? "bg-red-100 text-red-800"
                        : item.type === "CM"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.type}
                  </span>
                </td>
                <td className="py-2 px-4 border-b text-sm">
                  {item.description}
                </td>
                <td className="py-2 px-4 border-b text-center text-sm">
                  {item.deletedAt ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      Đã xóa
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Hoạt động
                    </span>
                  )}
                </td>
                <td className="py-2 px-4 border-b text-center text-sm">
                  <div className="flex flex-wrap gap-1.5 justify-center min-w-[140px]">
                    <button
                      onClick={() => setViewDetailSize(item)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5"
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
                            onClick={() => setEditingSize(item)}
                            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-colors flex items-center gap-1.5"
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
                            onClick={() => handleDeleteSize(item._id)}
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
                      </>
                    ) : (
                      canUpdate() && (
                        <button
                          onClick={() => handleRestoreSize(item._id)}
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
        <div className="text-sm text-gray-600">
          Trang {currentPage} / {totalPages} • Tổng: {totalCount} kích thước
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                  className="px-3 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                >
                  1
                </button>
              );
              if (startPage > 2) {
                pages.push(
                  <span key="ellipsis1" className="px-2 text-gray-500">
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
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                  <span key="ellipsis2" className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }
              pages.push(
                <button
                  key={totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
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
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Tiếp
          </button>
        </div>
      </div>

      {/* View Detail Modal */}
      {viewDetailSize && (
        <ViewDetailModal
          size={viewDetailSize}
          onClose={() => setViewDetailSize(null)}
        />
      )}
    </div>
  );
};

export default SizePage;
