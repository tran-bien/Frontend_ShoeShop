import { useState, useEffect, useCallback } from "react";
import { adminLoyaltyService } from "../../../services/LoyaltyService";
import type { LoyaltyTier } from "../../../types/loyalty";
import { useAuth } from "../../../hooks/useAuth";
import toast from "react-hot-toast";
import LoyaltyTierFormModal from "../../../components/Admin/LoyaltyTier/LoyaltyTierFormModal";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  SparklesIcon,
  TrophyIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";

const AdminLoyaltyTierPage = () => {
  const { canCreate, canUpdate, canDelete } = useAuth();

  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null);

  // Fetch tiers
  const fetchTiers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminLoyaltyService.getAllTiers();
      // Sort by minPoints ascending
      const sortedTiers = data.data.tiers.sort(
        (a, b) => a.minPoints - b.minPoints
      );
      setTiers(sortedTiers);
    } catch (error) {
      console.error("Failed to fetch loyalty tiers:", error);
      toast.error("Không thể tải danh sách hạng thành viên");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  // Delete tier
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa hạng thành viên này?")) return;

    try {
      await adminLoyaltyService.deleteTier(id);
      toast.success("Đã xóa hạng thành viên");
      fetchTiers();
    } catch (error) {
      console.error("Failed to delete tier:", error);
      toast.error("Không thể xóa hạng thành viên");
    }
  };

  // Get tier color
  const getTierColor = (tier: LoyaltyTier) => {
    const colors = {
      bronze: {
        bg: "bg-mono-100",
        text: "text-mono-700",
        border: "border-mono-300",
        icon: "text-mono-600",
      },
      silver: {
        bg: "bg-mono-100",
        text: "text-mono-700",
        border: "border-mono-300",
        icon: "text-mono-500",
      },
      gold: {
        bg: "bg-mono-100",
        text: "text-mono-800",
        border: "border-mono-200",
        icon: "text-mono-700",
      },
      platinum: {
        bg: "bg-mono-200",
        text: "text-mono-900",
        border: "border-mono-300",
        icon: "text-mono-800",
      },
      diamond: {
        bg: "bg-mono-300",
        text: "text-mono-900",
        border: "border-mono-200",
        icon: "text-mono-800",
      },
    };

    const tierName = tier.name.toLowerCase();
    if (tierName.includes("bronze")) return colors.bronze;
    if (tierName.includes("silver")) return colors.silver;
    if (tierName.includes("gold")) return colors.gold;
    if (tierName.includes("platinum")) return colors.platinum;
    if (tierName.includes("diamond")) return colors.diamond;

    // Default fallback
    return colors.silver;
  };

  // Stats
  const stats = {
    totalTiers: tiers.length,
    activeTiers: tiers.filter((t) => t.isActive).length,
    avgMultiplier:
      tiers.length > 0
        ? (
            tiers.reduce((sum, t) => sum + t.benefits.pointsMultiplier, 0) /
            tiers.length
          ).toFixed(2)
        : "0",
  };

  return (
    <div className="min-h-screen bg-mono-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-mono-black mb-2">
            Quản lý Loyalty Tiers
          </h1>
          <p className="text-mono-600">
            Quản lý các hạng thành viên và quyền lợi của chương trình khách hàng
            thân thiết
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border border-mono-200 rounded-xl p-6 hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-mono-600 uppercase tracking-wider mb-1">
                  Tổng số hạng
                </p>
                <p className="text-3xl font-bold text-mono-black">
                  {stats.totalTiers}
                </p>
              </div>
              <div className="w-12 h-12 bg-mono-100 rounded-xl flex items-center justify-center">
                <TrophyIcon className="w-6 h-6 text-mono-700" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-mono-200 rounded-xl p-6 hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-mono-600 uppercase tracking-wider mb-1">
                  Đang hoạt động
                </p>
                <p className="text-3xl font-bold text-mono-black">
                  {stats.activeTiers}
                </p>
              </div>
              <div className="w-12 h-12 bg-mono-100 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-mono-800" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-mono-200 rounded-xl p-6 hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-mono-600 uppercase tracking-wider mb-1">
                  Trung bình Multiplier
                </p>
                <p className="text-3xl font-bold text-mono-black">
                  x{stats.avgMultiplier}
                </p>
              </div>
              <div className="w-12 h-12 bg-mono-300 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-mono-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mb-6">
          {canCreate() && (
            <button
              onClick={() => {
                setEditingTier(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Tạo hạng mới
            </button>
          )}
        </div>

        {/* Tiers List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-mono-300 border-t-mono-black rounded-full animate-spin" />
          </div>
        ) : tiers.length === 0 ? (
          <div className="bg-white border border-mono-200 rounded-xl p-12 text-center">
            <p className="text-mono-600">Chưa có hạng thành viên nào</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tiers.map((tier, index) => {
              const colorScheme = getTierColor(tier);
              const nextTier = tiers[index + 1];

              return (
                <div
                  key={tier._id}
                  className={`bg-white border-2 ${colorScheme.border} rounded-xl p-6 hover:shadow-medium transition-shadow relative overflow-hidden`}
                >
                  {/* Background decoration */}
                  <div
                    className={`absolute top-0 right-0 w-40 h-40 ${colorScheme.bg} rounded-full -mr-20 -mt-20 opacity-50`}
                  />

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        {/* Tier Icon */}
                        <div
                          className={`w-16 h-16 ${colorScheme.bg} rounded-xl flex items-center justify-center`}
                        >
                          <TrophyIcon
                            className={`w-8 h-8 ${colorScheme.icon}`}
                          />
                        </div>

                        {/* Tier Info */}
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-mono-black">
                              {tier.name}
                            </h3>
                            <span
                              className={`px-3 py-1 text-xs rounded-full ${
                                tier.isActive
                                  ? "bg-mono-200 text-mono-900"
                                  : "bg-mono-100 text-mono-500"
                              }`}
                            >
                              {tier.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-mono-500">Từ:</span>
                              <span className="font-bold text-mono-black">
                                {tier.minPoints.toLocaleString()} điểm
                              </span>
                            </div>
                            {tier.maxPoints && (
                              <>
                                <span className="text-mono-400">→</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-mono-500">Đến:</span>
                                  <span className="font-bold text-mono-black">
                                    {tier.maxPoints.toLocaleString()} điểm
                                  </span>
                                </div>
                              </>
                            )}
                            {nextTier && (
                              <>
                                <ArrowUpIcon className="w-4 h-4 text-mono-400" />
                                <div className="flex items-center gap-2">
                                  <span className="text-mono-500">
                                    Lên {nextTier.name}:
                                  </span>
                                  <span className="font-bold text-mono-black">
                                    {nextTier.minPoints.toLocaleString()} điểm
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {canUpdate() && (
                          <button
                            onClick={() => {
                              setEditingTier(tier);
                              setShowModal(true);
                            }}
                            className="p-2 text-mono-600 hover:text-mono-black hover:bg-mono-100 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        )}
                        {canDelete() && (
                          <button
                            onClick={() => handleDelete(tier._id)}
                            className="p-2 text-mono-700 hover:text-mono-900 hover:bg-mono-100 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Benefits Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Points Multiplier */}
                      <div
                        className={`${colorScheme.bg} border ${colorScheme.border} rounded-lg p-4`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 flex items-center justify-center rounded-lg bg-white border ${colorScheme.border}`}
                          >
                            <svg
                              className={`w-4 h-4 ${colorScheme.icon}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-sm font-semibold ${colorScheme.text} mb-1`}
                            >
                              Hệ số nhân điểm
                            </h4>
                            <p className="text-2xl font-bold text-mono-black">
                              x{tier.benefits.pointsMultiplier}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Priority Support */}
                      <div
                        className={`${colorScheme.bg} border ${colorScheme.border} rounded-lg p-4`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 flex items-center justify-center rounded-lg bg-white border ${colorScheme.border}`}
                          >
                            <SparklesIcon
                              className={`w-4 h-4 ${colorScheme.icon}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-sm font-semibold ${colorScheme.text} mb-1`}
                            >
                              Hỗ trợ ưu tiên
                            </h4>
                            <p
                              className={`text-sm font-medium ${
                                tier.benefits.prioritySupport
                                  ? "text-mono-800"
                                  : "text-mono-400"
                              }`}
                            >
                              {tier.benefits.prioritySupport ? "Có" : "Không"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 bg-gradient-to-r from-mono-100 to-mono-50 border border-mono-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-mono-black rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-mono-black mb-2">
                Lưu ý về Loyalty Tiers
              </h3>
              <ul className="space-y-1 text-sm text-mono-600">
                <li className="flex items-start gap-2">
                  <span className="text-mono-400 mt-0.5">•</span>
                  <span>Các hạng được sắp xếp theo minPoints tăng dần</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mono-400 mt-0.5">•</span>
                  <span>
                    Khách hàng sẽ tự động được nâng hạng khi đạt đủ điểm
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mono-400 mt-0.5">•</span>
                  <span>
                    Points Multiplier giúp tăng tốc độ tích điểm cho hạng cao
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mono-400 mt-0.5">•</span>
                  <span>
                    Hạng Inactive sẽ không hiển thị cho người dùng nhưng vẫn giữ
                    dữ liệu
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <LoyaltyTierFormModal
            tier={editingTier}
            onClose={() => {
              setShowModal(false);
              setEditingTier(null);
            }}
            onSuccess={() => {
              setShowModal(false);
              setEditingTier(null);
              fetchTiers();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminLoyaltyTierPage;






