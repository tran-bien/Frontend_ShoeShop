import { useState, useEffect } from "react";
import { adminLoyaltyService } from "../../../services/LoyaltyService";
import type {
  LoyaltyTier,
  CreateLoyaltyTierData,
} from "../../../types/loyalty";
import toast from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface LoyaltyTierFormModalProps {
  tier: LoyaltyTier | null;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<CreateLoyaltyTierData> | null;
}

const LoyaltyTierFormModal: React.FC<LoyaltyTierFormModalProps> = ({
  tier,
  onClose,
  onSuccess,
  initialValues = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateLoyaltyTierData>({
    name: tier?.name ?? initialValues?.name ?? "",
    minSpending: tier?.minSpending ?? initialValues?.minSpending ?? 0,
    maxSpending: tier?.maxSpending ?? initialValues?.maxSpending,
    benefits: {
      pointsMultiplier:
        tier?.benefits?.pointsMultiplier ??
        initialValues?.benefits?.pointsMultiplier ??
        1,
      prioritySupport:
        tier?.benefits?.prioritySupport ??
        initialValues?.benefits?.prioritySupport ??
        false,
    },
    displayOrder: tier?.displayOrder ?? initialValues?.displayOrder ?? 0,
  });

  useEffect(() => {
    // Automatically set minSpending for new tier creation
    // Keep it equal to previous tier's maxSpending (no +1 to avoid step validation error)
    const autoMinSpending =
      !tier && initialValues?.maxSpending !== undefined
        ? initialValues.maxSpending
        : tier?.minSpending ?? initialValues?.minSpending ?? 0;

    setFormData({
      name: tier?.name ?? initialValues?.name ?? "",
      minSpending: autoMinSpending,
      maxSpending: tier?.maxSpending ?? initialValues?.maxSpending,
      benefits: {
        pointsMultiplier:
          tier?.benefits?.pointsMultiplier ??
          initialValues?.benefits?.pointsMultiplier ??
          1,
        prioritySupport:
          tier?.benefits?.prioritySupport ??
          initialValues?.benefits?.prioritySupport ??
          false,
      },
      displayOrder: tier?.displayOrder ?? initialValues?.displayOrder ?? 0,
    });
  }, [tier, initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên hạng");
      return;
    }

    if (formData.minSpending < 0) {
      toast.error("Doanh số tối thiểu không được âm");
      return;
    }

    // Validate maxSpending > minSpending nếu có maxSpending
    if (formData.maxSpending !== undefined && formData.maxSpending !== null) {
      if (formData.maxSpending <= formData.minSpending) {
        toast.error("Doanh số tối đa phải lớn hơn doanh số tối thiểu");
        return;
      }
    }

    if (
      formData.benefits.pointsMultiplier < 1 ||
      formData.benefits.pointsMultiplier > 5
    ) {
      toast.error("Hệ số nhân điểm phải từ 1 đến 5");
      return;
    }

    setLoading(true);
    try {
      if (tier) {
        // Update
        await adminLoyaltyService.updateTier(tier._id, formData);
        toast.success("Cập nhật hạng thành công");
      } else {
        // Create
        await adminLoyaltyService.createTier(formData);
        toast.success("Tạo hạng thành công");
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save tier:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Không thể lưu hạng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-mono-200">
          <h2 className="text-2xl font-bold text-mono-black">
            {tier ? "Cập nhật Hạng" : "Tạo Hạng Mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-mono-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-mono-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-mono-black">
              Thông tin cơ bản
            </h3>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Tên hạng <span className="text-mono-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="VD: Bronze, Silver, Gold..."
                className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
                required
              />
            </div>

            {/* Spending Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">
                  Doanh số tối thiểu (VNĐ){" "}
                  <span className="text-mono-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.minSpending}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minSpending: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="100000"
                  placeholder="VD: 0, 1000000, 5000000..."
                  className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
                  required
                />
                <p className="text-xs text-mono-500 mt-1">
                  Tổng tiền mua hàng tối thiểu trong 12 tháng
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">
                  Doanh số tối đa (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.maxSpending || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxSpending: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  min="0"
                  step="100000"
                  placeholder="Để trống = Không giới hạn"
                  className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
                />
                <p className="text-xs text-mono-500 mt-1">
                  Để trống nếu là hạng cao nhất (không giới hạn)
                </p>
              </div>
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
              />
              <p className="text-xs text-mono-500 mt-1">
                Số nhỏ hơn sẽ hiển thị trước
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-mono-black">Quyền lợi</h3>

            {/* Points Multiplier */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Hệ số nhân điểm (1-5) <span className="text-mono-500">*</span>
              </label>
              <input
                type="number"
                value={formData.benefits.pointsMultiplier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    benefits: {
                      ...formData.benefits,
                      pointsMultiplier: parseFloat(e.target.value) || 1,
                    },
                  })
                }
                min="1"
                max="5"
                step="0.1"
                className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
                required
              />
              <p className="text-xs text-mono-500 mt-1">
                VD: x1.5 nghĩa là mua 100k được 150 điểm
              </p>
            </div>

            {/* Priority Support */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="prioritySupport"
                checked={formData.benefits.prioritySupport}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    benefits: {
                      ...formData.benefits,
                      prioritySupport: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 text-mono-black border-mono-300 rounded focus:ring-mono-black"
              />
              <label
                htmlFor="prioritySupport"
                className="text-sm font-medium text-mono-700 cursor-pointer"
              >
                Hỗ trợ ưu tiên
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-mono-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-mono-700 bg-mono-100 rounded-lg hover:bg-mono-200 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-mono-black rounded-lg hover:bg-mono-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : tier ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoyaltyTierFormModal;
