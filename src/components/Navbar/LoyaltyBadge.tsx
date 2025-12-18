import { Link } from "react-router-dom";
import { SparklesIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { userLoyaltyService } from "../../services/LoyaltyService";
import type { UserLoyaltyInfo } from "../../types/loyalty";

export const LoyaltyBadge = () => {
  const [loyaltyInfo, setLoyaltyInfo] = useState<UserLoyaltyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoyaltyInfo = async () => {
      try {
        const { data } = await userLoyaltyService.getLoyaltyInfo();
        setLoyaltyInfo(data.data);
      } catch (error) {
        console.error("Failed to fetch loyalty info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyInfo();
  }, []);

  if (loading || !loyaltyInfo) {
    return null;
  }

  // Get tier info - BE may return currentTier, tier, or tierName
  const tier = loyaltyInfo.currentTier || loyaltyInfo.tier;
  const tierName = tier?.name || loyaltyInfo.tierName || "Thành viên";
  const tierMinPoints = tier?.minPoints || 0;

  // Get expiring points - handle both number and object format
  const expiringPointsValue =
    typeof loyaltyInfo.expiringPoints === "object"
      ? loyaltyInfo.expiringPoints?.points
      : loyaltyInfo.expiringPoints;

  // Get next tier min points
  const nextTierMinPoints =
    typeof loyaltyInfo.nextTier === "object" && loyaltyInfo.nextTier
      ? "minPoints" in loyaltyInfo.nextTier
        ? loyaltyInfo.nextTier.minPoints
        : 0
      : 0;

  return (
    <Link
      to="/loyalty/dashboard"
      className="flex items-center gap-2 px-4 py-2 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors group"
    >
      {/* Trophy Icon */}
      <div className="relative">
        <TrophyIcon className="w-5 h-5 text-mono-700 group-hover:text-mono-black transition-colors" />
        {expiringPointsValue && expiringPointsValue > 0 && (
          <SparklesIcon className="w-3 h-3 text-mono-black absolute -top-1 -right-1 animate-pulse" />
        )}
      </div>

      {/* Loyalty Info */}
      <div className="flex flex-col">
        <span className="text-xs font-medium text-mono-900 leading-tight">
          {tierName}
        </span>
        <span className="text-xs text-mono-600 leading-tight">
          {loyaltyInfo.currentPoints.toLocaleString()} điểm
        </span>
      </div>

      {/* Progress to Next Tier */}
      {loyaltyInfo.nextTier &&
        nextTierMinPoints !== undefined &&
        nextTierMinPoints > tierMinPoints && (
          <div className="ml-2 flex flex-col items-end">
            <span className="text-[10px] text-mono-500 leading-tight">
              Còn{" "}
              {loyaltyInfo.pointsToNextTier?.toLocaleString() ||
                (
                  nextTierMinPoints - loyaltyInfo.currentPoints
                ).toLocaleString()}
            </span>
            <div className="w-16 h-1 bg-mono-200 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-mono-black transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    ((loyaltyInfo.currentPoints - tierMinPoints) /
                      (nextTierMinPoints - tierMinPoints)) *
                      100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
    </Link>
  );
};

export default LoyaltyBadge;
