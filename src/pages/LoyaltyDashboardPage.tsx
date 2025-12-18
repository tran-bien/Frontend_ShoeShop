import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Award,
  TrendingUp,
  Gift,
  Clock,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Star,
  ArrowUp,
  ArrowDown,
  Crown,
  Ticket,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import { userLoyaltyService } from "../services/LoyaltyService";
import { userCouponService } from "../services/CouponService";
import Sidebar from "../components/User/Sidebar";
import type {
  UserLoyaltyInfo,
  LoyaltyTransaction,
  LoyaltyTier,
} from "../types/loyalty";
import type { Coupon } from "../types/coupon";

const LoyaltyDashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserLoyaltyInfo | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [redeemableCoupons, setRedeemableCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemLoading, setRedeemLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, transRes, tiersRes] = await Promise.all([
        userLoyaltyService.getLoyaltyInfo(),
        userLoyaltyService.getTransactions({ page: 1, limit: 10 }),
        userLoyaltyService.getTiers(),
      ]);

      console.log("Loyalty stats response:", statsRes.data);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (transRes.data.success) {
        setTransactions(transRes.data.data.transactions || []);
        setTotalPages(transRes.data.data.pagination?.totalPages || 1);
      }
      if (tiersRes.data.success) {
        // BE user API trả về { success, data: [...tiers] }
        // data có thể là array trực tiếp hoặc object { tiers: [...] }
        const responseData = tiersRes.data.data;
        const tiersData = Array.isArray(responseData)
          ? responseData
          : tiersRes.data.tiers || responseData?.tiers || [];
        setTiers(tiersData);
      }

      // Fetch redeemable coupons - filter by isRedeemable=true
      try {
        const couponsRes = await userCouponService.getAvailableCoupons({
          limit: 50,
          isRedeemable: true,
        });
        if (couponsRes.data.success) {
          // Response có thể là coupons hoặc data
          const allCoupons =
            couponsRes.data.coupons || couponsRes.data.data || [];
          // Filter thêm để đảm bảo chỉ có coupon có pointCost > 0
          const redeemable = allCoupons.filter(
            (c: Coupon) => (c.pointCost ?? 0) > 0
          );
          setRedeemableCoupons(redeemable);
        }
      } catch (err) {
        console.log("Could not fetch redeemable coupons:", err);
      }
    } catch (error) {
      console.error("Error fetching loyalty data:", error);
      toast.error("Không thể tải thông tin điểm thưởng");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await userLoyaltyService.getTransactions({
        page,
        limit: 10,
      });
      if (response.data.success) {
        setTransactions(response.data.data.transactions || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleRedeemCoupon = async (couponId: string, pointCost: number) => {
    if (!stats || stats.currentPoints < pointCost) {
      toast.error("Không đủ điểm để đổi coupon này");
      return;
    }

    try {
      setRedeemLoading(couponId);
      await userCouponService.collectCoupon(couponId);
      toast.success("Đổi coupon thành công!");
      // Refresh data
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err?.response?.data?.message || "Không thể đổi coupon";
      toast.error(errorMsg);
    } finally {
      setRedeemLoading(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Helper functions
  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      EARN: "Tích điểm",
      REDEEM: "Đổi điểm",
      EXPIRE: "Hết hạn",
      ADJUST: "Điều chỉnh",
    };
    return labels[type] || type;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "EARN":
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case "REDEEM":
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      case "EXPIRE":
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <Gift className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "EARN":
        return "text-green-600";
      case "REDEEM":
      case "EXPIRE":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTransactionPrefix = (type: string) => {
    return type === "EARN" ? "+" : "-";
  };

  // Get current tier from stats (BE returns tier or currentTier)
  const getCurrentTier = (): LoyaltyTier | null => {
    if (!stats) return null;
    return stats.tier || stats.currentTier || null;
  };

  // Get lifetime points (BE returns totalEarned or lifetimePoints)
  const getLifetimePoints = (): number => {
    if (!stats) return 0;
    return stats.totalEarned || stats.lifetimePoints || 0;
  };

  // Get expiring points as number
  const getExpiringPointsValue = (): number => {
    if (!stats || !stats.expiringPoints) return 0;
    if (typeof stats.expiringPoints === "number") {
      return stats.expiringPoints;
    }
    return stats.expiringPoints.points || 0;
  };

  // Calculate progress percentage
  const getProgressPercentage = (): number => {
    if (!stats) return 0;
    const currentTier = getCurrentTier();
    const nextTier = stats.nextTier;

    if (!currentTier || !nextTier) return 100;

    const currentMinPoints =
      currentTier.minPoints || currentTier.minSpending || 0;
    const nextMinPoints =
      typeof nextTier === "object" &&
      ("minPoints" in nextTier || "minSpending" in nextTier)
        ? (nextTier as { minPoints?: number; minSpending?: number })
            .minPoints ||
          (nextTier as { minSpending?: number }).minSpending ||
          0
        : 0;

    if (!nextMinPoints || nextMinPoints <= currentMinPoints) return 100;

    return Math.min(
      ((stats.currentPoints - currentMinPoints) /
        (nextMinPoints - currentMinPoints)) *
        100,
      100
    );
  };

  // Get next tier info
  const getNextTierInfo = () => {
    if (!stats || !stats.nextTier) return null;

    const nextTier = stats.nextTier;
    if (typeof nextTier === "object" && "name" in nextTier) {
      const minPoints =
        (nextTier as { minPoints?: number; minSpending?: number }).minPoints ||
        (nextTier as { minSpending?: number }).minSpending ||
        0;
      return {
        name: nextTier.name,
        minPoints: minPoints,
        pointsNeeded:
          "pointsNeeded" in nextTier
            ? (nextTier as { pointsNeeded: number }).pointsNeeded
            : "spendingNeeded" in nextTier
            ? (nextTier as { spendingNeeded: number }).spendingNeeded
            : minPoints - stats.currentPoints,
      };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400 mx-auto" />
          <p className="mt-4 text-gray-500">
            Đang tải thông tin điểm thưởng...
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
        <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">
          Không thể tải thông tin điểm thưởng
        </p>
        <button
          onClick={fetchData}
          className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const currentTier = getCurrentTier();
  const nextTierInfo = getNextTierInfo();
  const lifetimePoints = getLifetimePoints();
  const expiringPoints = getExpiringPointsValue();
  const progressPercentage = getProgressPercentage();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Award className="w-7 h-7" />
          Điểm Thưởng
        </h1>
        <p className="text-gray-500 mt-1">
          Quản lý điểm thưởng và hạng thành viên của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Current Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black text-white p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Gift className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-70">Điểm hiện tại</span>
          </div>
          <p className="text-4xl font-bold mb-1">
            {stats.currentPoints?.toLocaleString() || 0}
          </p>
          <p className="text-sm opacity-70">điểm</p>
        </motion.div>

        {/* Current Tier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-2 border-gray-200 p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Star className="w-8 h-8 text-gray-700" />
            <span className="text-sm text-gray-500">Hạng hiện tại</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {currentTier?.name || stats.tierName || "Chưa có"}
          </p>
          {currentTier?.displayOrder && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black" />
              <span className="text-sm text-gray-500">
                Cấp độ {currentTier.displayOrder}
              </span>
            </div>
          )}
        </motion.div>

        {/* Lifetime Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-gray-600" />
            <span className="text-sm text-gray-500">Tổng điểm tích lũy</span>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {lifetimePoints.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">điểm</p>
        </motion.div>
      </div>

      {/* Quick Actions - Kho Voucher */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-8"
      >
        <div
          onClick={() => navigate("/my-coupons")}
          className="bg-white text-black p-6 rounded-xl cursor-pointer hover:shadow-lg transition-all group border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Kho Voucher Của Bạn</h3>
                <p className="text-sm text-gray-500">
                  Xem và quản lý các mã giảm giá đã thu thập
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.div>

      {/* Progress to Next Tier */}
      {nextTierInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Tiến trình lên hạng
              </h3>
              <p className="text-sm text-gray-500">
                Còn{" "}
                <span className="font-medium text-black">
                  {nextTierInfo.pointsNeeded?.toLocaleString()}
                </span>{" "}
                điểm để lên{" "}
                <span className="font-medium">{nextTierInfo.name}</span>
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-black rounded-full"
            />
          </div>

          {/* Points Range */}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{currentTier?.minPoints?.toLocaleString() || 0} điểm</span>
            <span>{nextTierInfo.minPoints?.toLocaleString()} điểm</span>
          </div>
        </motion.div>
      )}

      {/* Tier Benefits */}
      {currentTier?.benefits && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8"
        >
          <h3 className="font-semibold text-gray-900 mb-4">
            Quyền lợi của bạn
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-100">
              <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Nhân điểm tích lũy</p>
                <p className="text-sm text-gray-500">
                  x{currentTier.benefits.pointsMultiplier || 1} điểm cho mỗi đơn
                  hàng
                </p>
              </div>
            </div>
            {currentTier.benefits.prioritySupport && (
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-100">
                <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Hỗ trợ ưu tiên</p>
                  <p className="text-sm text-gray-500">
                    Được hỗ trợ nhanh chóng từ đội ngũ CSKH
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Expiring Points Warning */}
      {expiringPoints > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-orange-800">Điểm sắp hết hạn</h3>
          </div>
          <p className="text-orange-700">
            Bạn có{" "}
            <span className="font-bold">{expiringPoints.toLocaleString()}</span>{" "}
            điểm sắp hết hạn trong 30 ngày tới. Hãy sử dụng điểm trước khi hết
            hạn!
          </p>
        </motion.div>
      )}

      {/* All Loyalty Tiers */}
      {tiers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h3 className="font-semibold text-gray-900">Hạng thành viên</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiers
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((tier) => {
                const isCurrentTier = currentTier?._id === tier._id;
                return (
                  <div
                    key={tier._id}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isCurrentTier
                        ? "border-black bg-gray-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {isCurrentTier && (
                      <span className="absolute -top-2 -right-2 bg-black text-white text-xs px-2 py-0.5 rounded-full">
                        Hiện tại
                      </span>
                    )}
                    <h4 className="font-bold text-lg mb-2">{tier.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Chi tiêu từ {tier.minSpending?.toLocaleString("vi-VN")}đ
                      {tier.maxSpending
                        ? ` đến ${tier.maxSpending.toLocaleString("vi-VN")}đ`
                        : "+"}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Gift className="w-4 h-4" />
                        <span>
                          x{tier.benefits?.pointsMultiplier || 1} điểm/đơn hàng
                        </span>
                      </div>
                      {tier.benefits?.prioritySupport && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Star className="w-4 h-4" />
                          <span>Hỗ trợ ưu tiên</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* Redeemable Coupons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.58 }}
        className="bg-white border border-gray-200 rounded-xl p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-gray-900">Đổi điểm lấy Coupon</h3>
          </div>
          <button
            onClick={() => navigate("/my-coupons")}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <Wallet className="w-4 h-4" />
            <span>Xem kho voucher</span>
          </button>
        </div>

        {redeemableCoupons.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">
              Hiện chưa có coupon nào để đổi bằng điểm
            </p>
            <p className="text-sm text-gray-400">
              Vui lòng quay lại sau để kiểm tra các ưu đãi mới
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {redeemableCoupons.map((coupon) => {
              const pointCost = coupon.pointCost ?? 0;
              const canRedeem = stats && stats.currentPoints >= pointCost;

              // Xác định text hiển thị - ẩn số 0
              const hasDescription = !!(
                coupon.description && coupon.description.trim()
              );
              const hasValue =
                typeof coupon.value === "number" && coupon.value > 0;
              const discountText = hasValue
                ? coupon.type === "percent"
                  ? `Giảm ${coupon.value}%`
                  : `Giảm ${coupon.value?.toLocaleString("vi-VN")}đ`
                : null;
              const displayText = hasDescription
                ? coupon.description
                : discountText;

              return (
                <div
                  key={coupon._id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-lg text-gray-900">
                        {coupon.code}
                      </p>
                      {displayText && (
                        <p className="text-sm text-gray-600">{displayText}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-black bg-gray-100 px-2 py-1 rounded">
                      {pointCost.toLocaleString()} điểm
                    </span>
                  </div>
                  {coupon.minOrderValue && (
                    <p className="text-xs text-gray-500 mb-3">
                      Đơn tối thiểu{" "}
                      {coupon.minOrderValue?.toLocaleString("vi-VN")}đ
                    </p>
                  )}
                  <button
                    onClick={() => handleRedeemCoupon(coupon._id, pointCost)}
                    disabled={!canRedeem || redeemLoading === coupon._id}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      canRedeem
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {redeemLoading === coupon._id
                      ? "Đang xử lý..."
                      : canRedeem
                      ? "Đổi ngay"
                      : "Không đủ điểm"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Lịch sử giao dịch</h3>
        </div>

        <AnimatePresence mode="wait">
          {transactions.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 text-center text-gray-500"
            >
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Chưa có giao dịch nào</p>
            </motion.div>
          ) : (
            <motion.div
              key="transactions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="divide-y divide-gray-100">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description ||
                              getTransactionTypeLabel(transaction.type)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-semibold ${getTransactionColor(
                            transaction.type
                          )}`}
                        >
                          {getTransactionPrefix(transaction.type)}
                          {Math.abs(transaction.points).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Số dư:{" "}
                          {transaction.balanceAfter?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-200">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Trước
                  </button>
                  <span className="text-sm text-gray-600">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Wrapper component with Sidebar
const LoyaltyDashboard: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 bg-mono-100">
        <Sidebar />
        <div className="flex-1 p-8">
          <LoyaltyDashboardContent />
        </div>
      </div>
    </div>
  );
};

export default LoyaltyDashboard;
