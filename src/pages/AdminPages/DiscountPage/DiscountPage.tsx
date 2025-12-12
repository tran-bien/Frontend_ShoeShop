import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { adminCouponService } from "../../../services/CouponService";
import { useAuth } from "../../../hooks/useAuth";
import type { Coupon, CouponPriority } from "../../../types/coupon";

type Discount = Coupon & {
  id: string;
  currentUses: number;
  status: string;
};

const initialForm = {
  code: "",
  description: "",
  type: "percent" as "percent" | "fixed",
  value: 0,
  maxDiscount: 0,
  minOrderValue: 0,
  startDate: "",
  endDate: "",
  maxUses: 1,
  isPublic: true,
  isRedeemable: false,
  pointCost: 0,
  maxRedeemPerUser: 0,
  priority: "MEDIUM" as CouponPriority,
};

const DiscountPage = () => {
  const { canCreate, canUpdate, canToggleStatus, canDelete } = useAuth();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDiscount, setEditDiscount] = useState<Discount | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await adminCouponService.getAllCoupons();
      const coupons = Array.isArray(res.data.data)
        ? res.data.data
        : res.data.data?.coupons || [];
      setDiscounts(
        coupons.map((c: Coupon) => ({
          _id: c._id,
          id: c._id,
          code: c.code,
          description: c.description,
          type: c.type,
          value: c.value,
          maxDiscount: c.maxDiscount,
          minOrderValue: c.minOrderValue,
          startDate: c.startDate ? c.startDate.slice(0, 10) : "",
          endDate: c.endDate ? c.endDate.slice(0, 10) : "",
          maxUses: c.maxUses,
          currentUses: c.currentUses,
          status: c.status,
          isPublic: c.isPublic,
          createdAt: c.createdAt || "",
          updatedAt: c.updatedAt || "",
          isRedeemable: c.isRedeemable || false,
          pointCost: c.pointCost || 0,
          maxRedeemPerUser: c.maxRedeemPerUser || 0,
          priority: c.priority || "MEDIUM",
        }))
      );
    } catch {
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditDiscount(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (discount: Discount) => {
    setEditDiscount(discount);
    setForm({
      code: discount.code,
      description: discount.description,
      type: discount.type,
      value: discount.value,
      maxDiscount: discount.maxDiscount || 0,
      minOrderValue: discount.minOrderValue,
      startDate: discount.startDate,
      endDate: discount.endDate,
      maxUses: discount.maxUses,
      isPublic: discount.isPublic,
      isRedeemable: discount.isRedeemable || false,
      pointCost: discount.pointCost || 0,
      maxRedeemPerUser: discount.maxRedeemPerUser || 0,
      priority: discount.priority || "MEDIUM",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const data: Partial<Coupon> = {
      code: form.code,
      description: form.description,
      type: form.type,
      value: form.value,
      minOrderValue: form.minOrderValue,
      startDate: form.startDate,
      endDate: form.endDate,
      maxUses: form.maxUses,
      isPublic: form.isPublic,
      isRedeemable: form.isRedeemable,
      pointCost: form.pointCost,
      maxRedeemPerUser: form.maxRedeemPerUser,
      priority: form.priority,
    };
    if (form.type === "percent") {
      data.maxDiscount = form.maxDiscount;
    }
    try {
      if (editDiscount) {
        await adminCouponService.updateCoupon(editDiscount.id, data);
      } else {
        await adminCouponService.createCoupon(data);
      }
      setShowModal(false);
      setEditDiscount(null);
      setForm(initialForm);
      fetchDiscounts();
    } catch {
      alert(
        editDiscount ? "Cập nhật coupon thất bại!" : "Thêm coupon thất bại!"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (discount: Discount) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa coupon này?")) return;
    try {
      await adminCouponService.deleteCoupon(discount.id);
      fetchDiscounts();
    } catch {
      alert("Xóa coupon thất bại!");
    }
  };

  const handleToggleStatus = async (discount: Discount) => {
    const newStatus = discount.status === "active" ? "inactive" : "active";
    try {
      await adminCouponService.updateCouponStatus(discount.id, {
        status: newStatus,
      });
      fetchDiscounts();
    } catch {
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (
      [
        "value",
        "maxDiscount",
        "minOrderValue",
        "maxUses",
        "pointCost",
        "maxRedeemPerUser",
      ].includes(name)
    ) {
      setForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const filteredDiscounts = discounts.filter((d) => {
    const matchSearch =
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-mono-900 text-white",
      inactive: "bg-mono-200 text-mono-700",
      expired: "bg-mono-100 text-mono-500",
      archived: "bg-mono-100 text-mono-400",
    };
    const labels: Record<string, string> = {
      active: "Hoạt động",
      inactive: "Tạm ngừng",
      expired: "Hết hạn",
      archived: "Lưu trữ",
    };
    return (
      <span
        className={`${
          styles[status] || "bg-mono-100 text-mono-600"
        } px-2.5 py-1 rounded-full text-xs font-medium`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      HIGH: "text-mono-900",
      MEDIUM: "text-mono-600",
      LOW: "text-mono-400",
    };
    const labels: Record<string, string> = {
      HIGH: "Cao",
      MEDIUM: "TB",
      LOW: "Thấp",
    };
    return (
      <span className={`text-xs font-medium ${styles[priority] || ""}`}>
        {labels[priority] || ""}
      </span>
    );
  };

  return (
    <div className="p-6 w-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-mono-900">Quản lý Coupon</h2>
          <p className="text-sm text-mono-500 mt-1">
            Quản lý mã giảm giá và khuyến mãi
          </p>
        </div>
        {canCreate() && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-mono-900 hover:bg-mono-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Thêm Coupon
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-mono-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            {!isSearchVisible ? (
              <button
                onClick={() => setIsSearchVisible(true)}
                className="flex items-center gap-2 px-4 py-2 border border-mono-300 bg-white hover:bg-mono-50 text-mono-700 rounded-lg transition-colors"
              >
                <IoIosSearch className="text-lg text-mono-500" />
                <span className="text-sm">Tìm kiếm...</span>
              </button>
            ) : (
              <div className="relative">
                <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo mã hoặc mô tả..."
                  className="w-full pl-10 pr-10 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsSearchVisible(false);
                    setSearchQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mono-400 hover:text-mono-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm ngừng</option>
            <option value="expired">Hết hạn</option>
            <option value="archived">Lưu trữ</option>
          </select>
          <div className="flex items-center gap-2 text-sm text-mono-500">
            <span className="font-medium">{filteredDiscounts.length}</span>
            <span>coupon</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-mono-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="animate-spin h-8 w-8 text-mono-400"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-mono-500 text-sm">Đang tải...</span>
            </div>
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-mono-400">
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <p className="text-lg font-medium">Không có coupon nào</p>
            <p className="text-sm mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Thử thay đổi bộ lọc"
                : "Bắt đầu bằng cách thêm coupon mới"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-mono-50 border-b border-mono-200">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Mã Coupon
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Giảm giá
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Điều kiện
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Thời hạn
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Lượt dùng
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mono-100">
                {filteredDiscounts.map((discount) => (
                  <tr
                    key={discount.id}
                    className="hover:bg-mono-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-mono-900">
                          {discount.code}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {getPriorityBadge(discount.priority)}
                          {discount.isPublic ? (
                            <span className="text-[10px] text-mono-500">
                              Công khai
                            </span>
                          ) : (
                            <span className="text-[10px] text-mono-400">
                              Riêng tư
                            </span>
                          )}
                          {discount.isRedeemable && (
                            <span className="text-[10px] bg-mono-200 text-mono-700 px-1.5 py-0.5 rounded">
                              Đổi điểm
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p
                        className="text-sm text-mono-700 line-clamp-2 max-w-[200px]"
                        title={discount.description}
                      >
                        {discount.description}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-mono-900">
                          {discount.type === "percent"
                            ? `${discount.value}%`
                            : `${discount.value.toLocaleString("vi-VN")}đ`}
                        </span>
                        {discount.type === "percent" &&
                          discount.maxDiscount > 0 && (
                            <span className="text-xs text-mono-500">
                              Tối đa{" "}
                              {discount.maxDiscount.toLocaleString("vi-VN")}đ
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-mono-600">
                        {discount.minOrderValue > 0
                          ? `≥ ${discount.minOrderValue.toLocaleString(
                              "vi-VN"
                            )}đ`
                          : "Không"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-xs text-mono-600">
                        <div>{discount.startDate}</div>
                        <div className="text-mono-400">đến</div>
                        <div>{discount.endDate}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-mono-900">
                          {discount.currentUses}/{discount.maxUses || "∞"}
                        </span>
                        {discount.maxUses && (
                          <div className="w-16 h-1.5 bg-mono-200 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-mono-700 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (discount.currentUses / discount.maxUses) *
                                    100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(discount.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 justify-center">
                        {canUpdate() && (
                          <button
                            onClick={() => openEditModal(discount)}
                            className="p-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        )}
                        {canToggleStatus() && (
                          <button
                            onClick={() => handleToggleStatus(discount)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              discount.status === "active"
                                ? "bg-mono-100 hover:bg-mono-200 text-mono-700"
                                : "bg-mono-50 hover:bg-mono-100 text-mono-600"
                            }`}
                            title={
                              discount.status === "active"
                                ? "Tạm ngừng"
                                : "Kích hoạt"
                            }
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={
                                  discount.status === "active"
                                    ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                    : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                }
                              />
                            </svg>
                          </button>
                        )}
                        {canDelete() && (
                          <button
                            onClick={() => handleDelete(discount)}
                            className="p-1.5 bg-mono-100 hover:bg-mono-200 text-mono-700 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
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
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-mono-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-mono-900">
                {editDiscount ? "Chỉnh sửa Coupon" : "Thêm Coupon mới"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-mono-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-mono-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto max-h-[calc(90vh-140px)]"
            >
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-1.5">
                      Mã coupon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      placeholder="VD: SALE50"
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-1.5">
                      Loại giảm giá
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                    >
                      <option value="percent">Phần trăm (%)</option>
                      <option value="fixed">Số tiền cố định (đ)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1.5">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Mô tả ngắn gọn về coupon..."
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm resize-none"
                    rows={2}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-1.5">
                      Giá trị {form.type === "percent" ? "(%)" : "(đ)"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={form.value}
                      onChange={handleChange}
                      placeholder={
                        form.type === "percent" ? "VD: 10" : "VD: 50000"
                      }
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                      required
                      min={1}
                      max={form.type === "percent" ? 100 : undefined}
                    />
                  </div>
                  {form.type === "percent" && (
                    <div>
                      <label className="block text-sm font-medium text-mono-700 mb-1.5">
                        Giảm tối đa (đ)
                      </label>
                      <input
                        type="number"
                        name="maxDiscount"
                        value={form.maxDiscount}
                        onChange={handleChange}
                        placeholder="VD: 100000"
                        className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                        min={0}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1.5">
                    Đơn tối thiểu (đ)
                  </label>
                  <input
                    type="number"
                    name="minOrderValue"
                    value={form.minOrderValue}
                    onChange={handleChange}
                    placeholder="VD: 200000"
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                    min={0}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-1.5">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-1.5">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-1.5">
                      Số lượt sử dụng tối đa
                    </label>
                    <input
                      type="number"
                      name="maxUses"
                      value={form.maxUses}
                      onChange={handleChange}
                      placeholder="VD: 100"
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-1.5">
                      Độ ưu tiên
                    </label>
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                    >
                      <option value="HIGH">Cao</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="LOW">Thấp</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={form.isPublic}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-mono-300 text-mono-900 focus:ring-mono-500"
                    />
                    <span className="text-sm text-mono-700">Công khai</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isRedeemable"
                      checked={form.isRedeemable}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-mono-300 text-mono-900 focus:ring-mono-500"
                    />
                    <span className="text-sm text-mono-700">Đổi bằng điểm</span>
                  </label>
                </div>
                {form.isRedeemable && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-mono-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-mono-700 mb-1.5">
                        Số điểm cần đổi
                      </label>
                      <input
                        type="number"
                        name="pointCost"
                        value={form.pointCost}
                        onChange={handleChange}
                        placeholder="VD: 500"
                        className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mono-700 mb-1.5">
                        Giới hạn đổi/người
                      </label>
                      <input
                        type="number"
                        name="maxRedeemPerUser"
                        value={form.maxRedeemPerUser}
                        onChange={handleChange}
                        placeholder="0 = không giới hạn"
                        className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                        min={0}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-mono-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-mono-700 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-mono-900 hover:bg-mono-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  )}
                  {editDiscount ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountPage;
