import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { userCouponService } from "../../../services/CouponService";
import type { Coupon } from "../../../types/coupon";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  FiPercent,
  FiDollarSign,
  FiTag,
  FiCalendar,
  FiShoppingCart,
  FiGift,
  FiLoader,
  FiArrowLeft,
  FiCopy,
  FiSearch,
  FiFilter,
} from "react-icons/fi";

const CouponsPage: React.FC = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectingCouponId, setCollectingCouponId] = useState<string | null>(
    null
  );
  const [filterType, setFilterType] = useState<"all" | "percent" | "fixed">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    // Scroll to top on mount and when filter/page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Chờ auth load xong trước khi fetch
    if (!authLoading) {
      fetchPublicCoupons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, currentPage, isAuthenticated, authLoading]);

  const fetchPublicCoupons = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit,
        status: "active",
        sort: "createdAt_desc",
      };

      if (filterType !== "all") {
        params.type = filterType;
      }

      const response = await userCouponService.getAvailableCoupons(params);

      if (response.data.success) {
        // Backend trả về: { success: true, coupons: [...], pagination: {...} }
        setCoupons(response.data.coupons || []);

        // Cập nhật thông tin phân trang
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
        }
      } else {
        toast.error("Không thể tải danh sách mã giảm giá");
      }
    } catch (error: any) {
      console.error("Error fetching coupons:", error);
      toast.error("Có lỗi xảy ra khi tải mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  const handleCollectCoupon = async (couponId: string) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thu thập mã giảm giá");
      return;
    }

    try {
      setCollectingCouponId(couponId);
      const response = await userCouponService.collectCoupon(couponId);

      if (response.data.success) {
        toast.success("Thu thập mã giảm giá thành công!");
        // Refresh danh sách sau khi thu thập
        fetchPublicCoupons();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể thu thập mã giảm giá";
      toast.error(errorMessage);
    } finally {
      setCollectingCouponId(null);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.type === "percent") {
      return `${coupon.value}%`;
    } else {
      return `${coupon.value.toLocaleString("vi-VN")}đ`;
    }
  };

  // Lọc coupon theo searchTerm và filterType
  const filteredCoupons = coupons.filter((coupon) => {
    // Filter theo search term
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter theo type (nếu không phải "all")
    const matchesType = filterType === "all" || coupon.type === filterType;

    return matchesSearch && matchesType;
  });

  // Hiển thị loading khi auth đang load hoặc đang fetch dữ liệu
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiLoader className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Đang tải mã giảm giá...</p>
        </div>
      </div>
    );
  }

  // Chỉ hiển thị thông báo đăng nhập khi auth đã load xong VÀ user chưa đăng nhập
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg max-w-md mx-4 px-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
            <FiGift className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Vui lòng đăng nhập
          </h3>
          <p className="text-gray-600 mb-6">
            Đăng nhập để xem và thu thập các mã giảm giá hấp dẫn
          </p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Thu Thập Mã Giảm Giá
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá và thu thập các mã giảm giá hấp dẫn để tiết kiệm cho đơn
              hàng của bạn
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search bar */}
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Tìm mã giảm giá..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <FiFilter className="text-gray-600" />
              <span className="text-gray-600">Loại:</span>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "Tất cả", icon: FiTag },
                  { value: "percent", label: "Giảm %", icon: FiPercent },
                  { value: "fixed", label: "Giảm tiền", icon: FiDollarSign },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setFilterType(filter.value as any);
                      setCurrentPage(1); // Reset về trang 1 khi đổi filter
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      filterType === filter.value
                        ? "bg-black text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-gray-100 shadow"
                    }`}
                  >
                    <filter.icon className="w-4 h-4" />
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Coupons Grid */}
        {filteredCoupons.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Gradient Header */}
                  <div className="h-2 bg-black"></div>

                  <div className="p-6">
                    {/* Coupon Type Badge & Code */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                          coupon.type === "percent"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {coupon.type === "percent" ? (
                          <FiPercent className="w-4 h-4" />
                        ) : (
                          <FiDollarSign className="w-4 h-4" />
                        )}
                        {formatDiscount(coupon)}
                      </div>
                      <button
                        onClick={() => copyCouponCode(coupon.code)}
                        className="flex items-center gap-1 text-xs font-mono bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                        title="Sao chép mã"
                      >
                        {coupon.code}
                        <FiCopy className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Coupon Description */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {coupon.description}
                    </h3>

                    {/* Coupon Details */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiShoppingCart className="w-4 h-4 text-gray-400" />
                        <span>
                          Đơn tối thiểu:{" "}
                          <span className="font-semibold text-gray-900">
                            {coupon.minOrderValue.toLocaleString("vi-VN")}đ
                          </span>
                        </span>
                      </div>
                      {coupon.maxDiscount && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiTag className="w-4 h-4 text-gray-400" />
                          <span>
                            Giảm tối đa:{" "}
                            <span className="font-semibold text-gray-900">
                              {coupon.maxDiscount.toLocaleString("vi-VN")}đ
                            </span>
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs">
                          HSD: {formatDate(coupon.endDate)}
                        </span>
                      </div>
                      {coupon.isRedeemable &&
                        coupon.pointCost &&
                        coupon.pointCost > 0 && (
                          <div className="flex items-center gap-2 text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                            <FiGift className="w-4 h-4" />
                            <span className="font-medium text-sm">
                              Đổi {coupon.pointCost.toLocaleString("vi-VN")}{" "}
                              điểm
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Collect Button */}
                    <button
                      onClick={() => handleCollectCoupon(coupon._id)}
                      disabled={
                        collectingCouponId === coupon._id || !isAuthenticated
                      }
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                        collectingCouponId === coupon._id
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : isAuthenticated
                          ? "bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {collectingCouponId === coupon._id ? (
                        <>
                          <FiLoader className="w-5 h-5 animate-spin" />
                          Đang thu thập...
                        </>
                      ) : isAuthenticated ? (
                        <>
                          <FiGift className="w-5 h-5" />
                          Thu thập ngay
                        </>
                      ) : (
                        "Đăng nhập để thu thập"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-md bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Trước
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          currentPage === page
                            ? "bg-black text-white"
                            : "bg-white border border-gray-300 hover:bg-gray-100"
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
                    className="px-4 py-2 rounded-md bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Tiếp
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <FiGift className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Hiện tại chưa có mã giảm giá
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy quay lại sau để không bỏ lỡ những ưu đãi hấp dẫn!
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsPage;
