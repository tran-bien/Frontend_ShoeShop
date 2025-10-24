import React, { useEffect, useState } from "react";
import { variantApi } from "../../../services/VariantService";
import { Variant } from "../../../types/product";
import VariantForm from "./VariantForm";
import VariantImagesManager from "./VariantImagesManager";
import { useAuth } from "../../../hooks/useAuth";

const VariantPage: React.FC = () => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [deletedVariants, setDeletedVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVariants, setTotalVariants] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [isActiveFilter, setIsActiveFilter] = useState("all");
  const [sortOption, setSortOption] = useState('{"createdAt":-1}');
  const limit = 10;

  const {
    canToggleStatus,
    canDelete,
    canUpdate,
    canCreate,
    hasStaffAccess,
    hasAdminOnlyAccess,
  } = useAuth();

  // State cho quản lý ảnh
  const [showImageManager, setShowImageManager] = useState<string | null>(null);
  const [variantImages, setVariantImages] = useState<Variant["imagesvariant"]>(
    []
  );

  // Lấy danh sách biến thể
  const fetchVariants = async (page: number = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        page,
        limit,
        ...(searchQuery && { search: searchQuery }),
        ...(genderFilter !== "all" && { gender: genderFilter }),
        ...(isActiveFilter !== "all" && {
          isActive: isActiveFilter === "true",
        }),
        sort: sortOption,
      };

      const res = await variantApi.getAllVariants(params);
      const data = res.data.variants || res.data.data || [];
      const pagination = res.data.pagination;

      setVariants(data);
      setTotalPages(pagination?.totalPages || 1);
      setTotalVariants(pagination?.totalItems || 0);
      setCurrentPage(page);
    } catch {
      setVariants([]);
      setTotalPages(1);
      setTotalVariants(0);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách biến thể đã xóa
  const fetchDeletedVariants = async (page: number = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        page,
        limit,
        sort: sortOption,
      };

      const res = await variantApi.getDeletedVariants(params);
      const data = res.data.variants || res.data.data || [];
      const pagination = res.data.pagination;

      setDeletedVariants(data);
      setTotalPages(pagination?.totalPages || 1);
      setTotalVariants(pagination?.totalItems || 0);
      setCurrentPage(page);
    } catch {
      setDeletedVariants([]);
      setTotalPages(1);
      setTotalVariants(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showDeleted) {
      fetchDeletedVariants(currentPage);
    } else {
      fetchVariants(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showDeleted,
    currentPage,
    searchQuery,
    genderFilter,
    isActiveFilter,
    sortOption,
  ]);

  // Xóa mềm
  const handleDelete = async (id: string) => {
    await variantApi.deleteVariant(id);
    fetchVariants();
  };

  // Khôi phục
  const handleRestore = async (id: string) => {
    await variantApi.restoreVariant(id);
    if (showDeleted) {
      fetchDeletedVariants();
    }
    fetchVariants();
  };
  // Bắt đầu cập nhật
  const handleEdit = (variant: Variant) => {
    setEditingVariant(variant);
    setIsFormOpen(true);
  };

  // Mở form thêm mới
  const handleAddNew = () => {
    setEditingVariant(null);
    setIsFormOpen(true);
  };

  // Sau khi thêm/cập nhật thành công
  const handleSuccess = () => {
    setEditingVariant(null);
    setIsFormOpen(false);
    fetchVariants();
  };

  // Đóng form
  const handleCloseForm = () => {
    setEditingVariant(null);
    setIsFormOpen(false);
  };

  // Mở modal quản lý ảnh
  const handleOpenImageManager = async (variant: Variant) => {
    setShowImageManager(variant._id);
    // Lấy lại ảnh biến thể từ API
    if (variant.imagesvariant) {
      setVariantImages(variant.imagesvariant);
    } else {
      const res = await variantApi.getVariantById(variant._id);
      const variantData = res.data.variant || res.data.data?.variant;
      setVariantImages(variantData?.imagesvariant || []);
    }
  };

  return (
    <div className="p-6 w-full font-sans bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 tracking-tight leading-snug mb-6">
        Quản Lý Biến Thể Sản Phẩm
      </h2>

      {/* Tab chuyển đổi */}
      <div className="flex border-b mb-6 bg-white rounded-t-lg">
        <button
          onClick={() => {
            setShowDeleted(false);
            setCurrentPage(1);
          }}
          className={`px-6 py-3 font-medium transition border-b-2 -mb-px ${
            !showDeleted
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-blue-600"
          }`}
        >
          Biến thể hoạt động
          {!showDeleted && totalVariants > 0 ? ` (${totalVariants})` : ""}
        </button>
        {hasStaffAccess() && (
          <button
            onClick={() => {
              setShowDeleted(true);
              setCurrentPage(1);
            }}
            className={`px-6 py-3 font-medium transition border-b-2 -mb-px ${
              showDeleted
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-blue-600"
            }`}
          >
            Biến thể đã xóa
          </button>
        )}
        {!showDeleted && canCreate() && (
          <button
            className="ml-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium mr-3 my-2 transition-colors shadow-sm"
            onClick={handleAddNew}
          >
            + Thêm Biến Thể
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      {!showDeleted && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 space-y-4">
          {/* Search */}
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm biến thể theo sản phẩm, màu sắc..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Gender Filter */}
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">Tất cả giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="unisex">Unisex</option>
            </select>

            {/* Active Status Filter */}
            <select
              value={isActiveFilter}
              onChange={(e) => {
                setIsActiveFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="true">Hoạt động</option>
              <option value="false">Ngừng hoạt động</option>
            </select>

            {/* Sort */}
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value='{"createdAt":-1}'>Mới nhất</option>
              <option value='{"createdAt":1}'>Cũ nhất</option>
              <option value='{"updatedAt":-1}'>Cập nhật gần đây</option>
            </select>

            {/* Clear Filters */}
            {(searchQuery ||
              genderFilter !== "all" ||
              isActiveFilter !== "all" ||
              sortOption !== '{"createdAt":-1}') && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setGenderFilter("all");
                  setIsActiveFilter("all");
                  setSortOption('{"createdAt":-1}');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                ✕ Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      )}
      {/* Modal hiển thị form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
              onClick={handleCloseForm}
              title="Đóng"
            >
              ×
            </button>
            <VariantForm
              onSuccess={handleSuccess}
              editingVariant={editingVariant}
            />
          </div>
        </div>
      )}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (showDeleted ? deletedVariants : variants).length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showDeleted
              ? "Không có biến thể nào đã xóa"
              : "Không tìm thấy biến thể"}
          </h3>
          <p className="text-gray-500">
            {showDeleted
              ? "Chưa có biến thể nào bị xóa trong hệ thống"
              : searchQuery || genderFilter !== "all"
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              : "Hãy thêm biến thể đầu tiên cho sản phẩm"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto shadow-md rounded-lg bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Biến thể
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Màu sắc
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Giới tính
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Size & SKU
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(showDeleted ? deletedVariants : variants).map((v) => {
                  const totalQuantity =
                    v.inventorySummary?.totalQuantity ||
                    v.sizes?.reduce((sum, s) => sum + (s.quantity || 0), 0) ||
                    0;
                  const stockStatus =
                    v.inventorySummary?.stockStatus ||
                    (totalQuantity > 10
                      ? "in_stock"
                      : totalQuantity > 0
                      ? "low_stock"
                      : "out_of_stock");

                  return (
                    <tr
                      key={v._id}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {typeof v.product === "object"
                              ? v.product.name
                              : v.product}
                          </p>
                          <p
                            className="text-xs text-gray-500 font-mono"
                            title={v._id}
                          >
                            ID: {v._id.slice(-8)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
                            {typeof v.color === "object" && (
                              <>
                                {v.color.type === "solid" && v.color.code ? (
                                  <div
                                    className="w-9 h-9 rounded-full border-2 border-gray-300 shadow-sm"
                                    style={{
                                      background: v.color.code || "#e5e7eb",
                                    }}
                                    title={`Solid: ${v.color.code}`}
                                  ></div>
                                ) : v.color.type === "half" &&
                                  v.color.colors?.length === 2 ? (
                                  <div
                                    className="w-9 h-9 rounded-full border-2 border-gray-300 shadow-sm relative overflow-hidden"
                                    title={`Half: ${v.color.colors.join(
                                      " / "
                                    )}`}
                                  >
                                    <div
                                      className="absolute inset-0 rounded-full"
                                      style={{
                                        background: `linear-gradient(90deg, ${v.color.colors[0]} 50%, ${v.color.colors[1]} 50%)`,
                                      }}
                                    ></div>
                                  </div>
                                ) : v.color.colors &&
                                  v.color.colors.length > 0 ? (
                                  <div
                                    className="w-9 h-9 rounded-full border-2 border-gray-300 shadow-sm relative overflow-hidden"
                                    title={v.color.colors.join(" / ")}
                                  >
                                    <div
                                      className="absolute inset-0 rounded-full"
                                      style={{
                                        background: `linear-gradient(90deg, ${v.color.colors
                                          .map(
                                            (
                                              c: string,
                                              i: number,
                                              arr: string[]
                                            ) => {
                                              const percent = Math.round(
                                                (100 / arr.length) * (i + 1)
                                              );
                                              return `${c} ${percent}%`;
                                            }
                                          )
                                          .join(", ")})`,
                                      }}
                                    ></div>
                                  </div>
                                ) : null}
                              </>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {typeof v.color === "object"
                              ? v.color.name
                              : v.color}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            v.gender === "male"
                              ? "bg-blue-100 text-blue-800"
                              : v.gender === "female"
                              ? "bg-pink-100 text-pink-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {v.gender === "male"
                            ? "Nam"
                            : v.gender === "female"
                            ? "Nữ"
                            : "Unisex"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {v.sizes?.slice(0, 3).map((s, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-gray-600 flex items-center gap-2"
                            >
                              <span className="font-semibold bg-gray-100 px-2 py-0.5 rounded">
                                {typeof s.size === "object"
                                  ? s.size.value
                                  : s.size}
                              </span>
                              {s.sku && (
                                <span
                                  className="font-mono text-gray-500"
                                  title="SKU"
                                >
                                  {s.sku}
                                </span>
                              )}
                            </div>
                          ))}
                          {v.sizes && v.sizes.length > 3 && (
                            <span className="text-xs text-blue-600 font-medium">
                              +{v.sizes.length - 3} size khác
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {
                            {
                              in_stock: (
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                                  Còn hàng
                                </span>
                              ),
                              low_stock: (
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                                  Sắp hết
                                </span>
                              ),
                              out_of_stock: (
                                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                                  Hết hàng
                                </span>
                              ),
                            }[stockStatus]
                          }
                          <span className="text-xs text-gray-500 font-medium">
                            SL: {totalQuantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {v.deletedAt ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                            Đã xóa
                          </span>
                        ) : (
                          <span
                            className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${
                              v.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {v.isActive ? "✓ Hoạt động" : "✕ Ngừng"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center flex-wrap">
                          {!showDeleted ? (
                            <>
                              <button
                                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium rounded-lg border border-purple-200 transition-colors flex items-center gap-1.5"
                                onClick={() => handleOpenImageManager(v)}
                                title="Quản lý ảnh"
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
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                Ảnh
                              </button>
                              {canUpdate() && (
                                <button
                                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-colors flex items-center gap-1.5"
                                  onClick={() => handleEdit(v)}
                                  title="Sửa biến thể"
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
                              {canToggleStatus() && (
                                <button
                                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                                    v.isActive
                                      ? "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                                      : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                  }`}
                                  onClick={async () => {
                                    await variantApi.updateStatus(
                                      v._id,
                                      !v.isActive
                                    );
                                    fetchVariants(currentPage);
                                  }}
                                  title={
                                    v.isActive ? "Tắt hoạt động" : "Kích hoạt"
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
                                  {v.isActive ? "Tắt" : "Bật"}
                                </button>
                              )}
                              {canDelete() && !v.deletedAt && (
                                <button
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg border border-red-200 transition-colors flex items-center gap-1.5"
                                  onClick={() => handleDelete(v._id)}
                                  title="Xóa biến thể"
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
                            hasAdminOnlyAccess() && (
                              <button
                                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-lg border border-green-200 transition-colors flex items-center gap-1.5"
                                onClick={() => handleRestore(v._id)}
                                title="Khôi phục biến thể"
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-4 flex items-center justify-between border-t border-gray-200 rounded-b-lg shadow-sm mt-0">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * limit + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * limit, totalVariants)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{totalVariants}</span> biến
                    thể
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>
                    {[...Array(totalPages)].map((_, idx) => {
                      const page = idx + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? "z-10 bg-blue-600 border-blue-600 text-white"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* Modal quản lý ảnh variant */}
      {showImageManager && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-xl relative">
            <button
              className="absolute top-2 right-2 text-xl font-bold"
              onClick={() => setShowImageManager(null)}
            >
              ×
            </button>
            <VariantImagesManager
              variantId={showImageManager}
              images={variantImages}
              reloadImages={async () => {
                // Gọi lại API lấy variant theo id
                const res = await variantApi.getVariantById(showImageManager);
                const variantData = res.data.variant || res.data.data?.variant;
                setVariantImages(variantData?.imagesvariant || []);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantPage;
