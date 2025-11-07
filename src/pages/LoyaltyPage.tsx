import { useState, useEffect } from "react";
import { userLoyaltyService } from "../services/LoyaltyService";
import type {
  UserLoyaltyInfo,
  LoyaltyTransaction,
  LoyaltyTier,
} from "../types/loyalty";
import {
  TrophyIcon,
  SparklesIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

const LoyaltyPage = () => {
  const [loyaltyInfo, setLoyaltyInfo] = useState<UserLoyaltyInfo | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [allTiers, setAllTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "tiers">(
    "overview"
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [infoRes, transactionsRes, tiersRes] = await Promise.all([
          userLoyaltyService.getLoyaltyInfo(),
          userLoyaltyService.getTransactions({ limit: 10 }),
          userLoyaltyService.getTiers(),
        ]);

        setLoyaltyInfo(infoRes.data.data);
        setTransactions(transactionsRes.data.data.transactions);
        setAllTiers(tiersRes.data.data.tiers);
      } catch (error) {
        console.error("Failed to fetch loyalty data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-mono-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-mono-300 border-t-mono-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!loyaltyInfo) {
    return (
      <div className="min-h-screen bg-mono-50 flex items-center justify-center">
        <p className="text-mono-600">Không thể tải thông tin điểm thưởng</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mono-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header - Current Tier & Points */}
        <div className="bg-gradient-to-br from-mono-900 to-mono-800 text-white rounded-2xl p-8 mb-6 shadow-luxury">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrophyIcon className="w-8 h-8" />
                <h1 className="text-3xl font-bold">
                  {loyaltyInfo.currentTier.name}
                </h1>
              </div>
              <p className="text-mono-300 text-sm">
                Hạng thành viên hiện tại của bạn
              </p>
            </div>
            <div className="text-right">
              <p className="text-mono-300 text-sm mb-1">Điểm hiện tại</p>
              <p className="text-4xl font-bold">
                {loyaltyInfo.currentPoints.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {loyaltyInfo.nextTier && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm">
                  Tiến độ đến {loyaltyInfo.nextTier.name}
                </p>
                <p className="text-sm font-medium">
                  Còn {loyaltyInfo.pointsToNextTier?.toLocaleString()} điểm
                </p>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{
                    width: `${
                      ((loyaltyInfo.currentPoints -
                        loyaltyInfo.currentTier.minPoints) /
                        ((loyaltyInfo.nextTier.minPoints || 0) -
                          loyaltyInfo.currentTier.minPoints)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Expiring Points Warning */}
          {loyaltyInfo.expiringPoints &&
            loyaltyInfo.expiringPoints.points > 0 && (
              <div className="bg-mono-700/30 border border-mono-600/40 rounded-lg p-3 mt-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-mono-200" />
                <p className="text-sm text-mono-100">
                  <strong>{loyaltyInfo.expiringPoints.points}</strong> điểm sẽ
                  hết hạn vào{" "}
                  {new Date(
                    loyaltyInfo.expiringPoints.expiresAt
                  ).toLocaleDateString("vi-VN")}
                </p>
              </div>
            )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-mono-200">
          {[
            { key: "overview", label: "Tổng quan" },
            { key: "history", label: "Lịch sử" },
            { key: "tiers", label: "Hạng thành viên" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? "text-mono-black"
                  : "text-mono-600 hover:text-mono-black"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mono-black" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Benefits */}
            <div className="bg-white border border-mono-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-mono-black mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                Quyền lợi của bạn
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-mono-700">Điểm tích lũy</span>
                  <span className="text-sm font-medium text-mono-black">
                    x{loyaltyInfo.currentTier.benefits.pointsMultiplier}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-mono-700">Hỗ trợ ưu tiên</span>
                  <span className="text-sm font-medium text-mono-black">
                    {loyaltyInfo.currentTier.benefits.prioritySupport
                      ? "Có"
                      : "Không"}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white border border-mono-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-mono-black mb-4 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5" />
                Thống kê
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-mono-600 mb-1">
                    Tổng điểm tích lũy
                  </p>
                  <p className="text-2xl font-bold text-mono-black">
                    {loyaltyInfo.lifetimePoints.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-mono-600 mb-1">Điểm hiện có</p>
                  <p className="text-2xl font-bold text-mono-black">
                    {loyaltyInfo.currentPoints.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white border border-mono-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-mono-black mb-6">
              Lịch sử giao dịch
            </h2>
            {transactions.length === 0 ? (
              <p className="text-center text-mono-600 py-12">
                Chưa có giao dịch nào
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 bg-mono-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-mono-black mb-1">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-mono-600">
                        {new Date(transaction.createdAt).toLocaleString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          transaction.points > 0
                            ? "text-mono-900"
                            : "text-mono-700"
                        }`}
                      >
                        {transaction.points > 0 ? "+" : ""}
                        {transaction.points.toLocaleString()}
                      </p>
                      <p className="text-xs text-mono-500">
                        Số dư: {transaction.balanceAfter.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "tiers" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTiers.map((tier) => {
              const isCurrent = tier._id === loyaltyInfo.currentTier._id;
              const isNext = tier._id === loyaltyInfo.nextTier?._id;

              return (
                <div
                  key={tier._id}
                  className={`bg-white border-2 rounded-xl p-6 transition-all ${
                    isCurrent
                      ? "border-mono-black shadow-medium"
                      : isNext
                      ? "border-mono-400"
                      : "border-mono-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TrophyIcon
                      className={`w-6 h-6 ${
                        isCurrent ? "text-mono-black" : "text-mono-400"
                      }`}
                    />
                    <h3 className="text-lg font-bold text-mono-black">
                      {tier.name}
                    </h3>
                    {isCurrent && (
                      <span className="ml-auto text-xs font-medium bg-mono-black text-white px-2 py-1 rounded">
                        Hiện tại
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-mono-600 mb-4">Hạng {tier.name}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-mono-600">Điểm tối thiểu</span>
                      <span className="font-medium text-mono-black">
                        {tier.minPoints.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mono-600">Tích điểm</span>
                      <span className="font-medium text-mono-black">
                        x{tier.benefits.pointsMultiplier}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyPage;
