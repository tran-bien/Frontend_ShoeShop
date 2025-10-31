import React, { useState } from "react";
import {
  bannerAdminService,
  Banner,
  UpdateBannerData,
} from "../../../services/BannerService";

interface EditBannerProps {
  banner: Banner;
  onClose: () => void;
  onSuccess: () => void;
}

const EditBanner: React.FC<EditBannerProps> = ({
  banner,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<UpdateBannerData>({
    title: banner.title,
    displayOrder: banner.displayOrder,
    link: banner.link || "",
    isActive: banner.isActive,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "displayOrder"
          ? parseInt(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await bannerAdminService.updateBanner(banner._id, formData);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Cập nhật banner thất bại!";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-mono-300 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg relative text-black">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-mono-500 hover:text-mono-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">Cập nhật Banner</h2>

        {/* Hiển thị ảnh hiện tại */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">
            Ảnh hiện tại:
          </label>
          <img
            src={banner.image.url}
            alt={banner.title}
            className="h-20 w-auto border rounded mx-auto"
          />
          <p className="text-xs text-mono-500 text-center mt-1">
            Để thay đổi ảnh, vui lòng sử dụng chức năng "Thay đổi ảnh" trong
            danh sách banner
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-black">
              Tiêu đề banner <span className="text-mono-800">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Nhập tiêu đề cho banner"
              className="mt-1 block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              Vị trí hiển thị <span className="text-mono-800">*</span>
            </label>
            <select
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
            >
              <option value={1}>Vị trí 1</option>
              <option value={2}>Vị trí 2</option>
              <option value={3}>Vị trí 3</option>
              <option value={4}>Vị trí 4</option>
              <option value={5}>Vị trí 5</option>
            </select>
            <p className="text-xs text-mono-500 mt-1">
              Vị trí hiện tại: {banner.displayOrder} (tối đa 5 banners)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              Đường dẫn (không bắt buộc)
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://example.com hoặc /products"
              className="mt-1 block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
            />
            <p className="text-xs text-mono-500 mt-1">
              Khi người dùng click vào banner sẽ chuyển đến đường dẫn này
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-mono-900 focus:ring-mono-700 border-mono-300 rounded"
            />
            <label className="ml-2 block text-sm text-black">
              Banner đang hoạt động
            </label>
          </div>

          {error && <div className="text-mono-800 text-sm">{error}</div>}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-mono-600 border border-mono-300 rounded-md hover:bg-mono-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-mono-500 text-white px-4 py-2 rounded-md hover:bg-mono-black transition disabled:opacity-50"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBanner;
