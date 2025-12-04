import React, { useEffect, useState } from "react";
import { adminVariantService } from "../../../services/VariantService";
import { Variant } from "../../../types/variant";
import VariantForm from "./VariantForm";
import VariantImagesManager from "./VariantImagesManager";
import ColorSwatch from "../../../components/Custom/ColorSwatch";
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

  // State cho quáº£n lÃ½ áº£nh
  const [showImageManager, setShowImageManager] = useState<string | null>(null);
  const [variantImages, setVariantImages] = useState<Variant["imagesvariant"]>(
    []
  );

  // Láº¥y danh sÃ¡ch biáº¿n thá»ƒ
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
      // Handle both formats: res.data.variants or res.data.data or res.data as array
      const responseData = res.data as unknown as {
        variants?: Variant[];
        data?: Variant[];
        pagination?: { totalPages?: number; totalItems?: number };
      };
      const data = responseData.variants || responseData.data || [];
      const pagination = responseData.pagination;

      setVariants(data as Variant[]);
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

  // Láº¥y danh sÃ¡ch biáº¿n thá»ƒ Ä‘Ã£ xÃ³a
  const fetchDeletedVariants = async (page: number = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        page,
        limit,
        sort: sortOption,
      };

      const res = await adminVariantService.getDeletedVariants(params);
      // Handle both formats: res.data.variants or res.data.data or res.data as array
      const responseData = res.data as unknown as {
        variants?: Variant[];
        data?: Variant[];
        pagination?: { totalPages?: number; totalItems?: number };
      };
      const data = responseData.variants || responseData.data || [];
      const pagination = responseData.pagination;

      setDeletedVariants(data as Variant[]);
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

  // XÃ³a má»m
  const handleDelete = async (id: string) => {
    await adminVariantService.deleteVariant(id);
    fetchVariants();
  };

  // KhÃ´i phá»¥c
  const handleRestore = async (id: string) => {
    await adminVariantService.restoreVariant(id);
    if (showDeleted) {
      fetchDeletedVariants();
    }
    fetchVariants();
  };
  // Báº¯t Ä‘áº§u cáº­p nháº­t
  const handleEdit = (variant: Variant) => {
    setEditingVariant(variant);
    setIsFormOpen(true);
  };

  // Má»Ÿ form thÃªm má»›i
  const handleAddNew = () => {
    setEditingVariant(null);
    setIsFormOpen(true);
  };

  // Sau khi thÃªm/cáº­p nháº­t thÃ nh cÃ´ng
  const handleSuccess = () => {
    setEditingVariant(null);
    setIsFormOpen(false);
    fetchVariants();
  };

  // ÄÃ³ng form
  const handleCloseForm = () => {
    setEditingVariant(null);
    setIsFormOpen(false);
  };

  // Má»Ÿ modal quáº£n lÃ½ áº£nh
  const handleOpenImageManager = async (variant: Variant) => {
    setShowImageManager(variant._id);
    // Láº¥y láº¡i áº£nh biáº¿n thá»ƒ tá»« API
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
        Quáº£n lÃ½ biáº¿n thá»ƒ sáº£n pháº©m
      </h2>

      {/* Tab chuyá»ƒn Ä‘á»•i */}
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
          Biáº¿n thá»ƒ hoáº¡t Ä‘á»™ng
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
            Biáº¿n thá»ƒ Ä‘Ã£ xÃ³a
          </button>
        )}
        {!showDeleted && canCreate() && (
          <button
            className="ml-auto px-6 py-3 bg-mono-black hover:bg-mono-800 text-white rounded-lg font-medium mr-3 my-2 transition-colors shadow-sm"
            onClick={handleAddNew}
          >
            + ThÃªm biáº¿n thá»ƒ
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
                placeholder="ðŸ” TÃ¬m kiáº¿m biáº¿n thá»ƒ theo sáº£n pháº©m, mÃ u sáº¯c..."
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
              <option value="all">Táº¥t cáº£ giá»›i tÃ­nh</option>
              <option value="male">Nam</option>
              <option value="female">Ná»¯</option>
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
              <option value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
              <option value="true">Hoáº¡t Ä‘á»™ng</option>
              <option value="false">Ngá»«ng hoáº¡t Ä‘á»™ng</option>
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
              <option value='{"createdAt":-1}'>Má»›i nháº¥t</option>
              <option value='{"createdAt":1}'>CÅ© nháº¥t</option>
              <option value='{"updatedAt":-1}'>Cáº­p nháº­t gáº§n Ä‘Ã¢y</option>
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
                âœ– XÃ³a bá»™ lá»c
              </button>
            )}
          </div>
        </div>
      )}
      {/* Modal hiá»ƒn thá»‹ form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-mono-500 hover:text-mono-800 text-xl"
              onClick={handleCloseForm}
              title="ÄÃ³ng"
            >
              Ã—
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mono-black"></div>
          <p className="mt-4 text-mono-600">Äang táº£i dá»¯ liá»‡u...</p>
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
              ? "KhÃ´ng cÃ³ biáº¿n thá»ƒ nÃ o Ä‘Ã£ xÃ³a"
              : "KhÃ´ng tÃ¬m tháº¥y biáº¿n thá»ƒ"}
          </h3>
          <p className="text-mono-500">
            {showDeleted
              ? "ChÆ°a cÃ³ biáº¿n thá»ƒ nÃ o bá»‹ xÃ³a trong há»‡ thá»‘ng"
              : searchQuery || genderFilter !== "all"
              ? "Thá»­ thay Ä‘á»•i bá»™ lá»c hoáº·c tá»« khÃ³a tÃ¬m kiáº¿m"
              : "HÃ£y thÃªm biáº¿n thá»ƒ Ä‘áº§u tiÃªn cho sáº£n pháº©m"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto shadow-md rounded-lg bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-mono-50 to-mono-100">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Biáº¿n thá»ƒ
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    MÃ u sáº¯c
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Giá»›i tÃ­nh
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Size & SKU
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Tá»“n kho
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Tráº¡ng thÃ¡i
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    HÃ nh Ä‘á»™ng
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
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold text-mono-900">
                            {typeof v.product === "object"
                              ? v.product.name
                              : v.product}
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
                          {typeof v.color === "object" && (
                            <ColorSwatch color={v.color} size="lg" />
                          )}
                          <span className="text-sm font-medium text-mono-700">
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
                              ? "bg-mono-200 text-mono-900"
                              : v.gender === "female"
                              ? "bg-mono-300 text-mono-900"
                              : "bg-mono-100 text-mono-800"
                          }`}
                        >
                          {v.gender === "male"
                            ? "Nam"
                            : v.gender === "female"
                            ? "Ná»¯"
                            : "Unisex"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {v.sizes?.slice(0, 3).map((s, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-mono-600 flex items-center gap-2"
                            >
                              <span className="font-semibold bg-mono-100 px-2 py-0.5 rounded">
                                {typeof s.size === "object"
                                  ? s.size.value
                                  : s.size}
                              </span>
                              {s.sku && (
                                <span
                                  className="font-mono text-mono-500"
                                  title="SKU"
                                >
                                  {s.sku}
                                </span>
                              )}
                            </div>
                          ))}
                          {v.sizes && v.sizes.length > 3 && (
                            <span className="text-xs text-mono-black font-medium">
                              +{v.sizes.length - 3} size khÃ¡c
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
                                  CÃ²n hÃ ng
                                </span>
                              ),
                              low_stock: (
                                <span className="bg-mono-300 text-mono-900 px-3 py-1 rounded-full text-xs font-semibold">
                                  Sáº¯p háº¿t
                                </span>
                              ),
                              out_of_stock: (
                                <span className="bg-mono-300 text-mono-900 px-3 py-1 rounded-full text-xs font-semibold">
                                  Háº¿t hÃ ng
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
                            ÄÃ£ xÃ³a
                          </span>
                        ) : (
                          <span
                            className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${
                              v.isActive
                                ? "bg-mono-200 text-mono-900"
                                : "bg-mono-100 text-mono-700"
                            }`}
                          >
                            {v.isActive ? "Hoáº¡t Ä‘á»™ng" : "Ngá»«ng"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center flex-wrap">
                          {!showDeleted ? (
                            <>
                              <button
                                className="px-3 py-1.5 bg-mono-100 hover:bg-mono-200 text-mono-800 text-xs font-medium rounded-lg border border-mono-300 transition-colors flex items-center gap-1.5"
                                onClick={() => handleOpenImageManager(v)}
                                title="Quáº£n lÃ½ áº£nh"
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
                                áº¢nh
                              </button>
                              {canUpdate() && (
                                <button
                                  className="px-3 py-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 text-xs font-medium rounded-lg border border-mono-200 transition-colors flex items-center gap-1.5"
                                  onClick={() => handleEdit(v)}
                                  title="Sá»­a biáº¿n thá»ƒ"
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
                                  Sá»­a
                                </button>
                              )}
                              {canToggleStatus() && (
                                <button
                                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                                    v.isActive
                                      ? "bg-mono-100 hover:bg-mono-100 text-mono-700 border-mono-200"
                                      : "bg-mono-50 hover:bg-mono-200 text-mono-900 border-mono-200"
                                  }`}
                                  onClick={async () => {
                                    await adminVariantService.updateStatus(
                                      v._id,
                                      !v.isActive
                                    );
                                    fetchVariants(currentPage);
                                  }}
                                  title={
                                    v.isActive ? "Táº¯t hoáº¡t Ä‘á»™ng" : "KÃ­ch hoáº¡t"
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
                                  {v.isActive ? "Táº¯t" : "Báº­t"}
                                </button>
                              )}
                              {canDelete() && !v.deletedAt && (
                                <button
                                  className="px-3 py-1.5 bg-mono-100 hover:bg-mono-200 text-mono-800 text-xs font-medium rounded-lg border border-mono-300 transition-colors flex items-center gap-1.5"
                                  onClick={() => handleDelete(v._id)}
                                  title="XÃ³a biáº¿n thá»ƒ"
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
                                  XÃ³a
                                </button>
                              )}
                            </>
                          ) : (
                            hasAdminOnlyAccess() && (
                              <button
                                className="px-3 py-1.5 bg-mono-50 hover:bg-mono-200 text-mono-900 text-xs font-medium rounded-lg border border-mono-200 transition-colors flex items-center gap-1.5"
                                onClick={() => handleRestore(v._id)}
                                title="KhÃ´i phá»¥c biáº¿n thá»ƒ"
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
                                KhÃ´i phá»¥c
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
            <div className="bg-white px-4 py-4 flex items-center justify-between border-t border-mono-200 rounded-b-lg shadow-sm mt-0">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-mono-300 text-sm font-medium rounded-md text-mono-700 bg-white hover:bg-mono-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  TrÆ°á»›c
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-mono-300 text-sm font-medium rounded-md text-mono-700 bg-white hover:bg-mono-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-mono-700">
                    Hiá»ƒn thá»‹{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * limit + 1}
                    </span>{" "}
                    Ä‘áº¿n{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * limit, totalVariants)}
                    </span>{" "}
                    trong tá»•ng sá»‘{" "}
                    <span className="font-medium">{totalVariants}</span> biáº¿n
                    thá»ƒ
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-mono-300 bg-white text-sm font-medium text-mono-500 hover:bg-mono-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      â€¹
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
                                ? "z-10 bg-mono-black border-mono-black text-white"
                                : "bg-white border-mono-300 text-mono-700 hover:bg-mono-50"
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
                            className="relative inline-flex items-center px-4 py-2 border border-mono-300 bg-white text-sm font-medium text-mono-700"
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
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-mono-300 bg-white text-sm font-medium text-mono-500 hover:bg-mono-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      â€º
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* Modal quáº£n lÃ½ áº£nh variant */}
      {showImageManager && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-xl relative">
            <button
              className="absolute top-2 right-2 text-xl font-bold"
              onClick={() => setShowImageManager(null)}
            >
              Ã—
            </button>
            <VariantImagesManager
              variantId={showImageManager}
              images={variantImages}
              reloadImages={async () => {
                // Gá»i láº¡i API láº¥y variant theo id
                const res = await adminVariantService.getVariantById(showImageManager);
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
    </div>
  );
};

export default VariantPage;



