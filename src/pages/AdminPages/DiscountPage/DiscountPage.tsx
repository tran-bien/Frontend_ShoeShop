import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { adminCouponService } from "../../../services/CouponService";
import AddDiscount from "./AddDiscount";
import { useAuth } from "../../../hooks/useAuth";
import type { Coupon } from "../../../types/coupon";

// Alias for better semantics
type Discount = Coupon & {
  id: string;
  currentUses: number;
  status: string;
};

const initialForm: Omit<
  Discount,
  | "id"
  | "currentUses"
  | "status"
  | "_id"
  | "usedBy"
  | "isActive"
  | "createdAt"
  | "updatedAt"
> = {
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
  const { canCreate, canUpdate, canToggleStatus, canDelete } = useAuth();
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
      const res = await adminCouponService.getAllCoupons();
      const coupons = res.data.data?.coupons || [];
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
        }))
      );
    } catch {
      setDiscounts([]);
    }
  };

  // S?a
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
    };
    if (form.type === "percent") {
      data.maxDiscount = form.maxDiscount;
    }
    try {
      await adminCouponService.updateCoupon(editDiscount.id, data);
      setShowEdit(false);
      setEditDiscount(null);
      setForm(initialForm);
      fetchDiscounts();
    } catch {
      alert("C?p nh?t coupon th?t b?i!");
    }
  };

  // Xóa
  const handleDeleteDiscount = async (discount: Discount) => {
    if (!window.confirm("B?n ch?c ch?n mu?n xóa coupon này?")) return;
    try {
      await adminCouponService.deleteCoupon(discount.id);
      fetchDiscounts();
    } catch {
      alert("Xóa coupon th?t b?i!");
    }
  };

  // Ð?i tr?ng thái
  const handleUpdateStatus = async (
    discount: Discount,
    status: "active" | "inactive" | "archived"
  ) => {
    try {
      await adminCouponService.updateCouponStatus(discount.id, { status });
      fetchDiscounts();
    } catch {
      alert("C?p nh?t tr?ng thái th?t b?i!");
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

  // L?c theo tìm ki?m
  const filteredDiscounts = discounts.filter(
    (d) =>
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 w-full font-sans">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-mono-800 tracking-tight leading-snug">
          Danh Sách Coupon
        </h2>
        {!isSearchVisible ? (
          <button
            onClick={() => setIsSearchVisible(true)}
            className="flex items-center gap-2 border border-mono-300 bg-white hover:bg-mono-100 text-mono-700 px-5 py-2 rounded-3xl shadow transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-mono-400 active:bg-mono-200"
          >
            <IoIosSearch className="text-xl text-mono-500" />
            <span className="font-medium">Tìm ki?m</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 w-full max-w-md">
            <IoIosSearch
              onClick={() => {
                setIsSearchVisible(false);
                setSearchQuery("");
              }}
              className="text-mono-400 cursor-pointer text-xl"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã ho?c mô t?..."
              className="w-full px-4 py-2 border border-mono-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-mono-600"
            />
          </div>
        )}
      </div>
      <div className="flex border-b mb-4">
        {canCreate() && (
          <button
            className="ml-auto px-4 py-2 bg-slate-500 text-white rounded-3xl font-medium"
            onClick={() => {
              setShowAdd(true);
              setForm(initialForm);
            }}
          >
            Thêm Coupon
          </button>
        )}
      </div>
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-md overflow-hidden border">
          <thead className="bg-mono-50 text-mono-700 text-sm font-semibold uppercase">
            <tr>
              <th className="py-3 px-4 text-center border-b">Mã</th>
              <th className="py-3 px-4 text-center border-b">Mô t?</th>
              <th className="py-3 px-4 text-center border-b">Lo?i</th>
              <th className="py-3 px-4 text-center border-b">Giá tr?</th>
              <th className="py-3 px-4 text-center border-b">Gi?m t?i da</th>
              <th className="py-3 px-4 text-center border-b">Ðon t?i thi?u</th>
              <th className="py-3 px-4 text-center border-b">Ngày b?t d?u</th>
              <th className="py-3 px-4 text-center border-b">Ngày k?t thúc</th>
              <th className="py-3 px-4 text-center border-b">Lu?t dùng</th>
              <th className="py-3 px-4 text-center border-b">T?i da</th>
              <th className="py-3 px-4 text-center border-b">Tr?ng thái</th>
              <th className="py-3 px-4 text-center border-b">Công khai</th>
              <th className="py-3 px-4 text-center border-b">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredDiscounts.map((discount) => (
              <tr key={discount.id} className="hover:bg-mono-50 border-t">
                <td className="py-2 px-4 border-b text-center">
                  {discount.code}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.description}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.type === "percent" ? "Ph?n tram" : "C? d?nh"}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.type === "percent"
                    ? `${discount.value}%`
                    : `${discount.value.toLocaleString()}d`}
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
                      Ðang ho?t d?ng
                    </span>
                  ) : (
                    <span className="bg-mono-200 text-mono-700 px-2 py-1 rounded-full text-xs font-semibold">
                      Ng?ng
                    </span>
                  )}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {discount.isPublic ? "Có" : "Không"}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    {canUpdate() && (
                      <button
                        onClick={() => handleEditDiscount(discount)}
                        className="inline-flex items-center justify-center bg-mono-500 hover:bg-mono-black text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                      >
                        S?a
                      </button>
                    )}
                    {canDelete() && (
                      <button
                        onClick={() => handleDeleteDiscount(discount)}
                        className="inline-flex items-center justify-center bg-mono-800 hover:bg-mono-900 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                      >
                        Xóa
                      </button>
                    )}
                    {canToggleStatus() && (
                      <button
                        className={`text-xs px-2 py-1 rounded-full ${
                          discount.status === "active"
                            ? "bg-yellow-400 hover:bg-yellow-500 text-white"
                            : "bg-mono-700 hover:bg-mono-800 text-white"
                        }`}
                        onClick={() =>
                          handleUpdateStatus(
                            discount,
                            discount.status === "active" ? "inactive" : "active"
                          )
                        }
                      >
                        {discount.status === "active" ? "Ng?ng" : "Kích ho?t"}
                      </button>
                    )}
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

      {/* Modal S?a */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md relative text-black overflow-y-auto max-h-[90vh]">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="absolute top-2 right-2 text-mono-500 hover:text-mono-700 text-2xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-6 text-center">S?a Coupon</h3>
            <form onSubmit={handleUpdateDiscount}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-mono-600">
                  Mã coupon
                </label>
                <input
                  className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
                  name="code"
                  placeholder="Mã coupon"
                  value={form.code}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-mono-600">
                  Mô t?
                </label>
                <textarea
                  className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
                  name="description"
                  placeholder="Mô t?"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-mono-600">
                  Lo?i gi?m giá
                </label>
                <select
                  className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="percent">Ph?n tram (%)</option>
                  <option value="fixed">S? ti?n c? d?nh</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-mono-600">
                  Giá tr?
                </label>
                <input
                  className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
                  name="value"
                  type="number"
                  placeholder={
                    form.type === "percent" ? "Giá tr? (%)" : "S? ti?n gi?m"
                  }
                  value={form.value}
                  onChange={handleChange}
                  required
                  min={1}
                />
              </div>
              {form.type === "percent" && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-mono-600">
                    Gi?m t?i da (VND)
                  </label>
                  <input
                    className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
                    name="maxDiscount"
                    type="number"
                    placeholder="Gi?m t?i da"
                    value={form.maxDiscount}
                    onChange={handleChange}
                    min={0}
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-bold text-mono-600">
                  Ðon t?i thi?u (VND)
                </label>
                <input
                  className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
                  name="minOrderValue"
                  type="number"
                  placeholder="Ðon t?i thi?u"
                  value={form.minOrderValue}
                  onChange={handleChange}
                  min={0}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-mono-600">
                  Ngày b?t d?u
                </label>
                <input
                  className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-mono-600">
                  Ngày k?t thúc
                </label>
                <input
                  className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-mono-600">
                  S? lu?t s? d?ng t?i da
                </label>
                <input
                  className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
                  name="maxUses"
                  type="number"
                  placeholder="S? lu?t s? d?ng t?i da"
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
                <span className="text-sm text-mono-700">Công khai</span>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  className="bg-mono-500 hover:bg-mono-black text-white px-6 py-2 rounded-md"
                >
                  Luu
                </button>
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="bg-mono-200 hover:bg-mono-300 text-mono-700 px-6 py-2 rounded-md"
                >
                  H?y
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
