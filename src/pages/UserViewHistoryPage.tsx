import React, { useState, useEffect } from "react";
import { FiClock, FiEye, FiTrash2, FiShoppingBag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { userViewHistoryService } from "../services/ViewHistoryService";
import Sidebar from "../components/User/Sidebar";
import ProductCard from "../components/ProductCard/ProductCard";
import { convertToProductCardProduct } from "../services/ProductService";
import type { Product } from "../types/product";
import type { ViewHistory } from "../types/viewHistory";

interface PopulatedViewHistory extends Omit<ViewHistory, "product"> {
  product: Product;
}

const UserViewHistoryContent: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<PopulatedViewHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        setHistory(
          (response.data.data.history || []) as PopulatedViewHistory[]
        );
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching view history:", error);
      toast.error("Không thể tải lịch sử xem");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      setDeleting(true);
      await userViewHistoryService.clearHistory();
      toast.success("Đã xóa lịch sử xem");
      setHistory([]);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Không thể xóa lịch sử xem");
    } finally {
      setDeleting(false);
    }
  };

  // FIX: Correct time formatting logic
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return d.toLocaleDateString("vi-VN");
  };

  // Handle product click - navigate to product detail
  const handleProductClick = (item: PopulatedViewHistory) => {
    if (item.product?.slug) {
      navigate(`/product/${item.product.slug}`);
    } else {
      toast.error("Không tìm thấy sản phẩm");
    }
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Lịch Sử Xem
            </h1>
            <p className="text-gray-500">
              Các sản phẩm bạn đã xem gần đây ({history.length} sản phẩm)
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <FiTrash2 className="w-4 h-4" />
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Empty State */}
        {history.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <FiEye className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Chưa có lịch sử xem
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Các sản phẩm bạn xem sẽ được lưu lại ở đây để bạn dễ dàng tìm lại
            </p>
          </div>
        ) : (
          <>
            {/* Products Grid - Using ProductCard component */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {history.map((item) => {
                const cardProduct = convertToProductCardProduct(item.product);
                return (
                  <div key={item._id} className="relative">
                    <ProductCard
                      product={cardProduct}
                      onClick={() => handleProductClick(item)}
                    />
                    {/* Time badge overlay */}
                    <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10 pointer-events-none">
                      <FiClock className="w-3 h-3" />
                      <span>{formatDate(item.lastViewedAt || item.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm font-medium"
                >
                  ← Trước
                </button>

                <span className="text-gray-600 font-medium">
                  Trang {page} / {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm font-medium"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Xóa lịch sử xem
                </h3>
                <p className="text-sm text-gray-500">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem của mình?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleClearHistory}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-4 h-4" />
                    Xóa tất cả
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper component with Sidebar
const UserViewHistory: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 bg-mono-100">
        <Sidebar />
        <div className="flex-1">
          <UserViewHistoryContent />
        </div>
      </div>
    </div>
  );
};

export default UserViewHistory;
