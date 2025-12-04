import React, { useState, useEffect } from "react";
import { FiClock, FiEye, FiTrash2, FiShoppingBag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { userViewHistoryService } from "../services/ViewHistoryService";
import type { Product } from "../types/product";
import type { ViewHistory } from "../types/viewHistory";

interface PopulatedViewHistory extends Omit<ViewHistory, "product"> {
  product: Product;
}

const UserViewHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<PopulatedViewHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await userViewHistoryService.getViewHistory({
        page,
        limit: 12,
      });
      if (response.data.success) {
        setHistory(response.data.data.viewHistory as PopulatedViewHistory[]);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching view history:", error);
      toast.error("KhÃ´ng thá»ƒ táº£i lá»‹ch sá»­ xem");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a toÃ n bá»™ lá»‹ch sá»­ xem?")) return;

    try {
      await userViewHistoryService.clearHistory();
      toast.success("ÄÃ£ xÃ³a lá»‹ch sá»­ xem");
      setHistory([]);
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("KhÃ´ng thá»ƒ xÃ³a lá»‹ch sá»­");
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "HÃ´m qua";
    if (diffDays < 7) return `${diffDays} ngÃ y trÆ°á»›c`;
    return d.toLocaleDateString("vi-VN");
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Äang táº£i...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Lá»‹ch Sá»­ Xem</h1>
            <p className="text-gray-600">CÃ¡c sáº£n pháº©m báº¡n Ä‘Ã£ xem gáº§n Ä‘Ã¢y</p>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
              XÃ³a táº¥t cáº£
            </button>
          )}
        </div>

        {/* Empty State */}
        {history.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <FiEye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              ChÆ°a cÃ³ lá»‹ch sá»­ xem
            </h3>
            <p className="text-gray-500 mb-6">
              CÃ¡c sáº£n pháº©m báº¡n xem sáº½ hiá»ƒn thá»‹ á»Ÿ Ä‘Ã¢y
            </p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FiShoppingBag className="w-5 h-5" />
              KhÃ¡m phÃ¡ sáº£n pháº©m
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {history.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/products/${item.product.slug}`)}
                  className="group cursor-pointer bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={item.product.images?.[0]?.url || "/placeholder.jpg"}
                      alt={item.product.name}
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
                      {item.product.name}
                    </h3>

                    {/* Price */}
                    {item.product.priceRange && item.product.priceRange.min && (
                      <p className="text-sm font-semibold text-black mb-2">
                        {item.product.priceRange.min.toLocaleString("vi-VN")}â‚«
                        {item.product.priceRange.max &&
                          item.product.priceRange.min !==
                            item.product.priceRange.max && (
                            <span className="text-gray-500">
                              {" "}
                              -{" "}
                              {item.product.priceRange.max.toLocaleString(
                                "vi-VN"
                              )}
                              â‚«
                            </span>
                          )}
                      </p>
                    )}

                    {/* View Time */}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FiClock className="w-3 h-3" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  TrÆ°á»›c
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
  );
};

export default UserViewHistory;

