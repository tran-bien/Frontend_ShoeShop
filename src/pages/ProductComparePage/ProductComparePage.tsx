import React from "react";
import { Link } from "react-router-dom";
import { useCompare } from "../../contexts/CompareContext";
import ColorSwatch from "../../components/Custom/ColorSwatch";
import {
  XMarkIcon,
  TagIcon,
  SwatchIcon,
  ArrowsUpDownIcon,
  BuildingStorefrontIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const ProductComparePage: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-mono-50 flex items-center justify-center">
        <div className="text-center">
          <Squares2X2Icon className="h-16 w-16 text-mono-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-mono-900 mb-2">
            Chưa có sản phẩm để so sánh
          </h2>
          <p className="text-mono-600 mb-6">
            Thêm sản phẩm vào danh sách so sánh để xem chi tiết
          </p>
          <Link
            to="/products"
            className="inline-block bg-mono-black text-white px-6 py-3 rounded-lg hover:bg-mono-800 transition-colors"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mono-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-mono-900 mb-2">
              So sánh sản phẩm
            </h1>
            <p className="text-mono-600">
              So sánh {compareList.length} sản phẩm
            </p>
          </div>
          <button
            onClick={clearCompare}
            className="bg-mono-100 hover:bg-mono-200 text-mono-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <XMarkIcon className="h-5 w-5" />
            Xóa tất cả
          </button>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-mono-200">
                <th className="p-4 text-left text-mono-700 font-medium w-48 sticky left-0 bg-white z-10">
                  Thông tin
                </th>
                {compareList.map((product) => (
                  <th key={product._id} className="p-4 min-w-[280px]">
                    <div className="relative">
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCompare(product._id)}
                        className="absolute top-0 right-0 bg-mono-100 hover:bg-mono-200 text-mono-700 p-1 rounded-full transition-colors"
                        title="Xóa"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>

                      {/* Product Image */}
                      <Link to={`/products/${product.slug}`}>
                        <img
                          src={
                            product.images?.[0]?.url || "/placeholder-image.jpg"
                          }
                          alt={product.name}
                          className="w-full h-64 object-cover rounded-lg mb-3 hover:opacity-90 transition-opacity"
                        />
                      </Link>

                      {/* Product Name */}
                      <Link
                        to={`/products/${product.slug}`}
                        className="text-lg font-semibold text-mono-900 hover:text-mono-700 transition-colors line-clamp-2"
                      >
                        {product.name}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Price */}
              <tr className="border-b border-mono-100 hover:bg-mono-50">
                <td className="p-4 font-medium text-mono-700 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <TagIcon className="h-5 w-5" />
                    Giá
                  </div>
                </td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4 text-center">
                    <div className="text-2xl font-bold text-mono-900">
                      {product.priceRange?.min?.toLocaleString("vi-VN") || 0}₫
                      {product.priceRange?.min !== product.priceRange?.max &&
                        product.priceRange?.max && (
                          <span>
                            {" "}
                            - {product.priceRange.max.toLocaleString("vi-VN")}₫
                          </span>
                        )}
                    </div>
                    {product.hasDiscount &&
                      product.maxDiscountPercent &&
                      product.maxDiscountPercent > 0 && (
                        <div className="text-sm text-red-600 mt-1">
                          Giảm đến {product.maxDiscountPercent}%
                        </div>
                      )}
                  </td>
                ))}
              </tr>

              {/* Brand */}
              <tr className="border-b border-mono-100 hover:bg-mono-50">
                <td className="p-4 font-medium text-mono-700 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <BuildingStorefrontIcon className="h-5 w-5" />
                    Thương hiệu
                  </div>
                </td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4 text-center">
                    <span className="text-mono-900">
                      {typeof product.brand === "object"
                        ? product.brand.name
                        : "N/A"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr className="border-b border-mono-100 hover:bg-mono-50">
                <td className="p-4 font-medium text-mono-700 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <Squares2X2Icon className="h-5 w-5" />
                    Danh mục
                  </div>
                </td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4 text-center">
                    <span className="text-mono-900">
                      {typeof product.category === "object"
                        ? product.category.name
                        : "N/A"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Gender - Removed as not in Product type */}

              {/* Tags */}
              <tr className="border-b border-mono-100 hover:bg-mono-50">
                <td className="p-4 font-medium text-mono-700 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <TagIcon className="h-5 w-5" />
                    Tags
                  </div>
                </td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {product.tags && product.tags.length > 0 ? (
                        product.tags.map((tag, index) => {
                          const tagName =
                            typeof tag === "string" ? tag : tag.name;
                          const tagId =
                            typeof tag === "string"
                              ? `tag-${index}`
                              : tag._id;
                          return (
                            <span
                              key={tagId}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-mono-100 text-mono-800 border border-mono-200"
                            >
                              {tagName}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-mono-500">N/A</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Colors */}
              <tr className="border-b border-mono-100 hover:bg-mono-50">
                <td className="p-4 font-medium text-mono-700 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <SwatchIcon className="h-5 w-5" />
                    Màu sắc
                  </div>
                </td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {product.variantSummary?.colors &&
                      product.variantSummary.colors.length > 0 ? (
                        product.variantSummary.colors.map((color, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center gap-1"
                          >
                            <ColorSwatch
                              color={{
                                _id: `${product._id}-${index}`,
                                name: color.name,
                                code:
                                  color.hexCode || color.code || "#000000",
                                type: color.type || "solid",
                                colors: color.colors,
                              }}
                              size="md"
                            />
                            <span className="text-xs text-mono-600">
                              {color.name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-mono-500">N/A</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Sizes */}
              <tr className="border-b border-mono-100 hover:bg-mono-50">
                <td className="p-4 font-medium text-mono-700 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <ArrowsUpDownIcon className="h-5 w-5" />
                    Size
                  </div>
                </td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4 text-center">
                    <div className="text-mono-600">
                      {product.variantSummary?.sizeCount || 0} kích cỡ
                    </div>
                  </td>
                ))}
              </tr>

              {/* Stock Status */}
              <tr className="border-b border-mono-100 hover:bg-mono-50">
                <td className="p-4 font-medium text-mono-700 sticky left-0 bg-white">
                  Tình trạng
                </td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        product.totalQuantity && product.totalQuantity > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.totalQuantity && product.totalQuantity > 0
                        ? "Còn hàng"
                        : "Hết hàng"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Description */}
              <tr className="hover:bg-mono-50">
                <td className="p-4 font-medium text-mono-700 sticky left-0 bg-white">
                  Mô tả
                </td>
                {compareList.map((product) => (
                  <td key={product._id} className="p-4">
                    <p className="text-mono-600 text-sm line-clamp-4">
                      {product.description || "Không có mô tả"}
                    </p>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/products"
            className="bg-mono-100 hover:bg-mono-200 text-mono-700 px-6 py-3 rounded-lg transition-colors font-medium"
          >
            Thêm sản phẩm
          </Link>
          {compareList.length > 1 && (
            <button
              onClick={clearCompare}
              className="bg-mono-black hover:bg-mono-800 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Bắt đầu lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductComparePage;
