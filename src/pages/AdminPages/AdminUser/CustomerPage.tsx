import React, { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { sessionUserApi } from "../../../services/SessionUserService";

// Định nghĩa kiểu dữ liệu user từ API
interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: { url?: string };
  role: string;
  isActive: boolean;
  isVerified: boolean;
  blockedAt?: string | null;
}

interface Session {
  _id: string;
  user: string | { _id: string; name: string; email: string; role: string };
  userAgent: string;
  ip: string;
  createdAt: string;
  device?: {
    browser?: {
      name?: string;
    };
  };
}

const ListCustomerPage: React.FC = () => {
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchCustomers(), fetchSessions()]);
  };

  const fetchCustomers = async () => {
    try {
      const res = await sessionUserApi.getAllUsers();
      setCustomers(res.data.users || res.data.data || []);
    } catch {
      setCustomers([]);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await sessionUserApi.getAllSessions();
      setSessions(res.data.sessions || res.data.data || []);
    } catch {
      setSessions([]);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSearchVisibility = () => setIsSearchVisible(true);
  const handleBack = () => {
    setIsSearchVisible(false);
    setSearchQuery("");
  };

  const getSessionUserId = (user: any) =>
    typeof user === "object" && user !== null ? user._id : user;

  const getStatus = (customer: Customer) => {
    if (customer.blockedAt)
      return (
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
          Đã khóa
        </span>
      );
    if (!customer.isActive)
      return (
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
          Ngừng hoạt động
        </span>
      );
    if (!customer.isVerified)
      return (
        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">
          Chưa xác thực
        </span>
      );
    return (
      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
        Đang hoạt động
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    if (role === "admin")
      return (
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
          Admin
        </span>
      );
    return (
      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
        User
      </span>
    );
  };

  const handleLogoutUser = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      await sessionUserApi.logoutUser(userId);
      await fetchSessions();
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleBlockUser = async (customer: Customer) => {
    const isBlocked = !!customer.blockedAt;
    let reason = "";
    setLoadingUserId(customer._id);
    try {
      await sessionUserApi.blockUser(customer._id, !isBlocked, reason);
      await fetchCustomers();
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div className="p-6 w-full ">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight leading-snug font-sans">
          Danh Sách Khách Hàng
        </h2>

        {!isSearchVisible ? (
          <button
            onClick={toggleSearchVisibility}
            className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 px-5 py-2 rounded-3xl shadow transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 active:bg-gray-200"
          >
            <IoIosSearch className="text-xl text-gray-500" />
            <span className="font-medium">Tìm kiếm</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 w-full max-w-md">
            <IoIosSearch
              onClick={handleBack}
              className="text-gray-400 cursor-pointer text-xl"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-md overflow-hidden border">
          <thead className="bg-gray-50 text-gray-700 text-sm font-semibold uppercase">
            <tr>
              <th className="py-3 px-4 text-left border-b">ID</th>
              <th className="py-3 px-4 text-left border-b">Avatar</th>
              <th className="py-3 px-4 text-left border-b">Tên Khách Hàng</th>
              <th className="py-3 px-4 text-left border-b">Email</th>
              <th className="py-3 px-4 text-left border-b">Số ĐT</th>
              <th className="py-3 px-4 text-left border-b">Trạng thái</th>
              <th className="py-3 px-4 text-left border-b">Vai trò</th>
              <th className="py-3 px-4 text-left border-b">Session</th>
              <th className="py-3 px-4 text-left border-b">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer._id} className="hover:bg-gray-50 border-t">
                <td className="px-4 py-3 text-sm">{customer._id}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    {customer.avatar?.url ? (
                      <img
                        src={customer.avatar.url}
                        alt={customer.name}
                        className="h-10 w-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="h-10 w-10 flex items-center justify-center bg-gray-200 rounded-full text-gray-500">
                        ?
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {customer.name}
                </td>
                <td className="px-4 py-3 text-sm">{customer.email}</td>
                <td className="px-4 py-3 text-sm">{customer.phone || "-"}</td>
                <td className="px-4 py-3">{getStatus(customer)}</td>
                <td className="px-4 py-3">{getRoleBadge(customer.role)}</td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {sessions.filter(
                    (s) => getSessionUserId(s.user) === customer._id
                  ).length > 0 ? (
                    <>
                      {sessions
                        .filter(
                          (s) => getSessionUserId(s.user) === customer._id
                        )
                        .map((s) => (
                          <div key={s._id} className="mb-1">
                            <span className="text-xs">
                              {s.device?.browser?.name || "Unknown"} - {s.ip}{" "}
                              <br />
                              {new Date(s.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                    </>
                  ) : (
                    <span className="text-gray-400">Không có session</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    {sessions.some(
                      (s) => getSessionUserId(s.user) === customer._id
                    ) && (
                      <button
                        className="inline-flex items-center justify-center bg-blue-400 hover:bg-blue-400 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={loadingUserId === customer._id}
                        onClick={() => handleLogoutUser(customer._id)}
                      >
                        {loadingUserId === customer._id ? (
                          <span className="animate-pulse">
                            Đang đăng xuất...
                          </span>
                        ) : (
                          "Đăng xuất"
                        )}
                      </button>
                    )}

                    <button
                      className={`inline-flex items-center justify-center text-xs px-3 py-1 rounded-full shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                        customer.blockedAt
                          ? "bg-green-300 hover:bg-green-300 text-white"
                          : "bg-gray-400 hover:bg-gray-400 text-white"
                      }`}
                      disabled={loadingUserId === customer._id}
                      onClick={() => handleBlockUser(customer)}
                    >
                      {loadingUserId === customer._id ? (
                        <span className="animate-pulse">Đang xử lý...</span>
                      ) : customer.blockedAt ? (
                        "Mở khóa"
                      ) : (
                        "Khóa"
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListCustomerPage;
