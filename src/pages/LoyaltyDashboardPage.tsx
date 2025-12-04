import React, { useState, useEffect } from "react";
import {
  FiAward,
  FiTrendingUp,
  FiGift,
  FiClock,
  FiChevronRight,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { userLoyaltyService } from "../services/LoyaltyService";
import type { UserLoyaltyInfo, LoyaltyTransaction } from "../types/loyalty";

const LoyaltyDashboard: React.FC = () => {
  const [stats, setStats] = useState<UserLoyaltyInfo | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, transRes] = await Promise.all([
        userLoyaltyService.getLoyaltyInfo(),
        userLoyaltyService.getTransactions({ page: 1, limit: 10 }),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (transRes.data.success) {
        setTransactions(transRes.data.data.transactions);
        setTotalPages(transRes.data.data.pagination.totalPages);
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
        setTransactions(response.data.data.transactions);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const getTransactionColor = (type: string) => {
    return type === "earn" ? "text-mono-600" : "text-mono-700";
  };

  const getTransactionPrefix = (type: string) => {
    return type === "earn" ? "+" : "-";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Không thể tải thông tin</p>
      </div>
    );
  }

  const progressPercentage = stats.nextTier
    ? ((stats.currentPoints - stats.currentTier.minPoints) /
        (stats.nextTier.minPoints - stats.currentTier.minPoints)) *
      100
    : 100;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2 flex items-center gap-2">
            <FiAward className="w-8 h-8" />
            Điểm Thưởng
          </h1>
          <p className="text-gray-600">
            Quản lý điểm thưởng và hạng thành viên
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Points */}
          <div className="bg-gradient-to-br from-black to-gray-800 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <FiGift className="w-8 h-8" />
              <span className="text-sm opacity-80">Điểm hiện tại</span>
            </div>
            <p className="text-4xl font-bold mb-2">
              {stats.currentPoints.toLocaleString()}
            </p>
            <p className="text-sm opacity-80">điểm</p>
          </div>

          {/* Current Tier */}
          <div className="p-6 rounded-lg border-2 border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <FiAward className="w-8 h-8" />
              <span className="text-sm text-gray-600">Hạng hiện tại</span>
            </div>
            <p className="text-2xl font-bold mb-2">{stats.currentTier.name}</p>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-900" />
              <span className="text-sm text-gray-600">
                Thứ tự: {stats.currentTier.displayOrder}
              </span>
            </div>
          </div>

          {/* Lifetime Points */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <FiTrendingUp className="w-8 h-8 text-gray-700" />
              <span className="text-sm text-gray-600">Tổng điểm tích lũy</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">
              {stats.lifetimePoints.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">điểm</p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {stats.nextTier && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-black mb-1">
                  Tiến trình lên hạng
                </h3>
                <p className="text-sm text-gray-600">
                  Còn {stats.pointsToNextTier?.toLocaleString()} điểm để lên{" "}
                  {stats.nextTier.name}
                </p>
              </div>
              <FiChevronRight className="w-6 h-6 text-gray-400" />
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-black transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>

            {/* Points Range */}
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>{stats.currentTier.minPoints.toLocaleString()} điểm</span>
              <span>{stats.nextTier.minPoints.toLocaleString()} điểm</span>
            </div>
          </div>
        )}

        {/* Tier Benefits */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-black mb-4">Quyền lợi của bạn</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center flex-shrink-0">
                <FiGift className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-black">Tích điểm</p>
                <p className="text-sm text-gray-600">
                  x{stats.currentTier.benefits.pointsMultiplier} điểm cho mỗi
                  đơn hàng
                </p>
              </div>
            </div>
            {stats.currentTier.benefits.prioritySupport && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiGift className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-black">Hỗ trợ ưu tiên</p>
                  <p className="text-sm text-gray-600">
                    Được hỗ trợ nhanh chóng
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expiring Points */}
        {stats.expiringPoints && (
          <div className="bg-mono-100 border border-mono-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FiClock className="w-5 h-5 text-mono-700" />
              <h3 className="font-semibold text-black">Điểm sắp hết hạn</h3>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">
                {stats.expiringPoints.points.toLocaleString()} điểm
              </span>
              <span className="text-sm text-gray-600">
                Hết hạn:{" "}
                {new Date(stats.expiringPoints.expiresAt).toLocaleDateString(
                  "vi-VN"
                )}
              </span>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-black">Lịch sử giao dịch</h3>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Chưa có giao dịch nào
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <div key={transaction._id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-black mb-1">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.createdAt).toLocaleString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p
                          className={`text-lg font-semibold ${getTransactionColor(
                            transaction.type
                          )}`}
                        >
                          {getTransactionPrefix(transaction.type)}
                          {transaction.points.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Còn: {transaction.balanceAfter.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>

                  <span className="text-gray-600">
                    Trang {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyDashboard;



