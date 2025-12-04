import { useState } from "react";
import {
  bannerAdminService,
  createImageFormData,
} from "../../../services/BannerService";

interface BannerImageManagerProps {
  bannerId: string;
  currentImage: {
    url: string;
    public_id: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const BannerImageManager: React.FC<BannerImageManagerProps> = ({
  bannerId,
  currentImage,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Vui lòng chơn ẩnh mới");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = createImageFormData(selectedFile);
      await bannerAdminService.updateBannerImage(bannerId, formData);

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Cập nhật ẩnh thểt b?i!";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-mono-300 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md relative text-black">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-mono-500 hover:text-mono-700 text-2xl"
        >
          &times;
        </button>

        <h3 className="text-lg font-bold mb-4 text-center">
          Thay đổi ẩnh Banner
        </h3>

        {/* ẩnh hiện tại */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">
            ẩnh hiện tại:
          </label>
          <div className="flex justify-center">
            <img
              src={currentImage.url}
              alt="Current banner"
              className="h-24 w-auto object-contain border rounded"
            />
          </div>
        </div>

        {/* Upload ẩnh mới */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">
            Chơn ẩnh mới <span className="text-mono-800">*</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full px-3 py-2 border border-mono-300 rounded-md shadow-sm focus:outline-none focus:ring-mono-700 focus:border-mono-700 sm:text-sm"
          />
          <p className="text-xs text-mono-500 mt-1">
            Chỉp nhơn: JPG, PNG, WEBP. Tại đã 5MB. Kích thước khuyện ngh?:
            1920x400px
          </p>
        </div>

        {/* Preview ẩnh mới */}
        {selectedFile && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Xem trước ảnh mới:
            </label>
            <div className="flex justify-center">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="h-24 w-auto object-contain border rounded"
              />
            </div>
            <p className="text-xs text-mono-800 text-center mt-1">
              ✓ Ảnh đã chọn: {selectedFile.name}
            </p>
          </div>
        )}

        {error && <div className="text-mono-800 text-sm mb-4">{error}</div>}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-mono-600 border border-mono-300 rounded-md hover:bg-mono-50 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            className="bg-mono-500 text-white px-4 py-2 rounded-md hover:bg-mono-black transition disabled:opacity-50"
          >
            {loading ? "Đang cập nhật..." : "Cập nhật ảnh"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerImageManager;
