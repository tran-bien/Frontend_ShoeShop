import { useState, useEffect } from "react";
import { productImageService } from "../../../services/ImageService";
import { useAuth } from "../../../hooks/useAuth";

const ProductImagesManager = ({ productId, images, reloadImages }: any) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [localImages, setLocalImages] = useState(images);
  const { canManageImages } = useAuth();

  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Vui lòng chọn ít nhất một ảnh!");
      return;
    }
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append("images", file);
    });
    await productImageService.uploadImages(productId, formData);
    setSelectedFiles(null);
    reloadImages();
  };

  const handleRemove = async (imageId: string) => {
    await productImageService.removeImages(productId, [imageId]);
    reloadImages();
  };

  const handleSetMain = async (imageId: string) => {
    await productImageService.setMainImage(productId, imageId);
    reloadImages();
  };

  // Đổi vị trí ảnh trong localImages
  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= localImages.length) return;
    const updated = [...localImages];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setLocalImages(updated);
  };

  // Gửi thứ tự mới lên server
  const handleReorder = async () => {
    const imageOrders = localImages.map((img: any, idx: number) => ({
      _id: img._id,
      displayOrder: idx,
    }));
    await productImageService.reorderImages(productId, imageOrders);
    reloadImages();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-xl text-black">
      <h3 className="text-lg font-bold mb-4">
        {canManageImages() ? "Quản Lý Ảnh Sản Phẩm" : "Xem Ảnh Sản Phẩm"}
      </h3>
      {canManageImages() && (
        <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
          <input
            type="file"
            accept="image/*"
            name="images"
            multiple
            onChange={(e) => setSelectedFiles(e.target.files)}
            className="block border border-mono-300 rounded px-2 py-1"
          />
          <button
            onClick={handleUpload}
            className="bg-mono-500 text-white px-4 py-2 rounded hover:bg-mono-black transition"
          >
            Tải ảnh lên
          </button>
        </div>
      )}
      <div className="flex gap-3 mt-2 flex-wrap">
        {localImages.map((img: any, idx: number) => (
          <div
            key={img._id}
            className="relative flex flex-col items-center bg-mono-50 rounded-lg p-2 shadow border"
          >
            <img
              src={img.url}
              alt=""
              className="h-24 w-24 object-cover border rounded mb-2"
            />
            {canManageImages() && (
              <div className="flex gap-1 mb-1">
                <button
                  disabled={idx === 0}
                  className="px-2 py-1 bg-mono-200 rounded text-xs"
                  onClick={() => moveImage(idx, idx - 1)}
                  title="Lên"
                >
                  ↑
                </button>
                <button
                  disabled={idx === localImages.length - 1}
                  className="px-2 py-1 bg-mono-200 rounded text-xs"
                  onClick={() => moveImage(idx, idx + 1)}
                  title="Xuống"
                >
                  ↓
                </button>
              </div>
            )}
            {canManageImages() && (
              <button
                className="bg-mono-800 hover:bg-mono-900 text-white px-2 py-1 rounded text-xs mb-1"
                onClick={() => handleRemove(img._id)}
              >
                Xóa
              </button>
            )}
            {canManageImages() && !img.isMain && (
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                onClick={() => handleSetMain(img._id)}
              >
                Đặt làm chính
              </button>
            )}
            {img.isMain && (
              <span className="text-mono-800 font-semibold text-xs">Main</span>
            )}
          </div>
        ))}
      </div>
      {canManageImages() && (
        <button
          className="mt-4 px-4 py-2 bg-mono-500 text-white rounded hover:bg-mono-black transition"
          onClick={handleReorder}
          disabled={localImages.length < 2}
        >
          Lưu thứ tự ảnh
        </button>
      )}
    </div>
  );
};

export default ProductImagesManager;
