import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import wishlistService, {
  WishlistProduct,
} from "../../services/WishlistService";
import { toast } from "react-hot-toast";

const LikeProduct = () => {
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // Lấy danh sách sản phẩm yêu thích từ API
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const res = await wishlistService.getWishlist();
        if (res.data && res.data.success) {
          setWishlist(res.data.wishlist || []);
        } else {
          setWishlist([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách yêu thích:", error);
        setWishlist([]);
        toast.error("Không thể tải danh sách yêu thích");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  // Hàm xóa sản phẩm khỏi wishlist
  const removeProduct = async (wishlistItemId: string) => {
    if (removingItems.has(wishlistItemId)) return; // Tránh click nhiều lần

    setRemovingItems((prev) => new Set([...prev, wishlistItemId]));
    try {
      const response = await wishlistService.removeFromWishlist(wishlistItemId);
      if (response.data && response.data.success) {
        setWishlist((prev) =>
          prev.filter((item) => item._id !== wishlistItemId)
        );
        toast.success("Đã xóa khỏi danh sách yêu thích");
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

  // Hàm di chuyển đến trang chi tiết sản phẩm
  const navigateToProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {loading ? (
        <div className="py-10 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách yêu thích...</p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="py-10 text-center">
          <div className="text-5xl text-gray-300 mb-4">❤️</div>
          <p className="text-gray-600">Bạn chưa có sản phẩm yêu thích nào.</p>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Khám phá sản phẩm
          </button>
        </div>
      ) : (
        wishlist.map((item) => (
          <div
            key={item._id}
            className="flex items-center bg-white shadow-md rounded-lg p-4 w-[400px] hover:shadow-lg transition-shadow duration-200"
          >
            {/* Ảnh sản phẩm */}
            <div
              className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-md font-bold text-lg overflow-hidden cursor-pointer"
              onClick={() => navigateToProduct(item.product._id)}
            >
              {item.product.images && item.product.images[0]?.url ? (
                <img
                  src={item.product.images[0].url}
                  alt={item.product.name}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>

            {/* Thông tin sản phẩm */}
            <div
              className="flex-1 ml-4 cursor-pointer"
              onClick={() => navigateToProduct(item.product._id)}
            >
              <p className="text-lg font-medium hover:text-blue-600 transition-colors">
                {item.product.name}
              </p>
              {item.variant ? (
                <>
                  <p className="text-red-500 font-semibold">
                    {item.variant.priceFinal?.toLocaleString()}đ
                  </p>
                  {item.variant.percentDiscount > 0 && (
                    <span className="text-xs text-gray-500 line-through">
                      {item.variant.price?.toLocaleString()}đ
                    </span>
                  )}
                </>
              ) : (
                <p className="text-red-500 font-semibold">
                  {item.product.price?.toLocaleString() || "Liên hệ"}đ
                </p>
              )}
            </div>

            {/* Icon thùng rác */}
            <button
              onClick={() => removeProduct(item._id)}
              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Xóa khỏi yêu thích"
              disabled={removingItems.has(item._id)}
            >
              {removingItems.has(item._id) ? (
                <div className="h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FaTrash size={18} />
              )}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default LikeProduct;
