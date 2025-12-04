import React, { useState } from "react";
import {
  bannerAdminService,
  CreateBannerData,
  createBannerFormData,
} from "../../../services/BannerService";

interface AddBannerProps {
  handleClose: () => void;
  onSuccess?: () => void;
}

const AddBanner: React.FC<AddBannerProps> = ({ handleClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    displayOrder: 1,
    link: "",
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Ki?m tra kích thước file (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước ẩnh không được vu?t quá 5MB");
        return;
      }

      // Ki?m tra lo?i file
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chơn file ẩnh");
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Vui lòng chơn ẩnh banner");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createData: CreateBannerData = {
        ...formData,
        banner: selectedFile,
      };

      const formDataToSend = createBannerFormData(createData);
      await bannerAdminService.createBanner(formDataToSend);

      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Thêm banner thểt b?i!";
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
          onClick={handleClose}
          className="absolute top-2 right-2 text-mono-500 hover:text-mono-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">Thêm Banner Mới</h2>
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
              Chọn vị trí banner sẽ xuất hiện trên trang chủ (tối đa 5 banners)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              Ðuẩng đến (không bắt buộc)
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://example.com ho?c /products"
              className="mt-1 block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
            />
            <p className="text-xs text-mono-500 mt-1">
              Khi người dùng click vào banner số chuyện đến đường đến này
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              ẩnh banner <span className="text-mono-800">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
            />
            <p className="text-xs text-mono-500 mt-1">
              Chấp nhận: JPG, PNG, WEBP. Tối đa 5MB. Kích thước khuyến nghị:
              1920x400px
            </p>
            {selectedFile && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="h-20 w-auto border rounded"
                />
                <p className="text-xs text-mono-800 mt-1">
                  Ảnh đã chọn: {selectedFile.name}
                </p>
              </div>
            )}
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
              Hiển thị ngay
            </label>
          </div>

          {error && <div className="text-mono-800 text-sm">{error}</div>}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-mono-600 border border-mono-300 rounded-md hover:bg-mono-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-mono-500 text-white px-4 py-2 rounded-md hover:bg-mono-black transition disabled:opacity-50"
            >
              {loading ? "Đang thêm..." : "Thêm Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBanner;
