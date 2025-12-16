import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCompare } from "../../contexts/CompareContext";
import ColorSwatch from "../../components/Custom/ColorSwatch";
import { publicCompareService } from "../../services/CompareService";
import { Product } from "../../types/product";
import {
  XMarkIcon,
  TagIcon,
  SwatchIcon,
  ArrowsUpDownIcon,
  BuildingStorefrontIcon,
  Squares2X2Icon,
  StarIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const ProductComparePage: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [selectedVariantImages, setSelectedVariantImages] = useState<
    Map<string, number>
  >(new Map());
  const [fullCompareData, setFullCompareData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch full compare data when compareList changes
  useEffect(() => {
    const fetchFullCompareData = async () => {
      const validIds = compareList.filter((p) => p && p._id).map((p) => p._id);

      if (validIds.length === 0) {
        setFullCompareData([]);
        return;
      }

      // If only 1 product, compare API won't work, use basic data
      if (validIds.length === 1) {
        setFullCompareData(compareList.filter((p) => p && p._id && p.slug));
        return;
      }

      setIsLoading(true);
      try {
        const response = await publicCompareService.compareProducts(validIds);
        const compareData = response.data.data;

        if (Array.isArray(compareData) && compareData.length > 0) {
          // Sort to maintain original order from compareList
          const sortedData = validIds
            .map((id) => compareData.find((p: Product) => p._id === id))
            .filter(Boolean) as Product[];
          setFullCompareData(sortedData);
        } else {
          // Fallback to original data
          setFullCompareData(compareList.filter((p) => p && p._id && p.slug));
        }
      } catch (error) {
        console.error("Failed to fetch compare data:", error);
        // Fallback to original data
        setFullCompareData(compareList.filter((p) => p && p._id && p.slug));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullCompareData();
  }, [compareList]);

  // Use fullCompareData instead of compareList for display
  const validProducts = fullCompareData.filter((p) => p && p._id && p.slug);

  // Get current image index for a product's variant images
  const getImageIndex = (productId: string) =>
    selectedVariantImages.get(productId) || 0;

  // Navigate images
  const nextImage = (productId: string, maxImages: number) => {
    setSelectedVariantImages((prev) => {
      const newMap = new Map(prev);
      const current = prev.get(productId) || 0;
      newMap.set(productId, (current + 1) % maxImages);
      return newMap;
    });
  };

  const prevImage = (productId: string, maxImages: number) => {
    setSelectedVariantImages((prev) => {
      const newMap = new Map(prev);
      const current = prev.get(productId) || 0;
      newMap.set(productId, (current - 1 + maxImages) % maxImages);
      return newMap;
    });
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
        );
      } else if (i - 0.5 <= rating) {
        stars.push(
          <StarIconSolid
            key={i}
            className="h-4 w-4 text-yellow-400 opacity-50"
          />
        );
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-mono-300" />);
      }
    }
    return stars;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-mono-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mono-900 mx-auto mb-4"></div>
          <p className="text-mono-600">Đang tải dữ liệu so sánh...</p>
        </div>
      </div>
    );
  }

  if (validProducts.length === 0 && compareList.length === 0) {
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
              So sánh {validProducts.length} sản phẩm
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
                {validProducts.map((product) => {
                  // Collect all images from product and variants
                  const allImages: { url: string; label?: string }[] = [];

                  // Product main images
                  if (product.images && product.images.length > 0) {
                    product.images.forEach((img: any, idx: number) => {
                      allImages.push({
                        url: img.url || img,
                        label: idx === 0 ? "Ảnh chính" : `Ảnh ${idx + 1}`,
                      });
                    });
                  }

                  // Variant images (from variantSummary colors if available)
                  if (product.variantSummary?.colors) {
                    product.variantSummary.colors.forEach((color: any) => {
                      if (color.images && color.images.length > 0) {
                        color.images.forEach((img: any) => {
                          allImages.push({
                            url: img.url || img,
                            label: `Màu ${color.name}`,
                          });
                        });
                      }
                    });
                  }

                  const imageIndex = getImageIndex(product._id);
                  const currentImage =
                    allImages[imageIndex]?.url ||
                    product.images?.[0]?.url ||
                    "/placeholder-image.jpg";
                  const currentLabel = allImages[imageIndex]?.label || "";

                  return (
                    <th key={product._id} className="p-4 min-w-[320px]">
                      <div className="relative">
                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCompare(product._id)}
                          className="absolute top-0 right-0 bg-mono-100 hover:bg-mono-200 text-mono-700 p-1 rounded-full transition-colors z-10"
                          title="Xóa"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>

                        {/* Product Image with Navigation */}
                        <div className="relative group">
                          <Link to={`/products/${product.slug}`}>
                            <img
                              src={currentImage}
                              alt={product.name}
                              className="w-full h-72 object-cover rounded-lg mb-2 hover:opacity-90 transition-opacity"
                            />
                          </Link>

                          {/* Image Navigation */}
                          {allImages.length > 1 && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  prevImage(product._id, allImages.length);
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronLeftIcon className="h-4 w-4 text-mono-700" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  nextImage(product._id, allImages.length);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronRightIcon className="h-4 w-4 text-mono-700" />
                              </button>

                              {/* Image Dots */}
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {allImages.slice(0, 5).map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setSelectedVariantImages((prev) => {
                                        const newMap = new Map(prev);
                                        newMap.set(product._id, idx);
                                        return newMap;
                                      });
                                    }}
                                    className={`h-2 w-2 rounded-full transition-all ${
                                      imageIndex === idx
                                        ? "bg-mono-900 w-4"
                                        : "bg-white/70 hover:bg-white"
                                    }`}
                                  />
                                ))}
                                {allImages.length > 5 && (
                                  <span className="text-white text-xs">
                                    +{allImages.length - 5}
                                  </span>
                                )}
                              </div>
                            </>
                          )}

                          {/* Image Label */}
                          {currentLabel && (
                            <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                              {currentLabel}
                            </span>
                          )}
                        </div>

                        {/* Image Count */}
                        <div className="flex items-center justify-center gap-1 text-xs text-mono-500 mb-2">
                          <PhotoIcon className="h-3.5 w-3.5" />
                          <span>{allImages.length} ảnh</span>
                        </div>

                        {/* Product Name */}
                        <Link
                          to={`/products/${product.slug}`}
                          className="text-lg font-semibold text-mono-900 hover:text-mono-700 transition-colors line-clamp-2"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* Price */}
              <tr className="border-b border-mono-100 hover:bg-mono-50">
                <td className="p-4 font-medium text-mono-700 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="h-5 w-5" />
                    Giá
                  </div>
                </td>
                {validProducts.map((product) => (
                  <td key={product._id} className="p-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-mono-900">
                        {(product.priceRange?.min || 0).toLocaleString("vi-VN")}
                        đ
                        {product.priceRange?.min !== product.priceRange?.max &&
                          product.priceRange?.max && (
                            <span className="text-lg font-medium text-mono-600">
                              {" "}
                              - {product.priceRange.max.toLocaleString("vi-VN")}
                              đ
                            </span>
                          )}
                      </div>
                      {product.discount?.hasDiscount &&
                        product.discount?.maxPercent &&
                        product.discount.maxPercent > 0 && (
                          <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-sm font-semibold rounded">
                            Giảm đến {product.discount.maxPercent}%
                          </span>
                        )}
                      {product.priceRange?.isSinglePrice && (
                        <div className="text-xs text-mono-500">
                          Giá đồng nhất
                        </div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Rating & Reviews */}
              <tr className="border-b border-mono-100 hover:bg-mono-50">
                <td className="p-4 font-medium text-mono-700 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5" />
                    Đánh giá
                  </div>
                </td>
                {validProducts.map((product) => (
                  <td key={product._id} className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        {renderStars(product.rating || 0)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-mono-900">
                          {(product.rating || 0).toFixed(1)}
                        </span>
                        <span className="text-sm text-mono-500">
                          ({product.numReviews || 0} đánh giá)
                        </span>
                      </div>
                    </div>
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
                {validProducts.map((product) => (
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
                {validProducts.map((product) => (
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
                {validProducts.map((product) => (
                  <td key={product._id} className="p-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {product.tags && product.tags.length > 0 ? (
                        product.tags.map((tag, index) => {
                          const tagName =
                            typeof tag === "string" ? tag : tag.name;
                          const tagId =
                            typeof tag === "string" ? `tag-${index}` : tag._id;
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

              {/* Colors with Details */}
              <tr className="border-b border-mono-100 hover:bg-mono-50">
                <td className="p-4 font-medium text-mono-700 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <SwatchIcon className="h-5 w-5" />
                    Màu sắc
                  </div>
                </td>
                {validProducts.map((product) => (
                  <td key={product._id} className="p-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-sm font-medium text-mono-700 mb-1">
                        {product.variantSummary?.colorCount ||
                          product.variantSummary?.colors?.length ||
                          0}{" "}
                        màu sắc
                      </div>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {product.variantSummary?.colors &&
                        product.variantSummary.colors.length > 0 ? (
                          product.variantSummary.colors.map(
                            (color: any, index: number) => (
                              <div
                                key={index}
                                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-mono-50 transition-colors"
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
                                <span className="text-xs text-mono-600 text-center max-w-[60px] truncate">
                                  {color.name}
                                </span>
                                {color.quantity !== undefined && (
                                  <span className="text-[10px] text-mono-500">
                                    SL: {color.quantity}
                                  </span>
                                )}
                              </div>
                            )
                          )
                        ) : (
                          <span className="text-mono-500">N/A</span>
                        )}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Variant Summary */}
              <tr className="border-b border-mono-100 hover:bg-mono-50">
                <td className="p-4 font-medium text-mono-700 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <Squares2X2Icon className="h-5 w-5" />
                    Biến thể
                  </div>
                </td>
                {validProducts.map((product) => (
                  <td key={product._id} className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-semibold text-mono-900">
                        {product.variantSummary?.total || 0}
                      </span>
                      <span className="text-sm text-mono-500">
                        biến thể có sẵn
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Sizes with Details */}
              <tr className="border-b border-mono-100 hover:bg-mono-50">
                <td className="p-4 font-medium text-mono-700 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <ArrowsUpDownIcon className="h-5 w-5" />
                    Size
                  </div>
                </td>
                {validProducts.map((product) => (
                  <td key={product._id} className="p-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-sm font-medium text-mono-700 mb-1">
                        {product.variantSummary?.sizeCount || 0} kích cỡ có sẵn
                      </div>
                      {product.variantSummary?.sizes &&
                      product.variantSummary.sizes.length > 0 ? (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {product.variantSummary.sizes.map(
                            (
                              size:
                                | string
                                | { value: string; quantity?: number },
                              index: number
                            ) => {
                              const sizeValue =
                                typeof size === "string" ? size : size.value;
                              const sizeQuantity =
                                typeof size === "object"
                                  ? size.quantity
                                  : undefined;
                              return (
                                <div
                                  key={index}
                                  className="flex flex-col items-center gap-1 p-2 bg-mono-50 rounded-lg border border-mono-200"
                                >
                                  <span className="text-sm font-semibold text-mono-800">
                                    Size {sizeValue}
                                  </span>
                                  {sizeQuantity !== undefined && (
                                    <span className="text-xs text-mono-600">
                                      SL: {sizeQuantity.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <span className="text-mono-500">
                          Không có thông tin size
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Description */}
              <tr className="hover:bg-mono-50">
                <td className="p-4 font-medium text-mono-700 sticky left-0 bg-white">
                  Mô tả
                </td>
                {validProducts.map((product) => (
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
          {validProducts.length > 1 && (
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
