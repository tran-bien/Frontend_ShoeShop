import { useState } from "react";
import { adminCouponService } from "../../../services/CouponService";

interface AddDiscountProps {
  handleClose: () => void;
}

const initialForm = {
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

const AddDiscount: React.FC<AddDiscountProps> = ({ handleClose }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
      await adminCouponService.createCoupon(data);
      handleClose();
    } catch (err) {
      setError("Thêm phi?u giảm giá thểt b?i!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-mono-300 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md relative text-black overflow-y-auto max-h-[90vh]">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-2 right-2 text-mono-500 hover:text-mono-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">Thêm Coupon</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-mono-600">
              Mã coupon
            </label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="Nhập mã coupon"
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-mono-600">
              Mô t?
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Nhập mô t?"
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-mono-600">
              Lo?i giảm giá
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
            >
              <option value="percent">Phần tram (%)</option>
              <option value="fixed">Số tiền c? đếnh</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-mono-600">
              Giá trở
            </label>
            <input
              type="number"
              name="value"
              value={form.value}
              onChange={handleChange}
              placeholder={
                form.type === "percent" ? "Giá trở (%)" : "Số tiền giảm"
              }
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
              required
              min={1}
            />
          </div>
          {form.type === "percent" && (
            <div className="mb-4">
              <label className="block text-sm font-bold text-mono-600">
                Giảm tại đã (VND)
              </label>
              <input
                type="number"
                name="maxDiscount"
                value={form.maxDiscount}
                onChange={handleChange}
                placeholder="Giảm tối đa"
                className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
                min={0}
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-bold text-mono-600">
              Đơn tối thiểu (VND)
            </label>
            <input
              type="number"
              name="minOrderValue"
              value={form.minOrderValue}
              onChange={handleChange}
              placeholder="Đơn tối thiểu"
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
              min={0}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-mono-600">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-mono-600">
              Ngày k?t thúc
            </label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-mono-600">
              Số lu?t sử dụng tại da
            </label>
            <input
              type="number"
              name="maxUses"
              value={form.maxUses}
              onChange={handleChange}
              placeholder="Số lu?t sử dụng tại da"
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
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
          {error && <div className="text-mono-800 text-sm mb-2">{error}</div>}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-mono-700 hover:bg-mono-800 text-white px-6 py-2 rounded-md"
            >
              {loading ? "Đang thêm..." : "Thêm"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="bg-mono-200 hover:bg-mono-300 text-mono-700 px-6 py-2 rounded-md"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDiscount;
