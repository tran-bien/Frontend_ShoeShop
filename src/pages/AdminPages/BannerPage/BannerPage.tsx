import React, { useState, useEffect } from "react";
import { bannerAdminService, Banner } from "../../../services/BannerService";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-hot-toast";

const BannerPage: React.FC = () => {
  const { canDelete, canCreate, canUpdate } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerAdminService.getBanners({
        limit: 50,
        sort: "display_order_asc",
      });
      console.log("Banner API Response:", response);
      console.log("Banner data:", response.data);
      console.log("Banners array:", response.data.data);
      setBanners(response.data.data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggleStatus = async (bannerId: string) => {
    try {
      const banner = banners.find((b) => b._id === bannerId);
      if (!banner) return;

      // Nếu đang ẩn và muốn hiện, kiểm tra xung đột vị trí
      if (!banner.isActive) {
        const conflictingBanner = banners.find(
          (b) =>
            b._id !== bannerId &&
            b.displayOrder === banner.displayOrder &&
            b.isActive
        );

        if (conflictingBanner) {
          toast.error(
            `Không thể hiện banner. Vị trí ${banner.displayOrder} đã được sử dụng bởi banner "${conflictingBanner.title}".`
          );
          return;
        }
      }

      await bannerAdminService.toggleBannerStatus(bannerId);
      toast.success(
        `${banner.isActive ? "ẩn" : "Hiện"} banner "${
          banner.title
        }" thành công!`
      );
      fetchBanners();
    } catch (error: unknown) {
      console.error("Error toggling banner status:", error);

      // Xử lý lỗi 409 từ backend
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 409) {
          toast.error(
            axiosError.response?.data?.message ||
              "Không thể thay đổi trạng thái do xung đột vị trí."
          );
        } else {
          toast.error(
            "Có lỗi xảy ra khi thay đổi trạng thái banner. Vui lòng thử lại."
          );
        }
      } else {
        toast.error(
          "Có lỗi xảy ra khi thay đổi trạng thái banner. Vui lòng thử lại."
        );
      }
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    const bannerToDelete = banners.find((b) => b._id === bannerId);
    if (!bannerToDelete) return;

    setSelectedBanner(bannerToDelete);
    setShowDeleteModal(true);
  };

  const confirmDeleteBanner = async () => {
    if (!selectedBanner) return;

    try {
      setSubmitting(true);
      await bannerAdminService.deleteBanner(selectedBanner._id);
      toast.success("Xóa banner thành công!");
      fetchBanners();
      setShowDeleteModal(false);
      setSelectedBanner(null);
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Có lỗi xảy ra khi xóa banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReorderBanner = async (bannerId: string, newOrder: number) => {
    try {
      // Tìm banner hiện tại
      const currentBanner = banners.find((b) => b._id === bannerId);
      if (!currentBanner) return;

      // Kiểm tra nếu vị trí không thay đổi
      if (currentBanner.displayOrder === newOrder) {
        toast.error("Banner đã ở vị trí này rồi!");
        return; // Không cần cập nhật nếu vị trí giống nhau
      }

      // Kiểm tra xung đột vị trí với banner active khác trên frontend trước khi gửi API
      const conflictingBanner = banners.find(
        (b) => b._id !== bannerId && b.displayOrder === newOrder && b.isActive
      );

      if (conflictingBanner) {
        toast.error(
          `Vị trí ${newOrder} đã được sử dụng bởi banner "${conflictingBanner.title}". Vui lòng chọn vị trí khác.`
        );
        return;
      }

      // Cập nhật displayOrder của banner
      await bannerAdminService.updateBanner(bannerId, {
        displayOrder: newOrder,
      });
      toast.success(
        `Đã chuyển banner "${currentBanner.title}" đến vị trí ${newOrder}`
      );
      fetchBanners();
    } catch (error: unknown) {
      console.error("Error reordering banner:", error);

      // Xử lý lỗi 409 từ backend
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 409) {
          toast.error(
            axiosError.response?.data?.message ||
              `Vị trí ${newOrder} đã được sử dụng. Vui lòng chọn vị trí khác.`
          );
        } else {
          toast.error(
            "Có lỗi xảy ra khi thay đổi vị trí banner. Vui lòng thử lại."
          );
        }
      } else {
        toast.error(
          "Có lỗi xảy ra khi thay đổi vị trí banner. Vui lòng thử lại."
        );
      }
    }
  };

  // Create Banner Modal
  const CreateBannerModal = () => {
    const [formData, setFormData] = useState({
      title: "",
      displayOrder: 1,
      link: "",
      isActive: true,
      banner: null as File | null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.banner) {
        toast.error("Vui lòng chọn ảnh banner");
        return;
      }

      // Kiểm tra xung đột vị trí trên frontend trước khi gửi API
      if (formData.isActive) {
        const conflictingBanner = banners.find(
          (b) => b.displayOrder === formData.displayOrder && b.isActive
        );

        if (conflictingBanner) {
          toast.error(
            `Vị trí ${formData.displayOrder} đã được sử dụng bởi banner "${conflictingBanner.title}". Vui lòng chọn vị trí khác.`
          );
          return;
        }
      }

      setSubmitting(true);
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title);
        formDataToSend.append("displayOrder", formData.displayOrder.toString());
        formDataToSend.append("link", formData.link);
        formDataToSend.append("isActive", formData.isActive.toString());
        formDataToSend.append("banner", formData.banner);

        await bannerAdminService.createBanner(formDataToSend);
        setShowCreateModal(false);
        setFormData({
          title: "",
          displayOrder: 1,
          link: "",
          isActive: true,
          banner: null,
        });
        fetchBanners();
        toast.success("Tạo banner thành công!");
      } catch (error: unknown) {
        console.error("Error creating banner:", error);

        // Xử lý lỗi 409 từ backend
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { status?: number; data?: { message?: string } };
          };
          if (axiosError.response?.status === 409) {
            toast.error(
              axiosError.response?.data?.message ||
                `Vị trí ${formData.displayOrder} đã được sử dụng. Vui lòng chọn vị trí khác.`
            );
          } else {
            toast.error("Có lỗi xảy ra khi tạo banner. Vui lòng thử lại.");
          }
        } else {
          toast.error("Có lỗi xảy ra khi tạo banner. Vui lòng thử lại.");
        }
      } finally {
        setSubmitting(false);
      }
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4">Tạo Banner Mới</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Tiêu đề
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Vị trí hiện thể
              </label>
              <select
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    Vị trí {num}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Liên kết (tùy chọn)
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Ảnh Banner
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    banner: e.target.files?.[0] || null,
                  })
                }
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 text-mono-black focus:ring-mono-500 border-mono-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-mono-700">
                Hiển thị ngay lập tức
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-mono-600 border border-mono-300 rounded-lg hover:bg-mono-50"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 disabled:opacity-50"
              >
                {submitting ? "Đang tạo..." : "Tạo Banner"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit Banner Modal
  const EditBannerModal = () => {
    const [formData, setFormData] = useState({
      title: selectedBanner?.title || "",
      displayOrder: selectedBanner?.displayOrder || 1,
      link: selectedBanner?.link || "",
      isActive: selectedBanner?.isActive || false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedBanner) return;

      // Kiểm tra xung đột vị trí trên frontend trước khi gửi API
      if (
        formData.isActive &&
        formData.displayOrder !== selectedBanner.displayOrder
      ) {
        const conflictingBanner = banners.find(
          (b) =>
            b._id !== selectedBanner._id &&
            b.displayOrder === formData.displayOrder &&
            b.isActive
        );

        if (conflictingBanner) {
          toast.error(
            `Vị trí ${formData.displayOrder} đã được sử dụng bởi banner "${conflictingBanner.title}". Vui lòng chọn vị trí khác.`
          );
          return;
        }
      }

      setSubmitting(true);
      try {
        await bannerAdminService.updateBanner(selectedBanner._id, formData);
        setShowEditModal(false);
        setSelectedBanner(null);
        fetchBanners();
        toast.success("Cập nhật banner thành công!");
      } catch (error: unknown) {
        console.error("Error updating banner:", error);

        // Xử lý lỗi 409 từ backend
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { status?: number; data?: { message?: string } };
          };
          if (axiosError.response?.status === 409) {
            toast.error(
              axiosError.response?.data?.message ||
                `Vị trí ${formData.displayOrder} đã được sử dụng. Vui lòng chọn vị trí khác.`
            );
          } else {
            toast.error("Có lỗi xảy ra khi cập nhật banner. Vui lòng thử lại.");
          }
        } else {
          toast.error("Có lỗi xảy ra khi cập nhật banner. Vui lòng thử lại.");
        }
      } finally {
        setSubmitting(false);
      }
    };

    if (!showEditModal || !selectedBanner) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4">Chỉnh sửa Banner</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Tiêu đề
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Vị trí hiện thể
              </label>
              <select
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    Vị trí {num}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Liên kết (tùy chọn)
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
                placeholder="https://example.com"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editIsActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 text-mono-black focus:ring-mono-500 border-mono-300 rounded"
              />
              <label
                htmlFor="editIsActive"
                className="ml-2 text-sm text-mono-700"
              >
                Hiển thị banner
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedBanner(null);
                }}
                className="flex-1 px-4 py-2 text-mono-600 border border-mono-300 rounded-lg hover:bg-mono-50"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 disabled:opacity-50"
              >
                {submitting ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Image Update Modal
  const ImageUpdateModal = () => {
    const [newImage, setNewImage] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedBanner || !newImage) return;

      setSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("banner", newImage);

        await bannerAdminService.updateBannerImage(
          selectedBanner._id,
          formData
        );
        setShowImageModal(false);
        setSelectedBanner(null);
        setNewImage(null);
        fetchBanners();
        toast.success("Cập nhật ảnh banner thành công!");
      } catch (error: unknown) {
        console.error("Error updating banner image:", error);
        alert("Có lỗi xảy ra khi cập nhật ảnh");
      } finally {
        setSubmitting(false);
      }
    };

    if (!showImageModal || !selectedBanner) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4">Đổi ảnh Banner</h3>

          {/* Current Image */}
          <div className="mb-4">
            <p className="text-sm text-mono-600 mb-2">Ảnh hiện tại:</p>
            <img
              src={selectedBanner.image.url}
              alt={selectedBanner.title}
              className="w-full h-32 object-cover rounded-lg border"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Chọn ảnh mới
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
                required
              />
            </div>

            {newImage && (
              <div>
                <p className="text-sm text-mono-600 mb-2">Ảnh mới:</p>
                <img
                  src={URL.createObjectURL(newImage)}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedBanner(null);
                  setNewImage(null);
                }}
                className="flex-1 px-4 py-2 text-mono-600 border border-mono-300 rounded-lg hover:bg-mono-50"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting || !newImage}
                className="flex-1 px-4 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 disabled:opacity-50"
              >
                {submitting ? "Đang cập nhật..." : "Cập nhật ảnh"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = () => {
    if (!showDeleteModal || !selectedBanner) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center">
            {/* Warning Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-mono-200 mb-4">
              <svg
                className="h-8 w-8 text-mono-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-mono-900 mb-2">
              Xác nhận xóa banner
            </h3>

            <div className="mb-4">
              <p className="text-mono-600 mb-3">
                Bạn có chắc chắn muốn xóa banner này không?
              </p>

              {/* Banner Preview */}
              <div className="bg-mono-50 rounded-lg p-3 mb-3">
                <img
                  src={selectedBanner.image.url}
                  alt={selectedBanner.title}
                  className="w-full h-24 object-cover rounded-md mb-2"
                />
                <p className="font-medium text-mono-900 text-sm">
                  {selectedBanner.title}
                </p>
                <p className="text-mono-500 text-xs">
                  Vị trí {selectedBanner.displayOrder}
                </p>
              </div>

              <p className="text-mono-900 text-sm font-medium">
                ⚠️ Hành động này không thể hoàn tác
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBanner(null);
                }}
                className="flex-1 px-4 py-2 text-mono-600 border border-mono-300 rounded-lg hover:bg-mono-50 transition-colors"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteBanner}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-mono-900 text-white rounded-lg hover:bg-mono-800 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Đang xóa..." : "Xóa banner"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mono-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mono-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-mono-900 mb-2">
              Quản lý Banner
            </h1>
            <p className="text-mono-600">
              Quản lý banner hiển thị trên trang chủ website (tối đa 5 banner)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {canCreate() && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-mono-800 hover:bg-mono-900 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Thêm Banner
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-mono-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-mono-black"
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
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-mono-900">
                Tổng Banner
              </h3>
              <p className="text-2xl font-bold text-mono-black">
                {banners.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-mono-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-mono-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-mono-900">
                Đang Hiển Thị
              </h3>
              <p className="text-2xl font-bold text-mono-800">
                {banners.filter((b) => b.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-mono-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-mono-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-mono-900">Đã ẩn</h3>
              <p className="text-2xl font-bold text-mono-600">
                {banners.filter((b) => !b.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Banner List */}
      {banners.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-mono-200">
          <div className="text-mono-400 mb-6">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-mono-900 mb-2">
            Chưa có banner nào
          </h3>
          <p className="text-mono-500 mb-6">
            Hãy tạo banner đầu tiên để quảng bá sản phẩm trên trang chủ
          </p>
          {canCreate() && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-mono-800 hover:bg-mono-900 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tạo Banner Đầu Tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Banner Image */}
                  <div className="lg:w-2/5">
                    <div className="relative group">
                      <img
                        src={banner.image.url}
                        alt={banner.title}
                        className="w-full h-60 lg:h-48 object-cover rounded-lg border shadow-sm"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"></div>
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-mono-800 text-sm font-medium px-2 py-1 rounded-full">
                          #{banner.displayOrder}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Banner Info */}
                  <div className="lg:w-3/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-mono-900 line-clamp-2">
                          {banner.title}
                        </h3>
                        <div className="flex items-center gap-2 ml-4">
                          {banner.isActive ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-mono-100 text-mono-800">
                              <div className="w-2 h-2 bg-mono-700 rounded-full"></div>
                              Đang hiển thị
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-mono-100 text-mono-600">
                              <div className="w-2 h-2 bg-mono-400 rounded-full"></div>
                              Đã ẩn
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-mono-50 text-mono-700 border border-mono-200">
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
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Vị trí {banner.displayOrder}
                        </span>

                        {banner.link && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-mono-100 text-mono-800 border border-mono-200">
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
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                            Có liên kết
                          </span>
                        )}

                        <span className="text-sm text-mono-500">
                          Tạo:{" "}
                          {new Date(banner.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {canUpdate() && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedBanner(banner);
                              setShowEditModal(true);
                            }}
                            className="px-4 py-2 bg-mono-50 hover:bg-mono-100 text-mono-700 text-sm font-medium rounded-lg border border-mono-200 transition-colors flex items-center gap-2"
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
                            Chỉnh sửa
                          </button>

                          <button
                            onClick={() => {
                              setSelectedBanner(banner);
                              setShowImageModal(true);
                            }}
                            className="px-4 py-2 bg-mono-50 hover:bg-mono-100 text-mono-700 text-sm font-medium rounded-lg border border-mono-200 transition-colors flex items-center gap-2"
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
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Đổi ảnh
                          </button>

                          {/* Dropdown đổi vị trí */}
                          <select
                            value={banner.displayOrder}
                            onChange={(e) =>
                              handleReorderBanner(
                                banner._id,
                                parseInt(e.target.value)
                              )
                            }
                            className="px-3 py-2 bg-white hover:bg-mono-50 text-mono-700 text-sm font-medium rounded-lg border border-mono-200 transition-colors"
                          >
                            {[1, 2, 3, 4, 5].map((position) => (
                              <option key={position} value={position}>
                                Vị trí {position}
                              </option>
                            ))}
                          </select>
                        </>
                      )}

                      <button
                        onClick={() => handleToggleStatus(banner._id)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                          banner.isActive
                            ? "bg-mono-100 hover:bg-mono-100 text-mono-700 border border-mono-200"
                            : "bg-mono-50 hover:bg-mono-100 text-mono-700 border border-mono-200"
                        }`}
                      >
                        {banner.isActive ? (
                          <>
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
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              />
                            </svg>
                            ẩn banner
                          </>
                        ) : (
                          <>
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Hiện banner
                          </>
                        )}
                      </button>

                      {canDelete() && (
                        <button
                          onClick={() => handleDeleteBanner(banner._id)}
                          className="px-4 py-2 bg-mono-100 hover:bg-mono-200 text-mono-800 text-sm font-medium rounded-lg border border-mono-300 transition-colors flex items-center gap-2"
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
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateBannerModal />
      <EditBannerModal />
      <ImageUpdateModal />
      <DeleteConfirmModal />
    </div>
  );
};

export default BannerPage;
