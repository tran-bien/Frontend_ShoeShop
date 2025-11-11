import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiAward, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";
import { adminLoyaltyService } from "../../../services/LoyaltyService";
import type { LoyaltyTier } from "../../../types/loyalty";

const LoyaltyTiersManagement: React.FC = () => {
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<LoyaltyTier | null>(null);

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      const response = await adminLoyaltyService.getAllTiers();
      if (response.data.success) {
        setTiers(response.data.data.tiers);
      }
    } catch (error) {
      console.error("Error fetching tiers:", error);
      toast.error("Không thể tải danh sách hạng thành viên");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa hạng thành viên này?")) return;

    try {
      await adminLoyaltyService.deleteTier(id);
      toast.success("Xóa hạng thành viên thành công");
      fetchTiers();
    } catch (error) {
      console.error("Error deleting tier:", error);
      toast.error("Không thể xóa hạng thành viên");
    }
  };

  const handleToggleActive = async (tier: LoyaltyTier) => {
    try {
      await adminLoyaltyService.updateTier(tier._id, {
        isActive: !tier.isActive,
      });
      toast.success("Cập nhật trạng thái thành công");
      fetchTiers();
    } catch (error) {
      console.error("Error updating tier:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2 flex items-center gap-2">
          <FiAward className="w-8 h-8" />
          Quản Lý Hạng Thành Viên
        </h1>
        <p className="text-gray-600">
          Cấu hình các hạng và quyền lợi thành viên
        </p>
      </div>

      {/* Create Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => {
            setSelectedTier(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Thêm hạng mới
        </button>
      </div>

      {/* Tiers Grid */}
      {tiers.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <FiAward className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">
            Chưa có hạng thành viên nào
          </p>
          <button
            onClick={() => {
              setSelectedTier(null);
              setShowModal(true);
            }}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Tạo hạng đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier._id}
              className="border-2 rounded-lg overflow-hidden hover:shadow-lg transition-shadow border-gray-200"
            >
              {/* Header */}
              <div className="p-6 bg-gray-900 text-white">
                <div className="flex items-center justify-between mb-4">
                  <FiStar className="w-8 h-8" />
                  <span className="text-sm opacity-80">
                    Thứ tự: {tier.displayOrder}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm opacity-90">{tier.slug}</p>
              </div>

              {/* Content */}
              <div className="p-6 bg-white">
                {/* Points Range */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Khoảng điểm:</p>
                  <p className="font-semibold text-black">
                    {tier.minPoints.toLocaleString()} -{" "}
                    {tier.maxPoints ? tier.maxPoints.toLocaleString() : "∞"}{" "}
                    điểm
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Hệ số tích điểm:
                    </span>
                    <span className="font-medium text-black">
                      x{tier.benefits.pointsMultiplier}
                    </span>
                  </div>
                  {tier.benefits.prioritySupport && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Hỗ trợ ưu tiên
                      </span>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleToggleActive(tier)}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      tier.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tier.isActive ? "Đang hoạt động" : "Không hoạt động"}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedTier(tier);
                    setShowModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors border-r border-gray-200"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span className="text-sm">Sửa</span>
                </button>
                <button
                  onClick={() => handleDelete(tier._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors text-red-600"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span className="text-sm">Xóa</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal - TODO: Implement form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedTier ? "Chỉnh Sửa" : "Thêm"} Hạng Thành Viên
            </h2>
            <p className="text-gray-600 mb-4">
              TODO: Implement form with fields for name, level, points range,
              benefits, color, etc.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTier(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  // TODO: Implement save
                  setShowModal(false);
                  setSelectedTier(null);
                }}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyTiersManagement;
