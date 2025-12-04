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

  return (
    <Link
      to="/loyalty"
      className="flex items-center gap-2 px-4 py-2 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors group"
    >
      {/* Trophy Icon */}
      <div className="relative">
        <TrophyIcon className="w-5 h-5 text-mono-700 group-hover:text-mono-black transition-colors" />
        {loyaltyInfo.expiringPoints &&
          loyaltyInfo.expiringPoints.points > 0 && (
            <SparklesIcon className="w-3 h-3 text-mono-black absolute -top-1 -right-1 animate-pulse" />
          )}
      </div>

      {/* Loyalty Info */}
      <div className="flex flex-col">
        <span className="text-xs font-medium text-mono-900 leading-tight">
          {loyaltyInfo.currentTier.name}
        </span>
        <span className="text-xs text-mono-600 leading-tight">
          {loyaltyInfo.currentPoints.toLocaleString()} điểm
        </span>
      </div>

      {/* Progress to Next Tier */}
      {loyaltyInfo.nextTier && (
        <div className="ml-2 flex flex-col items-end">
          <span className="text-[10px] text-mono-500 leading-tight">
            Còn {loyaltyInfo.pointsToNextTier?.toLocaleString()}
          </span>
          <div className="w-16 h-1 bg-mono-200 rounded-full overflow-hidden mt-0.5">
            <div
              className="h-full bg-mono-black transition-all duration-300"
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
    </Link>
  );
};

export default LoyaltyBadge;

