import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { discountApi } from "../../../services/DiscountService";
import AddDiscount from "./AddDiscount";

interface Discount {
  id: string;
  code: string;
  description: string;
  type: string;
  value: number;
  maxDiscount?: number;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  maxUses: number;
  currentUses: number;
  status: string;
  isPublic: boolean;
}

const initialForm: Omit<Discount, "id" | "currentUses" | "status"> = {
  code: "",
  description: "",
  type: "percent",
  value: 0,
  maxDiscount: 0,
  minOrderValue: 0,
  startDate: "",
  endDate: "",
  maxUses: 1,
  isPublic: true,
};

const DiscountPage = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editDiscount, setEditDiscount] = useState<Discount | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const res = await discountApi.getAllAdminCoupons();
      const coupons = res.data.coupons || res.data.data || [];
      setDiscounts(
        coupons.map((c: any) => ({
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
        }))
      );
    } catch {
      setDiscounts([]);
    }
  };

  // Sửa
  const handleEditDiscount = (discount: Discount) => {
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
    });
    setShowEdit(true);
  };

  const handleUpdateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDiscount) return;
    const data: any = {
      code: form.code,
      description: form.description,
      type: form.type,
      value: form.value,
      minOrderValue: form.minOrderValue,
      startDate: form.startDate,
      endDate: form.endDate,
      maxUses: form.maxUses,
      isPublic: form.isPublic,
    };
    if (form.type === "percent") {
      data.maxDiscount = form.maxDiscount;
    }
    try {
      await discountApi.updateAdminCoupon(editDiscount.id, data);
      setShowEdit(false);
      setEditDiscount(null);
      setForm(initialForm);
      fetchDiscounts();
    } catch {
      alert("Cập nhật coupon thất bại!");
    }
  };

  // Xóa
  const handleDeleteDiscount = async (discount: Discount) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa coupon này?")) return;
    try {
      await discountApi.deleteAdminCoupon(discount.id);
      fetchDiscounts();
    } catch {
      alert("Xóa coupon thất bại!");
    }
  };

  // Đổi trạng thái
  const handleUpdateStatus = async (discount: Discount, status: string) => {
    try {
      await discountApi.updateAdminCouponStatus(discount.id, status);
      fetchDiscounts();
    } catch {
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  // Form change
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
      name === "value" ||
      name === "maxDiscount" ||
      name === "minOrderValue" ||
      name === "maxUses"
    ) {
      setForm((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Lọc theo tìm kiếm
  const filteredDiscounts = discounts.filter(
    (d) =>
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 w-full font-sans">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight leading-snug">
          Danh Sách Coupon
        </h2>
        {!isSearchVisible ? (
          <button
            onClick={() => setIsSearchVisible(true)}
            className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 px-5 py-2 rounded-3xl shadow transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 active:bg-gray-200"
          >
            <IoIosSearch className="text-xl text-gray-500" />
            <span className="font-medium">Tìm kiếm</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 w-full max-w-md">
            <IoIosSearch
              onClick={() => {
                setIsSearchVisible(false);
                setSearchQuery("");
              }}
              className="text-gray-400 cursor-pointer text-xl"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã hoặc mô tả..."
              className="w-full px-4 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}
      </div>
      <div className="flex border-b mb-4">
        <button
          className="ml-auto px-4 py-2 bg-slate-500 text-white rounded-3xl font-medium"
          onClick={() => {
            setShowAdd(true);
            setForm(initialForm);
          }}
        >
          Thêm Coupon
        </button>
      </div>
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-md overflow-hidden border">
          <thead className="bg-gray-50 text-gray-700 text-sm font-semibold uppercase">
            <tr>
              <th className="py-3 px-4 text-center border-b">Mã</th>
              <th className="py-3 px-4 text-center border-b">Mô tả</th>
              <th className="py-3 px-4 text-center border-b">Loại</th>
              <th className="py-3 px-4 text-center border-b">Giá trị</th>
              <th className="py-3 px-4 text-center border-b">Giảm tối đa</th>
              <th className="py-3 px-4 text-center border-b">Đơn tối thiểu</th>
              <th className="py-3 px-4 text-center border-b">Ngày bắt đầu</th>
              <th className="py-3 px-4 text-center border-b">Ngày kết thúc</th>
              <th className="py-3 px-4 text-center border-b">Lượt dùng</th>
              <th className="py-3 px-4 text-center border-b">Tối đa</th>
              <th className="py-3 px-4 text-center border-b">Trạng thái</th>
              <th className="py-3 px-4 text-center border-b">Công khai</th>
              <th className="py-3 px-4 text-center border-b">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredDiscounts.map((discount) => (
              <tr key={discount.id} className="hover:bg-gray-50 border-t">
                <td className="py-2 px-4 border-b text-center">
                  {discount.code}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.description}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.type === "percent" ? "Phần trăm" : "Cố định"}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.type === "percent"
                    ? `${discount.value}%`
                    : `${discount.value.toLocaleString()}đ`}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.type === "percent"
                    ? discount.maxDiscount?.toLocaleString()
                    : "-"}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.minOrderValue.toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.startDate}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.endDate}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.currentUses}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.maxUses}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.status === "active" ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                      Đang hoạt động
                    </span>
                  ) : (
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
                      Ngừng
                    </span>
                  )}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.isPublic ? "Có" : "Không"}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <button
                      onClick={() => handleEditDiscount(discount)}
                      className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteDiscount(discount)}
                      className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                    >
                      Xóa
                    </button>
                    <button
                      className={`text-xs px-2 py-1 rounded-full ${
                        discount.status === "active"
                          ? "bg-yellow-400 hover:bg-yellow-500 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                      onClick={() =>
                        handleUpdateStatus(
                          discount,
                          discount.status === "active" ? "inactive" : "active"
                        )
                      }
                    >
                      {discount.status === "active" ? "Ngừng" : "Kích hoạt"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm */}
      {showAdd && (
        <AddDiscount
          handleClose={() => {
            setShowAdd(false);
            fetchDiscounts();
          }}
        />
      )}

      {/* Modal Sửa */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md relative text-black overflow-y-auto max-h-[90vh]">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-6 text-center">Sửa Coupon</h3>
            <form onSubmit={handleUpdateDiscount}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Mã coupon
                </label>
                <input
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  name="code"
                  placeholder="Mã coupon"
                  value={form.code}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Mô tả
                </label>
                <textarea
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  name="description"
                  placeholder="Mô tả"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Loại giảm giá
                </label>
                <select
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="percent">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Giá trị
                </label>
                <input
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  name="value"
                  type="number"
                  placeholder={
                    form.type === "percent" ? "Giá trị (%)" : "Số tiền giảm"
                  }
                  value={form.value}
                  onChange={handleChange}
                  required
                  min={1}
                />
              </div>
              {form.type === "percent" && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-600">
                    Giảm tối đa (VND)
                  </label>
                  <input
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    name="maxDiscount"
                    type="number"
                    placeholder="Giảm tối đa"
                    value={form.maxDiscount}
                    onChange={handleChange}
                    min={0}
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Đơn tối thiểu (VND)
                </label>
                <input
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  name="minOrderValue"
                  type="number"
                  placeholder="Đơn tối thiểu"
                  value={form.minOrderValue}
                  onChange={handleChange}
                  min={0}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Ngày bắt đầu
                </label>
                <input
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Ngày kết thúc
                </label>
                <input
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Số lượt sử dụng tối đa
                </label>
                <input
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  name="maxUses"
                  type="number"
                  placeholder="Số lượt sử dụng tối đa"
                  value={form.maxUses}
                  onChange={handleChange}
                  min={1}
                />
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={form.isPublic}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Công khai</span>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md"
                >
                  Hủy
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
