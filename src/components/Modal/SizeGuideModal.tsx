import React, { useEffect, useState } from "react";
import { publicSizeGuideService } from "../../services/SizeGuideService";
import type { SizeGuide } from "../../types/sizeGuide";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
  gender?: string;
}

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  categoryId,
  gender,
}) => {
  const [sizeGuide, setSizeGuide] = useState<SizeGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && categoryId) {
      fetchSizeGuide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, categoryId, gender]);

  const fetchSizeGuide = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await publicSizeGuideService.getSizeGuideByCategory(
        categoryId!,
        gender
      );
      // Handle nested response structure - API may return data.data.sizeGuide or data.data directly
      const responseData = data.data || data;
      const guideData =
        (responseData as { sizeGuide?: SizeGuide }).sizeGuide || responseData;
      setSizeGuide(guideData as SizeGuide);
    } catch (err: unknown) {
      console.error("Failed to fetch size guide:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
          "Không tìm thấy bảng hướng dẫn size cho sản phẩm này"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-luxury max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
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
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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
                    <p>• Đo chiều dài bàn chân từ gót đến ngón cái dài nhất</p>
                    <p>• Nên đo vào buổi chiều khi bàn chân hơi phù</p>
                    <p>• Chọn size lớn hơn 0.5-1cm so với chiều dài bàn chân</p>
                    <p>• Tham khảo bảng size cụ thể của từng thương hiệu</p>
                  </div>
                </div>
              </div>
            ) : sizeGuide ? (
              <div className="space-y-6">
                {/* Title & Description */}
                {sizeGuide.title && (
                  <div>
                    <h3 className="text-xl font-semibold text-mono-black mb-2">
                      {sizeGuide.title}
                    </h3>
                    {sizeGuide.description && (
                      <p className="text-mono-600">{sizeGuide.description}</p>
                    )}
                  </div>
                )}

                {/* Category & Gender Info */}
                <div className="flex gap-3">
                  {sizeGuide.category && (
                    <span className="px-3 py-1 bg-mono-100 text-mono-800 rounded-full text-sm font-medium">
                      {typeof sizeGuide.category === "object"
                        ? (sizeGuide.category as { name: string }).name
                        : sizeGuide.category}
                    </span>
                  )}
                  {sizeGuide.gender && (
                    <span className="px-3 py-1 bg-mono-200 text-mono-900 rounded-full text-sm font-medium">
                      {sizeGuide.gender === "male"
                        ? "Nam"
                        : sizeGuide.gender === "female"
                        ? "Nữ"
                        : "Unisex"}
                    </span>
                  )}
                </div>

                {/* Measurement Instructions */}
                {sizeGuide.measurementInstructions &&
                  sizeGuide.measurementInstructions.length > 0 && (
                    <div className="bg-mono-50 rounded-xl p-6">
                      <h4 className="font-semibold text-mono-black mb-3 flex items-center gap-2">
                        <span className="text-lg">📏</span>
                        Hướng dẫn đo
                      </h4>
                      <ul className="space-y-2">
                        {sizeGuide.measurementInstructions.map(
                          (instruction, index) => (
                            <li
                              key={index}
                              className="text-sm text-mono-700 flex gap-2"
                            >
                              <span className="text-mono-500">•</span>
                              <span>{instruction}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Size Chart Table */}
                {sizeGuide.sizeChart &&
                  Array.isArray(sizeGuide.sizeChart) &&
                  sizeGuide.sizeChart.length > 0 && (
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
                              {sizeGuide.sizeChart[0]?.width && (
                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                  Chiều rộng (cm)
                                </th>
                              )}
                              {sizeGuide.sizeChart[0]?.note && (
                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                  Ghi chú
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-mono-200">
                            {sizeGuide.sizeChart.map((row, index) => (
                              <tr
                                key={index}
                                className="hover:bg-mono-50 transition-colors"
                              >
                                <td className="px-4 py-3 font-medium text-mono-900">
                                  {row.size}
                                </td>
                                <td className="px-4 py-3 text-mono-700">
                                  {row.length}
                                </td>
                                {row.width && (
                                  <td className="px-4 py-3 text-mono-700">
                                    {row.width}
                                  </td>
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
                  )}

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
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-mono-200 bg-mono-50">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-mono-black text-white rounded-lg font-medium hover:bg-mono-900 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SizeGuideModal;
