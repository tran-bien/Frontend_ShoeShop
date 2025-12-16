import { useEffect, useState } from "react";
import { productAdminService } from "../../../services/ProductService";
import { Product } from "../../../types/product";
import ProductImagesManager from "./ProductImagesManager";
import ColorSwatch from "../../../components/Custom/ColorSwatch";
import { useAuth } from "../../../hooks/useAuth";

interface ProductDetailProps {
  product: Product;
  handleClose: () => void;
}

const ProductDetail = ({ product, handleClose }: ProductDetailProps) => {
  const [detail, setDetail] = useState<Product>(product);
  const [loading, setLoading] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "variants" | "images">(
    "info"
  );
  const [selectedImage, setSelectedImage] = useState<string>("");
  const { canManageImages } = useAuth();

  useEffect(() => {
    setLoading(true);
    productAdminService
      .getProductById(product._id) // Use admin API method
      .then((res: any) => {
        // BE trả về: { success: true, product: Product }
        const productData = (res.data.product ||
          res.data.data ||
          res.data) as Product;
        console.log("Product detail loaded:", productData);
        setDetail(productData);
        // Set first image as selected
        if (productData.images?.length > 0) {
          const mainImg = productData.images.find(
            (img: { isMain: boolean }) => img.isMain
          );
          setSelectedImage(mainImg?.url || productData.images[0]?.url || "");
        }
      })
      .catch((err: any) => {
        console.error("Error loading product detail:", err);
      })
      .finally(() => setLoading(false));
  }, [product._id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-xl font-bold"
          >
            ×
          </button>
          <div>Đang tải chi tiết sản phẩm...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-sans p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl relative shadow-2xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-mono-50 to-indigo-50">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-mono-800 mb-1">
              {detail.name}
            </h2>
            <p className="text-sm text-mono-500">Chi tiết sản phẩm</p>
          </div>
          <button
            onClick={handleClose}
            className="ml-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-mono-100 text-mono-400 hover:text-mono-800 transition-all"
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

        {/* Tabs */}
        <div className="flex border-b bg-mono-50 px-6">
          <button
            onClick={() => setActiveTab("images")}
            className={`px-6 py-3 font-medium text-sm transition-all border-b-2 -mb-px ${
              activeTab === "images"
                ? "text-mono-black border-mono-black bg-white"
                : "text-mono-600 border-transparent hover:text-mono-black hover:bg-mono-100"
            }`}
          >
            <span className="flex items-center gap-2">
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
              Hình ảnh ({detail.images?.length || 0})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-3 font-medium text-sm transition-all border-b-2 -mb-px ${
              activeTab === "info"
                ? "text-mono-black border-mono-black bg-white"
                : "text-mono-600 border-transparent hover:text-mono-black hover:bg-mono-100"
            }`}
          >
            <span className="flex items-center gap-2">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Thông tin
            </span>
          </button>
          <button
            onClick={() => setActiveTab("variants")}
            className={`px-6 py-3 font-medium text-sm transition-all border-b-2 -mb-px ${
              activeTab === "variants"
                ? "text-mono-black border-mono-black bg-white"
                : "text-mono-600 border-transparent hover:text-mono-black hover:bg-mono-100"
            }`}
          >
            <span className="flex items-center gap-2">
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
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
              Biến thể ({detail.variants?.length || 0})
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Images Tab */}
          {activeTab === "images" && (
            <div className="space-y-4">
              {detail.images && detail.images.length > 0 ? (
                <>
                  {/* Main Image */}
                  <div className="relative bg-mono-100 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                    <img
                      src={
                        selectedImage ||
                        detail.images.find((img) => img.isMain)?.url ||
                        detail.images[0]?.url
                      }
                      alt={detail.name}
                      className="max-w-full max-h-full object-contain"
                    />
                    {canManageImages() && (
                      <button
                        onClick={() => setShowImageManager(true)}
                        className="absolute top-4 right-4 bg-white hover:bg-mono-100 text-mono-700 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all flex items-center gap-2"
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
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        Quản lý ảnh
                      </button>
                    )}
                  </div>
                  {/* Thumbnails */}
                  <div className="grid grid-cols-6 gap-3">
                    {detail.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(img.url)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                          selectedImage === img.url
                            ? "border-mono-500 shadow-lg"
                            : "border-mono-200 hover:border-mono-400"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt="thumbnail"
                          className="w-full h-full object-cover"
                        />
                        {img.isMain && (
                          <div className="absolute top-1 right-1 bg-mono-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                            Main
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-16 w-16 text-mono-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-4 text-mono-500">Chưa có hình ảnh</p>
                </div>
              )}
            </div>
          )}

          {/* Info Tab */}
          {activeTab === "info" && (
            <div className="space-y-6">
              {/* Description Card */}
              <div className="bg-gradient-to-br from-mono-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-mono-800 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-mono-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Mô tả sản phẩm
                </h3>
                <p className="text-mono-700 leading-relaxed">
                  {detail.description}
                </p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-mono-200 rounded-xl p-4">
                  <div className="text-xs text-mono-500 font-medium mb-1">
                    Danh mục
                  </div>
                  <div className="text-sm font-semibold text-mono-800">
                    {typeof detail.category === "object"
                      ? detail.category?.name
                      : detail.category}
                  </div>
                </div>
                <div className="bg-white border border-mono-200 rounded-xl p-4">
                  <div className="text-xs text-mono-500 font-medium mb-1">
                    Thương hiệu
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-mono-800">
                      {typeof detail.brand === "object"
                        ? detail.brand?.name
                        : detail.brand}
                    </span>
                    {typeof detail.brand === "object" &&
                      detail.brand?.logo?.url && (
                        <img
                          src={detail.brand.logo.url}
                          alt={detail.brand.name}
                          className="h-6 rounded"
                        />
                      )}
                  </div>
                </div>
                <div className="bg-white border border-mono-200 rounded-xl p-4">
                  <div className="text-xs text-mono-500 font-medium mb-1">
                    Trạng thái
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      detail.isActive
                        ? "bg-mono-100 text-mono-700"
                        : "bg-mono-100 text-mono-600"
                    }`}
                  >
                    {detail.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                  </span>
                </div>
                <div className="bg-white border border-mono-200 rounded-xl p-4">
                  <div className="text-xs text-mono-500 font-medium mb-1">
                    Tồn kho
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        detail.stockStatus === "in_stock"
                          ? "bg-mono-100 text-mono-700"
                          : detail.stockStatus === "low_stock"
                          ? "bg-mono-100 text-mono-700"
                          : "bg-mono-200 text-mono-800"
                      }`}
                    >
                      {{
                        in_stock: "Còn hàng",
                        low_stock: "Sắp hết",
                        out_of_stock: "Hết hàng",
                      }[
                        detail.stockStatus as
                          | "in_stock"
                          | "low_stock"
                          | "out_of_stock"
                      ] || "Hết hàng"}
                    </span>
                    <span className="text-sm text-mono-600">
                      ({detail.totalQuantity} sản phẩm)
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {detail.tags && detail.tags.length > 0 && (
                <div className="bg-white border border-mono-200 rounded-xl p-4">
                  <div className="text-xs text-mono-500 font-medium mb-3">
                    Tags sản phẩm
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detail.tags.map((tag, index) => {
                      // Type guard for tag object
                      if (typeof tag === "string") return null;

                      return (
                        <span
                          key={tag._id || index}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            tag.type === "MATERIAL"
                              ? "bg-mono-100 text-mono-800"
                              : tag.type === "USECASE"
                              ? "bg-mono-100 text-mono-800"
                              : "bg-mono-200 text-mono-800"
                          }`}
                        >
                          {tag.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-mono-50 border border-mono-200 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-mono-500">ID:</span>
                    <span className="ml-2 font-mono text-mono-700">
                      {detail._id}
                    </span>
                  </div>
                  <div>
                    <span className="text-mono-500">Slug:</span>
                    <span className="ml-2 font-mono text-mono-700">
                      {detail.slug}
                    </span>
                  </div>
                  <div>
                    <span className="text-mono-500">Ngày tạo:</span>
                    <span className="ml-2 text-mono-700">
                      {new Date(detail.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-mono-500">Cập nhật:</span>
                    <span className="ml-2 text-mono-700">
                      {new Date(detail.updatedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Variants Tab */}
          {activeTab === "variants" && (
            <div className="space-y-4">
              {/* Variant Stats */}
              {(detail as any).variantStats && (
                <div className="bg-mono-50 border border-mono-200 rounded-xl p-4 mb-4">
                  <div className="text-xs text-mono-500 font-medium mb-3">
                    Thống kê biến thể
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="text-xl font-bold text-mono-800">
                        {(detail as any).variantStats.total}
                      </div>
                      <div className="text-xs text-mono-500">Tổng</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        {(detail as any).variantStats.active}
                      </div>
                      <div className="text-xs text-mono-500">Đang bán</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-yellow-600">
                        {(detail as any).variantStats.inactive}
                      </div>
                      <div className="text-xs text-mono-500">Ẩn</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-600">
                        {(detail as any).variantStats.deleted}
                      </div>
                      <div className="text-xs text-mono-500">Đã xóa</div>
                    </div>
                  </div>
                </div>
              )}

              {detail.variants && detail.variants.length > 0 ? (
                detail.variants.map((variant) => {
                  // Type guard for Variant object
                  if (typeof variant === "string") return null;
                  const isDeleted = !!(variant as any).deletedAt;

                  return (
                    <div
                      key={variant._id}
                      className={`border rounded-xl p-5 hover:shadow-md transition-shadow ${
                        isDeleted
                          ? "border-red-200 bg-red-50/30"
                          : "border-mono-200 bg-gradient-to-br from-white to-mono-50"
                      }`}
                    >
                      {/* Variant Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {/* Color Swatch */}
                          {variant.color &&
                            typeof variant.color !== "string" && (
                              <ColorSwatch color={variant.color} size="lg" />
                            )}
                          <div>
                            <h4 className="font-semibold text-mono-800 text-lg">
                              {variant.color &&
                              typeof variant.color !== "string"
                                ? variant.color.name
                                : variant.color}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                  variant.gender === "male"
                                    ? "bg-blue-100 text-blue-800"
                                    : variant.gender === "female"
                                    ? "bg-pink-100 text-pink-800"
                                    : "bg-mono-200 text-mono-800"
                                }`}
                              >
                                {variant.gender === "male"
                                  ? "Nam"
                                  : variant.gender === "female"
                                  ? "Nữ"
                                  : "Unisex"}
                              </span>
                              {variant.color &&
                                typeof variant.color !== "string" && (
                                  <span className="text-xs text-mono-400 font-mono">
                                    {variant.color.code}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isDeleted ? (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                              ✗ Đã xóa
                            </span>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                variant.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-mono-100 text-mono-600"
                              }`}
                            >
                              {variant.isActive ? "✓ Đang bán" : "✗ Ẩn"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Deleted Info */}
                      {isDeleted && (variant as any).deletedBy && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <div className="text-xs text-red-600">
                            <span className="font-medium">Đã xóa bởi:</span>{" "}
                            {(variant as any).deletedBy?.email ||
                              (variant as any).deletedByInfo?.email}
                          </div>
                          <div className="text-xs text-red-500">
                            <span className="font-medium">Thời gian:</span>{" "}
                            {new Date(
                              (variant as any).deletedAt
                            ).toLocaleString("vi-VN")}
                          </div>
                        </div>
                      )}

                      {/* Inventory Summary */}
                      {(variant as any).inventorySummary && (
                        <div className="bg-mono-50 border border-mono-200 rounded-lg p-3 mb-4">
                          <div className="text-xs text-mono-500 font-medium mb-2">
                            Thông tin tồn kho biến thể
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white rounded-lg p-2 border border-mono-200">
                              <div className="text-xs text-mono-500">
                                Tồn kho
                              </div>
                              <div className="text-lg font-bold text-mono-800">
                                {(
                                  variant as any
                                ).inventorySummary.totalQuantity.toLocaleString()}{" "}
                                đôi
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-mono-200">
                              <div className="text-xs text-mono-500">
                                Giá vốn TB
                              </div>
                              <div className="text-lg font-bold text-mono-800">
                                {(
                                  variant as any
                                ).inventorySummary.avgCostPrice?.toLocaleString(
                                  "vi-VN"
                                ) || 0}
                                đ
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-mono-200">
                              <div className="text-xs text-mono-500">
                                Giá bán
                              </div>
                              <div className="text-lg font-bold text-green-600">
                                {(
                                  variant as any
                                ).inventorySummary.finalPrice?.toLocaleString(
                                  "vi-VN"
                                ) || 0}
                                đ
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-mono-200">
                              <div className="text-xs text-mono-500">
                                Giá trị tồn
                              </div>
                              <div className="text-lg font-bold text-blue-600">
                                {(
                                  variant as any
                                ).inventorySummary.totalValue?.toLocaleString(
                                  "vi-VN"
                                ) || 0}
                                đ
                              </div>
                            </div>
                          </div>
                          {(variant as any).inventorySummary.discountPercent >
                            0 && (
                            <div className="mt-2 text-xs text-mono-600">
                              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                Giảm{" "}
                                {
                                  (variant as any).inventorySummary
                                    .discountPercent
                                }
                                %
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Images */}
                      {variant.imagesvariant &&
                        variant.imagesvariant.length > 0 && (
                          <div className="mb-4">
                            <div className="text-xs text-mono-500 font-medium mb-2">
                              Ảnh biến thể ({variant.imagesvariant.length})
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {variant.imagesvariant.map((img) => (
                                <div key={img._id} className="relative">
                                  <img
                                    src={img.url}
                                    alt="variant"
                                    className={`h-20 w-20 object-cover rounded-lg border-2 transition-all ${
                                      img.isMain
                                        ? "border-mono-600"
                                        : "border-mono-200 hover:border-mono-400"
                                    }`}
                                  />
                                  {img.isMain && (
                                    <span className="absolute -top-1 -right-1 bg-mono-800 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                      Main
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Sizes with Inventory Info */}
                      <div>
                        <div className="text-xs text-mono-500 font-medium mb-2">
                          Chi tiết Size & Tồn kho ({variant.sizes?.length || 0}{" "}
                          size)
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs">
                            <thead className="bg-mono-100">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium text-mono-600">
                                  Size
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-mono-600">
                                  SKU
                                </th>
                                <th className="px-3 py-2 text-right font-medium text-mono-600">
                                  Tồn kho
                                </th>
                                <th className="px-3 py-2 text-right font-medium text-mono-600">
                                  Giá vốn
                                </th>
                                <th className="px-3 py-2 text-right font-medium text-mono-600">
                                  Giá bán
                                </th>
                                <th className="px-3 py-2 text-right font-medium text-mono-600">
                                  Giảm giá
                                </th>
                                <th className="px-3 py-2 text-right font-medium text-mono-600">
                                  Lợi nhuận
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-mono-100">
                              {variant.sizes && variant.sizes.length > 0 ? (
                                variant.sizes.map((sz) => {
                                  const inv = (sz as any).inventory || {};
                                  return (
                                    <tr
                                      key={sz._id}
                                      className="hover:bg-mono-50"
                                    >
                                      <td className="px-3 py-2 font-semibold text-mono-800">
                                        {sz.size && typeof sz.size !== "string"
                                          ? `${sz.size.value} ${sz.size.type}`
                                          : sz.size}
                                      </td>
                                      <td
                                        className="px-3 py-2 font-mono text-mono-500 max-w-[120px] truncate"
                                        title={sz.sku}
                                      >
                                        {sz.sku || "N/A"}
                                      </td>
                                      <td className="px-3 py-2 text-right">
                                        <span
                                          className={`font-bold ${
                                            inv.quantity > 10
                                              ? "text-green-600"
                                              : inv.quantity > 0
                                              ? "text-yellow-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          {inv.quantity || 0}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-right text-mono-700">
                                        {inv.costPrice?.toLocaleString(
                                          "vi-VN"
                                        ) || 0}
                                        đ
                                      </td>
                                      <td className="px-3 py-2 text-right font-medium text-mono-800">
                                        {inv.finalPrice?.toLocaleString(
                                          "vi-VN"
                                        ) || 0}
                                        đ
                                      </td>
                                      <td className="px-3 py-2 text-right">
                                        {inv.discountPercent > 0 ? (
                                          <span className="text-red-600 font-medium">
                                            -{inv.discountPercent}%
                                          </span>
                                        ) : (
                                          <span className="text-mono-400">
                                            0%
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-right font-medium text-green-600">
                                        {inv.profitPerItem?.toLocaleString(
                                          "vi-VN"
                                        ) || 0}
                                        đ
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td
                                    colSpan={7}
                                    className="px-3 py-4 text-center text-mono-400"
                                  >
                                    Chưa có size
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Variant Metadata */}
                      <div className="mt-4 pt-4 border-t border-mono-200">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-mono-500">ID:</span>
                            <span className="ml-1 font-mono text-mono-600">
                              {variant._id.slice(-8)}
                            </span>
                          </div>
                          <div>
                            <span className="text-mono-500">Tạo:</span>
                            <span className="ml-1 text-mono-600">
                              {new Date(variant.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-16 w-16 text-mono-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <p className="mt-4 text-mono-500">Chưa có biến thể nào</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal quản lý ảnh */}
        {showImageManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative shadow-2xl">
              <button
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-mono-100 text-mono-400 hover:text-mono-800 transition-all"
                onClick={() => setShowImageManager(false)}
              >
                <svg
                  className="w-5 h-5"
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
              <ProductImagesManager
                productId={detail._id}
                images={detail.images}
                reloadImages={async () => {
                  const res = await productAdminService.getProductById(
                    detail._id
                  ); // Use admin API
                  const productData = (res.data.data || res.data) as Product;
                  setDetail(productData);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
