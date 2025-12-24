import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  publicCouponService,
  userCouponService,
} from "../../../services/CouponService";
import { Coupon } from "../../../types/coupon";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import {
  FiPercent,
  FiDollarSign,
  FiTag,
  FiCopy,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiLoader,
  FiShoppingCart,
  FiGift,
} from "react-icons/fi";

const CouponsPage: React.FC = () => {
  const navigate = useNavigate(); // We'll use this for returning to home page
  const { isAuthenticated } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<"all" | "percent" | "fixed">(
    "all"
  );
  const [collectingId, setCollectingId] = useState<string | null>(null);
  const limit = 12; // Số lượng coupon mới trang

  // Auto scroll to top on mount and when filter/page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchCoupons();
  }, [currentPage, filterType]);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);

    try {
      // Chuẩn bỏ params cho API call
      const params = {
        page: currentPage,
        limit,
        status: "active" as "active", // Fixed type by explicitly casting to the expected enum value
        ...(filterType !== "all" && { type: filterType }),
      };

      const response = await publicCouponService.getPublicCoupons(params);

      if (response.data.success) {
        setCoupons(response.data.coupons || []);

        // Cập nhật thông tin phân trang
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
        }
      } else {
        setError("Không thể tải danh sách mã giảm giá");
        toast.error("Không thể tải danh sách mã giảm giá");
      }
    } catch (error: any) {
      console.error("Error fetching coupons:", error);
      setError("Có lỗi xảy ra khi tải dữ liệu mã giảm giá");
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  // Copy coupon code to clipboard
  const copyCouponCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Đã sao chép mã: ${code}`);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Không thể sao chép mã giảm giá");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  // Handle collect coupon
  const handleCollectCoupon = async (couponId: string) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thu thập mã giảm giá");
      navigate("/login");
      return;
    }

    try {
      setCollectingId(couponId);
      await userCouponService.collectCoupon(couponId);
      toast.success("Đã thu thập mã giảm giá thành công!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message;
      // Only show toast once - component handles error display
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Không thể thu thập mã giảm giá");
      }
    } finally {
      setCollectingId(null);
    }
  };

  // Lọc coupon theo searchTerm và loại
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === "percent") {
      return matchesSearch && coupon.type === "percent";
    }
    if (filterType === "fixed") {
      return matchesSearch && coupon.type === "fixed";
    }
    return matchesSearch;
  });

  // Component hiển thị mã giảm giá
  const CouponCard = ({ coupon }: { coupon: Coupon }) => (
    <div className="bg-white border-2 border-mono-200 rounded-lg p-4 hover:border-mono-800 hover:shadow-md transition-all duration-300 relative overflow-hidden">
      {/* Badge góc trên bên phải */}
      <div className="absolute top-0 right-0 bg-mono-800 text-white text-xs px-2 py-1">
        {coupon.type === "percent" ? "GIẢM %" : "GIẢM TIỀN"}
      </div>

      <div className="flex flex-col h-full">
        {/* Giá trị giảm giá */}
        <div className="mb-3">
          <div className="text-2xl font-bold text-mono-900 flex items-center">
            {coupon.type === "percent" ? (
              <>
                <FiPercent className="mr-1 text-mono-black" />
                <span>{coupon.value}%</span>
              </>
            ) : (
              <>
                <FiDollarSign className="mr-1 text-mono-800" />
                <span>{formatCurrency(coupon.value)}</span>
              </>
            )}
          </div>
          {coupon.maxDiscount && coupon.type === "percent" && (
            <div className="text-sm text-mono-600 mt-1">
              Tối đa {formatCurrency(coupon.maxDiscount)}
            </div>
          )}
        </div>

        {/* Mô tả */}
        <div className="mb-3 flex-grow">
          <p className="text-sm text-mono-700 line-clamp-2 leading-relaxed">
            {coupon.description}
          </p>
          <p className="text-xs text-mono-500 mt-2 flex items-center">
            <FiTag className="mr-1" />
            Đơn tối thiểu {formatCurrency(coupon.minOrderValue)}
          </p>
        </div>

        {/* Ngày hết hạn */}
        <div className="mt-auto">
          <div className="flex items-center space-x-1 text-sm text-mono-600 mb-3">
            <FiCalendar size={14} />
            <span>HSD: {formatDate(coupon.endDate)}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {/* Copy button */}
            <button
              onClick={() => copyCouponCode(coupon.code)}
              className="flex-1 flex items-center justify-center space-x-2 bg-mono-black hover:bg-mono-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <span className="font-mono truncate">{coupon.code}</span>
              <FiCopy size={14} className="flex-shrink-0" />
            </button>

            {/* Collect button */}
            <button
              onClick={() => handleCollectCoupon(coupon._id)}
              disabled={collectingId === coupon._id}
              className="flex items-center justify-center bg-mono-100 hover:bg-mono-200 text-mono-800 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Thu thập mã giảm giá"
            >
              {collectingId === coupon._id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mono-800" />
              ) : (
                <FiGift size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mono-50 py-10">
      <div className="container mx-auto px-4">
        {/* Tiêu đề trang và nút quay về trang chủ */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-mono-900 mb-3">Mã giảm giá</h1>
          <p className="text-mono-600 max-w-2xl mx-auto">
            Khám phá các mã giảm giá hấp dẫn và áp dụng cho đơn hàng của bạn để
            nhận ưu đãi tốt nhất
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-mono-black hover:text-mono-800 flex items-center mx-auto"
          >
            <span>&larr; Quay về trang chủ</span>
          </button>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Thanh tìm kiếm */}
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Tìm mã giảm giá..."
                className="pl-10 pr-4 py-2 border border-mono-300 rounded-lg w-full focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mono-400" />
            </div>

            {/* Bộ lọc */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <FiFilter className="text-mono-600" />
              <span className="text-mono-600">Loại:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filterType === "all"
                      ? "bg-mono-800 text-white"
                      : "bg-mono-100 text-mono-600 hover:bg-mono-200"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterType("percent")}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filterType === "percent"
                      ? "bg-mono-black text-white"
                      : "bg-mono-100 text-mono-600 hover:bg-mono-200"
                  }`}
                >
                  Giảm %
                </button>
                <button
                  onClick={() => setFilterType("fixed")}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filterType === "fixed"
                      ? "bg-mono-800 text-white"
                      : "bg-mono-100 text-mono-600 hover:bg-mono-200"
                  }`}
                >
                  Giảm tiền
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách mã giảm giá */}
        {loading ? (
          <div className="flex items-center justify-center h-60">
            <FiLoader className="animate-spin text-3xl text-mono-black" />
            <span className="ml-2 text-lg">Đang tải mã giảm giá...</span>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <div className="text-mono-900 text-lg mb-2">{error}</div>
            <button
              onClick={fetchCoupons}
              className="px-4 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-10 bg-mono-100 rounded-lg">
            <FiTag className="mx-auto text-5xl text-mono-400 mb-3" />
            <p className="text-mono-600 text-lg">
              {searchTerm
                ? "Không tìm thấy mã giảm giá phù hợp"
                : "Hiện không có mã giảm giá nào"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCoupons.map((coupon) => (
                <CouponCard key={coupon._id} coupon={coupon} />
              ))}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-md border border-mono-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-mono-100"
                  >
                    Trước
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-md ${
                          currentPage === page
                            ? "bg-mono-black text-white"
                            : "border border-mono-300 hover:bg-mono-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-md border border-mono-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-mono-100"
                  >
                    Tiếp
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Hướng dẫn sử dụng - Simplify this section */}
        <div className="mt-16 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-mono-900 mb-4">
            Hướng dẫn sử dụng mã giảm giá
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-4">
              <div className="bg-mono-100 text-mono-black p-3 rounded-full">
                <FiCopy className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-mono-900 mb-2">
                  Sao chép mã
                </h3>
                <p className="text-sm text-mono-600">
                  Nhấn vào nút dưới mỗi mã giảm giá để sao chép mã vào bộ nhớ
                  tạm
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-mono-100 text-mono-black p-3 rounded-full">
                <FiShoppingCart className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-mono-900 mb-2">
                  Thêm sản phẩm vào giỏ
                </h3>
                <p className="text-sm text-mono-600">
                  Thêm sản phẩm bạn muốn mua vào giỏ hàng với giá trị đơn tối
                  thiểu
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-mono-100 text-mono-black p-3 rounded-full">
                <FiTag className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-mono-900 mb-2">Áp dụng mã</h3>
                <p className="text-sm text-mono-600">
                  Dán mã giảm giá vào ô nhập mã trong trang giỏ hàng và bấm áp
                  dụng
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponsPage;
