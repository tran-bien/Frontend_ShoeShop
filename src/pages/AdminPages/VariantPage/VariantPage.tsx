import React, { useEffect, useState } from "react";
import { adminVariantService } from "../../../services/VariantService";
import { Variant } from "../../../types/variant";
import VariantForm from "./VariantForm";
import VariantImagesManager from "./VariantImagesManager";
import ColorSwatch from "../../../components/Custom/ColorSwatch";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-hot-toast";
import defaultImage from "../../../assets/image_df.png";

const VariantPage: React.FC = () => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [deletedVariants, setDeletedVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // State cho modal xác nhận xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<Variant | null>(null);

  // State cho expanded sizes dropdown
  const [expandedSizes, setExpandedSizes] = useState<Record<string, boolean>>(
    {}
  );

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

      const res = await adminVariantService.getAllVariants(params);
      // Handle response structure: data array + pagination fields at root level
      const responseData = res.data as unknown as {
        variants?: Variant[];
        data?: Variant[];
        totalPages?: number;
        total?: number;
        pagination?: { totalPages?: number; totalItems?: number };
      };
      const data = responseData.variants || responseData.data || [];
      // BE trả về pagination fields trực tiếp: totalPages, total, currentPage
      const totalPagesFromRes =
        responseData.totalPages || responseData.pagination?.totalPages || 1;
      const totalItemsFromRes =
        responseData.total || responseData.pagination?.totalItems || 0;

      setVariants(data as Variant[]);
      setTotalPages(totalPagesFromRes);
      setTotalVariants(totalItemsFromRes);
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

      const res = await adminVariantService.getDeletedVariants(params);
      // Handle response structure: data array + pagination fields at root level
      const responseData = res.data as unknown as {
        variants?: Variant[];
        data?: Variant[];
        totalPages?: number;
        total?: number;
        pagination?: { totalPages?: number; totalItems?: number };
      };
      const data = responseData.variants || responseData.data || [];
      // BE trả về pagination fields trực tiếp: totalPages, total, currentPage
      const totalPagesFromRes =
        responseData.totalPages || responseData.pagination?.totalPages || 1;
      const totalItemsFromRes =
        responseData.total || responseData.pagination?.totalItems || 0;

      setDeletedVariants(data as Variant[]);
      setTotalPages(totalPagesFromRes);
      setTotalVariants(totalItemsFromRes);
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
  const handleDelete = async (variant: Variant) => {
    setVariantToDelete(variant);
    setShowDeleteModal(true);
  };

  // Xác nhận xóa
  const confirmDelete = async () => {
    if (!variantToDelete) return;
    try {
      await adminVariantService.deleteVariant(variantToDelete._id);
      toast.success("Đã xóa biến thể thành công");
      setShowDeleteModal(false);
      setVariantToDelete(null);
      fetchVariants();
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Không thể xóa biến thể");
    }
  };

  // Khôi phục
  const handleRestore = async (id: string) => {
    try {
      await adminVariantService.restoreVariant(id);
      toast.success("Đã khôi phục biến thể thành công");
      if (showDeleted) {
        fetchDeletedVariants();
      }
      fetchVariants();
    } catch (error) {
      console.error("Error restoring variant:", error);
      toast.error("Không thể khôi phục biến thể");
    }
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
      const res = await adminVariantService.getVariantById(variant._id);
      // Handle response structure
      const resData = res.data as unknown as {
        variant?: Variant;
        data?: { variant?: Variant } | Variant;
      };
      const variantData =
        resData.variant ||
        (resData.data as { variant?: Variant })?.variant ||
        (resData.data as Variant);
      setVariantImages(variantData?.imagesvariant || []);
    }
  };

  return (
    <div className="p-6 w-full font-sans bg-mono-50 min-h-screen">
      <h2 className="text-3xl font-bold text-mono-800 tracking-tight leading-snug mb-6">
        Quản lý biến thể sản phẩm
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
              ? "text-mono-black border-mono-black"
              : "text-mono-500 border-transparent hover:text-mono-black"
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
                ? "text-mono-black border-mono-black"
                : "text-mono-500 border-transparent hover:text-mono-black"
            }`}
          >
            Biến thể đã xóa
          </button>
        )}
        {!showDeleted && canCreate() && (
          <button
            className="ml-auto px-6 py-3 bg-mono-black hover:bg-mono-800 text-white rounded-lg font-medium mr-3 my-2 transition-colors shadow-sm"
            onClick={handleAddNew}
          >
            + Thêm biến thể
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
                placeholder="Tìm kiếm biến thể theo sản phẩm, màu sắc..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-600 transition-all"
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
              className="px-3 py-2 border border-mono-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-600"
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
              className="px-3 py-2 border border-mono-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-600"
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
              className="px-3 py-2 border border-mono-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-600"
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
                className="px-3 py-2 text-sm text-mono-black hover:text-mono-900 font-medium border border-mono-200 rounded-lg hover:bg-mono-50 transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      )}
      {/* Modal hiển thị form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] flex flex-col">
            {/* Header - Fixed white background with proper z-index */}
            <div className="sticky top-0 bg-white border-b border-mono-200 p-6 rounded-t-xl z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-mono-900">
                    {editingVariant ? "Cập nhật biến thể" : "Thêm biến thể mới"}
                  </h2>
                  <p className="text-sm text-mono-500 mt-1">
                    {editingVariant
                      ? "Chỉnh sửa thông tin biến thể sản phẩm"
                      : "Tạo biến thể mới cho sản phẩm"}
                  </p>
                </div>
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-mono-100 text-mono-600 transition-all"
                  onClick={handleCloseForm}
                  title="Đóng"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
              <VariantForm
                onSuccess={handleSuccess}
                editingVariant={editingVariant}
              />
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mono-black"></div>
          <p className="mt-4 text-mono-600">Đang tải dữ liệu...</p>
        </div>
      ) : (showDeleted ? deletedVariants : variants).length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg
            className="mx-auto h-16 w-16 text-mono-400 mb-4"
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
          <h3 className="text-lg font-medium text-mono-900 mb-2">
            {showDeleted
              ? "Không có biến thể nào đã xóa"
              : "Không tìm thấy biến thể"}
          </h3>
          <p className="text-mono-500">
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
              <thead className="bg-gradient-to-r from-mono-50 to-mono-100">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Biến thể
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Màu sắc
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Giới tính
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Giá bán
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Size & SKU
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
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
                      className="hover:bg-mono-50 transition-colors"
                    >
                      {/* Main Image */}
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-mono-200 bg-mono-50">
                          <img
                            src={
                              v.imagesvariant &&
                              v.imagesvariant.length > 0 &&
                              v.imagesvariant[0]?.url
                                ? v.imagesvariant[0].url
                                : defaultImage
                            }
                            alt={`${
                              typeof v.product === "object" &&
                              v.product !== null
                                ? v.product.name
                                : "Variant"
                            }`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = defaultImage;
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold text-mono-900">
                            {typeof v.product === "object" && v.product !== null
                              ? v.product.name
                              : v.product || "N/A"}
                          </p>
                          <p
                            className="text-xs text-mono-500 font-mono"
                            title={v._id}
                          >
                            ID: {v._id.slice(-8)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {typeof v.color === "object" && v.color !== null && (
                            <ColorSwatch color={v.color} size="lg" />
                          )}
                          <span className="text-sm font-medium text-mono-700">
                            {typeof v.color === "object" && v.color !== null
                              ? v.color.name
                              : v.color || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            v.gender === "male"
                              ? "bg-mono-200 text-mono-900"
                              : v.gender === "female"
                              ? "bg-mono-300 text-mono-900"
                              : "bg-mono-100 text-mono-800"
                          }`}
                        >
                          {v.gender === "male"
                            ? "Nam"
                            : v.gender === "female"
                            ? "Nữ"
                            : "Unisex"}
                        </span>
                      </td>
                      {/* Cell giá bán */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {/* BE đã tính toán giá cho cả biến thể đã xóa từ inventory */}
                          {v.inventorySummary?.sizeInventory &&
                          v.inventorySummary.sizeInventory.length > 0 ? (
                            (() => {
                              const prices = v.inventorySummary.sizeInventory
                                .map((s) => s.sellingPrice)
                                .filter((p) => p > 0);
                              if (prices.length === 0) {
                                return (
                                  <span className="text-sm text-mono-400 italic">
                                    Chưa có giá
                                  </span>
                                );
                              }
                              const minPrice = Math.min(...prices);
                              const maxPrice = Math.max(...prices);
                              return (
                                <span className="text-sm font-semibold text-mono-900">
                                  {minPrice === maxPrice
                                    ? `${minPrice.toLocaleString("vi-VN")}₫`
                                    : `${minPrice.toLocaleString(
                                        "vi-VN"
                                      )}₫ - ${maxPrice.toLocaleString(
                                        "vi-VN"
                                      )}₫`}
                                </span>
                              );
                            })()
                          ) : v.priceFinal ? (
                            <>
                              <span className="text-sm font-semibold text-mono-900">
                                {v.priceFinal?.toLocaleString("vi-VN")}₫
                              </span>
                              {(v.percentDiscount ?? 0) > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-mono-500 line-through">
                                    {v.price?.toLocaleString("vi-VN")}₫
                                  </span>
                                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                    -{v.percentDiscount}%
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-mono-400 italic">
                              Chưa có giá
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Cell Size & SKU với dropdown */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {v.sizes && v.sizes.length > 0 ? (
                            <>
                              {/* Hiển thị 2 sizes đầu */}
                              {(expandedSizes[v._id]
                                ? v.sizes
                                : v.sizes.slice(0, 2)
                              ).map((s, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs text-mono-600 flex items-center gap-2"
                                >
                                  <span className="font-semibold bg-mono-100 px-2 py-0.5 rounded min-w-[32px] text-center">
                                    {typeof s.size === "object"
                                      ? s.size.value
                                      : s.size}
                                  </span>
                                  {s.sku && (
                                    <span
                                      className="font-mono text-mono-500 text-[10px] break-all"
                                      title={s.sku}
                                    >
                                      {s.sku}
                                    </span>
                                  )}
                                </div>
                              ))}
                              {/* Nút expand/collapse nếu có nhiều hơn 2 sizes */}
                              {v.sizes.length > 2 && (
                                <button
                                  onClick={() =>
                                    setExpandedSizes((prev) => ({
                                      ...prev,
                                      [v._id]: !prev[v._id],
                                    }))
                                  }
                                  className="text-xs text-mono-700 font-medium hover:text-mono-900 flex items-center gap-1 transition-colors mt-1"
                                >
                                  {expandedSizes[v._id] ? (
                                    <>
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 15l7-7 7 7"
                                        />
                                      </svg>
                                      Thu gọn
                                    </>
                                  ) : (
                                    <>
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 9l-7 7-7-7"
                                        />
                                      </svg>
                                      +{v.sizes.length - 2} size khác
                                    </>
                                  )}
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-mono-400 italic">
                              Chưa có size
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {
                            {
                              in_stock: (
                                <span className="bg-mono-200 text-mono-900 px-3 py-1 rounded-full text-xs font-semibold">
                                  Còn hàng
                                </span>
                              ),
                              low_stock: (
                                <span className="bg-mono-300 text-mono-900 px-3 py-1 rounded-full text-xs font-semibold">
                                  Sắp hết
                                </span>
                              ),
                              out_of_stock: (
                                <span className="bg-mono-300 text-mono-900 px-3 py-1 rounded-full text-xs font-semibold">
                                  Hết hàng
                                </span>
                              ),
                            }[stockStatus]
                          }
                          <span className="text-xs text-mono-500 font-medium">
                            SL: {totalQuantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {v.deletedAt ? (
                          <span className="bg-mono-200 text-mono-800 px-3 py-1.5 rounded-full text-xs font-semibold">
                            Đã xóa
                          </span>
                        ) : (
                          <span
                            className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${
                              v.isActive
                                ? "bg-mono-200 text-mono-900"
                                : "bg-mono-100 text-mono-700"
                            }`}
                          >
                            {v.isActive ? "Hoạt động" : "Ngừng"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1 justify-center">
                          {!showDeleted ? (
                            <>
                              <button
                                className="p-1.5 bg-mono-100 hover:bg-mono-200 text-mono-700 rounded-lg border border-mono-200 transition-colors"
                                onClick={() => handleOpenImageManager(v)}
                                title="Quản lý ảnh"
                              >
                                <svg
                                  className="w-4 h-4"
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
                              </button>
                              {canUpdate() && (
                                <button
                                  className="p-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 rounded-lg border border-mono-200 transition-colors"
                                  onClick={() => handleEdit(v)}
                                  title="Sửa biến thể"
                                >
                                  <svg
                                    className="w-4 h-4"
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
                                </button>
                              )}
                              {canToggleStatus() && (
                                <button
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    v.isActive
                                      ? "bg-mono-100 hover:bg-mono-200 text-mono-700 border-mono-200"
                                      : "bg-mono-50 hover:bg-mono-100 text-mono-600 border-mono-200"
                                  }`}
                                  onClick={async () => {
                                    try {
                                      await adminVariantService.updateStatus(
                                        v._id,
                                        !v.isActive
                                      );
                                      toast.success(
                                        `Đã ${
                                          !v.isActive ? "kích hoạt" : "tắt"
                                        } biến thể`
                                      );
                                      fetchVariants(currentPage);
                                    } catch (error) {
                                      console.error(
                                        "Error toggling status:",
                                        error
                                      );
                                      toast.error(
                                        "Không thể cập nhật trạng thái"
                                      );
                                    }
                                  }}
                                  title={
                                    v.isActive ? "Tắt hoạt động" : "Kích hoạt"
                                  }
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d={
                                        v.isActive
                                          ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                          : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      }
                                    />
                                  </svg>
                                </button>
                              )}
                              {canDelete() && !v.deletedAt && (
                                <button
                                  className="p-1.5 bg-mono-100 hover:bg-mono-200 text-mono-700 rounded-lg border border-mono-200 transition-colors"
                                  onClick={() => handleDelete(v)}
                                  title="Xóa biến thể"
                                >
                                  <svg
                                    className="w-4 h-4"
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
                                </button>
                              )}
                            </>
                          ) : (
                            hasAdminOnlyAccess() && (
                              <button
                                className="p-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 rounded-lg border border-mono-200 transition-colors"
                                onClick={() => handleRestore(v._id)}
                                title="Khôi phục biến thể"
                              >
                                <svg
                                  className="w-4 h-4"
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
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-mono-600">
              Trang {currentPage} / {totalPages} • Tổng: {totalVariants} biến
              thể
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
                const showPages = 5;
                let startPage = Math.max(
                  1,
                  currentPage - Math.floor(showPages / 2)
                );
                const endPage = Math.min(totalPages, startPage + showPages - 1);

                if (endPage - startPage < showPages - 1) {
                  startPage = Math.max(1, endPage - showPages + 1);
                }

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
                const res = await adminVariantService.getVariantById(
                  showImageManager
                );
                // Handle response structure
                const resData = res.data as unknown as {
                  variant?: Variant;
                  data?: { variant?: Variant } | Variant;
                };
                const variantData =
                  resData.variant ||
                  (resData.data as { variant?: Variant })?.variant ||
                  (resData.data as Variant);
                setVariantImages(variantData?.imagesvariant || []);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa biến thể */}
      {showDeleteModal && variantToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
            {/* Header */}
            <div className="p-6 border-b border-mono-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
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
                </div>
                <div>
                  <h2 className="text-lg font-bold text-mono-900">
                    Xác nhận xóa biến thể
                  </h2>
                  <p className="text-sm text-mono-500">
                    Hành động này có thể được hoàn tác
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-mono-700">
                Bạn có chắc chắn muốn xóa biến thể{" "}
                <strong className="text-mono-900">
                  {typeof variantToDelete.product === "object" &&
                  variantToDelete.product !== null
                    ? variantToDelete.product.name
                    : "Sản phẩm"}{" "}
                  -{" "}
                  {typeof variantToDelete.color === "object" &&
                  variantToDelete.color !== null
                    ? variantToDelete.color.name
                    : "Màu"}
                </strong>
                ?
              </p>
              <p className="text-sm text-mono-500 mt-2">
                Biến thể sẽ được chuyển vào mục đã xóa và có thể khôi phục sau.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-mono-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setVariantToDelete(null);
                }}
                className="px-5 py-2.5 text-mono-700 bg-white border border-mono-300 hover:bg-mono-50 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Xóa biến thể
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantPage;
