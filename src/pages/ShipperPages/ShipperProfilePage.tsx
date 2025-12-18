/**
 * ShipperProfilePage - Profile và toggle availability
 * SYNCED WITH BE: shipper.service.js - updateShipperAvailability()
 */
import { useState, useEffect, useCallback } from "react";
import {
  FiPhone,
  FiMail,
  FiCalendar,
  FiToggleLeft,
  FiToggleRight,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiPackage,
  FiTrendingUp,
  FiRefreshCw,
  FiAlertCircle,
  FiStar,
  FiEdit2,
  FiSave,
  FiX,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { shipperService } from "../../services/ShipperService";
import { useAuth } from "../../hooks/useAuth";
import type { Order } from "../../types/order";

// Default avatar URL
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=S&background=374151&color=fff&size=200&bold=true";

// Interface cho local stats (không có trong types vì tính từ orders)
interface LocalShipperStats {
  totalOrders: number;
  delivered: number;
  failed: number;
  inProgress: number;
  successRate: string;
}

const ShipperProfilePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<LocalShipperStats | null>(null);
  // Initialize from user's shipper info (from login response)
  const [isAvailable, setIsAvailable] = useState(
    user?.shipper?.isAvailable ?? false
  );
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Edit phone state
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(user?.phone || "");
  const [savingPhone, setSavingPhone] = useState(false);

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch orders to calculate stats
      const ordersResponse = await shipperService.getMyOrders();
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const ordersResponseData =
        (ordersResponse.data as any)?.data || ordersResponse.data;
      const ordersData = ordersResponseData?.orders || ordersResponseData || [];
      const orders: Order[] = Array.isArray(ordersData) ? ordersData : [];
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Calculate stats
      const totalOrders = orders.length;
      const delivered = orders.filter((o) => o.status === "delivered").length;
      const failed = orders.filter(
        (o) => o.status === "delivery_failed"
      ).length;
      const inProgress = orders.filter(
        (o) =>
          o.status === "assigned_to_shipper" || o.status === "out_for_delivery"
      ).length;
      const successRate =
        totalOrders > 0 ? ((delivered / totalOrders) * 100).toFixed(1) : "0";

      setStats({
        totalOrders,
        delivered,
        failed,
        inProgress,
        successRate,
      });

      // Get availability from user context (from login response)
      // This is persisted in localStorage and updated on toggle
      if (user?.shipper) {
        setIsAvailable(user.shipper.isAvailable);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Không thể tải thông tin profile");
    } finally {
      setLoading(false);
    }
  }, [user?.shipper]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleToggleAvailability = async () => {
    try {
      setToggleLoading(true);
      const newStatus = !isAvailable;

      await shipperService.updateAvailability(newStatus);
      setIsAvailable(newStatus);

      // Update localStorage user data to persist availability status
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.shipper) {
          userData.shipper.isAvailable = newStatus;
        } else {
          userData.shipper = { isAvailable: newStatus };
        }
        localStorage.setItem("user", JSON.stringify(userData));
      }

      toast.success(
        newStatus
          ? "Đã bật trạng thái sẵn sàng nhận đơn"
          : "Đã tắt trạng thái sẵn sàng nhận đơn"
      );
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setToggleLoading(false);
    }
  };

  // Handle save phone number
  const handleSavePhone = async () => {
    if (!phoneValue.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    // Validate phone format (Vietnamese phone) - khớp với backend validator
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(phoneValue.replace(/\s/g, ""))) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    try {
      setSavingPhone(true);
      await shipperService.updateProfile({ phone: phoneValue });

      // Update localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.phone = phoneValue;
        localStorage.setItem("user", JSON.stringify(userData));
      }

      toast.success("Đã cập nhật số điện thoại");
      setIsEditingPhone(false);
    } catch (error) {
      console.error("Error updating phone:", error);
      toast.error("Không thể cập nhật số điện thoại");
    } finally {
      setSavingPhone(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <FiRefreshCw className="animate-spin text-mono-400" size={32} />
          <span className="text-mono-500">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-mono-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mono-900">Hồ sơ cá nhân</h1>
          <p className="text-mono-500 text-sm mt-1">
            Quản lý thông tin và trạng thái hoạt động
          </p>
        </div>
        <button
          onClick={fetchProfileData}
          className="inline-flex items-center gap-2 bg-white hover:bg-mono-50 text-mono-700 border border-mono-200 px-4 py-2.5 rounded-lg transition-all font-medium text-sm"
        >
          <FiRefreshCw size={16} />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-mono-200 shadow-sm overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-mono-800 to-mono-900 px-6 py-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center ring-4 ring-white/30 overflow-hidden">
                  <img
                    src={user?.avatar?.url || DEFAULT_AVATAR}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                    }}
                  />
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{user?.name || "N/A"}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/70 text-sm">Shipper</span>
                    <span className="text-white/40">•</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isAvailable
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {isAvailable ? (
                        <>
                          <FiCheckCircle size={12} />
                          Đang hoạt động
                        </>
                      ) : (
                        <>
                          <FiXCircle size={12} />
                          Nghỉ
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-6">
              <h3 className="font-semibold text-mono-900 mb-4">
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-mono-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg border border-mono-200">
                    <FiMail className="text-mono-500" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-mono-500 font-medium">Email</p>
                    <p className="text-sm text-mono-900 font-medium">
                      {user?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-mono-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg border border-mono-200">
                    <FiPhone className="text-mono-500" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-mono-500 font-medium">
                      Số điện thoại
                    </p>
                    {isEditingPhone ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="tel"
                          value={phoneValue}
                          onChange={(e) => setPhoneValue(e.target.value)}
                          placeholder="Nhập số điện thoại"
                          className="flex-1 px-2 py-1 text-sm border border-mono-300 rounded focus:outline-none focus:ring-1 focus:ring-mono-400"
                        />
                        <button
                          onClick={handleSavePhone}
                          disabled={savingPhone}
                          className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {savingPhone ? (
                            <FiRefreshCw className="animate-spin" size={14} />
                          ) : (
                            <FiSave size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPhone(false);
                            setPhoneValue(user?.phone || "");
                          }}
                          className="p-1.5 bg-mono-200 text-mono-600 rounded hover:bg-mono-300"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-mono-900 font-medium">
                          {phoneValue || user?.phone || "Chưa cập nhật"}
                        </p>
                        <button
                          onClick={() => setIsEditingPhone(true)}
                          className="p-1 text-mono-400 hover:text-mono-600"
                          title="Chỉnh sửa số điện thoại"
                        >
                          <FiEdit2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-mono-50 rounded-lg md:col-span-2">
                  <div className="p-2 bg-white rounded-lg border border-mono-200">
                    <FiCalendar className="text-mono-500" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-mono-500 font-medium">
                      Ngày tham gia
                    </p>
                    <p className="text-sm text-mono-900 font-medium">
                      {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Availability & Stats */}
        <div className="space-y-6">
          {/* Availability Toggle */}
          <div className="bg-white rounded-xl border border-mono-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-mono-100 rounded-lg">
                <FiTruck className="text-mono-700" size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-mono-900">
                  Trạng thái hoạt động
                </h3>
                <p className="text-xs text-mono-500">
                  Bật để nhận đơn hàng mới
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleAvailability}
              disabled={toggleLoading}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                isAvailable
                  ? "bg-emerald-50 border-emerald-200 hover:border-emerald-300"
                  : "bg-mono-50 border-mono-200 hover:border-mono-300"
              } ${
                toggleLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-3">
                {isAvailable ? (
                  <FiCheckCircle className="text-emerald-600" size={22} />
                ) : (
                  <FiXCircle className="text-mono-400" size={22} />
                )}
                <div className="text-left">
                  <p
                    className={`font-semibold ${
                      isAvailable ? "text-emerald-700" : "text-mono-600"
                    }`}
                  >
                    {isAvailable ? "Đang hoạt động" : "Đang nghỉ"}
                  </p>
                  <p className="text-xs text-mono-500">
                    {isAvailable
                      ? "Bạn sẽ nhận được đơn hàng mới"
                      : "Bạn không nhận đơn hàng mới"}
                  </p>
                </div>
              </div>
              {toggleLoading ? (
                <FiRefreshCw className="animate-spin text-mono-500" size={24} />
              ) : isAvailable ? (
                <FiToggleRight className="text-emerald-600" size={32} />
              ) : (
                <FiToggleLeft className="text-mono-400" size={32} />
              )}
            </button>

            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <FiAlertCircle
                  className="text-amber-600 flex-shrink-0 mt-0.5"
                  size={16}
                />
                <p className="text-xs text-amber-700">
                  Khi tắt trạng thái, bạn vẫn cần hoàn thành các đơn hàng đang
                  giao
                </p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl border border-mono-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-mono-100 rounded-lg">
                <FiTrendingUp className="text-mono-700" size={18} />
              </div>
              <h3 className="font-semibold text-mono-900">
                Thống kê giao hàng
              </h3>
            </div>

            <div className="space-y-3">
              {/* Total Orders */}
              <div className="flex items-center justify-between p-3 bg-mono-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiPackage className="text-mono-500" size={18} />
                  <span className="text-sm text-mono-600">Tổng đơn</span>
                </div>
                <span className="font-bold text-mono-900">
                  {stats?.totalOrders || 0}
                </span>
              </div>

              {/* Delivered */}
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="text-emerald-600" size={18} />
                  <span className="text-sm text-emerald-700">Đã giao</span>
                </div>
                <span className="font-bold text-emerald-700">
                  {stats?.delivered || 0}
                </span>
              </div>

              {/* Failed */}
              <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiXCircle className="text-rose-600" size={18} />
                  <span className="text-sm text-rose-700">Thất bại</span>
                </div>
                <span className="font-bold text-rose-700">
                  {stats?.failed || 0}
                </span>
              </div>

              {/* In Progress */}
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiTruck className="text-amber-600" size={18} />
                  <span className="text-sm text-amber-700">Đang giao</span>
                </div>
                <span className="font-bold text-amber-700">
                  {stats?.inProgress || 0}
                </span>
              </div>

              {/* Success Rate */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiStar className="text-blue-600" size={18} />
                  <span className="text-sm text-blue-700">
                    Tỷ lệ thành công
                  </span>
                </div>
                <span className="font-bold text-blue-700">
                  {stats?.successRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipperProfilePage;
