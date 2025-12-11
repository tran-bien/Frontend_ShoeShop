import { useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiToggleLeft,
  FiToggleRight,
  FiRefreshCw,
  FiPackage,
  FiTrendingUp,
  FiCalendar,
  FiShield,
} from "react-icons/fi";
import { shipperService } from "../../services/ShipperService";
import { toast } from "react-hot-toast";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
  role?: string;
  isActive?: boolean;
  shipper?: {
    isAvailable?: boolean;
    activeOrders?: number;
    maxOrders?: number;
  };
}

interface ShipperStats {
  totalOrders: number;
  completed: number;
  failed: number;
  active: number;
  successRate: string;
}

interface ShipperOrder {
  _id: string;
  status: string;
}

const ShipperProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ShipperStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData: UserProfile = JSON.parse(userStr);
        setUser(userData);

        const ordersResponse = await shipperService.getMyOrders();
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const responseData =
          (ordersResponse.data as any)?.data || ordersResponse.data;
        const orders: ShipperOrder[] = Array.isArray(responseData)
          ? responseData
          : [];
        /* eslint-enable @typescript-eslint/no-explicit-any */

        const totalOrders = orders.length;
        const completed = orders.filter((o) => o.status === "delivered").length;
        const failed = orders.filter(
          (o) => o.status === "delivery_failed"
        ).length;
        const active = orders.filter(
          (o) =>
            o.status === "assigned_to_shipper" ||
            o.status === "out_for_delivery"
        ).length;
        const successRate =
          totalOrders > 0 ? ((completed / totalOrders) * 100).toFixed(1) : "0";

        setStats({
          totalOrders,
          completed,
          failed,
          active,
          successRate,
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!user) return;
    try {
      setUpdating(true);
      const newAvailability = !user.shipper?.isAvailable;
      await shipperService.updateAvailability(newAvailability);

      const updatedUser: UserProfile = {
        ...user,
        shipper: {
          ...user.shipper,
          isAvailable: newAvailability,
        },
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success(
        `Trạng thái đã cập nhật: ${
          newAvailability ? "Sẵn sàng nhận đơn" : "Tạm nghỉ"
        }`
      );
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái"
      );
    } finally {
      setUpdating(false);
    }
  };

  const getCapacityPercentage = () => {
    if (!user?.shipper?.maxOrders || user.shipper.maxOrders === 0) return 0;
    return Math.round(((stats?.active || 0) / user.shipper.maxOrders) * 100);
  };

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 80) return "bg-rose-500";
    if (percentage >= 50) return "bg-amber-500";
    return "bg-emerald-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <FiRefreshCw className="animate-spin text-mono-400" size={32} />
          <span className="text-mono-500">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  const capacityPct = getCapacityPercentage();

  return (
    <div className="p-6 bg-mono-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-mono-900 text-white rounded-2xl overflow-hidden shadow-lg">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-mono-800 rounded-2xl flex items-center justify-center overflow-hidden border-4 border-mono-700">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser size={40} className="text-mono-400" />
                  )}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-mono-900 ${
                    user?.shipper?.isAvailable
                      ? "bg-emerald-500"
                      : "bg-mono-500"
                  }`}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold mb-2">{user?.name}</h1>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-mono-300">
                  <span className="inline-flex items-center gap-2">
                    <FiMail size={16} />
                    {user?.email}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <FiPhone size={16} />
                    {user?.phone || "Chưa cập nhật"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="bg-white rounded-xl border border-mono-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-mono-900 mb-1">
                  Trạng thái hoạt động
                </h2>
                <p className="text-sm text-mono-500">
                  {user?.shipper?.isAvailable
                    ? "Bạn đang sẵn sàng nhận đơn hàng mới từ hệ thống"
                    : "Bạn đang tạm nghỉ và không nhận đơn hàng mới"}
                </p>
              </div>
              <button
                onClick={handleToggleAvailability}
                disabled={updating}
                className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 ${
                  user?.shipper?.isAvailable
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-mono-200 hover:bg-mono-300 text-mono-700"
                }`}
              >
                {user?.shipper?.isAvailable ? (
                  <>
                    <FiToggleRight size={24} />
                    <span>Đang hoạt động</span>
                  </>
                ) : (
                  <>
                    <FiToggleLeft size={24} />
                    <span>Đang nghỉ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Capacity Info */}
        <div className="bg-white rounded-xl border border-mono-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-mono-100">
            <h2 className="font-semibold text-mono-900">Công suất làm việc</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center p-4 bg-mono-50 rounded-xl">
                <p className="text-3xl font-bold text-mono-900">
                  {stats?.active || 0}
                </p>
                <p className="text-sm text-mono-500 mt-1">Đang giao</p>
              </div>
              <div className="text-center p-4 bg-mono-50 rounded-xl">
                <p className="text-3xl font-bold text-mono-900">
                  {user?.shipper?.maxOrders || 0}
                </p>
                <p className="text-sm text-mono-500 mt-1">Giới hạn</p>
              </div>
            </div>

            {/* Capacity Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-mono-500">Công suất sử dụng</span>
                <span className="font-semibold text-mono-800">
                  {capacityPct}%
                </span>
              </div>
              <div className="w-full bg-mono-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getCapacityColor(
                    capacityPct
                  )}`}
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
              <p className="text-xs text-mono-400 mt-2">
                {capacityPct < 50
                  ? "Bạn có thể nhận thêm nhiều đơn hàng"
                  : capacityPct < 80
                  ? "Công suất đang ở mức trung bình"
                  : "Công suất gần đạt giới hạn"}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl border border-mono-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-mono-100">
            <h2 className="font-semibold text-mono-900">Thống kê giao hàng</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Orders */}
              <div className="text-center p-4 bg-mono-50 rounded-xl">
                <div className="w-12 h-12 bg-mono-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiPackage className="text-mono-700" size={22} />
                </div>
                <p className="text-2xl font-bold text-mono-900">
                  {stats?.totalOrders || 0}
                </p>
                <p className="text-xs text-mono-500 mt-1">Tổng đơn</p>
              </div>

              {/* Completed */}
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiCheckCircle className="text-emerald-600" size={22} />
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats?.completed || 0}
                </p>
                <p className="text-xs text-emerald-700 mt-1">Đã giao</p>
              </div>

              {/* Failed */}
              <div className="text-center p-4 bg-rose-50 rounded-xl">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiXCircle className="text-rose-600" size={22} />
                </div>
                <p className="text-2xl font-bold text-rose-600">
                  {stats?.failed || 0}
                </p>
                <p className="text-xs text-rose-700 mt-1">Thất bại</p>
              </div>

              {/* Success Rate */}
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiTrendingUp className="text-blue-600" size={22} />
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.successRate}%
                </p>
                <p className="text-xs text-blue-700 mt-1">Tỷ lệ TC</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl border border-mono-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-mono-100">
            <h2 className="font-semibold text-mono-900">Thông tin tài khoản</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-mono-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-mono-100 rounded-lg">
                    <FiShield className="text-mono-600" size={16} />
                  </div>
                  <span className="text-mono-600">Vai trò</span>
                </div>
                <span className="font-semibold text-mono-900 capitalize bg-mono-100 px-3 py-1 rounded-lg text-sm">
                  {user?.role === "shipper"
                    ? "Nhân viên giao hàng"
                    : user?.role}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-mono-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-mono-100 rounded-lg">
                    <FiCalendar className="text-mono-600" size={16} />
                  </div>
                  <span className="text-mono-600">Ngày tham gia</span>
                </div>
                <span className="font-semibold text-mono-900">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-mono-100 rounded-lg">
                    <FiCheckCircle className="text-mono-600" size={16} />
                  </div>
                  <span className="text-mono-600">Trạng thái tài khoản</span>
                </div>
                <span
                  className={`font-semibold px-3 py-1 rounded-lg text-sm ${
                    user?.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {user?.isActive ? "Đang hoạt động" : "Tạm khóa"}
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
