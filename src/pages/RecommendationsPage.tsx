import React, { useState, useEffect } from "react";
import { FiTrendingUp, FiStar, FiFilter, FiPackage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { publicRecommendationService } from "../services/RecommendationService";
import type {
  Recommendation,
  RecommendationType,
} from "../types/recommendation";

const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] =
    useState<RecommendationType>("personalized");

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await publicRecommendationService.getRecommendations({
        type: selectedType,
        limit: 24,
      });
      if (response.data.success) {
        setRecommendations(response.data.data.recommendations || []);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("KhÃ´ng thá»ƒ táº£i gá»£i Ã½ sáº£n pháº©m");
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: RecommendationType) => {
    const labels: Record<RecommendationType, string> = {
      personalized: "DÃ nh cho báº¡n",
      trending: "Xu hÆ°á»›ng",
      similar: "TÆ°Æ¡ng tá»±",
      collaborative: "ÄÆ°á»£c Ä‘á» xuáº¥t",
    };
    return labels[type];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Äang táº£i gá»£i Ã½...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2 flex items-center gap-2">
            <FiStar className="w-8 h-8" />
            Gá»£i Ã Cho Báº¡n
          </h1>
          <p className="text-gray-600">
            Nhá»¯ng sáº£n pháº©m Ä‘Æ°á»£c chá»n riÃªng dÃ nh cho báº¡n
          </p>
        </div>

        {/* Type Filter */}
        <div className="mb-6 flex items-center gap-4 overflow-x-auto pb-2">
          <FiFilter className="text-gray-600 flex-shrink-0" />
          <div className="flex gap-2">
            {(
              [
                "personalized",
                "trending",
                "similar",
                "collaborative",
              ] as RecommendationType[]
            ).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedType === type
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {recommendations.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              ChÆ°a cÃ³ gá»£i Ã½
            </h3>
            <p className="text-gray-500 mb-6">
              HÃ£y xem thÃªm sáº£n pháº©m Ä‘á»ƒ nháº­n Ä‘Æ°á»£c gá»£i Ã½ phÃ¹ há»£p
            </p>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              KhÃ¡m phÃ¡ sáº£n pháº©m
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.product._id}
                onClick={() => navigate(`/products/${rec.product.slug}`)}
                className="group cursor-pointer bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={rec.product.images?.[0]?.url || "/placeholder.jpg"}
                    alt={rec.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.jpg";
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="text-sm font-medium text-black line-clamp-2 mb-2">
                    {rec.product.name}
                  </h3>

                  {/* Price */}
                  {rec.product.priceRange && (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-black">
                        {rec.product.priceRange.min?.toLocaleString("vi-VN")}â‚«
                      </p>
                    </div>
                  )}

                  {/* Rating */}
                  {rec.product.rating && rec.product.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <FiStar className="w-3 h-3 text-mono-600 fill-current" />
                      <span className="text-xs text-gray-600">
                        {typeof rec.product.rating === "number"
                          ? rec.product.rating.toFixed(1)
                          : "0.0"}{" "}
                        ({rec.product.reviewCount || 0})
                      </span>
                    </div>
                  )}

                  {/* Recommendation Info */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p
                      className="text-xs text-gray-500 line-clamp-1"
                      title={rec.reason}
                    >
                      {rec.reason}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">
                        {(rec.score * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs font-medium text-black">
                        {getTypeLabel(rec.type)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trending Badge */}
                {selectedType === "trending" && (
                  <div className="px-3 pb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white text-xs rounded-full">
                      <FiTrendingUp className="w-3 h-3" />
                      Xu hÆ°á»›ng
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;


