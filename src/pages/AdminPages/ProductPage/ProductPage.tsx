import { useState, useEffect } from "react";
import { productApi } from "../../../services/ProductService";
import { brandApi } from "../../../services/BrandService";
import { categoryApi } from "../../../services/CategoryService";
import { Product } from "../../../types/product";
import AddProduct from "./AddProduct";
import ProductDetail from "./ProductDetail";
import ProductImagesManager from "./ProductImagesManager";
import { useAuth } from "../../../hooks/useAuth";

const ProductPage = () => {
  const {
    canDelete,
    canCreate,
    canUpdate,
    canToggleStatus,
    hasStaffAccess,
    hasAdminOnlyAccess,
  } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showImageManager, setShowImageManager] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<Product["images"]>([]);

  // Pagination & Filter & Sort States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [isActiveFilter, setIsActiveFilter] = useState("all");
  const [sortOption, setSortOption] = useState("created_at_desc");
  const limit = 10;

  // Modal cập nhật trạng thái active
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [activeForm, setActiveForm] = useState({
    isActive: false,
    cascade: true,
  });

  // State cho form sửa
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [brands, setBrands] = useState<{ _id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );

  const fetchProducts = async (page: number = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        page,
        limit,
        ...(searchQuery && { search: searchQuery }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
        ...(brandFilter !== "all" && { brand: brandFilter }),
        ...(stockStatusFilter !== "all" && { stockStatus: stockStatusFilter }),
        ...(isActiveFilter !== "all" && {
          isActive: isActiveFilter === "true",
        }),
        sort: sortOption,
      };

      const res = showDeleted
        ? await productApi.getDeleted(params)
        : await productApi.getAll(params);

      const data = res.data.data || [];
      const pagination = res.data.pagination;

      setProducts(data);
      setTotalPages(pagination?.totalPages || 1);
      setTotalProducts(pagination?.totalItems || 0);
      setCurrentPage(page);
    } catch {
      setProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showDeleted,
    currentPage,
    searchQuery,
    categoryFilter,
    brandFilter,
    stockStatusFilter,
    isActiveFilter,
    sortOption,
  ]);

  useEffect(() => {
    if (showEdit) {
      brandApi.getAll().then((res) => setBrands(res.data.data || []));
      categoryApi.getAll().then((res) => setCategories(res.data.data || []));
    }
  }, [showEdit]);

  // Load brands and categories for filters on mount
  useEffect(() => {
    brandApi
      .getAll()
      .then((res) => setBrands(res.data.data || []))
      .catch(() => setBrands([]));
    categoryApi
      .getAll()
      .then((res) => setCategories(res.data.data || []))
      .catch(() => setCategories([]));
  }, []);

  const handleAddSuccess = () => {
    setShowAdd(false);
    fetchProducts();
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      category:
        typeof product.category === "string"
          ? product.category
          : product.category?._id || "",
      brand:
        typeof product.brand === "string"
          ? product.brand
          : product.brand?._id || "",
    });
    setEditError(null);
    setShowEdit(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await productApi.update(selectedProduct._id, editForm);
      setShowEdit(false);
      fetchProducts();
    } catch {
      setEditError("Cập nhật sản phẩm thất bại!");
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDelete(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    await productApi.delete(selectedProduct._id);
    setShowDelete(false);
    fetchProducts();
  };

  const handleRestore = async (id: string) => {
    await productApi.restore(id);
    fetchProducts();
  };

  // Mở modal cập nhật trạng thái active
  const openActiveModal = (product: Product) => {
    setSelectedProduct(product);
    setActiveForm({ isActive: !product.isActive, cascade: true });
    setShowActiveModal(true);
  };

  // Gửi cập nhật trạng thái active
  const handleActiveSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProduct) return;
    await productApi.updateStatus(selectedProduct._id, activeForm);
    setShowActiveModal(false);
    fetchProducts();
  };

  const handleUpdateStockStatus = async (product: Product) => {
    await productApi.updateStockStatus(product._id);
    fetchProducts();
  };

  const openModal = (type: string, product?: Product) => {
    if (product) setSelectedProduct(product);
    switch (type) {
      case "add":
        setShowAdd(true);
        break;
      case "edit":
        openEditModal(product!);
        break;
      case "delete":
        openDeleteModal(product!);
        break;
      case "detail":
        setShowDetail(true);
        break;
      case "images":
        if (product) {
          setShowImageManager(product._id);
          setProductImages(product.images || []);
        }
        break;
    }
  };

  const closeModal = (type: string) => {
    switch (type) {
      case "add":
        setShowAdd(false);
        break;
      case "edit":
        setShowEdit(false);
        break;
      case "delete":
        setShowDelete(false);
        break;
      case "detail":
        setShowDetail(false);
        break;
      case "active":
        setShowActiveModal(false);
        break;
      case "images":
        setShowImageManager(null);
        setProductImages([]);
        break;
    }
    setSelectedProduct(null);
  };

  return (
    <div className="p-6 w-full font-sans bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 tracking-tight leading-snug mb-6">
        Quản Lý Sản Phẩm
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
          Sản phẩm
          {!showDeleted && totalProducts > 0 ? ` (${totalProducts})` : ""}
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
            Sản phẩm đã xóa
          </button>
        )}
        {!showDeleted && canCreate() && (
          <button
            className="ml-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium mr-3 my-2 transition-colors shadow-sm"
            onClick={() => openModal("add")}
          >
            + Thêm Sản Phẩm
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
                placeholder="🔍 Tìm kiếm sản phẩm theo tên..."
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Brand Filter */}
            <select
              value={brandFilter}
              onChange={(e) => {
                setBrandFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">Tất cả thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </select>

            {/* Stock Status Filter */}
            <select
              value={stockStatusFilter}
              onChange={(e) => {
                setStockStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">Tất cả tồn kho</option>
              <option value="in_stock">Còn hàng</option>
              <option value="low_stock">Sắp hết</option>
              <option value="out_of_stock">Hết hàng</option>
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
              <option value="true">Đang bán</option>
              <option value="false">Ẩn</option>
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
              <option value="created_at_desc">Mới nhất</option>
              <option value="created_at_asc">Cũ nhất</option>
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery ||
            categoryFilter !== "all" ||
            brandFilter !== "all" ||
            stockStatusFilter !== "all" ||
            isActiveFilter !== "all" ||
            sortOption !== "created_at_desc") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setBrandFilter("all");
                setStockStatusFilter("all");
                setIsActiveFilter("all");
                setSortOption("created_at_desc");
                setCurrentPage(1);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ✕ Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : products.length === 0 ? (
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showDeleted
              ? "Không có sản phẩm nào đã xóa"
              : "Không tìm thấy sản phẩm"}
          </h3>
          <p className="text-gray-500">
            {showDeleted
              ? "Chưa có sản phẩm nào bị xóa trong hệ thống"
              : searchQuery || categoryFilter !== "all" || brandFilter !== "all"
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              : "Hãy thêm sản phẩm đầu tiên của bạn"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto shadow-md rounded-lg bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Thương hiệu
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Giá bán
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
                {products.map((product) => {
                  const {
                    _id,
                    name,
                    category,
                    brand,
                    stockStatus,
                    isActive,
                    images,
                    totalQuantity,
                  } = product;

                  // Sử dụng variantSummary nếu có, nếu không thì fallback về price
                  const priceRange = product.variantSummary?.priceRange || {
                    min: product.price || 0,
                    max: product.price || 0,
                  };

                  const mainImage =
                    images?.find((img) => img.isMain)?.url || images?.[0]?.url;

                  return (
                    <tr
                      key={_id}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {mainImage && (
                            <img
                              src={mainImage}
                              alt={name}
                              className="h-14 w-14 rounded-lg object-cover border border-gray-200 shadow-sm"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {name}
                            </p>
                            <p
                              className="text-xs text-gray-500 font-mono truncate"
                              title={_id}
                            >
                              ID: {_id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {typeof category === "string"
                            ? category
                            : category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {typeof brand === "string" ? brand : brand?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {priceRange?.min === priceRange?.max
                            ? `${(priceRange?.min || 0).toLocaleString()}đ`
                            : `${(priceRange?.min || 0).toLocaleString()}đ - ${(
                                priceRange?.max || 0
                              ).toLocaleString()}đ`}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 text-center select-none ${
                          canUpdate() && !showDeleted ? "cursor-pointer" : ""
                        }`}
                        title={
                          !showDeleted && canUpdate()
                            ? "Nhấn để cập nhật trạng thái tồn kho"
                            : ""
                        }
                        onClick={() => {
                          if (!showDeleted && canUpdate())
                            handleUpdateStockStatus(product);
                        }}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {
                            {
                              in_stock: (
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold inline-block">
                                  Còn hàng
                                </span>
                              ),
                              low_stock: (
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold inline-block">
                                  Sắp hết
                                </span>
                              ),
                              out_of_stock: (
                                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold inline-block">
                                  Hết hàng
                                </span>
                              ),
                            }[stockStatus || "out_of_stock"]
                          }
                          <span className="text-xs text-gray-500 font-medium">
                            SL: {totalQuantity || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {!showDeleted && canToggleStatus() && (
                          <button
                            type="button"
                            className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold focus:outline-none transition-all transform hover:scale-105 ${
                              isActive
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() => openActiveModal(product)}
                            title="Cập nhật trạng thái"
                          >
                            {isActive ? "✓ Đang bán" : "✕ Ẩn"}
                          </button>
                        )}
                        {!showDeleted && !canToggleStatus() && (
                          <span
                            className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${
                              isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {isActive ? "✓ Đang bán" : "✕ Ẩn"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center flex-wrap">
                          {!showDeleted ? (
                            <>
                              <button
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5"
                                onClick={() => openModal("detail", product)}
                                title="Xem chi tiết"
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
                                Chi tiết
                              </button>
                              {canUpdate() && (
                                <>
                                  <button
                                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-colors flex items-center gap-1.5"
                                    onClick={() => openModal("edit", product)}
                                    title="Sửa sản phẩm"
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
                                  <button
                                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium rounded-lg border border-purple-200 transition-colors flex items-center gap-1.5"
                                    onClick={() => openModal("images", product)}
                                    title="Quản lý ảnh sản phẩm"
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
                                </>
                              )}
                              {canDelete() && (
                                <button
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg border border-red-200 transition-colors flex items-center gap-1.5"
                                  onClick={() => openModal("delete", product)}
                                  title="Xóa sản phẩm"
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
                                onClick={() => handleRestore(product._id)}
                                title="Khôi phục sản phẩm"
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
                      {Math.min(currentPage * limit, totalProducts)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{totalProducts}</span> sản
                    phẩm
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

      {showAdd && <AddProduct handleClose={handleAddSuccess} />}

      {showEdit && selectedProduct && (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-auto relative text-black">
            <button
              type="button"
              onClick={() => closeModal("edit")}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition duration-300"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-8 text-center">Sửa Sản Phẩm</h2>
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  placeholder="Nhập tên sản phẩm"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  placeholder="Nhập mô tả"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Danh mục
                </label>
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Thương hiệu
                </label>
                <select
                  name="brand"
                  value={editForm.brand}
                  onChange={handleEditChange}
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              {editError && (
                <div className="text-red-500 text-sm mb-2">{editError}</div>
              )}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => closeModal("edit")}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
                >
                  {editLoading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && selectedProduct && (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-auto relative text-black">
            <h2 className="text-xl font-bold mb-4 text-center">Xác nhận xóa</h2>
            <p className="text-center mb-6">
              Bạn có chắc chắn muốn xóa sản phẩm "{selectedProduct.name}"?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => closeModal("delete")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cập nhật trạng thái active */}
      {showActiveModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative animate-fadeIn">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Cập nhật trạng thái sản phẩm
              </h2>
            </div>

            {/* Body */}
            <form onSubmit={handleActiveSubmit}>
              <div className="px-6 py-5 space-y-4">
                {/* Checkbox Ẩn/Hiện sản phẩm */}
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={!activeForm.isActive}
                      onChange={(e) =>
                        setActiveForm((f) => ({
                          ...f,
                          isActive: !e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                    >
                      Ẩn
                    </label>
                  </div>
                </div>

                {/* Checkbox Cascade */}
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="cascade"
                      checked={activeForm.cascade}
                      onChange={(e) =>
                        setActiveForm((f) => ({
                          ...f,
                          cascade: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="cascade"
                      className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                    >
                      Cập nhật cho biến thể
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={() => closeModal("active")}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          handleClose={() => closeModal("detail")}
        />
      )}

      {/* Modal Quản Lý Ảnh */}
      {showImageManager && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-xl relative">
            <button
              className="absolute top-2 right-2 text-xl font-bold hover:text-red-600"
              onClick={() => closeModal("images")}
            >
              ×
            </button>
            <ProductImagesManager
              productId={showImageManager}
              images={productImages}
              reloadImages={async () => {
                const res = await productApi.getById(showImageManager);
                const productData = (res.data.data || res.data) as Product;
                setProductImages(productData?.images || []);
                // Refresh products list to update images
                fetchProducts();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
