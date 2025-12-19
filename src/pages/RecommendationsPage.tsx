import React, { useState, useEffect } from "react";
import { FiTrendingUp, FiStar, FiFilter, FiPackage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { publicRecommendationService } from "../services/RecommendationService";
import { convertToProductCardProduct } from "../services/ProductService";
import ProductCard from "../components/ProductCard/ProductCard";
import type {
  Recommendation,
  RecommendationType,
} from "../types/recommendation";
import type { Product } from "../types/product";

const RecommendationsPage: React.FC = () => {
  const [selectedType, setSelectedType] =
    useState<RecommendationType>("personalized");
  // Auto scroll to top when page mounts hoặc selectedType thay đổi
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedType]);
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Handle multiple response formats:
        // Format 1: { data: { recommendations: [...] } }
        // Format 2: { data: { products: [...] } } - convert to Recommendation format
        let recs: Recommendation[] = [];
        const data = response.data.data;

        if (data?.recommendations && data.recommendations.length > 0) {
          recs = data.recommendations;
        } else if (data?.products && data.products.length > 0) {
          // Convert Product[] to Recommendation[]
          recs = data.products.map((product: unknown, index: number) => ({
            product,
            score: 10 - index,
            reason: "Được đề xuất cho bạn",
            type: selectedType,
          })) as Recommendation[];
        }

        setRecommendations(recs);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Không thể tải gợi ý sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: RecommendationType) => {
    const labels: Record<RecommendationType, string> = {
      personalized: "Dành cho bạn",
      trending: "Xu hướng",
      similar: "Tương tự",
      collaborative: "Được đề xuất",
    };
    return labels[type];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải gợi ý...</p>
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
            Gợi Ý Cho Bạn
          </h1>
          <p className="text-gray-600">
            Những sản phẩm được chọn riêng dành cho bạn
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
              Chưa có gợi ý
            </h3>
            <p className="text-gray-500 mb-6">
              Hãy xem thêm sản phẩm để nhận được gợi ý phù hợp
            </p>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendations.map((rec) => {
              const product = rec.product as Product;
              if (!product || !product._id) return null;

              const cardProduct = convertToProductCardProduct(product);
              if (!cardProduct || !cardProduct._id) return null;

              return (
                <div key={product._id} className="relative">
                  {/* Trending Badge */}
                  {selectedType === "trending" && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white text-xs rounded-full">
                        <FiTrendingUp className="w-3 h-3" />
                        Xu hướng
                      </span>
                    </div>
                  )}

                  {/* Recommendation reason badge */}
                  {rec.reason && (
                    <div className="absolute top-2 right-2 z-10">
                      <span
                        className="inline-flex items-center px-2 py-1 bg-white/90 text-gray-700 text-xs rounded-full shadow-sm"
                        title={rec.reason}
                      >
                        {getTypeLabel(rec.type)}
                      </span>
                    </div>
                  )}

                  <ProductCard
                    product={cardProduct}
                    onClick={() => {
                      navigate(`/product/${product.slug || product._id}`);
                      window.scrollTo(0, 0);
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
