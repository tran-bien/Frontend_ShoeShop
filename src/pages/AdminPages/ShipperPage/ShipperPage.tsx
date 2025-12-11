import React, { useState, useEffect, useMemo } from "react";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiRefreshCw,
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
  FiPhone,
  FiMail,
  FiEye,
  FiClock,
  FiChevronDown,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { adminShipperService } from "../../../services/ShipperService";
import AssignOrderModal from "../../../components/Admin/Shipper/AssignOrderModal";

// Types - Khớp với BE schema (User.shipper field)
interface ShipperInfo {
  isAvailable: boolean;
  activeOrders: number;
  maxOrders: number;
  deliveryStats: {
    total: number;
    successful: number;
    failed: number;
  };
}

interface Shipper {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: { url?: string };
  createdAt: string;
  shipper: ShipperInfo;
  // Computed fields for UI
  status: "available" | "busy" | "offline";
  currentOrders: number;
  maxOrders: number;
  deliveredCount: number;
  successRate: number;
}

// Status configs
const STATUS_CONFIG = {
  available: {
    label: "Sẵn sàng",
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  busy: {
    label: "Đang giao",
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
  offline: {
    label: "Ngoại tuyến",
    color: "bg-mono-100 text-mono-600 border border-mono-200",
    dot: "bg-mono-400",
  },
};

const ShipperPage: React.FC = () => {
  // States
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedShipper, setSelectedShipper] = useState<Shipper | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [shipperToAssign, setShipperToAssign] = useState<Shipper | null>(null);

  // Stats
  const stats = useMemo(() => {
    return {
      total: shippers.length,
      available: shippers.filter((s) => s.status === "available").length,
      busy: shippers.filter((s) => s.status === "busy").length,
      offline: shippers.filter((s) => s.status === "offline").length,
    };
  }, [shippers]);

  // Fetch shippers
  const fetchShippers = async () => {
    try {
      setLoading(true);
      const res = await adminShipperService.getShippers();
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const data = res.data as any;
      const shipperList = data.data?.shippers || data.shippers || [];

      // Map BE data to FE format - BE returns shipper info in nested `shipper` object
      const shipperData = shipperList.map((s: any) => {
        const shipperInfo = s.shipper || {};
        const isAvailable = shipperInfo.isAvailable === true;
        const activeOrders = shipperInfo.activeOrders || 0;
        const maxOrders = shipperInfo.maxOrders || 20;
        const deliveryStats = shipperInfo.deliveryStats || {
          total: 0,
          successful: 0,
          failed: 0,
        };

        // Determine status based on availability and active orders
        let status: "available" | "busy" | "offline" = "offline";
        if (isAvailable) {
          status = activeOrders >= maxOrders ? "busy" : "available";
        }

        return {
          _id: s._id,
          name: s.name || "Không xác định",
          email: s.email || "",
          phone: s.phone || "",
          avatar: s.avatar,
          createdAt: s.createdAt || new Date().toISOString(),
          shipper: shipperInfo,
          // Computed fields for UI
          status,
          currentOrders: activeOrders,
          maxOrders,
          deliveredCount: deliveryStats.successful || 0,
          successRate:
            deliveryStats.total > 0
              ? Math.round(
                  (deliveryStats.successful / deliveryStats.total) * 100
                )
              : 0,
        };
      });
      /* eslint-enable @typescript-eslint/no-explicit-any */
      setShippers(shipperData);
    } catch (error) {
      toast.error("Không thể tải danh sách shipper");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippers();
  }, []);

  // Filtered shippers
  const filteredShippers = useMemo(() => {
    return shippers.filter((shipper) => {
      const matchSearch =
        shipper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipper.phone.includes(searchTerm) ||
        shipper.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === "all" || shipper.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [shippers, searchTerm, statusFilter]);

  // Open assign modal
  const handleOpenAssignModal = (shipper?: Shipper) => {
    setShipperToAssign(shipper || null);
    setShowAssignModal(true);
  };

  // View shipper details
  const handleViewDetails = (shipper: Shipper) => {
    setSelectedShipper(shipper);
    setShowDetailModal(true);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  // Capacity percentage
  const getCapacityPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  // Capacity color
  const getCapacityColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="p-6 bg-mono-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mono-900">Quản lý Shipper</h1>
          <p className="text-mono-500 text-sm mt-1">
            Quản lý đội ngũ giao hàng và phân công đơn hàng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenAssignModal()}
            className="inline-flex items-center gap-2 bg-mono-900 hover:bg-mono-800 text-white px-4 py-2.5 rounded-lg transition-all font-medium text-sm"
          >
            <FiPackage size={16} />
            Gán đơn hàng
          </button>
          <button
            onClick={fetchShippers}
            className="inline-flex items-center gap-2 bg-white hover:bg-mono-50 text-mono-700 border border-mono-200 px-4 py-2.5 rounded-lg transition-all font-medium text-sm"
          >
            <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-mono-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-mono-100 rounded-lg">
              <FiUser className="text-mono-700" size={20} />
            </div>
            <div>
              <p className="text-xs text-mono-500 font-medium">Tổng shipper</p>
              <p className="text-xl font-bold text-mono-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-mono-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-lg">
              <FiCheckCircle className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-mono-500 font-medium">Sẵn sàng</p>
              <p className="text-xl font-bold text-emerald-600">
                {stats.available}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-mono-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <FiTruck className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-mono-500 font-medium">Đang giao</p>
              <p className="text-xl font-bold text-amber-600">{stats.busy}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-mono-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-mono-100 rounded-lg">
              <FiAlertCircle className="text-mono-500" size={20} />
            </div>
            <div>
              <p className="text-xs text-mono-500 font-medium">Ngoại tuyến</p>
              <p className="text-xl font-bold text-mono-600">{stats.offline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-mono-200 shadow-sm mb-6">
        <div className="p-4 border-b border-mono-100">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, SĐT, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-mono-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mono-200 focus:border-mono-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mono-400 hover:text-mono-600"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                showFilters || statusFilter !== "all"
                  ? "bg-mono-900 text-white border-mono-900"
                  : "bg-white text-mono-700 border-mono-200 hover:bg-mono-50"
              }`}
            >
              <FiFilter size={16} />
              Lọc
              {statusFilter !== "all" && (
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-mono-100">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-mono-600 font-medium mr-2">
                  Trạng thái:
                </span>
                {[
                  { value: "all", label: "Tất cả" },
                  { value: "available", label: "Sẵn sàng" },
                  { value: "busy", label: "Đang giao" },
                  { value: "offline", label: "Ngoại tuyến" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === option.value
                        ? "bg-mono-900 text-white"
                        : "bg-mono-100 text-mono-600 hover:bg-mono-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="px-4 py-3 bg-mono-50/50 flex items-center justify-between text-sm">
          <span className="text-mono-600">
            Hiển thị{" "}
            <span className="font-semibold text-mono-800">
              {filteredShippers.length}
            </span>{" "}
            shipper
          </span>
        </div>
      </div>

      {/* Shipper Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <FiRefreshCw className="animate-spin text-mono-400" size={32} />
            <span className="text-mono-500">Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : filteredShippers.length === 0 ? (
        <div className="bg-white rounded-xl border border-mono-200 p-12 text-center">
          <FiUser className="mx-auto text-mono-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-mono-700 mb-2">
            Không tìm thấy shipper
          </h3>
          <p className="text-mono-500 text-sm">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredShippers.map((shipper) => {
            const capacityPct = getCapacityPercentage(
              shipper.currentOrders,
              shipper.maxOrders
            );
            const statusConfig = STATUS_CONFIG[shipper.status];
            const canAssign =
              shipper.status === "available" &&
              shipper.currentOrders < shipper.maxOrders;

            return (
              <div
                key={shipper._id}
                className="bg-white rounded-xl border border-mono-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-mono-100">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      {shipper.avatar?.url ? (
                        <img
                          src={shipper.avatar.url}
                          alt={shipper.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-mono-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-mono-200 flex items-center justify-center">
                          <FiUser className="text-mono-500" size={20} />
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${statusConfig.dot}`}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-mono-900 truncate">
                        {shipper.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                        {shipper.successRate > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600">
                            <FiCheckCircle size={12} />
                            {shipper.successRate}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions dropdown */}
                    <div className="relative group">
                      <button className="p-1.5 rounded-lg hover:bg-mono-100 text-mono-400 hover:text-mono-600 transition-colors">
                        <FiChevronDown size={16} />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-mono-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                          onClick={() => handleViewDetails(shipper)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-mono-700 hover:bg-mono-50 transition-colors"
                        >
                          <FiEye size={14} />
                          Xem chi tiết
                        </button>
                        {canAssign && (
                          <button
                            onClick={() => handleOpenAssignModal(shipper)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-mono-700 hover:bg-mono-50 transition-colors"
                          >
                            <FiPackage size={14} />
                            Gán đơn hàng
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Contact */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-mono-600">
                      <FiPhone size={14} className="text-mono-400" />
                      <span>{shipper.phone || "Chưa cập nhật"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-mono-600 truncate">
                      <FiMail size={14} className="text-mono-400" />
                      <span className="truncate">
                        {shipper.email || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-mono-500">Đơn hàng đang giao</span>
                      <span className="font-medium text-mono-700">
                        {shipper.currentOrders}/{shipper.maxOrders}
                      </span>
                    </div>
                    <div className="h-1.5 bg-mono-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getCapacityColor(
                          capacityPct
                        )}`}
                        style={{ width: `${Math.min(capacityPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-2 border-t border-mono-100">
                    <div className="flex items-center gap-1.5 text-xs text-mono-500">
                      <FiCheckCircle size={14} className="text-emerald-500" />
                      <span>{shipper.deliveredCount} đã giao</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-mono-500">
                      <FiClock size={14} className="text-mono-400" />
                      <span>Từ {formatDate(shipper.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 bg-mono-50 border-t border-mono-100 flex items-center gap-2">
                  <button
                    onClick={() => handleViewDetails(shipper)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-mono-100 text-mono-700 border border-mono-200 px-3 py-2 rounded-lg transition-all text-xs font-medium"
                  >
                    <FiEye size={14} />
                    Chi tiết
                  </button>
                  {canAssign ? (
                    <button
                      onClick={() => handleOpenAssignModal(shipper)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-mono-900 hover:bg-mono-800 text-white px-3 py-2 rounded-lg transition-all text-xs font-medium"
                    >
                      <FiPackage size={14} />
                      Gán đơn
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-mono-100 text-mono-400 px-3 py-2 rounded-lg text-xs font-medium cursor-not-allowed"
                    >
                      <FiPackage size={14} />
                      {shipper.currentOrders >= shipper.maxOrders
                        ? "Đã đầy"
                        : "Không khả dụng"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedShipper && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-mono-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-mono-900">
                Chi tiết Shipper
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-mono-100 rounded-lg transition-colors"
              >
                <FiX size={20} className="text-mono-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Profile */}
              <div className="flex items-center gap-4 mb-6">
                {selectedShipper.avatar?.url ? (
                  <img
                    src={selectedShipper.avatar.url}
                    alt={selectedShipper.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-mono-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-mono-200 flex items-center justify-center">
                    <FiUser className="text-mono-500" size={32} />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-mono-900">
                    {selectedShipper.name}
                  </h3>
                  <span
                    className={`inline-flex items-center text-sm px-3 py-1 rounded-full mt-2 ${
                      STATUS_CONFIG[selectedShipper.status].color
                    }`}
                  >
                    {STATUS_CONFIG[selectedShipper.status].label}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-mono-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-mono-500 text-sm mb-1">
                    <FiPhone size={14} />
                    Số điện thoại
                  </div>
                  <p className="font-medium text-mono-800">
                    {selectedShipper.phone || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="bg-mono-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-mono-500 text-sm mb-1">
                    <FiMail size={14} />
                    Email
                  </div>
                  <p className="font-medium text-mono-800 truncate">
                    {selectedShipper.email || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="bg-mono-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-mono-500 text-sm mb-1">
                    <FiClock size={14} />
                    Ngày tham gia
                  </div>
                  <p className="font-medium text-mono-800">
                    {formatDate(selectedShipper.createdAt)}
                  </p>
                </div>
                <div className="bg-mono-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-mono-500 text-sm mb-1">
                    <FiTruck size={14} />
                    Tổng đơn đã giao
                  </div>
                  <p className="font-medium text-mono-800">
                    {selectedShipper.shipper?.deliveryStats?.total || 0} đơn
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="border-t border-mono-100 pt-6">
                <h4 className="text-sm font-semibold text-mono-700 mb-4">
                  Thống kê hoạt động
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <p className="text-2xl font-bold text-emerald-600">
                      {selectedShipper.deliveredCount}
                    </p>
                    <p className="text-xs text-emerald-700">Thành công</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl">
                    <p className="text-2xl font-bold text-amber-600">
                      {selectedShipper.currentOrders}
                    </p>
                    <p className="text-xs text-amber-700">Đang giao</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <p className="text-2xl font-bold text-red-600">
                      {selectedShipper.shipper?.deliveryStats?.failed || 0}
                    </p>
                    <p className="text-xs text-red-700">Thất bại</p>
                  </div>
                </div>
              </div>

              {/* Success Rate */}
              <div className="border-t border-mono-100 pt-6 mt-6">
                <h4 className="text-sm font-semibold text-mono-700 mb-3">
                  Tỉ lệ giao hàng thành công
                </h4>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-mono-500">Tỉ lệ thành công</span>
                  <span className="font-medium text-mono-800">
                    {selectedShipper.successRate}%
                  </span>
                </div>
                <div className="h-2.5 bg-mono-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedShipper.successRate >= 80
                        ? "bg-emerald-500"
                        : selectedShipper.successRate >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${selectedShipper.successRate}%`,
                    }}
                  />
                </div>
              </div>

              {/* Capacity */}
              <div className="border-t border-mono-100 pt-6 mt-6">
                <h4 className="text-sm font-semibold text-mono-700 mb-3">
                  Công suất làm việc
                </h4>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-mono-500">Đơn hàng đang giao</span>
                  <span className="font-medium text-mono-800">
                    {selectedShipper.currentOrders}/{selectedShipper.maxOrders}
                  </span>
                </div>
                <div className="h-2.5 bg-mono-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getCapacityColor(
                      getCapacityPercentage(
                        selectedShipper.currentOrders,
                        selectedShipper.maxOrders
                      )
                    )}`}
                    style={{
                      width: `${Math.min(
                        getCapacityPercentage(
                          selectedShipper.currentOrders,
                          selectedShipper.maxOrders
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-mono-100 bg-mono-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-mono-600 hover:text-mono-800 transition-colors"
              >
                Đóng
              </button>
              {selectedShipper.status === "available" &&
                selectedShipper.currentOrders < selectedShipper.maxOrders && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenAssignModal(selectedShipper);
                    }}
                    className="px-4 py-2 bg-mono-900 hover:bg-mono-800 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Gán đơn hàng
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Order Modal */}
      <AssignOrderModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setShipperToAssign(null);
        }}
        preSelectedShipperId={shipperToAssign?._id}
        onAssignSuccess={() => {
          fetchShippers();
          setShowAssignModal(false);
          setShipperToAssign(null);
        }}
      />
    </div>
  );
};

export default ShipperPage;
