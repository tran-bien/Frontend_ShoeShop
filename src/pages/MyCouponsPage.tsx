import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Ticket,
  Gift,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  Copy,
  CheckCircle,
  Tag,
  ShoppingBag,
} from "lucide-react";
import { userCouponService } from "../services/CouponService";
import Sidebar from "../components/User/Sidebar";
import type { Coupon } from "../types/coupon";
import { Link } from "react-router-dom";

type CouponStatus = "all" | "active" | "used" | "expired";

const MyCouponsContent: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CouponStatus>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params: {
        status?: "active" | "inactive" | "expired" | "archived";
      } = {};

      if (filter === "active") {
        params.status = "active";
      } else if (filter === "expired") {
        params.status = "expired";
      }

      const response = await userCouponService.getCollectedCoupons(params);

      if (response.data.success) {
        let fetchedCoupons = response.data.coupons || [];

        // Client-side filter if needed
        if (filter === "active") {
          const now = new Date();
          fetchedCoupons = fetchedCoupons.filter((c: Coupon) => {
            return (
              c.status === "active" &&
              new Date(c.startDate) <= now &&
              new Date(c.endDate) >= now
            );
          });
        } else if (filter === "expired") {
          const now = new Date();
          fetchedCoupons = fetchedCoupons.filter((c: Coupon) => {
            return c.status === "expired" || new Date(c.endDate) < now;
          });
        }

        setCoupons(fetchedCoupons);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Không thể tải danh sách coupon");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Đã sao chép mã giảm giá!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.type === "percent") {
      return `${coupon.value}%`;
    }
    return `${coupon.value?.toLocaleString("vi-VN")}đ`;
  };

  const isExpired = (coupon: Coupon) => {
    return new Date(coupon.endDate) < new Date() || coupon.status === "expired";
  };

  const isComingSoon = (coupon: Coupon) => {
    return new Date(coupon.startDate) > new Date();
  };

  const getCouponStatusBadge = (coupon: Coupon) => {
    if (isExpired(coupon)) {
      return (
        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
          Hết hạn
        </span>
      );
    }
    if (isComingSoon(coupon)) {
      return (
        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
          Sắp có hiệu lực
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
        Có thể sử dụng
      </span>
    );
  };

  const getScopeLabel = (coupon: Coupon) => {
    if (!coupon.scope || coupon.scope === "ALL") return null;

    const labels: Record<string, string> = {
      PRODUCTS: "Áp dụng cho sản phẩm cụ thể",
      VARIANTS: "Áp dụng cho biến thể cụ thể",
      CATEGORIES: "Áp dụng cho danh mục cụ thể",
    };
    return labels[coupon.scope];
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400 mx-auto" />
          <p className="mt-4 text-gray-500">Đang tải kho coupon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Ticket className="w-7 h-7" />
            Kho Coupon
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý các mã giảm giá đã thu thập
          </p>
        </div>
        <Link
          to="/coupons"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Gift className="w-4 h-4" />
          Thu thập thêm
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
        {[
          { value: "all", label: "Tất cả" },
          { value: "active", label: "Có thể dùng" },
          { value: "expired", label: "Đã hết hạn" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as CouponStatus)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có coupon nào
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === "all"
              ? "Hãy thu thập các mã giảm giá để nhận ưu đãi khi mua sắm"
              : filter === "active"
              ? "Bạn không có coupon nào đang hoạt động"
              : "Không có coupon hết hạn"}
          </p>
          <Link
            to="/coupons"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Gift className="w-5 h-5" />
            Khám phá coupon
          </Link>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {coupons.map((coupon) => {
              const expired = isExpired(coupon);
              return (
                <motion.div
                  key={coupon._id}
                  layout
                  className={`relative bg-white border rounded-xl overflow-hidden transition-all ${
                    expired
                      ? "border-gray-200 opacity-60"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  {/* Coupon Content */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-black">
                            {formatDiscount(coupon)}
                          </span>
                          {coupon.type === "percent" && coupon.maxDiscount && (
                            <span className="text-xs text-gray-500">
                              Tối đa{" "}
                              {coupon.maxDiscount.toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {coupon.description}
                        </p>
                      </div>
                      {getCouponStatusBadge(coupon)}
                    </div>

                    {/* Conditions */}
                    <div className="space-y-1.5 mb-4">
                      {coupon.minOrderValue > 0 && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>
                            Đơn tối thiểu{" "}
                            {coupon.minOrderValue.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          HSD: {formatDate(coupon.startDate)} -{" "}
                          {formatDate(coupon.endDate)}
                        </span>
                      </div>
                      {getScopeLabel(coupon) && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Tag className="w-3.5 h-3.5" />
                          <span>{getScopeLabel(coupon)}</span>
                        </div>
                      )}
                    </div>

                    {/* Code & Copy */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <span className="font-mono font-bold text-gray-900 tracking-wider">
                          {coupon.code}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        disabled={expired}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all ${
                          expired
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : copiedCode === coupon.code
                            ? "bg-green-100 text-green-700"
                            : "bg-black text-white hover:bg-gray-800"
                        }`}
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Đã sao chép
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Sao chép
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Decorative dashed line */}
                  <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-black via-gray-400 to-black opacity-10" />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Link to Loyalty */}
      <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Đổi điểm lấy Coupon
              </h3>
              <p className="text-sm text-gray-500">
                Dùng điểm tích lũy để đổi lấy các mã giảm giá hấp dẫn
              </p>
            </div>
          </div>
          <Link
            to="/loyalty/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Xem điểm thưởng
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const MyCouponsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 flex-shrink-0 order-first">
            <Sidebar />
          </div>
          <div className="flex-1">
            <MyCouponsContent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCouponsPage;
