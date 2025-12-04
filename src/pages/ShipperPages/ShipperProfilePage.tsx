import { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { shipperService } from "../../services/ShipperService";

const ShipperProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Get user from localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);

        // Fetch stats
        const ordersResponse = await shipperService.getMyOrders();
        // Handle response structure: could be { data: { data: orders } } or { data: orders }
        const responseData = ordersResponse.data?.data || ordersResponse.data;
        const orders = Array.isArray(responseData) ? responseData : [];

        const totalOrders = orders.length;
        const completed = orders.filter(
          (o: any) => o.status === "delivered"
        ).length;
        const failed = orders.filter(
          (o: any) => o.status === "delivery_failed"
        ).length;
        const active = orders.filter(
          (o: any) =>
            o.status === "assigned_to_shipper" ||
            o.status === "out_for_delivery"
        ).length;
        const successRate =
          totalOrders > 0 ? ((completed / totalOrders) * 100).toFixed(1) : 0;

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
    try {
      setUpdating(true);
      const newAvailability = !user.shipper?.isAvailable;
      await shipperService.updateAvailability(newAvailability);

      // Update local user data
      const updatedUser = {
        ...user,
        shipper: {
          ...user.shipper,
          isAvailable: newAvailability,
        },
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert(
        `Trạng thái dã được cập nhật thành: ${
          newAvailability ? "Sẩn sàng" : "Không sẩn sàng"
        }`
      );
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Có lỗi x?y ra khi cập nhật trạng thái"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-mono-500">Ðang tại...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-mono-900 text-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <FaUser size={48} className="text-mono-black" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
            <p className="text-mono-100 flex items-center gap-2">
              <FaEnvelope size={16} />
              {user?.email}
            </p>
            <p className="text-mono-100 flex items-center gap-2 mt-1">
              <FaPhone size={16} />
              {user?.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-mono-800 mb-2">
              Trạng thái sẩn sàng
            </h2>
            <p className="text-mono-600">
              {user?.shipper?.isAvailable
                ? "Bẩn đang sẩn sàng nhơn don hàng mới"
                : "Bẩn hiện không nhơn don hàng mới"}
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            disabled={updating}
            className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all ${
              user?.shipper?.isAvailable
                ? "bg-mono-800 text-white hover:bg-mono-700"
                : "bg-mono-100 text-mono-700 hover:bg-mono-200"
            } disabled:opacity-50`}
          >
            {user?.shipper?.isAvailable ? (
              <>
                <FaToggleOn size={24} />
                <span>Ðang ho?t đếng</span>
              </>
            ) : (
              <>
                <FaToggleOff size={24} />
                <span>Không ho?t đếng</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Capacity Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-mono-800 mb-4">
          Công su?t làm vi?c
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-mono-600">Ðon đang giao</p>
            <p className="text-2xl font-bold text-mono-black">
              {stats?.active || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-mono-600">Giới hơn don</p>
            <p className="text-2xl font-bold text-mono-800">
              {user?.shipper?.maxOrders || 0}
            </p>
          </div>
        </div>

        {/* Capacity Bar */}
        <div>
          <div className="flex justify-between text-sm text-mono-600 mb-2">
            <span>Công su?t</span>
            <span>
              {user?.shipper?.maxOrders > 0
                ? (
                    ((stats?.active || 0) / user.shipper.maxOrders) *
                    100
                  ).toFixed(0)
                : 0}
              %
            </span>
          </div>
          <div className="w-full bg-mono-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full ${
                (stats?.active || 0) / (user?.shipper?.maxOrders || 1) >= 0.8
                  ? "bg-mono-800"
                  : (stats?.active || 0) / (user?.shipper?.maxOrders || 1) >=
                    0.5
                  ? "bg-mono-600"
                  : "bg-mono-700"
              }`}
              style={{
                width: `${
                  user?.shipper?.maxOrders > 0
                    ? ((stats?.active || 0) / user.shipper.maxOrders) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-mono-800 mb-4">
          Thàng kê giao hàng
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Total Orders */}
          <div className="text-center">
            <div className="bg-mono-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaTruck size={28} className="text-mono-black" />
            </div>
            <p className="text-3xl font-bold text-mono-800">
              {stats?.totalOrders || 0}
            </p>
            <p className="text-sm text-mono-600 mt-1">Tổng don</p>
          </div>

          {/* Completed */}
          <div className="text-center">
            <div className="bg-mono-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCheckCircle size={28} className="text-mono-800" />
            </div>
            <p className="text-3xl font-bold text-mono-800">
              {stats?.completed || 0}
            </p>
            <p className="text-sm text-mono-600 mt-1">Ðã giao</p>
          </div>

          {/* Failed */}
          <div className="text-center">
            <div className="bg-mono-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaTimesCircle size={28} className="text-mono-900" />
            </div>
            <p className="text-3xl font-bold text-mono-900">
              {stats?.failed || 0}
            </p>
            <p className="text-sm text-mono-600 mt-1">Thểt b?i</p>
          </div>

          {/* Success Rate */}
          <div className="text-center">
            <div className="bg-mono-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCheckCircle size={28} className="text-mono-900" />
            </div>
            <p className="text-3xl font-bold text-mono-900">
              {stats?.successRate}%
            </p>
            <p className="text-sm text-mono-600 mt-1">Từ lệ TC</p>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-mono-800 mb-4">
          Thông tin tài khoẩn
        </h2>
        <div className="space-y-3 text-mono-700">
          <div className="flex justify-between">
            <span className="text-mono-600">Vai trò:</span>
            <span className="font-semibold capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-mono-600">Ngày t?o:</span>
            <span className="font-semibold">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-mono-600">Trạng thái tài khoẩn:</span>
            <span
              className={`font-semibold ${
                user?.isActive ? "text-mono-800" : "text-mono-900"
              }`}
            >
              {user?.isActive ? "Ho?t đếng" : "Tạm khóa"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipperProfilePage;

