import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiUsers,
  FiShield,
  FiUserCheck,
  FiUserX,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
} from "react-icons/fi";
import {
  adminSessionService,
  adminUserService,
} from "../../../services/SessionUserService";
import type { User, UserRole } from "../../../types/user";
import type { Session } from "../../../types/session";
import toast from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";

// Alias cho rõ nghĩa
type Customer = User;

const ROLES: { value: UserRole | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "user", label: "Khách hàng" },
  { value: "staff", label: "Nhân viên" },
  { value: "shipper", label: "Shipper" },
  { value: "admin", label: "Admin" },
];

const ListCustomerPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 10;

  // Role change modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("user");

  // Fetch data
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter === "blocked") params.isBlock = true;
      if (statusFilter === "active") params.isBlock = false;

      const res = await adminUserService.getAllUsers(params);
      // BE trả về: { success, data: [...], total, totalPages, currentPage }
      const responseData = res.data as unknown as {
        data?: Customer[];
        users?: Customer[];
        total?: number;
        totalPages?: number;
      };
      setCustomers(responseData.data || responseData.users || []);
      setTotalUsers(responseData.total || 0);
      setTotalPages(responseData.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Không thể tải danh sách người dùng");
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, roleFilter, statusFilter]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await adminSessionService.getAllSessions();
      const sessionsData = res.data.data?.sessions || res.data.data || [];
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
    } catch {
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchSessions();
  }, [fetchCustomers, fetchSessions]);

  // Filter by search
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helpers
  const getSessionUserId = (user: string | { _id: string }) =>
    typeof user === "object" && user !== null ? user._id : user;

  const getStatusBadge = (customer: Customer) => {
    if (customer.blockedAt)
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mono-200 text-mono-800">
          Đã khóa
        </span>
      );
    if (!customer.isActive)
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mono-100 text-mono-600">
          Ngừng HĐ
        </span>
      );
    if (!customer.isVerified)
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mono-100 text-mono-600">
          Chưa xác thực
        </span>
      );
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mono-100 text-mono-800">
        Hoạt động
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleStyles: Record<string, string> = {
      admin: "bg-mono-900 text-white",
      staff: "bg-mono-600 text-white",
      shipper: "bg-mono-400 text-white",
      user: "bg-mono-200 text-mono-700",
    };
    const roleLabels: Record<string, string> = {
      admin: "Admin",
      staff: "Staff",
      shipper: "Shipper",
      user: "User",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          roleStyles[role] || roleStyles.user
        }`}
      >
        {roleLabels[role] || role}
      </span>
    );
  };

  // Handlers
  const handleLogoutUser = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      await adminSessionService.logoutUser(userId);
      toast.success("Đã đăng xuất người dùng");
      await fetchSessions();
    } catch {
      toast.error("Không thể đăng xuất người dùng");
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleBlockUser = async (customer: Customer) => {
    const isBlocked = !!customer.blockedAt;
    setLoadingUserId(customer._id);
    try {
      await adminUserService.blockUser(customer._id, {
        isBlock: !isBlocked,
        reason: isBlocked ? "" : "Admin khóa tài khoản",
      });
      toast.success(isBlocked ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
      await fetchCustomers();
    } catch {
      toast.error("Không thể thực hiện thao tác");
    } finally {
      setLoadingUserId(null);
    }
  };

  const openRoleModal = (customer: Customer) => {
    setSelectedUser(customer);
    setNewRole(customer.role);
    setShowRoleModal(true);
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
    setLoadingUserId(selectedUser._id);
    try {
      await adminUserService.changeUserRole(selectedUser._id, {
        role: newRole as "user" | "staff" | "shipper",
      });
      toast.success(`Đã chuyển role thành ${newRole}`);
      setShowRoleModal(false);
      await fetchCustomers();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Không thể đổi role");
    } finally {
      setLoadingUserId(null);
    }
  };

  // Stats
  const stats = {
    total: totalUsers,
    admins: customers.filter((c) => c.role === "admin").length,
    staff: customers.filter((c) => c.role === "staff").length,
    shippers: customers.filter((c) => c.role === "shipper").length,
    blocked: customers.filter((c) => c.blockedAt).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-mono-900 flex items-center gap-2">
            <FiUsers className="text-mono-600" />
            Quản lý Người dùng
          </h1>
          <p className="text-mono-500 mt-1">
            Quản lý tài khoản và phân quyền người dùng
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-mono-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mono-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-mono-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mono-900">{stats.total}</p>
              <p className="text-sm text-mono-500">Tổng người dùng</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-mono-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mono-900 rounded-lg flex items-center justify-center">
              <FiShield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mono-900">{stats.admins}</p>
              <p className="text-sm text-mono-500">Admin</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-mono-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mono-600 rounded-lg flex items-center justify-center">
              <FiUserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mono-900">{stats.staff}</p>
              <p className="text-sm text-mono-500">Nhân viên</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-mono-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mono-400 rounded-lg flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mono-900">
                {stats.shippers}
              </p>
              <p className="text-sm text-mono-500">Shipper</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-mono-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mono-200 rounded-lg flex items-center justify-center">
              <FiUserX className="w-5 h-5 text-mono-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mono-900">
                {stats.blocked}
              </p>
              <p className="text-sm text-mono-500">Đã khóa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-mono-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full pl-10 pr-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-400"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-mono-400" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as UserRole | "all");
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-400"
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-400"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="blocked">Đã khóa</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-mono-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mono-900 mx-auto"></div>
            <p className="mt-2 text-mono-500">Đang tải...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-mono-500">
            Không tìm thấy người dùng nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-mono-50 border-b border-mono-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-mono-600 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-mono-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-mono-600 uppercase tracking-wider">
                    SĐT
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-mono-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-mono-600 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-mono-600 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-mono-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mono-100">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-mono-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {customer.avatar?.url ? (
                          <img
                            src={customer.avatar.url}
                            alt={customer.name}
                            className="w-10 h-10 rounded-full object-cover border border-mono-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-mono-200 flex items-center justify-center text-mono-500 font-semibold">
                            {customer.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-mono-900">
                            {customer.name}
                          </p>
                          <p className="text-xs text-mono-500">
                            {new Date(customer.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-mono-700">
                      {customer.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-mono-600">
                      {customer.phone || "-"}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(customer)}</td>
                    <td className="px-4 py-3">{getRoleBadge(customer.role)}</td>
                    <td className="px-4 py-3">
                      {sessions.filter(
                        (s) => getSessionUserId(s.user) === customer._id
                      ).length > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-mono-800 text-white">
                          Online (
                          {
                            sessions.filter(
                              (s) => getSessionUserId(s.user) === customer._id
                            ).length
                          }
                          )
                        </span>
                      ) : (
                        <span className="text-xs text-mono-400">Offline</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* Đăng xuất */}
                        {sessions.some(
                          (s) => getSessionUserId(s.user) === customer._id
                        ) && (
                          <button
                            onClick={() => handleLogoutUser(customer._id)}
                            disabled={loadingUserId === customer._id}
                            className="p-1.5 text-mono-600 hover:bg-mono-100 rounded-lg transition-colors"
                            title="Đăng xuất"
                          >
                            <FiLogOut className="w-4 h-4" />
                          </button>
                        )}

                        {/* Đổi role - chỉ admin và không phải chính mình */}
                        {currentUser?.role === "admin" &&
                          customer._id !== currentUser._id && (
                            <button
                              onClick={() => openRoleModal(customer)}
                              disabled={loadingUserId === customer._id}
                              className="p-1.5 text-mono-600 hover:bg-mono-100 rounded-lg transition-colors"
                              title="Đổi vai trò"
                            >
                              <FiUsers className="w-4 h-4" />
                            </button>
                          )}

                        {/* Khóa/Mở khóa - không thể khóa admin hoặc chính mình */}
                        {customer.role !== "admin" &&
                          customer._id !== currentUser?._id && (
                            <button
                              onClick={() => handleBlockUser(customer)}
                              disabled={loadingUserId === customer._id}
                              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                                customer.blockedAt
                                  ? "bg-mono-100 text-mono-700 hover:bg-mono-200"
                                  : "bg-mono-200 text-mono-800 hover:bg-mono-300"
                              }`}
                            >
                              {loadingUserId === customer._id
                                ? "..."
                                : customer.blockedAt
                                ? "Mở khóa"
                                : "Khóa"}
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-mono-200">
            <p className="text-sm text-mono-600">
              Trang {currentPage} / {totalPages} ({totalUsers} người dùng)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-mono-200 hover:bg-mono-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-mono-900 text-white"
                        : "border border-mono-200 hover:bg-mono-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-mono-200 hover:bg-mono-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-mono-900 mb-4">
              Thay đổi vai trò
            </h3>
            <p className="text-sm text-mono-600 mb-4">
              Đang thay đổi vai trò cho <strong>{selectedUser.name}</strong> (
              {selectedUser.email})
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Vai trò mới
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-400"
              >
                <option value="user">Khách hàng (User)</option>
                <option value="staff">Nhân viên (Staff)</option>
                <option value="shipper">Giao hàng (Shipper)</option>
              </select>
              <p className="text-xs text-mono-500 mt-2">
                ⚠️ Thay đổi role sẽ ảnh hưởng đến quyền truy cập của người dùng
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-sm font-medium text-mono-700 bg-mono-100 rounded-lg hover:bg-mono-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleChangeRole}
                disabled={
                  loadingUserId === selectedUser._id ||
                  newRole === selectedUser.role
                }
                className="px-4 py-2 text-sm font-medium text-white bg-mono-900 rounded-lg hover:bg-mono-800 transition-colors disabled:opacity-50"
              >
                {loadingUserId === selectedUser._id
                  ? "Đang xử lý..."
                  : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListCustomerPage;
