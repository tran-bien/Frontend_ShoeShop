import { useEffect, useState } from "react";
import { productApi } from "../../../services/ProductService";
import { Product } from "../../../model/Product";
import ProductImagesManager from "./ProductImagesManager";
import { useAuth } from "../../../hooks/useAuth";

interface ProductDetailProps {
  product: Product;
  handleClose: () => void;
}

const ProductDetail = ({ product, handleClose }: ProductDetailProps) => {
  const [detail, setDetail] = useState<any>(product);
  const [loading, setLoading] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const { canManageImages } = useAuth();

  useEffect(() => {
    setLoading(true);
    productApi
      .getDetailById(product._id)
      .then((res) => setDetail(res.data.product))
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 font-sans">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl relative shadow-lg max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-xl font-bold text-gray-400 hover:text-red-500 transition"
          title="Đóng"
        >
          ×
        </button>

        <h2 className="text-3xl font-bold text-gray-800 border-b pb-4 mb-6">
          {detail.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <p className="text-gray-700">{detail.description}</p>

            <div className="text-sm space-y-2">
              <div>
                <span className="font-medium">Danh mục:</span>{" "}
                {detail.category?.name}
              </div>
              <div>
                <span className="font-medium">Slug:</span> {detail.slug}
              </div>
              <div>
                <span className="font-medium">Thương hiệu:</span>{" "}
                {typeof detail.brand === "object"
                  ? detail.brand?.name
                  : detail.brand}
                {typeof detail.brand === "object" &&
                  detail.brand?.logo?.url && (
                    <img
                      src={detail.brand.logo.url}
                      alt={detail.brand.name}
                      className="inline-block h-6 ml-2 rounded"
                    />
                  )}
              </div>
              <div>
                <span className="font-medium">Trạng thái:</span>{" "}
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    detail.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {detail.isActive ? "Đang bán" : "Ẩn"}
                </span>
              </div>
              <div>
                <span className="font-medium">Tồn kho:</span>{" "}
                {
                  {
                    in_stock: "Còn hàng",
                    low_stock: "Sắp hết hàng",
                    out_of_stock: "Hết hàng",
                  }[
                    (detail.stockStatus as
                      | "in_stock"
                      | "low_stock"
                      | "out_of_stock") || "out_of_stock"
                  ]
                }
              </div>
              <div>
                <span className="font-medium">Số lượng:</span>{" "}
                {detail.totalQuantity}
              </div>
              <div>
                <span className="font-medium">Lượt đánh giá:</span>{" "}
                {detail.numReviews}
              </div>
            </div>

            <div>
              <span className="font-semibold">Ảnh sản phẩm:</span>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {detail.images?.length > 0 ? (
                  detail.images.map((img: any) => (
                    <img
                      key={img._id}
                      src={img.url}
                      alt="product"
                      className="h-24 w-full object-cover rounded-lg border shadow-sm"
                    />
                  ))
                ) : (
                  <span className="text-gray-400">Không có hình ảnh</span>
                )}
              </div>
              {canManageImages() && (
                <button
                  className="mt-3 inline-flex items-center gap-2 bg-gray-400 border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm transition"
                  onClick={() => setShowImageManager(true)}
                >
                  Quản Lý Ảnh
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            <span className="font-semibold text-lg">Biến thể:</span>
            {detail.variants?.length === 0 && (
              <div className="text-sm mt-2 text-gray-500">
                Không có biến thể
              </div>
            )}
            <div className="space-y-4 mt-2">
              {detail.variants?.map((variant: any) => (
                <div
                  key={variant._id}
                  className="border rounded-lg p-4 bg-gray-50 shadow-sm space-y-2"
                >
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="font-medium">Màu:</span>{" "}
                      {variant.color?.name}
                      {variant.color?.colors?.length > 0 && (
                        <span className="ml-2 flex gap-1">
                          {variant.color.colors.length === 1 ? (
                            // Màu đơn
                            <span
                              className="inline-block w-6 h-6 rounded-full border"
                              style={{ background: variant.color.colors[0] }}
                              title={variant.color.colors[0]}
                            ></span>
                          ) : variant.color.colors.length === 2 ? (
                            // 2 màu: mỗi nửa hình tròn 1 màu
                            <span
                              className="inline-block w-6 h-6 rounded-full border"
                              style={{
                                background: `linear-gradient(90deg, ${variant.color.colors[0]} 50%, ${variant.color.colors[1]} 50%)`,
                              }}
                              title={variant.color.colors.join(" / ")}
                            ></span>
                          ) : (
                            // Nhiều màu: chia đều các phần
                            <span
                              className="inline-block w-6 h-6 rounded-full border"
                              style={{
                                background: `linear-gradient(90deg, ${variant.color.colors
                                  .map(
                                    (c: string, i: number, arr: string[]) => {
                                      const percent = Math.round(
                                        (100 / arr.length) * (i + 1)
                                      );
                                      return `${c} ${percent}%`;
                                    }
                                  )
                                  .join(", ")})`,
                              }}
                              title={variant.color.colors.join(" / ")}
                            ></span>
                          )}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Giới tính:</span>{" "}
                      {variant.gender}
                    </div>
                    <div>
                      <span className="font-medium">Giá:</span>{" "}
                      <span className="text-blue-600 font-semibold">
                        {variant.price?.toLocaleString()} VND
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Giá bán:</span>{" "}
                      <span className="text-green-600 font-semibold">
                        {variant.priceFinal?.toLocaleString()} VND
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Giảm giá:</span>{" "}
                      {variant.percentDiscount}%
                    </div>
                    <div>
                      <span className="font-medium">Lợi nhuận:</span>{" "}
                      <span className="text-orange-600">
                        {variant.profit?.toLocaleString()} VND
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Trạng thái:</span>{" "}
                      {variant.isActive ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                          Đang bán
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
                          Ẩn
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Ảnh biến thể:</span>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {variant.imagesvariant?.map((img: any) => (
                        <img
                          key={img._id}
                          src={img.url}
                          alt="variant"
                          className="h-14 w-14 object-cover rounded border"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Size & số lượng:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {variant.sizes?.map((sz: any) => (
                        <span
                          key={sz._id}
                          className="inline-block bg-gray-100 px-2 py-1 rounded text-xs border"
                        >
                          {sz.size?.description || sz.size?.value}:{" "}
                          {sz.quantity} đôi
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-6 border-t pt-4 flex flex-wrap gap-6">
          <div>ID: {detail._id}</div>
          <div>Slug: {detail.slug}</div>
          <div>Ngày tạo: {new Date(detail.createdAt).toLocaleString()}</div>
          <div>Cập nhật: {new Date(detail.updatedAt).toLocaleString()}</div>
        </div>

        {/* Modal quản lý ảnh */}
        {showImageManager && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-xl relative">
              <button
                className="absolute top-2 right-2 text-xl font-bold"
                onClick={() => setShowImageManager(false)}
              >
                ×
              </button>
              <ProductImagesManager
                productId={detail._id}
                images={detail.images}
                reloadImages={async () => {
                  const res = await productApi.getDetailById(detail._id);
                  setDetail(res.data.product);
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
