import React, { useState, useRef, useEffect } from "react";
import { variantImageService } from "../../../services/ImageService";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-hot-toast";
import type { Image } from "../../../types/image";
import type { ProductImage } from "../../../types/common";

// Accept both Image and ProductImage types
type ImageInput = Image | ProductImage;

const VariantImagesManager = ({
  variantId,
  images,
  reloadImages,
}: {
  variantId: string;
  images: ImageInput[];
  reloadImages?: () => Promise<void>;
}) => {
  // Normalize images to Image type
  const normalizeImages = (imgs: ImageInput[]): Image[] =>
    imgs.map((img) => ({
      _id: (img as Image)._id || (img as ProductImage).public_id,
      url: img.url,
      publicId: (img as Image).publicId || (img as ProductImage).public_id,
      displayOrder: img.displayOrder,
      isMain: img.isMain,
      alt: img.alt,
    }));
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [localImages, setLocalImages] = useState<Image[]>(
    normalizeImages(images)
  );
  const [uploading, setUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    imageId: string | null;
  }>({ show: false, imageId: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { canManageImages } = useAuth();

  // Cập nhật localImages khi images props thay đổi
  useEffect(() => {
    setLocalImages(normalizeImages(images));
  }, [images]);

  // Tạo preview URL khi chọn file
  useEffect(() => {
    if (!selectedFiles) {
      setPreviewUrls([]);
      return;
    }
    const urls = Array.from(selectedFiles).map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Vui lòng chọn ít nhất một ảnh!");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(selectedFiles).forEach((file) => {
        formData.append("images", file);
      });
      const res = await variantImageService.uploadImages(variantId, formData);
      setSelectedFiles(null);
      setPreviewUrls([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      const added =
        res?.data?.data?.images ||
        (res?.data?.data?.image ? [res.data.data.image] : []);
      if (added && added.length > 0) {
        setLocalImages((prev: Image[]) => [...(added as Image[]), ...prev]);
      }
      // NOTE: Don't call reloadImages here - it will override localImages via useEffect
      // Parent will reload when modal closes via closeImageManager()
      toast.success("Tải ảnh thành công");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Tải ảnh thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (imageId: string) => {
    setDeleteModal({ show: true, imageId });
  };

  const confirmDelete = async () => {
    if (!deleteModal.imageId) return;
    setIsProcessing(true);
    try {
      await variantImageService.removeImages(variantId, [deleteModal.imageId]);
      // Cập nhật localImages ngay lập tức để UI phản ánh (không reload toàn bộ trang)
      setLocalImages((prev: Image[]) =>
        prev.filter((img: Image) => img._id !== deleteModal.imageId)
      );
      toast.success("Xóa ảnh thành công");
    } catch (error) {
      console.error("Remove failed:", error);
      toast.error("Xóa ảnh thất bại!");
    } finally {
      setIsProcessing(false);
      setDeleteModal({ show: false, imageId: null });
    }
  };

  const handleSetMain = async (imageId: string) => {
    setIsProcessing(true);
    try {
      const res = await variantImageService.setMainImage(variantId, imageId);
      const mainImage = res?.data?.data?.mainImage;
      if (mainImage) {
        setLocalImages((prev: Image[]) =>
          prev.map((img: Image) => ({
            ...img,
            isMain: img._id === mainImage._id,
          }))
        );
      } else {
        setLocalImages((prev: Image[]) =>
          prev.map((img: Image) => ({ ...img, isMain: img._id === imageId }))
        );
      }
      toast.success("Đặt ảnh chính thành công");
    } catch (error) {
      console.error("Set main failed:", error);
      toast.error("Đặt ảnh chính thất bại!");
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;
    const updated = [...localImages];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(idx, 0, moved);
    setLocalImages(updated);
    setDraggedIndex(idx);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Move buttons
  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= localImages.length) return;
    const updated = [...localImages];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setLocalImages(updated);
  };

  const handleReorder = async () => {
    setIsProcessing(true);
    try {
      const imageOrders = localImages.map((img: Image, idx: number) => ({
        _id: img._id,
        displayOrder: idx,
      }));
      const res = await variantImageService.reorderImages(
        variantId,
        imageOrders
      );
      const updated = res?.data?.data?.images;
      if (updated && Array.isArray(updated)) {
        setLocalImages(updated);
      }
      toast.success("Lưu thứ tự ảnh thành công");
    } catch (error) {
      console.error("Reorder failed:", error);
      toast.error("Lưu thứ tự thất bại!");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSelectedFiles = () => {
    setSelectedFiles(null);
    setPreviewUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-2xl text-black">
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
          {canManageImages() ? "Quản Lý Ảnh Biến Thể" : "Ảnh Biến Thể"}
        </h3>
        <span className="text-sm text-mono-500 bg-mono-100 px-3 py-1 rounded-full">
          {localImages.length} ảnh
        </span>
      </div>

      {/* Upload Section */}
      {canManageImages() && (
        <div className="mb-6 p-4 border-2 border-dashed border-mono-300 rounded-xl bg-mono-50 hover:border-mono-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            name="images"
            multiple
            onChange={(e) => setSelectedFiles(e.target.files)}
            className="hidden"
            id="variant-image-upload"
          />
          <label
            htmlFor="variant-image-upload"
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
              Nhấn để chọn ảnh hoặc kéo thả
            </span>
            <span className="text-xs text-mono-400 mt-1">
              Hỗ trợ JPG, PNG, WEBP
            </span>
          </label>

          {/* Preview selected files */}
          {previewUrls.length > 0 && (
            <div className="mt-4 border-t border-mono-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-mono-700">
                  Ảnh đã chọn ({previewUrls.length})
                </span>
                <button
                  onClick={clearSelectedFiles}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      className="h-20 w-20 object-cover rounded-lg border border-mono-200"
                    />
                  </div>
                ))}
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
                    Tải lên {previewUrls.length} ảnh
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Images Grid */}
      {localImages.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {localImages.map((img: Image, idx: number) => (
              <div
                key={img._id}
                draggable={canManageImages()}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`relative group bg-mono-50 rounded-xl overflow-hidden border-2 transition-all ${
                  draggedIndex === idx
                    ? "border-mono-500 opacity-50"
                    : img.isMain
                    ? "border-mono-800"
                    : "border-mono-200 hover:border-mono-400"
                } ${canManageImages() ? "cursor-move" : ""}`}
              >
                {/* Main badge */}
                {img.isMain && (
                  <div className="absolute top-2 left-2 z-10 bg-mono-900 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Chính
                  </div>
                )}

                {/* Order number */}
                <div className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur text-mono-700 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {idx + 1}
                </div>

                {/* Image */}
                <div
                  className="aspect-square cursor-pointer"
                  onClick={() => setLightboxImage(img.url)}
                >
                  <img
                    src={img.url}
                    alt={`Ảnh ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/image/placeholder.jpg";
                    }}
                  />
                </div>

                {/* Action buttons */}
                {canManageImages() && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    {/* Move buttons */}
                    <div className="flex gap-1">
                      <button
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(idx, idx - 1);
                        }}
                        className="p-1.5 bg-white rounded-lg disabled:opacity-40 hover:bg-mono-100 transition-colors"
                        title="Di chuyển lên"
                      >
                        <svg
                          className="w-4 h-4 text-mono-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        disabled={idx === localImages.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(idx, idx + 1);
                        }}
                        className="p-1.5 bg-white rounded-lg disabled:opacity-40 hover:bg-mono-100 transition-colors"
                        title="Di chuyển xuống"
                      >
                        <svg
                          className="w-4 h-4 text-mono-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Set main & Delete */}
                    <div className="flex gap-1">
                      {!img.isMain && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetMain(img._id);
                          }}
                          className="p-1.5 bg-mono-800 text-white rounded-lg hover:bg-mono-900 transition-colors"
                          title="Đặt làm ảnh chính"
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
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(img._id);
                        }}
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Xóa ảnh"
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
                    </div>
                  </div>
                )}

                {/* Click to view overlay for view-only mode */}
                {!canManageImages() && (
                  <div
                    className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => setLightboxImage(img.url)}
                  >
                    <svg
                      className="w-8 h-8 text-white"
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
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Save order button */}
          {canManageImages() && localImages.length >= 2 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleReorder}
                className="px-6 py-2.5 bg-mono-800 text-white rounded-lg hover:bg-mono-900 transition-colors font-medium flex items-center gap-2"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Lưu thứ tự ảnh
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-mono-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg font-medium">Chưa có ảnh nào</p>
          <p className="text-sm mt-1">Tải ảnh lên để bắt đầu</p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
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

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
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
              </div>
              <div>
                <h3 className="text-lg font-semibold text-mono-900">
                  Xác nhận xóa ảnh
                </h3>
                <p className="text-sm text-mono-500">
                  Bạn có chắc chắn muốn xóa ảnh này không?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteModal({ show: false, imageId: null })}
                className="px-4 py-2 text-mono-600 bg-mono-100 rounded-lg hover:bg-mono-200 transition-colors font-medium"
                disabled={isProcessing}
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Đang xóa...
                  </>
                ) : (
                  "Xóa ảnh"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && !deleteModal.show && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-lg px-6 py-4 flex items-center gap-3 shadow-lg">
            <svg
              className="animate-spin w-5 h-5 text-mono-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-mono-700 font-medium">Đang xử lý...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantImagesManager;
