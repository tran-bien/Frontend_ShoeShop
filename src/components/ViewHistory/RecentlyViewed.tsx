import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userViewHistoryService } from "../../services/ViewHistoryService";
import { convertToProductCardProduct } from "../../services/ProductService";
import ProductCard from "../ProductCard/ProductCard";
import type { ViewHistory } from "../../types/viewHistory";
import type { Product } from "../../types/product";
import { ClockIcon } from "@heroicons/react/24/outline";

interface RecentlyViewedProps {
  limit?: number;
  title?: string;
  excludeProductId?: string; // Exclude current product
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  limit = 8,
  title = "Sản phẩm đã xem gần đây",
  excludeProductId,
}) => {
  const navigate = useNavigate();
  const [viewHistory, setViewHistory] = useState<ViewHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViewHistory = async () => {
      setLoading(true);
      try {
        const { data } = await userViewHistoryService.getViewHistory({
          limit: limit + (excludeProductId ? 1 : 0), // Get extra if excluding
        });

        let history = data?.data?.viewHistory || [];

        // Filter out current product
        if (excludeProductId) {
          history = history.filter((item: ViewHistory) => {
            const productId =
              typeof item.product === "object"
                ? item.product._id
                : item.product;
            return productId !== excludeProductId;
          });
        }

        setViewHistory(history.slice(0, limit));
      } catch (error) {
        console.error("Failed to fetch view history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchViewHistory();
  }, [limit, excludeProductId]);

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-mono-300 border-t-mono-black rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (viewHistory.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-6 h-6 text-mono-700" />
            <h2 className="text-2xl font-bold text-mono-black">{title}</h2>
          </div>
          <span className="text-sm text-mono-600">
            {viewHistory.length} sản phẩm
          </span>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {viewHistory.map((item) => {
            const product = item.product as Product;
            if (!product || typeof product === "string") return null;

            const productCard = convertToProductCardProduct(product);

            return (
              <ProductCard
                key={item._id}
                product={productCard}
                onClick={() =>
                  navigate(`/product/${product.slug || product._id}`)
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
