import React, { useEffect, useState } from "react";
import { publicSizeGuideService } from "../../services/SizeGuideService";
import type { SizeGuide } from "../../types/sizeGuide";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  gender?: string;
}

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  productId,
  gender,
}) => {
  const [sizeGuide, setSizeGuide] = useState<SizeGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && productId) {
      fetchSizeGuide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, productId, gender]);

  const fetchSizeGuide = async () => {
    if (!productId) {
      setError("Không có thông tin sản phẩm");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await publicSizeGuideService.getProductSizeGuide(
        productId
      );

      // Handle response structure from BE: { success: true, sizeGuide: {...} }
      // Type is defined as { success, data } but BE returns { success, sizeGuide }
      const responseAny = data as any;

      if (responseAny.success && responseAny.sizeGuide) {
        setSizeGuide(responseAny.sizeGuide as SizeGuide);
      } else if (responseAny.sizeGuide === null) {
        // BE returns null when product has no size guide
        setError("Sản phẩm chưa có hướng dẫn size");
      } else if (responseAny.data) {
        // Fallback to standard response format
        setSizeGuide(responseAny.data as SizeGuide);
      } else {
        setError("Không tìm thấy hướng dẫn size");
      }
    } catch (err: unknown) {
      console.error("Failed to fetch size guide:", err);
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(
        apiError.response?.data?.message ||
          "Không tìm thấy bảng hướng dẫn size cho sản phẩm này"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Render size chart image or table
  const renderSizeChart = () => {
    if (!sizeGuide) return null;

    // BE structure: sizeGuide.sizeChart = { description: string, image: { url, public_id } }
    const sizeChart = sizeGuide.sizeChart as any;

    if (sizeChart?.image?.url) {
      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold text-mono-black flex items-center gap-2">
              <span className="text-2xl">📏</span>
              Bảng Size
            </h4>
            <button
              onClick={() => setFullscreenImage(sizeChart.image.url)}
              className="text-xs px-3 py-1.5 bg-mono-100 hover:bg-mono-200 text-mono-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
              Xem chi tiết
            </button>
          </div>
          {sizeChart.description && (
            <p className="text-sm text-mono-600 leading-relaxed bg-mono-50 p-4 rounded-lg">
              {sizeChart.description}
            </p>
          )}
          <div
            className="relative group cursor-pointer"
            onClick={() => setFullscreenImage(sizeChart.image.url)}
          >
            {/* chỉnh chiều rộng ảnh */}
            <img
              src={sizeChart.image.url}
              alt="Bảng size"
              className="max-h-[20rem] w-full rounded-xl border-2 border-mono-200 shadow-lg object-contain hover:border-mono-400 transition-all duration-300 hover:shadow-xl"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white px-4 py-2 rounded-lg shadow-lg">
                <span className="text-sm font-medium text-mono-900">
                  Click để phóng to
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fallback to array-based sizeChart (if exists)
    if (Array.isArray(sizeChart) && sizeChart.length > 0) {
      return (
        <div className="border border-mono-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-mono-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Chiều dài (cm)
                  </th>
                  {sizeChart[0]?.width && (
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Chiều rộng (cm)
                    </th>
                  )}
                  {sizeChart[0]?.note && (
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Ghi chú
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-mono-200">
                {sizeChart.map((row: any, index: number) => (
                  <tr
                    key={index}
                    className="hover:bg-mono-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-mono-900">
                      {row.size}
                    </td>
                    <td className="px-4 py-3 text-mono-700">{row.length}</td>
                    {row.width && (
                      <td className="px-4 py-3 text-mono-700">{row.width}</td>
                    )}
                    {row.note && (
                      <td className="px-4 py-3 text-mono-600 text-sm">
                        {row.note}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return null;
  };

  // Render measurement guide
  const renderMeasurementGuide = () => {
    if (!sizeGuide) return null;

    // BE structure: sizeGuide.measurementGuide = { description: string, image: { url, public_id } }
    const measurementGuide = sizeGuide.measurementGuide as any;

    if (measurementGuide?.image?.url) {
      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold text-mono-black flex items-center gap-2">
              <span className="text-2xl">📐</span>
              Hướng dẫn đo
            </h4>
            <button
              onClick={() => setFullscreenImage(measurementGuide.image.url)}
              className="text-xs px-3 py-1.5 bg-mono-100 hover:bg-mono-200 text-mono-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
              Xem chi tiết
            </button>
          </div>
          {measurementGuide.description && (
            <p className="text-sm text-mono-600 leading-relaxed bg-mono-50 p-4 rounded-lg">
              {measurementGuide.description}
            </p>
          )}
          <div
            className="relative group cursor-pointer"
            onClick={() => setFullscreenImage(measurementGuide.image.url)}
          >
            <img
              src={measurementGuide.image.url}
              alt="Hướng dẫn đo"
              className="max-h-[30rem] w-full rounded-xl border-2 border-mono-200 shadow-lg object-contain hover:border-mono-400 transition-all duration-300 hover:shadow-xl"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white px-4 py-2 rounded-lg shadow-lg">
                <span className="text-sm font-medium text-mono-900">
                  Click để phóng to
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fallback to measurementInstructions array
    const instructions = sizeGuide.measurementInstructions;
    if (
      instructions &&
      Array.isArray(instructions) &&
      instructions.length > 0
    ) {
      return (
        <div className="bg-mono-50 rounded-xl p-6">
          <h4 className="font-semibold text-mono-black mb-3 flex items-center gap-2">
            <span className="text-lg">ðŸ“</span>
            Hướng dẫn đo
          </h4>
          <ul className="space-y-2">
            {instructions.map((instruction, index) => (
              <li key={index} className="text-sm text-mono-700 flex gap-2">
                <span className="text-mono-500">â€¢</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-luxury max-w-6xl w-full max-h-[95vh] overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-mono-200">
            <h2 className="text-2xl font-bold text-mono-black">
              Hướng dẫn chọn size
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-mono-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-mono-700" />
            </button>
          </div>

          {/* Content */}
          <div className="px-8 py-8 overflow-y-auto max-h-[calc(95vh-80px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 border-2 border-mono-300 border-t-mono-black rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-mono-600 mb-4">{error}</p>
                <div className="bg-mono-50 rounded-xl p-6 max-w-md mx-auto">
                  <h4 className="font-medium mb-3 text-mono-black">
                    Hướng dẫn chung:
                  </h4>
                  <div className="text-sm text-mono-600 space-y-2 text-left">
                    <p>- Đo chiều dài bàn chân từ gót đến ngón cái dài nhất</p>
                    <p>- Nên đo vào buổi chiều khi bàn chân hơi phù</p>
                    <p>- Chọn size lớn hơn 0.5-1cm so với chiều dài bàn chân</p>
                    <p>- Tham khảo bảng size cụ thể của từng thương hiệu</p>
                  </div>
                </div>
              </div>
            ) : sizeGuide ? (
              <div className="space-y-8">
                {/* Product Info */}
                {sizeGuide.product && (
                  <div className="pb-4 border-b border-mono-200">
                    <span className="text-sm text-mono-500">Sản phẩm:</span>
                    <h3 className="text-lg font-semibold text-mono-900">
                      {typeof sizeGuide.product === "object"
                        ? (sizeGuide.product as any).name
                        : sizeGuide.product}
                    </h3>
                  </div>
                )}

                {/* Size Chart */}
                {renderSizeChart()}

                {/* Measurement Guide */}
                {renderMeasurementGuide()}

                {/* Additional Notes */}
                {sizeGuide.notes && (
                  <div className="bg-mono-50 rounded-xl p-6 border-l-4 border-mono-black">
                    <h4 className="font-semibold text-mono-black mb-2">
                      ⚠️ Lưu ý:
                    </h4>
                    <p className="text-sm text-mono-700 whitespace-pre-line">
                      {sizeGuide.notes}
                    </p>
                  </div>
                )}

                {/* No content fallback */}
                {!renderSizeChart() &&
                  !renderMeasurementGuide() &&
                  !sizeGuide.notes && (
                    <div className="text-center py-8">
                      <p className="text-mono-500">
                        Chưa có nội dung hướng dẫn size chi tiết
                      </p>
                    </div>
                  )}
              </div>
            ) : null}
          </div>

          {/* Footer đã bỏ nút đóng */}
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-[60] bg-black bg-opacity-95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 p-3 bg-white rounded-full hover:bg-mono-100 transition-colors z-10"
          >
            <XMarkIcon className="w-6 h-6 text-mono-900" />
          </button>
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={fullscreenImage}
              alt="Chi tiết ảnh"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg">
            <p className="text-sm text-mono-700">Click vào nền để đóng</p>
          </div>
        </div>
      )}
    </>
  );
};

export default SizeGuideModal;
