import { useState, useEffect } from "react";
import { productAdminService } from "../../../services/ProductService";
import { adminBrandService } from "../../../services/BrandService";
import { adminCategoryService } from "../../../services/CategoryService";
import { adminTagService } from "../../../services/TagService";
import { Product } from "../../../types/product";
import AddProduct from "./AddProduct";
import ProductDetail from "./ProductDetail";
import ProductImagesManager from "./ProductImagesManager";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-hot-toast";
import defaultImage from "../../../assets/image_df.png";

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
    tags: [] as string[],
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [brands, setBrands] = useState<{ _id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [tags, setTags] = useState<
    { _id: string; name: string; type: string }[]
  >([]);

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
        ? await productAdminService.getDeletedProducts(params)
        : await productAdminService.getProducts(params);

      // Handle response structure: data array + pagination fields at root level
      const responseData = res.data as {
        data?: Product[];
        totalPages?: number;
        total?: number;
        pagination?: { totalPages?: number; totalItems?: number };
      };
      const data = responseData.data || [];
      // BE trả về pagination fields trực tiếp: totalPages, total, currentPage
      const totalPagesFromRes =
        responseData.totalPages || responseData.pagination?.totalPages || 1;
      const totalItemsFromRes =
        responseData.total || responseData.pagination?.totalItems || 0;

      setProducts(data);
      setTotalPages(totalPagesFromRes);
      setTotalProducts(totalItemsFromRes);
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
      adminBrandService.getAll().then((res) => setBrands(res.data.data || []));
      adminCategoryService
        .getAll()
        .then((res) => setCategories(res.data.data || []));
      adminTagService
        .getActiveTags()
        .then((res) => setTags(res.data.data || []));
    }
  }, [showEdit]);

  // Load brands and categories for filters on mount
  useEffect(() => {
    adminBrandService
      .getAll()
      .then((res: any) => setBrands(res.data.data || []))
      .catch(() => setBrands([]));
    adminCategoryService
      .getAll()
      .then((res: any) => setCategories(res.data.data || []))
      .catch(() => setCategories([]));
    adminTagService
      .getActiveTags()
      .then((res: any) => setTags(res.data.data || []))
      .catch(() => setTags([]));
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
      tags:
        product.tags?.map((tag) => (typeof tag === "string" ? tag : tag._id)) ||
        [],
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

  const handleTagToggle = (tagId: string) => {
    setEditForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await productAdminService.updateProduct(selectedProduct._id, editForm);
      toast.success(`Đã cập nhật sản phẩm "${editForm.name}"`);
      setShowEdit(false);
      fetchProducts();
    } catch {
      setEditError("Cập nhật sản phẩm thất bại!");
      toast.error("Cập nhật sản phẩm thất bại!");
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
    try {
      await productAdminService.deleteProduct(selectedProduct._id);
      toast.success(`Đã xóa sản phẩm "${selectedProduct.name}"`);
      setShowDelete(false);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Không thể xóa sản phẩm");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await productAdminService.restoreProduct(id);
      toast.success("Đã khôi phục sản phẩm");
      fetchProducts();
    } catch (error) {
      console.error("Error restoring product:", error);
      toast.error("Không thể khôi phục sản phẩm");
    }
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
    try {
      await productAdminService.updateProductStatus(
        selectedProduct._id,
        activeForm
      );
      toast.success(
        `Đã ${activeForm.isActive ? "hiện" : "ẩn"} sản phẩm "${
          selectedProduct.name
        }"`
      );
      setShowActiveModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Không thể cập nhật trạng thái sản phẩm");
    }
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
    <div className="p-6 w-full font-sans bg-mono-50 min-h-screen">
      <h2 className="text-3xl font-bold text-mono-800 tracking-tight leading-snug mb-6">
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
              ? "text-mono-black border-mono-black"
              : "text-mono-500 border-transparent hover:text-mono-black"
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
                ? "text-mono-black border-mono-black"
                : "text-mono-500 border-transparent hover:text-mono-black"
            }`}
          >
            Sản phẩm đã xóa
          </button>
        )}
        {!showDeleted && canCreate() && (
          <button
            className="ml-auto px-6 py-3 bg-mono-black hover:bg-mono-800 text-white rounded-lg font-medium mr-3 my-2 transition-colors shadow-sm"
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
                className="w-full px-4 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-600 transition-all"
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
              className="px-3 py-2 border border-mono-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-600"
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
              className="px-3 py-2 border border-mono-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-600"
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
              className="px-3 py-2 border border-mono-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-600"
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
              className="px-3 py-2 border border-mono-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-600"
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
              className="px-3 py-2 border border-mono-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-600"
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
              className="text-sm text-mono-black hover:text-mono-800 font-medium"
            >
              ✕ Xóa bỏ lọc
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mono-black"></div>
          <p className="mt-4 text-mono-600">Đang tải dữ liệu...</p>
        </div>
      ) : products.length === 0 ? (
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-medium text-mono-900 mb-2">
            {showDeleted
              ? "Không có sản phẩm nào đã xóa"
              : "Không tìm thấy sản phẩm"}
          </h3>
          <p className="text-mono-500">
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
              <thead className="bg-gradient-to-r from-mono-50 to-mono-100">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Thương hiệu
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Giá bán
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
                    images?.find((img) => img.isMain)?.url ||
                    images?.[0]?.url ||
                    defaultImage;

                  return (
                    <tr
                      key={_id}
                      className="hover:bg-mono-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={mainImage}
                            alt={name}
                            className="h-14 w-14 rounded-lg object-cover border border-mono-200 shadow-sm"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-mono-900 truncate">
                              {name}
                            </p>
                            <p
                              className="text-xs text-mono-500 font-mono truncate"
                              title={_id}
                            >
                              ID: {_id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-mono-700">
                          {typeof category === "string"
                            ? category
                            : category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-mono-700">
                          {typeof brand === "string" ? brand : brand?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-mono-900">
                          {/* Hiển thị giá từ variantSummary.priceRange - BE đã tính toán cả cho sản phẩm đã xóa */}
                          {priceRange?.min && priceRange.min > 0 ? (
                            priceRange.min === priceRange.max ? (
                              `${priceRange.min.toLocaleString("vi-VN")}₫`
                            ) : (
                              `${priceRange.min.toLocaleString("vi-VN")}₫ - ${(
                                priceRange.max || priceRange.min
                              ).toLocaleString("vi-VN")}₫`
                            )
                          ) : (
                            <span className="text-mono-400 italic">
                              Chưa có giá
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {
                            {
                              in_stock: (
                                <span className="inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-semibold bg-mono-100 text-mono-800 min-w-[90px] h-7 whitespace-nowrap">
                                  Còn hàng
                                </span>
                              ),
                              low_stock: (
                                <span className="inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-semibold bg-mono-100 text-mono-800 min-w-[90px] h-7 whitespace-nowrap">
                                  Sắp hết
                                </span>
                              ),
                              out_of_stock: (
                                <span className="inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-semibold bg-mono-200 text-mono-900 min-w-[90px] h-7 whitespace-nowrap">
                                  Hết hàng
                                </span>
                              ),
                            }[stockStatus || "out_of_stock"]
                          }
                          <span className="text-xs text-mono-500 font-medium">
                            SL: {totalQuantity || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {showDeleted ? (
                          <span className="inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 min-w-[90px] h-7 whitespace-nowrap">
                            ✗ Đã xóa
                          </span>
                        ) : canToggleStatus() ? (
                          <button
                            type="button"
                            className={`inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-semibold focus:outline-none transition-all transform hover:scale-105 min-w-[90px] h-7 whitespace-nowrap ${
                              isActive
                                ? "bg-mono-100 text-mono-700 hover:bg-mono-200"
                                : "bg-mono-200 text-mono-800 hover:bg-mono-300"
                            }`}
                            onClick={() => openActiveModal(product)}
                            title="Cập nhật trạng thái"
                          >
                            {isActive ? "✓ Đang bán" : "✗ Ẩn"}
                          </button>
                        ) : (
                          <span
                            className={`inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-semibold min-w-[90px] h-7 whitespace-nowrap ${
                              isActive
                                ? "bg-mono-100 text-mono-700"
                                : "bg-mono-200 text-mono-800"
                            }`}
                          >
                            {isActive ? "✓ Đang bán" : "✗ Ẩn"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1 justify-center">
                          {!showDeleted ? (
                            <>
                              <button
                                className="p-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 rounded-lg border border-mono-200 transition-colors"
                                onClick={() => openModal("detail", product)}
                                title="Xem chi tiết"
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
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              {canUpdate() && (
                                <>
                                  <button
                                    className="p-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 rounded-lg border border-mono-200 transition-colors"
                                    onClick={() => openModal("edit", product)}
                                    title="Sửa sản phẩm"
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
                                  <button
                                    className="p-1.5 bg-mono-100 hover:bg-mono-200 text-mono-700 rounded-lg border border-mono-200 transition-colors"
                                    onClick={() => openModal("images", product)}
                                    title="Quản lý ảnh sản phẩm"
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
                                </>
                              )}
                              {canDelete() && (
                                <button
                                  className="p-1.5 bg-mono-100 hover:bg-mono-200 text-mono-700 rounded-lg border border-mono-200 transition-colors"
                                  onClick={() => openModal("delete", product)}
                                  title="Xóa sản phẩm"
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
                                onClick={() => handleRestore(product._id)}
                                title="Khôi phục sản phẩm"
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
              Trang {currentPage} / {totalPages} • Tổng: {totalProducts} sản
              phẩm
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

      {showAdd && <AddProduct handleClose={handleAddSuccess} />}

      {showEdit && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white text-mono-900 p-6 rounded-t-xl border-b border-mono-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Sửa Sản Phẩm</h2>
                  <p className="text-sm text-mono-500 mt-1">
                    Cập nhật thông tin sản phẩm
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => closeModal("edit")}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-all"
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

            {/* Form Content */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* Tên sản phẩm */}
              <div>
                <label className="block text-sm font-semibold text-mono-700 mb-2">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  placeholder="Nhập tên sản phẩm"
                  className="w-full px-4 py-3 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-semibold text-mono-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  placeholder="Nhập mô tả sản phẩm"
                  className="w-full px-4 py-3 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                  required
                />
              </div>

              {/* Grid 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Danh mục */}
                <div>
                  <label className="block text-sm font-semibold text-mono-700 mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent transition-all bg-white"
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

                {/* Thương hiệu */}
                <div>
                  <label className="block text-sm font-semibold text-mono-700 mb-2">
                    Thương hiệu <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="brand"
                    value={editForm.brand}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent transition-all bg-white"
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
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-mono-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 p-3 border border-mono-300 rounded-lg bg-mono-50 max-h-40 overflow-y-auto">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <button
                        key={tag._id}
                        type="button"
                        onClick={() => handleTagToggle(tag._id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          editForm.tags.includes(tag._id)
                            ? "bg-mono-800 text-white"
                            : "bg-white text-mono-700 border border-mono-300 hover:border-mono-500"
                        }`}
                      >
                        {tag.name}
                        <span className="ml-1 text-xs opacity-70">
                          ({tag.type})
                        </span>
                      </button>
                    ))
                  ) : (
                    <span className="text-mono-500 text-sm italic">
                      Không có tags
                    </span>
                  )}
                </div>
                <p className="text-xs text-mono-500 mt-1">
                  Đã chọn: {editForm.tags.length} tags
                </p>
              </div>

              {/* Error Message */}
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {editError}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-mono-200">
                <button
                  type="button"
                  onClick={() => closeModal("edit")}
                  className="px-6 py-2.5 text-mono-700 bg-mono-100 hover:bg-mono-200 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 bg-mono-800 hover:bg-mono-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang cập nhật...
                    </>
                  ) : (
                    "Cập nhật"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && selectedProduct && (
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
                    Xác nhận xóa sản phẩm
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
                Bạn có chắc chắn muốn xóa sản phẩm{" "}
                <strong className="text-mono-900">
                  "{selectedProduct.name}"
                </strong>
                ?
              </p>
              <p className="text-sm text-mono-500 mt-2">
                Sản phẩm sẽ được chuyển vào mục đã xóa và có thể khôi phục sau.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-mono-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => closeModal("delete")}
                className="px-5 py-2.5 text-mono-700 bg-white border border-mono-300 hover:bg-mono-50 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Xóa sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cập nhật trạng thái active */}
      {showActiveModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
            {/* Header */}
            <div className="px-6 py-4 border-b border-mono-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mono-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-mono-700"
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
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-mono-900">
                    Cập nhật trạng thái
                  </h2>
                  <p className="text-xs text-mono-500 truncate max-w-[280px]">
                    {selectedProduct.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleActiveSubmit}>
              <div className="px-6 py-5 space-y-4">
                {/* Trạng thái hiển thị */}
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-3">
                    Trạng thái hiển thị
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveForm((f) => ({ ...f, isActive: true }))
                      }
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        activeForm.isActive
                          ? "border-mono-800 bg-mono-50"
                          : "border-mono-200 hover:border-mono-300"
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                          activeForm.isActive
                            ? "bg-mono-800 text-white"
                            : "bg-mono-200 text-mono-600"
                        }`}
                      >
                        ✓
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          activeForm.isActive
                            ? "text-mono-900"
                            : "text-mono-600"
                        }`}
                      >
                        Đang bán
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveForm((f) => ({ ...f, isActive: false }))
                      }
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        !activeForm.isActive
                          ? "border-mono-800 bg-mono-50"
                          : "border-mono-200 hover:border-mono-300"
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                          !activeForm.isActive
                            ? "bg-mono-800 text-white"
                            : "bg-mono-200 text-mono-600"
                        }`}
                      >
                        ✗
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          !activeForm.isActive
                            ? "text-mono-900"
                            : "text-mono-600"
                        }`}
                      >
                        Ẩn
                      </span>
                    </button>
                  </div>
                </div>

                {/* Checkbox Cascade */}
                <div className="flex items-center gap-3 p-3 bg-mono-50 rounded-lg">
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
                    className="w-4 h-4 text-mono-800 bg-white border-mono-300 rounded focus:ring-mono-500 focus:ring-2 cursor-pointer"
                  />
                  <label
                    htmlFor="cascade"
                    className="text-sm text-mono-700 cursor-pointer select-none"
                  >
                    Áp dụng cho tất cả biến thể của sản phẩm
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-mono-50 rounded-b-xl flex justify-end gap-3">
                <button
                  type="button"
                  className="px-5 py-2.5 text-sm font-medium text-mono-700 bg-white border border-mono-300 rounded-lg hover:bg-mono-100 transition-colors"
                  onClick={() => closeModal("active")}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-mono-900 rounded-lg hover:bg-mono-800 transition-colors"
                >
                  Lưu thay đổi
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
              className="absolute top-2 right-2 text-xl font-bold hover:text-mono-900"
              onClick={() => closeModal("images")}
            >
              ×
            </button>
            <ProductImagesManager
              productId={showImageManager}
              images={productImages}
              reloadImages={async () => {
                const res = await productAdminService.getProductById(
                  showImageManager
                );
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
