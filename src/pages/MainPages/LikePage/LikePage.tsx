import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaHeart, FaTrash } from "react-icons/fa";
import wishlistService from "../../../services/WishlistService";
import ProductCard from "../../../components/ProductCard/ProductCard";
import { convertToProductCardProduct } from "../../../services/ProductService";
import { useAuth } from "../../../hooks/useAuth";
import Sidebar from "../../../components/User/Sidebar";

const LikePage: React.FC = () => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchWishlist();
  }, [isAuthenticated, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();

      if (response.data && response.data.success) {
        setWishlist(response.data.wishlist || []);
      } else {
        toast.error("Không thể tại danh sách yêu thích");
      }
    } catch (error) {
      console.error("Lỗi khi tại wishlist:", error);
      toast.error("Không thể tại danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (wishlistItemId: string) => {
    try {
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.add(wishlistItemId);
        return newSet;
      });

      const response = await wishlistService.removeFromWishlist(wishlistItemId);

      if (response.data && response.data.success) {
        setWishlist((prev) =>
          prev.filter((item) => item._id !== wishlistItemId)
        );
        toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích");
      } else {
        toast.error("Xóa sản phẩm yêu thích thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa khỏi wishlist:", error);
      toast.error("Xóa sản phẩm yêu thích thất bại!");
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(wishlistItemId);
        return newSet;
      });
    }
  };

  // Chuyển đổi dữ liệu wishlist item thành ProductCardProduct
  const convertWishlistToProductCard = (wishlistItem: any) => {
    const baseProduct = wishlistItem.product;

    // Sử dụng hàm convertToProductCardProduct và ghi đè một số giá trị
    const productCardData = convertToProductCardProduct({
      ...baseProduct,
      price: wishlistItem.variant?.priceFinal || baseProduct.price || 0,
      originalPrice:
        wishlistItem.variant?.price || baseProduct.originalPrice || 0,
      hasDiscount: wishlistItem.variant?.percentDiscount > 0,
      discountPercent: wishlistItem.variant?.percentDiscount || 0,
      salePercentage: wishlistItem.variant?.percentDiscount || 0,
    });

    return productCardData;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mono-black"></div>
        </div>
      );
    }

    if (wishlist.length === 0) {
      return (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <div className="text-6xl text-mono-300 mb-4 flex justify-center">
            <FaHeart />
          </div>
          <h2 className="text-2xl font-semibold text-mono-700 mb-3">
            Danh sách yêu thích trống
          </h2>
          <p className="text-mono-500 mb-6">
            Bạn chưa thêm sản phẩm nào vào danh sách yêu thích
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-mono-black text-white rounded-lg hover:bg-mono-800 transition-colors"
          >
            Khám phá sản phẩm ngay
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div key={item._id} className="relative">
            {/* ProductCard */}
            <ProductCard
              product={convertWishlistToProductCard(item)}
              onClick={() =>
                navigate(`/product/${item.product.slug || item.product._id}`)
              }
            />

            {/* Nút xóa - Đặt ở góc dưới bên phải và làm to hơn */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeProduct(item._id);
              }}
              disabled={removingItems.has(item._id)}
              className="absolute bottom-2 right-2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-mono-200 transition-colors"
              title="Xóa khỏi yêu thích"
            >
              {removingItems.has(item._id) ? (
                <div className="h-6 w-6 border-2 border-mono-800 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FaTrash className="text-mono-800" size={20} />
              )}
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-mono-100">
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <FaHeart className="text-mono-800" />
            <span>Sản phẩm yêu thích</span>
          </h1>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default LikePage;
