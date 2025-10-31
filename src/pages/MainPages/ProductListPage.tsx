import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import { FiFilter, FiX } from "react-icons/fi";
import filterService, {
  ColorFilter,
  SizeFilter,
  CategoryFilter,
  BrandFilter,
} from "../../services/FilterService";
import {
  productPublicService,
  convertToProductCardProduct,
} from "../../services/ProductService";
import { Product, ProductQueryParams } from "../../types/product";
import { toast } from "react-hot-toast";

// Helper function để xử lý split cho string hoặc array
const safeStringToArray = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(",");
};

// Hàm để chuyển đổi từ chuỗi query params thành đối tượng
const parseQueryParams = (
  searchParams: URLSearchParams
): ProductQueryParams => {
  return {
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 12,
    name: searchParams.get("name") || undefined,
    category: searchParams.get("category") || undefined,
    brand: searchParams.get("brand") || undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    gender: (searchParams.get("gender") as "male" | "female") || undefined,
    colors: searchParams.get("colors") || undefined,
    sizes: searchParams.get("sizes") || undefined,
    sort: searchParams.get("sort") || "newest",
  };
};

const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const navigate = useNavigate();

  // Thêm state cho phân trang
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filter states
  const [filters, setFilters] = useState<{
    colors: ColorFilter[];
    sizes: SizeFilter[];
    categories: CategoryFilter[];
    brands: BrandFilter[];
    priceRange?: { min: number; max: number };
  }>({
    colors: [],
    sizes: [],
    categories: [],
    brands: [],
  });

  // Lấy thông tin bộ lọc từ URL
  const queryParamsFromUrl = parseQueryParams(searchParams);

  // Giá trị bộ lọc hiện tại (sử dụng useState để duy trì giữa các lần render)
  const [filtersState, setFiltersState] =
    useState<ProductQueryParams>(queryParamsFromUrl);

  // Lấy danh sách sản phẩm dựa trên bộ lọc
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = parseQueryParams(searchParams);
      console.log("Fetching products with params:", params);

      const response = await productPublicService.getProducts(params);
      console.log("API response:", response.data);

      if (response.data.success) {
        const productsData = response.data.data || response.data.products || [];
        // Ensure we have a flat array of products
        const flattenedProducts = Array.isArray(productsData)
          ? productsData.flat()
          : [];
        setProducts(flattenedProducts);

        // Xử lý đúng cấu trúc phân trang - API backend có thể trả về các dạng khác nhau
        setPagination({
          // Ưu tiên lấy từ các trường chuẩn trước
          currentPage:
            response.data.currentPage ||
            response.data.pagination?.page ||
            params.page ||
            1,
          totalPages:
            response.data.totalPages ||
            response.data.pagination?.totalPages ||
            Math.ceil(
              (response.data.total ||
                response.data.pagination?.totalItems ||
                0) / (params.limit || 12)
            ),
          totalItems:
            response.data.total ||
            response.data.pagination?.totalItems ||
            response.data.count ||
            productsData.length,
          hasNext:
            response.data.hasNextPage ||
            response.data.hasNext ||
            response.data.pagination?.hasNext ||
            false,
          hasPrev:
            response.data.hasPrevPage ||
            response.data.hasPrev ||
            response.data.pagination?.hasPrev ||
            false,
        });

        console.log("Pagination after update:", pagination);
      } else {
        console.error("API returned success: false");
        setProducts([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false,
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNext: false,
        hasPrev: false,
      });
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách danh mục, thương hiệu, màu sắc và kích thước
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const { data } = await filterService.getFilterAttributes();
        if (data.success && data.filters) {
          const { categories, brands, colors, sizes, priceRange } =
            data.filters;
          setFilters({
            categories,
            brands,
            colors,
            sizes,
            priceRange,
          });
          console.log("Loaded filter options:", data.filters);

          // Nếu chưa có giá trị minPrice và maxPrice trong URL, khởi tạo chúng từ API
          if (filtersState.minPrice === undefined) {
            setFiltersState((prev) => ({
              ...prev,
              minPrice: priceRange?.min || 0,
            }));
          }
          if (filtersState.maxPrice === undefined) {
            setFiltersState((prev) => ({
              ...prev,
              maxPrice: priceRange?.max || 1000000,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Cập nhật lại filters khi URL thay đổi và fetch sản phẩm
  useEffect(() => {
    setFiltersState(parseQueryParams(searchParams));
    fetchProducts();
  }, [searchParams]);

  // Áp dụng bộ lọc
  const applyFilters = () => {
    // Loại bỏ các filter undefined, null hoặc empty string
    const newParams: Record<string, string> = {};

    // Thêm từng tham số hợp lệ vào URL
    Object.entries(filtersState).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        newParams[key] = String(value);
      }
    });

    // Reset về trang 1 khi thay đổi bộ lọc
    newParams.page = "1";

    setSearchParams(newParams);
    setShowMobileFilter(false);
  };

  // Reset bộ lọc
  const resetFilters = () => {
    setFiltersState({
      page: 1,
      limit: 12,
      sort: "newest",
      minPrice: filters.priceRange?.min,
      maxPrice: filters.priceRange?.max,
    });
    setSearchParams({ sort: "newest" });
  };

  // Xử lý khi chọn trang
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);

    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Kiểm tra xem có filter đang active không
  const hasActiveFilters = () => {
    return (
      filtersState.category ||
      filtersState.brand ||
      (filtersState.minPrice !== undefined &&
        filtersState.minPrice > (filters.priceRange?.min || 0)) ||
      (filtersState.maxPrice !== undefined &&
        filtersState.maxPrice < (filters.priceRange?.max || 1000000)) ||
      filtersState.gender ||
      filtersState.colors ||
      filtersState.sizes
    );
  };

  // Xử lý khi nhập giá trực tiếp
  const handlePriceInput = (type: "min" | "max", value: string) => {
    const numValue = value === "" ? undefined : Number(value);

    // Nếu là giá không hợp lệ, không cập nhật
    if (numValue !== undefined && isNaN(numValue)) {
      return;
    }

    // Kiểm tra giới hạn
    if (type === "min") {
      if (numValue !== undefined) {
        // Đảm bảo giá min không vượt quá giá max
        if (
          filtersState.maxPrice !== undefined &&
          numValue > filtersState.maxPrice
        ) {
          return;
        }
        // Đảm bảo giá min không nhỏ hơn giá min cho phép
        if (
          filters.priceRange?.min !== undefined &&
          numValue < filters.priceRange.min
        ) {
          return;
        }
      }
      setFiltersState({
        ...filtersState,
        minPrice: numValue,
      });
    } else {
      if (numValue !== undefined) {
        // Đảm bảo giá max không nhỏ hơn giá min
        if (
          filtersState.minPrice !== undefined &&
          numValue < filtersState.minPrice
        ) {
          return;
        }
        // Đảm bảo giá max không vượt quá giá max cho phép
        if (
          filters.priceRange?.max !== undefined &&
          numValue > filters.priceRange.max
        ) {
          return;
        }
      }
      setFiltersState({
        ...filtersState,
        maxPrice: numValue,
      });
    }
  };

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const buttons = [];
    const { currentPage, totalPages } = pagination;

    // Always show first page
    if (currentPage > 3) {
      buttons.push(1);
      if (currentPage > 4) {
        buttons.push("...");
      }
    }

    // Show pages around current page
    for (
      let i = Math.max(1, currentPage - 2);
      i <= Math.min(totalPages, currentPage + 2);
      i++
    ) {
      buttons.push(i);
    }

    // Always show last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        buttons.push("...");
      }
      buttons.push(totalPages);
    }

    return buttons;
  };

  // Chức năng lọc bằng checkbox cho danh mục, thương hiệu, size
  const handleCheckboxFilter = (
    type: "category" | "brand" | "sizes" | "colors",
    id: string
  ) => {
    // Lấy giá trị hiện tại
    const currentValue = filtersState[type];
    let newValue: string | undefined;

    if (!currentValue) {
      // Nếu chưa có giá trị, gán giá trị mới
      newValue = id;
    } else {
      // Nếu đã có, kiểm tra xem có tồn tại không
      const currentValueStr = String(currentValue);
      const values = currentValueStr.split(",");
      if (values.includes(id)) {
        // Nếu có, loại bỏ
        const newValues = values.filter((v: string) => v !== id);
        newValue = newValues.length > 0 ? newValues.join(",") : undefined;
      } else {
        // Nếu chưa có, thêm vào
        newValue = `${currentValueStr},${id}`;
      }
    }

    setFiltersState({
      ...filtersState,
      [type]: newValue,
    });
  };

  // Hàm điều hướng đến trang chi tiết sản phẩm
  const navigateToProduct = (product: Product) => {
    navigate(`/product/${product.slug || product._id}`);
  };

  return (
    <div className="min-h-screen bg-mono-50">
      {/* Page header */}
      <div className="bg-mono-100 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-mono-800 mb-4">Sản phẩm</h1>
          <div className="flex justify-between items-center">
            <p className="text-mono-600">
              {loading ? (
                "Đang tải sản phẩm..."
              ) : (
                <>
                  Hiển thị {products.length} / {pagination.totalItems} sản phẩm
                </>
              )}
            </p>
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-mono-200 md:hidden"
            >
              <FiFilter size={18} />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar filters - desktop */}
          <div className="w-full md:w-64 hidden md:block">
            <div className="sticky top-24 space-y-6">
              {/* Filters heading with reset button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Bộ lọc</h2>
                {hasActiveFilters() && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-mono-black hover:text-blue-800"
                  >
                    Đặt lại
                  </button>
                )}
              </div>

              {/* Sort filter */}
              <div className="space-y-2">
                <h3 className="font-medium text-mono-700">Sắp xếp</h3>
                <select
                  value={filtersState.sort}
                  onChange={(e) =>
                    setFiltersState({ ...filtersState, sort: e.target.value })
                  }
                  className="w-full p-2 border border-mono-300 rounded-md"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                  <option value="popular">Phổ biến nhất</option>
                  <option value="rating">Đánh giá cao</option>
                </select>
              </div>

              {/* Gender filter */}
              <div className="space-y-2">
                <h3 className="font-medium text-mono-700">Giới tính</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setFiltersState({
                        ...filtersState,
                        gender:
                          filtersState.gender === "male" ? undefined : "male",
                      })
                    }
                    className={`px-3 py-1 border rounded-md ${
                      filtersState.gender === "male"
                        ? "bg-mono-50 border-mono-500 text-blue-700"
                        : "border-mono-300"
                    }`}
                  >
                    Nam
                  </button>
                  <button
                    onClick={() =>
                      setFiltersState({
                        ...filtersState,
                        gender:
                          filtersState.gender === "female"
                            ? undefined
                            : "female",
                      })
                    }
                    className={`px-3 py-1 border rounded-md ${
                      filtersState.gender === "female"
                        ? "bg-mono-50 border-mono-500 text-blue-700"
                        : "border-mono-300"
                    }`}
                  >
                    Nữ
                  </button>
                </div>
              </div>

              {/* Price filter with slider */}
              <div className="space-y-6">
                <h3 className="font-medium text-mono-700">Khoảng giá</h3>

                {/* Thanh trượt khoảng giá - Thêm mb-8 để tăng khoảng cách */}
                <div className="px-2 mb-8">
                  <div className="relative">
                    {/* Track cho thanh trượt */}
                    <div className="absolute h-1 bg-mono-200 rounded w-full top-1/2 -translate-y-1/2"></div>

                    {/* Track đã chọn */}
                    <div
                      className="absolute h-1 bg-mono-500 rounded top-1/2 -translate-y-1/2"
                      style={{
                        left: `${
                          (((filtersState.minPrice ||
                            filters.priceRange?.min ||
                            0) -
                            (filters.priceRange?.min || 0)) /
                            ((filters.priceRange?.max || 1000000) -
                              (filters.priceRange?.min || 0))) *
                          100
                        }%`,
                        right: `${
                          100 -
                          (((filtersState.maxPrice ||
                            filters.priceRange?.max ||
                            1000000) -
                            (filters.priceRange?.min || 0)) /
                            ((filters.priceRange?.max || 1000000) -
                              (filters.priceRange?.min || 0))) *
                            100
                        }%`,
                      }}
                    ></div>

                    {/* Thanh trượt giá thấp nhất */}
                    <input
                      type="range"
                      min={filters.priceRange?.min || 0}
                      max={filters.priceRange?.max || 1000000}
                      value={
                        filtersState.minPrice || filters.priceRange?.min || 0
                      }
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        // Đảm bảo minPrice không vượt quá maxPrice
                        if (
                          value <=
                          (filtersState.maxPrice ||
                            filters.priceRange?.max ||
                            1000000)
                        ) {
                          setFiltersState({
                            ...filtersState,
                            minPrice: value,
                          });
                        }
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer h-1"
                      style={{
                        WebkitAppearance: "none",
                        appearance: "none",
                        backgroundColor: "transparent",
                      }}
                    />

                    {/* Thanh trượt giá cao nhất */}
                    <input
                      type="range"
                      min={filters.priceRange?.min || 0}
                      max={filters.priceRange?.max || 1000000}
                      value={
                        filtersState.maxPrice ||
                        filters.priceRange?.max ||
                        1000000
                      }
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        // Đảm bảo maxPrice không nhỏ hơn giá minPrice
                        if (
                          value >=
                          (filtersState.minPrice ||
                            filters.priceRange?.min ||
                            0)
                        ) {
                          setFiltersState({
                            ...filtersState,
                            maxPrice: value,
                          });
                        }
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer h-1"
                      style={{
                        WebkitAppearance: "none",
                        appearance: "none",
                        backgroundColor: "transparent",
                      }}
                    />
                  </div>
                </div>

                {/* Hiển thị khoảng giá đã chọn với input number */}
                <div className="flex items-center justify-between text-sm">
                  <input
                    type="number"
                    className="border rounded-md px-3 py-2 bg-white w-[45%] text-sm"
                    min={filters.priceRange?.min || 0}
                    max={
                      filtersState.maxPrice ||
                      filters.priceRange?.max ||
                      1000000
                    }
                    value={
                      filtersState.minPrice !== undefined
                        ? filtersState.minPrice
                        : ""
                    }
                    onChange={(e) => handlePriceInput("min", e.target.value)}
                    placeholder={`${filters.priceRange?.min || 0}`}
                  />
                  <span className="text-mono-500">đến</span>
                  <input
                    type="number"
                    className="border rounded-md px-3 py-2 bg-white w-[45%] text-sm"
                    min={filtersState.minPrice || filters.priceRange?.min || 0}
                    max={filters.priceRange?.max || 1000000}
                    value={
                      filtersState.maxPrice !== undefined
                        ? filtersState.maxPrice
                        : ""
                    }
                    onChange={(e) => handlePriceInput("max", e.target.value)}
                    placeholder={`${filters.priceRange?.max || 1000000}`}
                  />
                </div>

                {/* CSS để tùy chỉnh thumb của thanh trượt */}
                <style>{`
                  input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #3b82f6;
                    cursor: pointer;
                    pointer-events: auto;
                    z-index: 10;
                    position: relative;
                  }

                  input[type="range"]::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #3b82f6;
                    cursor: pointer;
                    pointer-events: auto;
                    z-index: 10;
                    position: relative;
                  }
                `}</style>
              </div>

              {/* Category filter */}
              <div className="space-y-2">
                <h3 className="font-medium text-mono-700">Danh mục</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {filters.categories.map((category) => (
                    <div key={category._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category._id}`}
                        checked={
                          filtersState.category
                            ?.split(",")
                            .includes(category._id) || false
                        }
                        onChange={() =>
                          handleCheckboxFilter("category", category._id)
                        }
                        className="h-4 w-4 text-mono-black rounded"
                      />
                      <label
                        htmlFor={`category-${category._id}`}
                        className="ml-2 text-sm text-mono-700"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand filter */}
              <div className="space-y-2">
                <h3 className="font-medium text-mono-700">Thương hiệu</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {filters.brands.map((brand) => (
                    <div key={brand._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`brand-${brand._id}`}
                        checked={
                          filtersState.brand?.split(",").includes(brand._id) ||
                          false
                        }
                        onChange={() =>
                          handleCheckboxFilter("brand", brand._id)
                        }
                        className="h-4 w-4 text-mono-black rounded"
                      />
                      <label
                        htmlFor={`brand-${brand._id}`}
                        className="ml-2 text-sm text-mono-700"
                      >
                        {brand.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color filter */}
              <div className="space-y-2">
                <h3 className="font-medium text-mono-700">Màu sắc</h3>{" "}
                <div className="flex flex-wrap gap-2">
                  {filters.colors.map((color) => (
                    <button
                      key={color._id}
                      onClick={() => handleCheckboxFilter("colors", color._id)}
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center ${
                        safeStringToArray(filtersState.colors).includes(
                          color._id
                        )
                          ? "ring-2 ring-mono-500 ring-offset-2"
                          : ""
                      }`}
                      title={color.name}
                    >
                      {color.type === "solid" ? (
                        <div
                          className="w-6 h-6 rounded-full border border-mono-300"
                          style={{ backgroundColor: color.code }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-mono-300 relative overflow-hidden">
                          <div
                            style={{
                              backgroundColor: color.colors?.[0] || "#fff",
                              width: "100%",
                              height: "100%",
                              position: "absolute",
                              left: 0,
                              top: 0,
                              clipPath: "inset(0 50% 0 0)",
                            }}
                          />
                          <div
                            style={{
                              backgroundColor: color.colors?.[1] || "#fff",
                              width: "100%",
                              height: "100%",
                              position: "absolute",
                              right: 0,
                              top: 0,
                              clipPath: "inset(0 0 0 50%)",
                            }}
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size filter */}
              <div className="space-y-2">
                <h3 className="font-medium text-mono-700">Kích thước</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.sizes.map((size) => (
                    <button
                      key={size._id}
                      onClick={() => handleCheckboxFilter("sizes", size._id)}
                      className={`relative w-10 h-10 flex items-center justify-center border rounded-md ${
                        safeStringToArray(filtersState.sizes).includes(size._id)
                          ? "bg-mono-50 border-mono-500 text-blue-700"
                          : "border-mono-300"
                      } group`}
                      title={size.description || `Size ${size.value}`}
                    >
                      {/* Hiển thị tooltip mặc định của trình duyệt */}
                      <span>{size.value}</span>

                      {/* Tooltip hiển thị description */}
                      {size.description && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-mono-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-max z-10 pointer-events-none">
                          {size.description}
                          {/* Mũi tên nhỏ phía dưới tooltip */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply filters button */}
              <button
                onClick={applyFilters}
                className="w-full py-2 bg-mono-black text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </div>

          {/* Mobile filter panel - tương tự như desktop nhưng định dạng khác */}
          {showMobileFilter && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
              <div className="h-full w-80 max-w-full bg-white p-4 ml-auto overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Bộ lọc</h2>
                  <button onClick={() => setShowMobileFilter(false)}>
                    <FiX size={24} />
                  </button>
                </div>

                {/* Filter content - same as sidebar but for mobile */}
                <div className="space-y-6">
                  {/* Sort filter */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-mono-700">Sắp xếp</h3>
                    <select
                      value={filtersState.sort}
                      onChange={(e) =>
                        setFiltersState({
                          ...filtersState,
                          sort: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-mono-300 rounded-md"
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="price-asc">Giá: Thấp đến cao</option>
                      <option value="price-desc">Giá: Cao đến thấp</option>
                      <option value="popular">Phổ biến nhất</option>
                      <option value="rating">Đánh giá cao</option>
                    </select>
                  </div>

                  {/* Gender filter */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-mono-700">Giới tính</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setFiltersState({
                            ...filtersState,
                            gender:
                              filtersState.gender === "male"
                                ? undefined
                                : "male",
                          })
                        }
                        className={`px-3 py-1 border rounded-md ${
                          filtersState.gender === "male"
                            ? "bg-mono-50 border-mono-500 text-blue-700"
                            : "border-mono-300"
                        }`}
                      >
                        Nam
                      </button>
                      <button
                        onClick={() =>
                          setFiltersState({
                            ...filtersState,
                            gender:
                              filtersState.gender === "female"
                                ? undefined
                                : "female",
                          })
                        }
                        className={`px-3 py-1 border rounded-md ${
                          filtersState.gender === "female"
                            ? "bg-mono-50 border-mono-500 text-blue-700"
                            : "border-mono-300"
                        }`}
                      >
                        Nữ
                      </button>
                    </div>
                  </div>

                  {/* Price filter with slider - Mobile */}
                  <div className="space-y-6">
                    <h3 className="font-medium text-mono-700">Khoảng giá</h3>

                    {/* Thanh trượt khoảng giá - Thêm mb-8 để tăng khoảng cách */}
                    <div className="px-2 mb-8">
                      <div className="relative">
                        {/* Track cho thanh trượt */}
                        <div className="absolute h-1 bg-mono-200 rounded w-full top-1/2 -translate-y-1/2"></div>

                        {/* Track đã chọn */}
                        <div
                          className="absolute h-1 bg-mono-500 rounded top-1/2 -translate-y-1/2"
                          style={{
                            left: `${
                              (((filtersState.minPrice ||
                                filters.priceRange?.min ||
                                0) -
                                (filters.priceRange?.min || 0)) /
                                ((filters.priceRange?.max || 1000000) -
                                  (filters.priceRange?.min || 0))) *
                              100
                            }%`,
                            right: `${
                              100 -
                              (((filtersState.maxPrice ||
                                filters.priceRange?.max ||
                                1000000) -
                                (filters.priceRange?.min || 0)) /
                                ((filters.priceRange?.max || 1000000) -
                                  (filters.priceRange?.min || 0))) *
                                100
                            }%`,
                          }}
                        ></div>

                        {/* Thanh trượt giá thấp nhất */}
                        <input
                          type="range"
                          min={filters.priceRange?.min || 0}
                          max={filters.priceRange?.max || 1000000}
                          value={
                            filtersState.minPrice ||
                            filters.priceRange?.min ||
                            0
                          }
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            // Đảm bảo minPrice không vượt quá maxPrice
                            if (
                              value <=
                              (filtersState.maxPrice ||
                                filters.priceRange?.max ||
                                1000000)
                            ) {
                              setFiltersState({
                                ...filtersState,
                                minPrice: value,
                              });
                            }
                          }}
                          className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer h-1"
                          style={{
                            WebkitAppearance: "none",
                            appearance: "none",
                            backgroundColor: "transparent",
                          }}
                        />

                        {/* Thanh trượt giá cao nhất */}
                        <input
                          type="range"
                          min={filters.priceRange?.min || 0}
                          max={filters.priceRange?.max || 1000000}
                          value={
                            filtersState.maxPrice ||
                            filters.priceRange?.max ||
                            1000000
                          }
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            // Đảm bảo maxPrice không nhỏ hơn giá minPrice
                            if (
                              value >=
                              (filtersState.minPrice ||
                                filters.priceRange?.min ||
                                0)
                            ) {
                              setFiltersState({
                                ...filtersState,
                                maxPrice: value,
                              });
                            }
                          }}
                          className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer h-1"
                          style={{
                            WebkitAppearance: "none",
                            appearance: "none",
                            backgroundColor: "transparent",
                          }}
                        />
                      </div>
                    </div>

                    {/* Hiển thị khoảng giá đã chọn với input number */}
                    <div className="flex items-center justify-between text-sm">
                      <input
                        type="number"
                        className="border rounded-md px-3 py-2 bg-white w-[45%] text-sm"
                        min={filters.priceRange?.min || 0}
                        max={
                          filtersState.maxPrice ||
                          filters.priceRange?.max ||
                          1000000
                        }
                        value={
                          filtersState.minPrice !== undefined
                            ? filtersState.minPrice
                            : ""
                        }
                        onChange={(e) =>
                          handlePriceInput("min", e.target.value)
                        }
                        placeholder={`${filters.priceRange?.min || 0}`}
                      />
                      <span className="text-mono-500">đến</span>
                      <input
                        type="number"
                        className="border rounded-md px-3 py-2 bg-white w-[45%] text-sm"
                        min={
                          filtersState.minPrice || filters.priceRange?.min || 0
                        }
                        max={filters.priceRange?.max || 1000000}
                        value={
                          filtersState.maxPrice !== undefined
                            ? filtersState.maxPrice
                            : ""
                        }
                        onChange={(e) =>
                          handlePriceInput("max", e.target.value)
                        }
                        placeholder={`${filters.priceRange?.max || 1000000}`}
                      />
                    </div>
                  </div>

                  {/* Other filters same as desktop */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-mono-700">Danh mục</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {filters.categories.map((category) => (
                        <div key={category._id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`category-mobile-${category._id}`}
                            checked={
                              filtersState.category
                                ?.split(",")
                                .includes(category._id) || false
                            }
                            onChange={() =>
                              handleCheckboxFilter("category", category._id)
                            }
                            className="h-4 w-4 text-mono-black rounded"
                          />
                          <label
                            htmlFor={`category-mobile-${category._id}`}
                            className="ml-2 text-sm text-mono-700"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brand filter */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-mono-700">Thương hiệu</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {filters.brands.map((brand) => (
                        <div key={brand._id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`brand-mobile-${brand._id}`}
                            checked={
                              filtersState.brand
                                ?.split(",")
                                .includes(brand._id) || false
                            }
                            onChange={() =>
                              handleCheckboxFilter("brand", brand._id)
                            }
                            className="h-4 w-4 text-mono-black rounded"
                          />
                          <label
                            htmlFor={`brand-mobile-${brand._id}`}
                            className="ml-2 text-sm text-mono-700"
                          >
                            {brand.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Color filter */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-mono-700">Màu sắc</h3>{" "}
                    <div className="flex flex-wrap gap-2">
                      {filters.colors.map((color) => (
                        <button
                          key={color._id}
                          onClick={() =>
                            handleCheckboxFilter("colors", color._id)
                          }
                          className={`relative w-8 h-8 rounded-full flex items-center justify-center ${
                            safeStringToArray(filtersState.colors).includes(
                              color._id
                            )
                              ? "ring-2 ring-mono-500 ring-offset-2"
                              : ""
                          }`}
                          title={color.name}
                        >
                          {color.type === "solid" ? (
                            <div
                              className="w-6 h-6 rounded-full border border-mono-300"
                              style={{ backgroundColor: color.code }}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-mono-300 relative overflow-hidden">
                              <div
                                style={{
                                  backgroundColor: color.colors?.[0] || "#fff",
                                  width: "100%",
                                  height: "100%",
                                  position: "absolute",
                                  left: 0,
                                  top: 0,
                                  clipPath: "inset(0 50% 0 0)",
                                }}
                              />
                              <div
                                style={{
                                  backgroundColor: color.colors?.[1] || "#fff",
                                  width: "100%",
                                  height: "100%",
                                  position: "absolute",
                                  right: 0,
                                  top: 0,
                                  clipPath: "inset(0 0 0 50%)",
                                }}
                              />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size filter */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-mono-700">Kích thước</h3>{" "}
                    <div className="flex flex-wrap gap-2">
                      {filters.sizes.map((size) => (
                        <button
                          key={size._id}
                          onClick={() =>
                            handleCheckboxFilter("sizes", size._id)
                          }
                          className={`w-10 h-10 flex items-center justify-center border rounded-md ${
                            safeStringToArray(filtersState.sizes).includes(
                              size._id
                            )
                              ? "bg-mono-50 border-mono-500 text-blue-700"
                              : "border-mono-300"
                          }`}
                        >
                          {size.value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={resetFilters}
                      className="flex-1 py-2 border border-mono-300 rounded-md"
                    >
                      Đặt lại
                    </button>
                    <button
                      onClick={applyFilters}
                      className="flex-1 py-2 bg-mono-black text-white rounded-md"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1">
            {/* Products grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-mono-200 aspect-square rounded-lg mb-4"></div>
                    <div className="h-4 bg-mono-200 rounded mb-2"></div>
                    <div className="h-4 bg-mono-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-mono-800 mb-4">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-4 py-2 bg-mono-500 text-white rounded hover:bg-mono-black"
                >
                  Thử lại
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-mono-500 text-lg">
                  Không tìm thấy sản phẩm nào phù hợp với bộ lọc
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-mono-500 text-white rounded hover:bg-mono-black"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={convertToProductCardProduct(product)}
                      onClick={() => navigateToProduct(product)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 space-x-2">
                    {/* Previous button */}
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={!pagination.hasPrev}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pagination.hasPrev
                          ? "text-mono-500 bg-white border border-mono-300 hover:bg-mono-50"
                          : "text-mono-300 bg-mono-100 border border-mono-200 cursor-not-allowed"
                      }`}
                    >
                      Trước
                    </button>

                    {/* Page numbers */}
                    {generatePaginationButtons().map((page, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          typeof page === "number" && handlePageChange(page)
                        }
                        disabled={page === "..."}
                        className={`px-3 py-2 text-sm font-medium rounded-md 
                        ${
                          page === "..."
                            ? "text-mono-500 cursor-default"
                            : page === pagination.currentPage
                            ? "text-white bg-mono-black border border-mono-black"
                            : "text-mono-500 bg-white border border-mono-300 hover:bg-mono-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Next button */}
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={!pagination.hasNext}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pagination.hasNext
                          ? "text-mono-500 bg-white border border-mono-300 hover:bg-mono-50"
                          : "text-mono-300 bg-mono-100 border border-mono-200 cursor-not-allowed"
                      }`}
                    >
                      Tiếp
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
