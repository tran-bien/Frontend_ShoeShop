import React, { useState, useEffect } from "react";
import { FiStar, FiPackage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { userRecommendationService } from "../services/RecommendationService";
import { convertToProductCardProduct } from "../services/ProductService";
import ProductCard from "../components/ProductCard/ProductCard";
import type { Recommendation } from "../types/recommendation";
import type { Product } from "../types/product";

const RecommendationsPage: React.FC = () => {
  // Auto scroll to top when page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response =
        await userRecommendationService.getPersonalizedRecommendations({
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
            reason: "Dành riêng cho bạn",
            type: "personalized",
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
            Những sản phẩm được chọn riêng dựa trên sở thích, lịch sử xem và mua
            hàng của bạn
          </p>
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
