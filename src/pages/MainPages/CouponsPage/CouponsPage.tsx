import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  publicCouponService,
  userCouponService,
} from "../../../services/CouponService";
import type { Coupon } from "../../../types/coupon";
import { useAuth } from "../../../hooks/useAuth";

const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectingCouponId, setCollectingCouponId] = useState<string | null>(
    null
  );
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPublicCoupons();
  }, []);

  const fetchPublicCoupons = async () => {
    try {
      setLoading(true);
      const response = await publicCouponService.getPublicCoupons({
        page: 1,
        limit: 20,
        sort: "createdAt_desc",
      });

      if (response.data.success) {
        setCoupons(response.data.coupons || []);
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
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể thu thập mã giảm giá";
      toast.error(errorMessage);
    } finally {
      setCollectingCouponId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.type === "percent") {
      return `${coupon.value}%`;
    } else {
      return `${coupon.value.toLocaleString("vi-VN")}₫`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mono-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mono-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-mono-900 mb-4">
            Mã Giảm Giá Dành Cho Bạn
          </h1>
          <p className="text-lg text-mono-600">
            Thu thập các mã giảm giá hấp dẫn để tiết kiệm cho đơn hàng tiếp theo
          </p>
        </div>

        {/* Coupons Grid */}
        {coupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  {/* Coupon Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-red-100 text-mono-900 px-3 py-1 rounded-full text-sm font-semibold">
                      {formatDiscount(coupon)}
                    </div>
                    <div className="text-xs text-mono-500">
                      Mã: {coupon.code}
                    </div>
                  </div>

                  {/* Coupon Description */}
                  <h3 className="text-lg font-semibold text-mono-900 mb-2">
                    {coupon.description}
                  </h3>

                  {/* Coupon Details */}
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-mono-600">
                      <span className="font-medium">Đơn tối thiểu:</span>{" "}
                      {coupon.minOrderValue.toLocaleString("vi-VN")}₫
                    </div>
                    {coupon.maxDiscount && (
                      <div className="text-sm text-mono-600">
                        <span className="font-medium">Giảm tối đa:</span>{" "}
                        {coupon.maxDiscount.toLocaleString("vi-VN")}₫
                      </div>
                    )}
                    <div className="text-sm text-mono-600">
                      <span className="font-medium">Có hiệu lực:</span>{" "}
                      {formatDate(coupon.startDate)} -{" "}
                      {formatDate(coupon.endDate)}
                    </div>
                  </div>

                  {/* Collect Button */}
                  <button
                    onClick={() => handleCollectCoupon(coupon._id)}
                    disabled={
                      collectingCouponId === coupon._id || !isAuthenticated
                    }
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      collectingCouponId === coupon._id
                        ? "bg-mono-400 text-white cursor-not-allowed"
                        : isAuthenticated
                        ? "bg-mono-black text-white hover:bg-blue-700"
                        : "bg-mono-300 text-mono-500 cursor-not-allowed"
                    }`}
                  >
                    {collectingCouponId === coupon._id
                      ? "Đang thu thập..."
                      : isAuthenticated
                      ? "Thu thập ngay"
                      : "Đăng nhập để thu thập"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-mono-400 text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold text-mono-900 mb-2">
              Hiện tại chưa có mã giảm giá nào
            </h3>
            <p className="text-mono-600">
              Hãy quay lại sau để không bỏ lỡ những ưu đãi hấp dẫn!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsPage;
