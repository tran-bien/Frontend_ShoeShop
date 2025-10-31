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
  // Tính số lượng tồn kho
  const getTotalInventory = () => {
    if (attributes?.inventoryMatrix?.summary?.total) {
      return attributes.inventoryMatrix.summary.total;
    }
    return product.totalQuantity || 0;
  };
  // Tạo mảng các kích thước đã sắp xếp
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
          Mô tả sản phẩm
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
                  : product.category || "Chưa phân loại"}
              </span>
            </div>
            <div className="flex">
              <span className="w-36 text-mono-600">Thương hiệu:</span>
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
                    : product.brand || "Chưa có thương hiệu"}
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
                    ? "text-orange-600"
                    : "text-mono-900"
                }`}
              >
                {product.stockStatus === "in_stock"
                  ? "Còn hàng"
                  : product.stockStatus === "low_stock"
                  ? "Sắp hết hàng"
                  : "Hết hàng"}
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
                  {attributes.priceRange?.min?.toLocaleString()} đ
                  {attributes.priceRange?.max !== attributes.priceRange?.min &&
                    ` - ${attributes.priceRange?.max?.toLocaleString()} đ`}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-mono-600 mb-1">Màu sắc có sẵn:</span>
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
                <span className="text-mono-600 mb-1">Kích thước có sẵn:</span>
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
          Chính sách bảo hành
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-mono-700">
          <li>Bảo hành chính hãng 12 tháng</li>
          <li>Đổi trả trong vòng 30 ngày nếu có lỗi từ nhà sản xuất</li>
          <li>Miễn phí vận chuyển với đơn hàng từ 500.000đ</li>
        </ul>
      </div>

      {/* Hướng dẫn chọn size */}
      <div>
        <h3 className="text-lg font-semibold border-b pb-2 mb-2">
          Hướng dẫn chọn size
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-mono-300">
            <thead>
              <tr className="bg-mono-100">
                <th className="border border-mono-300 px-4 py-2">Size</th>
                <th className="border border-mono-300 px-4 py-2">
                  Chiều dài chân (cm)
                </th>
                <th className="border border-mono-300 px-4 py-2">EU</th>
                <th className="border border-mono-300 px-4 py-2">US (Nam)</th>
                <th className="border border-mono-300 px-4 py-2">US (Nữ)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  36
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  22.7
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  36
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  4
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  5.5
                </td>
              </tr>
              <tr>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  37
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  23.3
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  37
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  4.5
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  6
                </td>
              </tr>
              <tr>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  38
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  24.0
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  38
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  5.5
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  7.5
                </td>
              </tr>
              <tr>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  39
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  24.7
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  39
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  6.5
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  8.5
                </td>
              </tr>
              <tr>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  40
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  25.3
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  40
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  7
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  9.5
                </td>
              </tr>
              <tr>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  41
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  26.0
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  41
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  8
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  10.5
                </td>
              </tr>
              <tr>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  42
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  26.7
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  42
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  9
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  11.5
                </td>
              </tr>
              <tr>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  43
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  27.3
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  43
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  9.5
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  12
                </td>
              </tr>
              <tr>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  44
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  28.0
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  44
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  10
                </td>
                <td className="border border-mono-300 px-4 py-2 text-center">
                  12.5
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
