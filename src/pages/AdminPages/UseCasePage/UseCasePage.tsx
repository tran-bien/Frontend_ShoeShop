import React, { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
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
  const [sortOption, setSortOption] = useState("created_at_desc");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const limit = 10;

  const toggleSearchVisibility = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery("");
      setCurrentPage(1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleBack = () => {
    setIsSearchVisible(false);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const fetchUseCases = async () => {
    try {
      setLoading(true);
      const response = await useCaseApi.getAll({
        page: currentPage,
        limit,
        name: searchQuery || undefined,
        sortBy: sortOption,
      });
      const data = response.data.data || [];
      setUseCases(data);
      setTotalPages(response.data.totalPages || 1);

      // Lấy stats tổng thể (BE giới hạn max 100, nên lấy 100 items để tính stats)
      const statsResponse = await useCaseApi.getAll({
        page: 1,
        limit: 100, // Max limit theo BE validator (1-100)
      });
      const statsData = statsResponse.data.data || [];
      const totalFromAPI = statsResponse.data.total || 0;

      // Nếu tổng số <= 100, stats chính xác 100%
      // Nếu > 100, tính tỷ lệ từ 100 items đầu
      if (totalFromAPI <= 100) {
        setTotalCount(totalFromAPI);
        setActiveCount(statsData.filter((m: UseCase) => m.isActive).length);
        setInactiveCount(statsData.filter((m: UseCase) => !m.isActive).length);
      } else {
        // Ước lượng dựa trên tỷ lệ của 100 items đầu
        const sampleActive = statsData.filter(
          (m: UseCase) => m.isActive
        ).length;
        const sampleInactive = statsData.filter(
          (m: UseCase) => !m.isActive
        ).length;
        const ratio = totalFromAPI / statsData.length;

        setTotalCount(totalFromAPI);
        setActiveCount(Math.round(sampleActive * ratio));
        setInactiveCount(Math.round(sampleInactive * ratio));
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showDeleted, searchQuery, sortOption]);

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
        toast.success("Thêm nhu cầu sử dụng thành công!");
      } catch (error: unknown) {
        console.error("Error creating UseCase:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message ||
              "Có lỗi xảy ra khi thêm nhu cầu sử dụng."
          );
        } else {
          toast.error("Có lỗi xảy ra khi thêm nhu cầu sử dụng.");
        }
      } finally {
        setSubmitting(false);
      }
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4">Thêm Nhu Cầu Sử Dụng</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên nhu cầu sử dụng
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
    <div className="p-6 w-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight leading-snug">
          Danh Sách Nhu Cầu Sử Dụng
        </h2>
        {!isSearchVisible ? (
          <button
            onClick={toggleSearchVisibility}
            className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 px-5 py-2 rounded-3xl shadow transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 active:bg-gray-200"
          >
            <IoIosSearch className="text-xl text-gray-500" />
            <span className="font-medium">Tìm kiếm</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 w-full max-w-md">
            <IoIosSearch
              onClick={handleBack}
              className="text-gray-400 cursor-pointer text-xl"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm theo tên nhu cầu sử dụng..."
              className="w-full px-4 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {!showDeleted && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm border border-blue-200">
            <h3 className="text-sm font-medium text-blue-600 mb-1">
              Tổng số nhu cầu sử dụng
            </h3>
            <p className="text-3xl font-bold text-blue-900">{totalCount}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200">
            <h3 className="text-sm font-medium text-green-600 mb-1">
              Đang hoạt động
            </h3>
            <p className="text-3xl font-bold text-green-900">{activeCount}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 shadow-sm border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-600 mb-1">
              Không hoạt động
            </h3>
            <p className="text-3xl font-bold text-yellow-900">
              {inactiveCount}
            </p>
          </div>
        </div>
      )}

      {/* Tab chuyển đổi và Sort */}
      <div className="flex items-center justify-between border-b mb-4">
        <div className="flex">
          <button
            onClick={() => {
              setShowDeleted(false);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
              !showDeleted
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-blue-600"
            }`}
          >
            Nhu cầu sử dụng đang hoạt động
          </button>
          <button
            onClick={() => {
              setShowDeleted(true);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
              showDeleted
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-blue-600"
            }`}
          >
            Nhu cầu sử dụng đã xóa
          </button>
        </div>
        <div className="flex items-center gap-3 mb-2">
          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="created_at_desc">Mới nhất</option>
            <option value="created_at_asc">Cũ nhất</option>
            <option value="name_asc">Tên A-Z</option>
            <option value="name_desc">Tên Z-A</option>
          </select>
          {!showDeleted && canCreate() && (
            <button
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
              onClick={() => setShowCreateModal(true)}
            >
              + Thêm Nhu Cầu Sử Dụng
            </button>
          )}
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
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Trang {currentPage} / {totalPages} • Tổng: {totalCount} nhu cầu sử
              dụng
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Trước
              </button>

              {/* Page Numbers */}
              {(() => {
                const pages = [];
                const showPages = 5; // Number of page buttons to show
                let startPage = Math.max(
                  1,
                  currentPage - Math.floor(showPages / 2)
                );
                const endPage = Math.min(totalPages, startPage + showPages - 1);

                // Adjust start if we're near the end
                if (endPage - startPage < showPages - 1) {
                  startPage = Math.max(1, endPage - showPages + 1);
                }

                // First page
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                }

                // Middle pages
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-2 rounded-lg font-medium transition-all ${
                        i === currentPage
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                // Last page
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pages;
              })()}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Tiếp
              </button>
            </div>
          </div>
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
