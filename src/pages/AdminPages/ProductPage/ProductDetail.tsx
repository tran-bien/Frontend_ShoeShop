import { useEffect, useState } from "react";
import { productApi } from "../../../services/ProductService";
import { Product } from "../../../types/product";
import ProductImagesManager from "./ProductImagesManager";
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
    productApi
      .getById(product._id) // Use admin API method
      .then((res) => {
        // BE trả về: { success: true, data: Product }
        const productData = (res.data.data || res.data) as Product;
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
      .catch((err) => {
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
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {detail.name}
            </h2>
            <p className="text-sm text-gray-500">Chi tiết sản phẩm</p>
          </div>
          <button
            onClick={handleClose}
            className="ml-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
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
        <div className="flex border-b bg-gray-50 px-6">
          <button
            onClick={() => setActiveTab("images")}
            className={`px-6 py-3 font-medium text-sm transition-all border-b-2 -mb-px ${
              activeTab === "images"
                ? "text-blue-600 border-blue-600 bg-white"
                : "text-gray-600 border-transparent hover:text-blue-600 hover:bg-gray-100"
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
                ? "text-blue-600 border-blue-600 bg-white"
                : "text-gray-600 border-transparent hover:text-blue-600 hover:bg-gray-100"
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
                ? "text-blue-600 border-blue-600 bg-white"
                : "text-gray-600 border-transparent hover:text-blue-600 hover:bg-gray-100"
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
                  <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
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
                        className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all flex items-center gap-2"
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
                            ? "border-blue-500 shadow-lg"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt="thumbnail"
                          className="w-full h-full object-cover"
                        />
                        {img.isMain && (
                          <div className="absolute top-1 right-1 bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
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
                    className="mx-auto h-16 w-16 text-gray-400"
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
                  <p className="mt-4 text-gray-500">Chưa có hình ảnh</p>
                </div>
              )}
            </div>
          )}

          {/* Info Tab */}
          {activeTab === "info" && (
            <div className="space-y-6">
              {/* Description Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
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
                <p className="text-gray-700 leading-relaxed">
                  {detail.description}
                </p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-medium mb-1">
                    Danh mục
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {typeof detail.category === "object"
                      ? detail.category?.name
                      : detail.category}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-medium mb-1">
                    Thương hiệu
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
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
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-medium mb-1">
                    Trạng thái
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      detail.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {detail.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                  </span>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-medium mb-1">
                    Tồn kho
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        detail.stockStatus === "in_stock"
                          ? "bg-green-100 text-green-700"
                          : detail.stockStatus === "low_stock"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
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
                    <span className="text-sm text-gray-600">
                      ({detail.totalQuantity} sản phẩm)
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {detail.tags && detail.tags.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-medium mb-3">
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
                              ? "bg-blue-100 text-blue-800"
                              : tag.type === "USECASE"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
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
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">ID:</span>
                    <span className="ml-2 font-mono text-gray-700">
                      {detail._id}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Slug:</span>
                    <span className="ml-2 font-mono text-gray-700">
                      {detail.slug}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ngày tạo:</span>
                    <span className="ml-2 text-gray-700">
                      {new Date(detail.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Cập nhật:</span>
                    <span className="ml-2 text-gray-700">
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
              {detail.variants && detail.variants.length > 0 ? (
                detail.variants.map((variant) => {
                  // Type guard for Variant object
                  if (typeof variant === "string") return null;

                  return (
                    <div
                      key={variant._id}
                      className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow"
                    >
                      {/* Variant Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {/* Color Swatch */}
                          {variant.color &&
                            typeof variant.color !== "string" &&
                            variant.color.colors &&
                            variant.color.colors.length > 0 && (
                              <div className="flex gap-2">
                                {variant.color.colors.length === 1 ? (
                                  <span
                                    className="inline-block w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm"
                                    style={{
                                      background: variant.color.colors[0],
                                    }}
                                    title={variant.color.colors[0]}
                                  />
                                ) : variant.color.colors.length === 2 ? (
                                  <span
                                    className="inline-block w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm"
                                    style={{
                                      background: `linear-gradient(90deg, ${variant.color.colors[0]} 50%, ${variant.color.colors[1]} 50%)`,
                                    }}
                                    title={variant.color.colors.join(" / ")}
                                  />
                                ) : (
                                  <span
                                    className="inline-block w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm"
                                    style={{
                                      background: `linear-gradient(90deg, ${variant.color.colors
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
                                    title={variant.color.colors.join(" / ")}
                                  />
                                )}
                              </div>
                            )}
                          <div>
                            <h4 className="font-semibold text-gray-800 text-lg">
                              {variant.color &&
                              typeof variant.color !== "string"
                                ? variant.color.name
                                : variant.color}
                            </h4>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                variant.gender === "Nam"
                                  ? "bg-blue-100 text-blue-700"
                                  : variant.gender === "Nữ"
                                  ? "bg-pink-100 text-pink-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {variant.gender}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            variant.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {variant.isActive ? "✓ Đang bán" : "✕ Ẩn"}
                        </span>
                      </div>

                      {/* Price Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">
                            Giá gốc
                          </div>
                          <div className="text-sm font-bold text-gray-800">
                            {(variant as any).price?.toLocaleString() || "N/A"}{" "}
                            ₫
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="text-xs text-gray-500 mb-1">
                            Giá bán
                          </div>
                          <div className="text-sm font-bold text-blue-600">
                            {(variant as any).priceFinal?.toLocaleString() ||
                              "N/A"}{" "}
                            ₫
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-orange-200">
                          <div className="text-xs text-gray-500 mb-1">
                            Giảm giá
                          </div>
                          <div className="text-sm font-bold text-orange-600">
                            {(variant as any).percentDiscount || 0}%
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="text-xs text-gray-500 mb-1">
                            Lợi nhuận
                          </div>
                          <div className="text-sm font-bold text-green-600">
                            {(variant as any).profit?.toLocaleString() || "N/A"}{" "}
                            ₫
                          </div>
                        </div>
                      </div>

                      {/* Images */}
                      {variant.imagesvariant &&
                        variant.imagesvariant.length > 0 && (
                          <div className="mb-4">
                            <div className="text-xs text-gray-500 font-medium mb-2">
                              Ảnh biến thể ({variant.imagesvariant.length})
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {variant.imagesvariant.map((img) => (
                                <img
                                  key={img._id}
                                  src={img.url}
                                  alt="variant"
                                  className="h-16 w-16 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Sizes */}
                      <div>
                        <div className="text-xs text-gray-500 font-medium mb-2">
                          Size & Số lượng
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {variant.sizes && variant.sizes.length > 0 ? (
                            variant.sizes.map((sz) => (
                              <span
                                key={sz._id}
                                className="inline-flex items-center gap-2 bg-white border border-gray-300 px-3 py-2 rounded-lg text-sm hover:border-blue-400 transition-all"
                              >
                                <span className="font-semibold text-gray-800">
                                  {sz.size && typeof sz.size !== "string"
                                    ? sz.size.description || sz.size.value
                                    : sz.size}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span
                                  className={`font-medium ${
                                    sz.quantity > 10
                                      ? "text-green-600"
                                      : sz.quantity > 0
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {sz.quantity} đôi
                                </span>
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Chưa có size
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
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
                  <p className="mt-4 text-gray-500">Chưa có biến thể nào</p>
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
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
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
                  const res = await productApi.getById(detail._id); // Use admin API
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
