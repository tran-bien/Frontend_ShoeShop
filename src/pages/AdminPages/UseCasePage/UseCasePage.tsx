import React, { useState, useEffect } from "react";
import { useCaseApi } from "../../../services/UseCaseService";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-hot-toast";

interface UseCase {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: string | { _id: string; name?: string } | null;
  createdAt: string;
  updatedAt: string;
}

const UseCasePage: React.FC = () => {
  const { canDelete, canCreate, canUpdate, canToggleStatus } = useAuth();
  const [UseCases, setUseCases] = useState<UseCase[]>([]);
  const [deletedUseCases, setDeletedUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  // Pagination & Filter & Stats
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const limit = 10;

  const fetchUseCases = async () => {
    try {
      setLoading(true);
      const response = await useCaseApi.getAll({
        page: currentPage,
        limit,
        name: searchQuery || undefined,
      });
      const data = response.data.data || [];
      setUseCases(data);
      setTotalPages(response.data.totalPages || 1);

      // Lấy stats tổng thể (không phân trang) để hiển thị chính xác
      const statsResponse = await useCaseApi.getAll({
        page: 1,
        limit: 1000, // Lấy tất cả để tính stats
      });
      const allUseCases = statsResponse.data.data || [];
      setTotalCount(statsResponse.data.total || 0);
      setActiveCount(allUseCases.filter((m: UseCase) => m.isActive).length);
      setInactiveCount(allUseCases.filter((m: UseCase) => !m.isActive).length);
    } catch (error) {
      console.error("Error fetching UseCases:", error);
      setUseCases([]);
      setTotalCount(0);
      setActiveCount(0);
      setInactiveCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedUseCases = async () => {
    try {
      setLoading(true);
      const response = await useCaseApi.getDeleted({
        page: currentPage,
        limit,
        name: searchQuery || undefined,
      });
      setDeletedUseCases(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching deleted UseCases:", error);
      setDeletedUseCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showDeleted) {
      fetchDeletedUseCases();
    } else {
      fetchUseCases();
    }
  }, [currentPage, showDeleted, searchQuery]);

  const handleToggleStatus = async (
    UseCaseId: string,
    currentStatus: boolean
  ) => {
    try {
      await useCaseApi.toggleStatus(UseCaseId, { isActive: !currentStatus });
      toast.success(
        `${currentStatus ? "Vô hiệu hóa" : "Kích hoạt"} chất liệu thành công!`
      );
      fetchUseCases();
    } catch (error: unknown) {
      console.error("Error toggling UseCase status:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message ||
            "Có lỗi xảy ra khi thay đổi trạng thái."
        );
      } else {
        toast.error("Có lỗi xảy ra khi thay đổi trạng thái.");
      }
    }
  };

  const handleDeleteUseCase = (useCase: UseCase) => {
    setSelectedUseCase(useCase);
    setShowDeleteModal(true);
  };

  const confirmDeleteUseCase = async () => {
    if (!selectedUseCase) return;

    try {
      setSubmitting(true);
      await useCaseApi.delete(selectedUseCase._id);
      toast.success("Xóa chất liệu thành công!");
      fetchUseCases();
      setShowDeleteModal(false);
      setSelectedUseCase(null);
    } catch (error: unknown) {
      console.error("Error deleting UseCase:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message ||
            "Có lỗi xảy ra khi xóa chất liệu"
        );
      } else {
        toast.error("Có lỗi xảy ra khi xóa chất liệu");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestoreUseCase = async (UseCaseId: string) => {
    try {
      await useCaseApi.restore(UseCaseId);
      toast.success("Khôi phục chất liệu thành công!");
      fetchDeletedUseCases();
    } catch (error: unknown) {
      console.error("Error restoring UseCase:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message ||
            "Có lỗi xảy ra khi khôi phục chất liệu"
        );
      } else {
        toast.error("Có lỗi xảy ra khi khôi phục chất liệu");
      }
    }
  };

  // Create Modal
  const CreateModal = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      isActive: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        await useCaseApi.create(formData);
        setShowCreateModal(false);
        setFormData({ name: "", description: "", isActive: true });
        fetchUseCases();
        toast.success("Thêm chất liệu thành công!");
      } catch (error: unknown) {
        console.error("Error creating UseCase:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message ||
              "Có lỗi xảy ra khi thêm chất liệu."
          );
        } else {
          toast.error("Có lỗi xảy ra khi thêm chất liệu.");
        }
      } finally {
        setSubmitting(false);
      }
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4">Thêm Chất Liệu</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên chất liệu
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="createIsActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="createIsActive"
                className="ml-2 text-sm text-gray-700"
              >
                Kích hoạt ngay
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Đang thêm..." : "Thêm"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit Modal
  const EditModal = () => {
    const [formData, setFormData] = useState({
      name: selectedUseCase?.name || "",
      description: selectedUseCase?.description || "",
    });

    useEffect(() => {
      if (selectedUseCase) {
        setFormData({
          name: selectedUseCase.name,
          description: selectedUseCase.description,
        });
      }
    }, [selectedUseCase]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedUseCase) return;

      setSubmitting(true);
      try {
        await useCaseApi.update(selectedUseCase._id, formData);
        setShowEditModal(false);
        setSelectedUseCase(null);
        fetchUseCases();
        toast.success("Cập nhật chất liệu thành công!");
      } catch (error: unknown) {
        console.error("Error updating UseCase:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message ||
              "Có lỗi xảy ra khi cập nhật chất liệu."
          );
        } else {
          toast.error("Có lỗi xảy ra khi cập nhật chất liệu.");
        }
      } finally {
        setSubmitting(false);
      }
    };

    if (!showEditModal || !selectedUseCase) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4">Chỉnh sửa Chất Liệu</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên chất liệu
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUseCase(null);
                }}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteModal = () => {
    if (!showDeleteModal || !selectedUseCase) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4 text-red-600">Xác nhận xóa</h3>
          <p className="text-gray-700 mb-6">
            Bạn có chắc chắn muốn xóa chất liệu{" "}
            <strong>"{selectedUseCase.name}"</strong>?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedUseCase(null);
              }}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              onClick={confirmDeleteUseCase}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // View Detail Modal
  const ViewDetailModal = () => {
    if (!showDetailModal || !selectedUseCase) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Chi Tiết Chất Liệu
            </h3>
            <button
              onClick={() => {
                setShowDetailModal(false);
                setSelectedUseCase(null);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Tên và Trạng thái */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Tên Chất Liệu
                  </h4>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedUseCase.name}
                  </p>
                </div>
                <div>
                  {selectedUseCase.deletedAt ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Đã xóa
                    </span>
                  ) : selectedUseCase.isActive ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Đang hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      Đã vô hiệu hóa
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mô tả */}
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Mô Tả</h4>
              <p className="text-gray-900">
                {selectedUseCase.description || "Không có mô tả"}
              </p>
            </div>

            {/* Thông tin chi tiết */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Ngày Tạo
                </h4>
                <p className="text-gray-900">
                  {new Date(selectedUseCase.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Cập Nhật Lần Cuối
                </h4>
                <p className="text-gray-900">
                  {new Date(selectedUseCase.updatedAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>

            {/* Nếu đã xóa, hiển thị thông tin người xóa */}
            {selectedUseCase.deletedAt && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-700 mb-2">
                  Thông Tin Xóa
                </h4>
                <div className="space-y-1 text-sm text-red-800">
                  <p>
                    Ngày xóa:{" "}
                    {new Date(selectedUseCase.deletedAt).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                  {selectedUseCase.deletedBy && (
                    <p>
                      Người xóa:{" "}
                      {typeof selectedUseCase.deletedBy === "object"
                        ? selectedUseCase.deletedBy.name || "N/A"
                        : selectedUseCase.deletedBy}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {!selectedUseCase.deletedAt && (
                <>
                  {canUpdate() && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setShowEditModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
                  )}
                  {canToggleStatus() && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleToggleStatus(
                          selectedUseCase._id,
                          selectedUseCase.isActive
                        );
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        selectedUseCase.isActive
                          ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {selectedUseCase.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedUseCase(null);
                }}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  const displayUseCases = showDeleted ? deletedUseCases : UseCases;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quản lý Chất Liệu
            </h1>
            <p className="text-gray-600">Quản lý các loại chất liệu sản phẩm</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {canCreate() && !showDeleted && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
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
                Thêm Chất Liệu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên chất liệu..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowDeleted(false);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                !showDeleted
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Đang hoạt động
            </button>
            <button
              onClick={() => {
                setShowDeleted(true);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                showDeleted
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Đã xóa
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tổng Chất Liệu
              </h3>
              <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Đang Hoạt Động
              </h3>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Đã Vô Hiệu Hóa
              </h3>
              <p className="text-2xl font-bold text-gray-600">
                {inactiveCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* UseCase List */}
      {displayUseCases.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-gray-400 mb-6">
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {showDeleted
              ? "Không có chất liệu nào đã xóa"
              : "Chưa có chất liệu nào"}
          </h3>
          <p className="text-gray-500 mb-6">
            {showDeleted
              ? "Tất cả chất liệu đang hoạt động bình thường"
              : "Hãy tạo chất liệu đầu tiên cho sản phẩm của bạn"}
          </p>
          {canCreate() && !showDeleted && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
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
              Tạo Chất Liệu Đầu Tiên
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {displayUseCases.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 ml-4">
                        {item.deletedAt ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Đã xóa
                          </span>
                        ) : item.isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            Đã vô hiệu hóa
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-gray-500">
                        Tạo:{" "}
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      {item.updatedAt !== item.createdAt && (
                        <span className="text-sm text-gray-500">
                          Cập nhật:{" "}
                          {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {!showDeleted ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedUseCase(item);
                            setShowDetailModal(true);
                          }}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 transition-colors flex items-center gap-2"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Chi tiết
                        </button>
                        {canUpdate() && (
                          <button
                            onClick={() => {
                              setSelectedUseCase(item);
                              setShowEditModal(true);
                            }}
                            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors flex items-center gap-2"
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
                            Sửa
                          </button>
                        )}
                        {canDelete() && (
                          <button
                            onClick={() => handleDeleteUseCase(item)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg border border-red-200 transition-colors flex items-center gap-2"
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
                        {canToggleStatus() && (
                          <button
                            onClick={() =>
                              handleToggleStatus(item._id, item.isActive)
                            }
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-2 ${
                              item.isActive
                                ? "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            }`}
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
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            {item.isActive ? "Tắt" : "Bật"}
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedUseCase(item);
                            setShowDetailModal(true);
                          }}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 transition-colors flex items-center gap-2"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Chi tiết
                        </button>
                        {canUpdate() && (
                          <button
                            onClick={() => handleRestoreUseCase(item._id)}
                            className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-lg border border-green-200 transition-colors flex items-center gap-2"
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
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Khôi phục
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-gray-700">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateModal />
      <EditModal />
      <DeleteModal />
      <ViewDetailModal />
    </div>
  );
};

export default UseCasePage;
