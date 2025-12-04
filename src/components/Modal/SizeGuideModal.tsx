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
        <div className="space-y-4">
          <h4 className="font-semibold text-mono-black flex items-center gap-2">
            <span className="text-lg">📏</span>
            Bảng Size
          </h4>
          {sizeChart.description && (
            <p className="text-sm text-mono-600">{sizeChart.description}</p>
          )}
          <img
            src={sizeChart.image.url}
            alt="Báº£ng size"
            className="w-full rounded-lg border border-mono-200"
          />
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
        <div className="space-y-4">
          <h4 className="font-semibold text-mono-black flex items-center gap-2">
            <span className="text-lg">ðŸ“</span>
            HÆ°á»›ng dáº«n Ä‘o
          </h4>
          {measurementGuide.description && (
            <p className="text-sm text-mono-600">
              {measurementGuide.description}
            </p>
          )}
          <img
            src={measurementGuide.image.url}
            alt="HÆ°á»›ng dáº«n Ä‘o"
            className="w-full rounded-lg border border-mono-200"
          />
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
            HÆ°á»›ng dáº«n Ä‘o
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
        <div className="bg-white rounded-2xl shadow-luxury max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-mono-200">
            <h2 className="text-2xl font-bold text-mono-black">
              HÆ°á»›ng dáº«n chá»n size
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
                    HÆ°á»›ng dáº«n chung:
                  </h4>
                  <div className="text-sm text-mono-600 space-y-2 text-left">
                    <p>â€¢ Äo chiá»u dÃ i bÃ n chÃ¢n tá»« gÃ³t Ä‘áº¿n ngÃ³n cÃ¡i dÃ i nháº¥t</p>
                    <p>â€¢ NÃªn Ä‘o vÃ o buá»•i chiá»u khi bÃ n chÃ¢n hÆ¡i phÃ¹</p>
                    <p>â€¢ Chá»n size lá»›n hÆ¡n 0.5-1cm so vá»›i chiá»u dÃ i bÃ n chÃ¢n</p>
                    <p>â€¢ Tham kháº£o báº£ng size cá»¥ thá»ƒ cá»§a tá»«ng thÆ°Æ¡ng hiá»‡u</p>
                  </div>
                </div>
              </div>
            ) : sizeGuide ? (
              <div className="space-y-6">
                {/* Product Info */}
                {sizeGuide.product && (
                  <div className="pb-4 border-b border-mono-200">
                    <span className="text-sm text-mono-500">Sáº£n pháº©m:</span>
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
                      âš ï¸ LÆ°u Ã½:
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
                        ChÆ°a cÃ³ ná»™i dung hÆ°á»›ng dáº«n size chi tiáº¿t
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
              ÄÃ³ng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SizeGuideModal;
