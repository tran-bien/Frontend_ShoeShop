import { useState, useEffect, useRef } from "react";
import { brandImageService } from "../../../services/ImageService";
import { adminBrandService } from "../../../services/BrandService";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-hot-toast";
import defaultImage from "../../../assets/image_df.png";

interface BrandLogoManagerProps {
  brandId: string;
  logo?: { url: string; public_id: string } | null;
  reloadBrand: () => void;
}

const BrandLogoManager = ({ brandId, reloadBrand }: BrandLogoManagerProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logo, setLogo] = useState<{ url: string; public_id: string } | null>(
    null
  );
  const [uploading, setUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { canManageImages } = useAuth();

  const fetchBrandLogo = async () => {
    try {
      const res = await adminBrandService.getById(brandId);
      setLogo(res.data.brand?.logo ?? res.data.data?.logo ?? null);
    } catch {
      setLogo(null);
    }
  };

  useEffect(() => {
    fetchBrandLogo();
  }, [brandId]);

  // Tạo preview URL khi chọn file
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn một ảnh!");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", selectedFile);
      await brandImageService.uploadLogo(brandId, formData);
      toast.success("Tải logo lên thành công!");
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchBrandLogo();
      reloadBrand();
    } catch {
      toast.error("Tải logo thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await brandImageService.removeLogo(brandId);
      toast.success("Xóa logo thành công!");
      await fetchBrandLogo();
      reloadBrand();
    } catch {
      toast.error("Xóa logo thất bại!");
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg text-black">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-mono-900 flex items-center gap-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {canManageImages() ? "Quản Lý Logo Thương Hiệu" : "Logo Thương Hiệu"}
        </h3>
      </div>

      {/* Upload Section */}
      {canManageImages() && (
        <div className="mb-6 p-4 border-2 border-dashed border-mono-300 rounded-xl bg-mono-50 hover:border-mono-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            name="logo"
            onChange={(e) =>
              setSelectedFile(e.target.files ? e.target.files[0] : null)
            }
            className="hidden"
            id="brand-logo-upload"
          />
          <label
            htmlFor="brand-logo-upload"
            className="flex flex-col items-center cursor-pointer py-4"
          >
            <svg
              className="w-12 h-12 text-mono-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-mono-600 font-medium">
              Nhấn để chọn logo hoặc kéo thả
            </span>
            <span className="text-xs text-mono-400 mt-1">
              Hỗ trợ JPG, PNG, WEBP (Tối đa 1 ảnh)
            </span>
          </label>

          {/* Preview selected file */}
          {previewUrl && (
            <div className="mt-4 border-t border-mono-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-mono-700">
                  Logo đã chọn
                </span>
                <button
                  onClick={clearSelectedFile}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Hủy chọn
                </button>
              </div>
              <div className="flex justify-center">
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-32 w-32 object-contain rounded-lg border border-mono-200 bg-white"
                  />
                </div>
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`mt-4 w-full py-2.5 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                  uploading
                    ? "bg-mono-400 cursor-not-allowed"
                    : "bg-mono-800 hover:bg-mono-900"
                }`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Tải lên logo
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Current Logo Display */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-mono-700 mb-3">
          Logo hiện tại
        </h4>
        <div className="flex justify-center">
          <div
            className={`relative group bg-mono-50 rounded-xl overflow-hidden border-2 transition-all ${
              logo?.url ? "border-mono-800" : "border-mono-200"
            }`}
          >
            {/* Logo Image */}
            <div
              className="w-40 h-40 flex items-center justify-center cursor-pointer p-4"
              onClick={() => logo?.url && setLightboxImage(logo.url)}
            >
              <img
                src={logo?.url || defaultImage}
                alt="Logo thương hiệu"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultImage;
                }}
              />
            </div>

            {/* Badge */}
            {logo?.url && (
              <div className="absolute top-2 left-2 z-10 bg-mono-900 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Logo
              </div>
            )}

            {/* Action overlay */}
            {canManageImages() && logo?.url && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImage(logo.url);
                  }}
                  className="p-2 bg-white rounded-lg hover:bg-mono-100 transition-colors"
                  title="Xem logo"
                >
                  <svg
                    className="w-5 h-5 text-mono-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirmDelete(true);
                  }}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Xóa logo"
                >
                  <svg
                    className="w-5 h-5"
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
              </div>
            )}

            {/* No logo state */}
            {!logo?.url && (
              <div className="absolute inset-0 flex items-center justify-center bg-mono-50/80">
                <p className="text-mono-400 text-sm font-medium">
                  Chưa có logo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-mono-300 transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <svg
              className="w-8 h-8"
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
          <img
            src={lightboxImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <div
          className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowConfirmDelete(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-sm text-black"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">Xác nhận xóa logo</h3>
            <p className="text-sm text-mono-700 mb-4">
              Bạn có chắc muốn xóa logo này?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 rounded-md bg-mono-200"
              >
                Hủy
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  setShowConfirmDelete(false);
                  await handleRemove();
                }}
                className="px-4 py-2 rounded-md bg-red-600 text-white"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandLogoManager;
