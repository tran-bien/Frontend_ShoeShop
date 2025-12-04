import React from "react";
import type { Color } from "../../types/color";
import type { Size } from "../../types/size";
import type { Gender } from "../../types/common";
import type { Product, ProductAttributes } from "../../types/product";

interface ProductInfoProps {
  product: Product;
  attributes?: ProductAttributes;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product, attributes }) => {
  // Tính số lượng tên kho
  const getTotalInventory = () => {
    if (attributes?.inventoryMatrix?.summary?.total) {
      return attributes.inventoryMatrix.summary.total;
    }
    return product.totalQuantity || 0;
  };
  // T?o mẩng các kích thước dã sắp xếp
  const getSortedSizes = (): Size[] => {
    if (!attributes?.sizes) return [];
    return [...attributes.sizes].sort((a: Size, b: Size) => {
      if (typeof a.value === "number" && typeof b.value === "number") {
        return a.value - b.value;
      }
      return String(a.value).localeCompare(String(b.value));
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold border-b pb-2 mb-2">
          Mô từ sản phẩm
        </h3>
        <p className="text-mono-700 whitespace-pre-line">
          {product.description}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold border-b pb-2 mb-2">
          Thông tin chi tiết
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex">
              <span className="w-36 text-mono-600">Danh mục:</span>
              <span className="font-medium">
                {typeof product.category === "object"
                  ? product.category?.name
                  : product.category || "Chua phân lo?i"}
              </span>
            </div>
            <div className="flex">
              <span className="w-36 text-mono-600">Thuong hi?u:</span>
              <div className="flex items-center">
                {typeof product.brand === "object" && product.brand?.logo ? (
                  <img
                    src={
                      typeof product.brand.logo === "string"
                        ? product.brand.logo
                        : product.brand.logo.url
                    }
                    alt={product.brand.name}
                    className="h-6 mr-2 object-contain"
                  />
                ) : null}
                <span className="font-medium">
                  {typeof product.brand === "object"
                    ? product.brand?.name
                    : product.brand || "Chua có thuong hi?u"}
                </span>
              </div>
            </div>

            <div className="flex">
              <span className="w-36 text-mono-600">Trạng thái:</span>
              <span
                className={`font-medium ${
                  product.stockStatus === "in_stock"
                    ? "text-mono-800"
                    : product.stockStatus === "low_stock"
                    ? "text-mono-700"
                    : "text-mono-900"
                }`}
              >
                {product.stockStatus === "in_stock"
                  ? "Còn hàng"
                  : product.stockStatus === "low_stock"
                  ? "S?p h?t hàng"
                  : "H?t hàng"}
              </span>
            </div>

            <div className="flex">
              <span className="w-36 text-mono-600">Tổng số lượng:</span>
              <span className="font-medium">{getTotalInventory()}</span>
            </div>
          </div>

          {attributes && (
            <div className="space-y-2">
              {" "}
              <div className="flex flex-col">
                <span className="text-mono-600 mb-1">Giới tính:</span>
                <div className="flex flex-wrap gap-1">
                  {attributes.genders?.map((g: Gender) => (
                    <span
                      key={g.id}
                      className="inline-block px-2 py-1 bg-mono-100 rounded-md text-sm"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-mono-600 mb-1">Khoảng giá:</span>
                <span className="font-medium">
                  {attributes.priceRange?.min?.toLocaleString()} d
                  {attributes.priceRange?.max !== attributes.priceRange?.min &&
                    ` - ${attributes.priceRange?.max?.toLocaleString()} d`}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-mono-600 mb-1">Màu sắc có sẩn:</span>
                <div className="flex flex-wrap gap-2">
                  {attributes.colors?.map((color: Color) => (
                    <div key={color._id} className="flex items-center gap-1">
                      {color.type === "solid" ? (
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.code }}
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full border relative overflow-hidden">
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
                      <span className="text-sm">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>{" "}
              <div className="flex flex-col">
                <span className="text-mono-600 mb-1">Kích thước có sẩn:</span>
                <div className="flex flex-wrap gap-1">
                  {getSortedSizes().map((size: Size) => (
                    <div key={size._id} className="relative group inline-block">
                      <span className="inline-block px-2 py-1 bg-mono-100 rounded-md text-sm cursor-help">
                        {size.value}
                      </span>
                      {size.description && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-mono-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-max z-10 pointer-events-none">
                          {size.description}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thông tin thêm */}
      <div>
        <h3 className="text-lg font-semibold border-b pb-2 mb-2">
          Chính sách b?o hành
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-mono-700">
          <li>B?o hành chính hãng 12 tháng</li>
          <li>Ð?i trở trong vòng 30 ngày n?u có lỗi từ nhà sẩn xuất</li>
          <li>Miẩn phí vẩn chuyện với don hàng từ 500.000d</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductInfo;


