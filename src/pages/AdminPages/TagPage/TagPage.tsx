import React, { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { Tag, TagType } from "../../../types/tag";
import { adminTagService } from "../../../services/TagService";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-hot-toast";

interface TagPageTag extends Tag {
  deletedAt?: string | null;
  deletedBy?: string | { _id: string; name?: string } | null;
}

const TAG_TYPES = {
  MATERIAL: "MATERIAL",
  USECASE: "USECASE",
  CUSTOM: "CUSTOM",
} as const;

const TAG_TYPE_LABELS = {
  MATERIAL: "Chất liệu",
  USECASE: "Nhu cầu sử dụng",
  CUSTOM: "Tùy chỉnh",
};

const TagPage: React.FC = () => {
  const { canDelete, canCreate, canUpdate, canToggleStatus } = useAuth();
  const [tags, setTags] = useState<TagPageTag[]>([]);
  const [deletedTags, setDeletedTags] = useState<TagPageTag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<TagPageTag | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  // Pagination & Filter & Stats
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>(""); // Filter by type
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [deletedCount, setDeletedCount] = useState(0);
  const [sortOption, setSortOption] = useState("created_at_desc");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const limit = 10;

  const toggleSearchVisibility = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery("");
      setSearchInput("");
      setCurrentPage(1);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleBack = () => {
    setIsSearchVisible(false);
    setSearchQuery("");
    setSearchInput("");
    setCurrentPage(1);
  };

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await adminTagService.getAll({
        page: currentPage,
        limit,
        name: searchQuery || undefined,
        type: typeFilter as TagType | undefined,
        sort: sortOption,
      });
      const data = response.data.data || [];
      setTags(data);
      setTotalPages(response.data.totalPages || 1);

      // L?y stats tổng thể
      const statsResponse = await adminTagService.getAll({
        page: 1,
        limit: 100,
      });
      const statsData = statsResponse.data.data || [];
      const totalFromAPI = statsResponse.data.total || 0;

      if (totalFromAPI <= 100) {
        setTotalCount(totalFromAPI);
        setActiveCount(statsData.filter((t: Tag) => t.isActive).length);
        setInactiveCount(statsData.filter((t: Tag) => !t.isActive).length);
      } else {
        const sampleActive = statsData.filter((t: Tag) => t.isActive).length;
        const sampleInactive = statsData.filter((t: Tag) => !t.isActive).length;
        const ratio = totalFromAPI / statsData.length;

        setTotalCount(totalFromAPI);
        setActiveCount(Math.round(sampleActive * ratio));
        setInactiveCount(Math.round(sampleInactive * ratio));
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      setTags([]);
      setTotalCount(0);
      setActiveCount(0);
      setInactiveCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedTags = async () => {
    try {
      setLoading(true);
      const response = await adminTagService.getDeleted({
        page: currentPage,
        limit,
        name: searchQuery || undefined,
      });
      setDeletedTags(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching deleted tags:", error);
      setDeletedTags([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedStats = async () => {
    try {
      const deletedResponse = await adminTagService.getDeleted({
        page: 1,
        limit: 100,
      });
      const totalDeleted = deletedResponse.data.pagination?.total || 0;
      setDeletedCount(totalDeleted);
    } catch {
      setDeletedCount(0);
    }
  };

  useEffect(() => {
    if (showDeleted) {
      fetchDeletedTags();
      fetchDeletedStats();
    } else {
      fetchTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showDeleted, searchQuery, sortOption, typeFilter]);

  const handleToggleStatus = async (tagId: string, currentStatus: boolean) => {
    try {
      await adminTagService.toggleStatus(tagId, { isActive: !currentStatus });
      toast.success(
        `${currentStatus ? "Vô hiệu hóa" : "Kích hoạt"} tag thành công!`
      );
      fetchTags();
    } catch (error: unknown) {
      console.error("Error toggling tag status:", error);
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

  const handleDeleteTag = (tag: Tag) => {
    setSelectedTag(tag as TagPageTag);
    setShowDeleteModal(true);
  };

  const confirmDeleteTag = async () => {
    if (!selectedTag) return;

    try {
      setSubmitting(true);
      await adminTagService.delete(selectedTag._id);
      toast.success("Xóa tag thành công!");
      fetchTags();
      setShowDeleteModal(false);
      setSelectedTag(null);
    } catch (error: unknown) {
      console.error("Error deleting tag:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message || "Có lỗi xảy ra khi xóa tag"
        );
      } else {
        toast.error("Có lỗi xảy ra khi xóa tag");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestoreTag = async (tagId: string) => {
    try {
      await adminTagService.restore(tagId);
      toast.success("Khôi phục tag thành công!");
      fetchDeletedTags();
    } catch (error: unknown) {
      console.error("Error restoring tag:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message ||
            "Có lỗi xảy ra khi khôi phục tag"
        );
      } else {
        toast.error("Có lỗi xảy ra khi khôi phục tag");
      }
    }
  };

  // Create Modal
  const CreateModal = () => {
    const [formData, setFormData] = useState<{
      name: string;
      type: "MATERIAL" | "USECASE" | "CUSTOM";
      description: string;
      isActive: boolean;
    }>({
      name: "",
      type: TAG_TYPES.MATERIAL,
      description: "",
      isActive: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        await adminTagService.create(formData);
        setShowCreateModal(false);
        setFormData({
          name: "",
          type: TAG_TYPES.MATERIAL,
          description: "",
          isActive: true,
        });
        fetchTags();
        toast.success("Thêm tag thành công!");
      } catch (error: unknown) {
        console.error("Error creating tag:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message || "Có lỗi xảy ra khi thêm tag."
          );
        } else {
          toast.error("Có lỗi xảy ra khi thêm tag.");
        }
      } finally {
        setSubmitting(false);
      }
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4">Thêm Tag Mới</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Tên tag
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Loại tag
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "MATERIAL" | "USECASE" | "CUSTOM",
                  })
                }
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
              >
                {Object.entries(TAG_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    name: "",
                    type: TAG_TYPES.MATERIAL,
                    description: "",
                    isActive: true,
                  });
                }}
                className="flex-1 px-4 py-2 text-mono-600 border border-mono-300 rounded-lg hover:bg-mono-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-mono-black hover:bg-mono-800 text-white rounded-lg transition-colors disabled:bg-mono-400"
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
    const [formData, setFormData] = useState<{
      name: string;
      type: "MATERIAL" | "USECASE" | "CUSTOM";
      description: string;
    }>({
      name: selectedTag?.name || "",
      type: selectedTag?.type || TAG_TYPES.MATERIAL,
      description: selectedTag?.description || "",
    });

    useEffect(() => {
      if (selectedTag) {
        setFormData({
          name: selectedTag.name,
          type: selectedTag.type,
          description: selectedTag.description || "",
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTag?._id]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedTag) return;

      setSubmitting(true);
      try {
        await adminTagService.update(selectedTag._id, formData);
        setShowEditModal(false);
        setSelectedTag(null);
        fetchTags();
        toast.success("Cập nhật tag thành công!");
      } catch (error: unknown) {
        console.error("Error updating tag:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message ||
              "Có lỗi xảy ra khi cập nhật tag."
          );
        } else {
          toast.error("Có lỗi xảy ra khi cập nhật tag.");
        }
      } finally {
        setSubmitting(false);
      }
    };

    if (!showEditModal || !selectedTag) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4">Chỉnh Sửa Tag</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Tên tag
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Loại tag
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "MATERIAL" | "USECASE" | "CUSTOM",
                  })
                }
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
              >
                {Object.entries(TAG_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTag(null);
                }}
                className="flex-1 px-4 py-2 text-mono-600 border border-mono-300 rounded-lg hover:bg-mono-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-mono-black hover:bg-mono-800 text-white rounded-lg transition-colors disabled:bg-mono-400"
              >
                {submitting ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete Modal
  const DeleteModal = () => {
    if (!showDeleteModal || !selectedTag) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-mono-900 mb-2">
              Xác nhận xóa tag
            </h3>
            <p className="text-center text-mono-600 mb-6">
              Bạn có chắc chắn muốn xóa tag{" "}
              <span className="font-semibold text-mono-900">
                "{selectedTag.name}"
              </span>
              ? Hành động này có thể được khôi phục sau.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTag(null);
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-mono-100 hover:bg-mono-200 text-mono-700 font-medium rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteTag}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                {submitting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // View Detail Modal
  const ViewDetailModal = () => {
    if (!showDetailModal || !selectedTag) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-mono-900">Chi Tiết Tag</h3>
            <button
              onClick={() => {
                setShowDetailModal(false);
                setSelectedTag(null);
              }}
              className="text-mono-400 hover:text-mono-600 transition-colors"
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
            <div className="bg-gradient-to-r from-mono-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-mono-500 mb-1">
                    Tên Tag
                  </h4>
                  <p className="text-xl font-bold text-mono-900">
                    {selectedTag.name}
                  </p>
                  <p className="text-sm text-mono-600 mt-1">
                    Loại:{" "}
                    <span className="font-semibold">
                      {TAG_TYPE_LABELS[selectedTag.type]}
                    </span>
                  </p>
                </div>
                <div>
                  {selectedTag.deletedAt ? (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-mono-200 text-mono-900">
                      Đã xóa
                    </span>
                  ) : selectedTag.isActive ? (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-mono-100 text-mono-800">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-mono-100 text-mono-800">
                      Vô hiệu
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mô tả */}
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-mono-500 mb-2">Mô Tả</h4>
              <p className="text-mono-900">
                {selectedTag.description || "Không có mô tả"}
              </p>
            </div>

            {/* Thông tin chi tiết */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-mono-500 mb-2">
                  Ngày Tạo
                </h4>
                <p className="text-mono-900">
                  {selectedTag.createdAt
                    ? new Date(selectedTag.createdAt).toLocaleString("vi-VN")
                    : "N/A"}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-mono-500 mb-2">
                  Cập Nhật Lần Cuối
                </h4>
                <p className="text-mono-900">
                  {selectedTag.updatedAt
                    ? new Date(selectedTag.updatedAt).toLocaleString("vi-VN")
                    : "N/A"}
                </p>
              </div>
            </div>

            {selectedTag.deletedAt && (
              <div className="border border-mono-300 bg-mono-100 rounded-lg p-4">
                <h4 className="text-sm font-medium text-mono-800 mb-2">
                  Thông Tin Xóa
                </h4>
                <div className="space-y-1">
                  <p className="text-sm text-mono-900">
                    Ngày xóa:{" "}
                    {new Date(selectedTag.deletedAt).toLocaleString("vi-VN")}
                  </p>
                  {selectedTag.deletedBy && (
                    <p className="text-sm text-mono-900">
                      Người xóa:{" "}
                      {typeof selectedTag.deletedBy === "object"
                        ? selectedTag.deletedBy.name || "N/A"
                        : selectedTag.deletedBy}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions - Chỉ nút Đóng */}
            <div className="flex gap-3 pt-4 justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedTag(null);
                }}
                className="px-6 py-2 text-mono-600 border border-mono-300 rounded-lg hover:bg-mono-50 transition-colors"
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mono-400"></div>
      </div>
    );
  }

  const displayTags = showDeleted ? deletedTags : tags;

  return (
    <div className="p-6 w-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-mono-800 tracking-tight leading-snug">
          Quản Lý Tags
        </h2>
        {!isSearchVisible ? (
          <div className="flex gap-3">
            <button
              onClick={toggleSearchVisibility}
              className="flex items-center gap-2 border border-mono-300 bg-white hover:bg-mono-100 text-mono-700 px-5 py-2 rounded-3xl shadow transition-colors font-medium"
            >
              <IoIosSearch className="text-xl" />
              <span>Tìm kiếm</span>
            </button>
            {canCreate() && !showDeleted && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2 bg-mono-black hover:bg-mono-800 text-white rounded-3xl shadow transition-colors font-medium"
              >
                + Thêm Tag
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 w-full max-w-md">
            <IoIosSearch
              onClick={handleBack}
              className="text-mono-400 cursor-pointer text-xl"
            />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Tìm theo tên tag..."
              className="w-full px-4 py-2 border border-mono-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-mono-600"
            />
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {!showDeleted && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-mono-50 to-mono-100 rounded-xl p-6 shadow-sm border border-mono-200">
            <h3 className="text-sm font-medium text-mono-black mb-1">
              Tổng số tags
            </h3>
            <p className="text-3xl font-bold text-mono-900">{totalCount}</p>
          </div>

          <div className="bg-gradient-to-br from-mono-50 to-mono-100 rounded-xl p-6 shadow-sm border border-mono-200">
            <h3 className="text-sm font-medium text-mono-800 mb-1">
              Tags hoạt động
            </h3>
            <p className="text-3xl font-bold text-mono-800">{activeCount}</p>
          </div>

          <div className="bg-gradient-to-br from-mono-100 to-mono-100 rounded-xl p-6 shadow-sm border border-mono-200">
            <h3 className="text-sm font-medium text-mono-700 mb-1">
              Tags vô hiệu
            </h3>
            <p className="text-3xl font-bold text-mono-900">{inactiveCount}</p>
          </div>
        </div>
      )}

      {/* Tab & Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b mb-4 pb-4 gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowDeleted(false);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium transition border-b-2 -mb-4 ${
              !showDeleted
                ? "text-mono-black border-mono-black"
                : "text-mono-500 border-transparent hover:text-mono-black"
            }`}
          >
            Tags đang hoạt động
          </button>
          <button
            onClick={() => {
              setShowDeleted(true);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium transition border-b-2 -mb-4 ${
              showDeleted
                ? "text-mono-black border-mono-black"
                : "text-mono-500 border-transparent hover:text-mono-black"
            }`}
          >
            Tags đã xóa
          </button>
        </div>

        {/* Type Filter */}
        {!showDeleted && (
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-mono-700">
              Lọc theo loại:
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-600"
            >
              <option value="">Tất cả</option>
              {Object.entries(TAG_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <label className="text-sm font-medium text-mono-700">
              Sắp xếp:
            </label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-4 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-600"
            >
              <option value="created_at_desc">Mới nhất</option>
              <option value="created_at_asc">Cũ nhất</option>
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
            </select>
          </div>
        )}
      </div>

      {/* Empty State */}
      {displayTags.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="mx-auto h-16 w-16 text-mono-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <p className="text-mono-500 text-lg mb-4">
            {showDeleted ? "Không có tags đã xóa" : "Chưa có tags nào"}
          </p>
          {canCreate() && !showDeleted && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-mono-black hover:bg-mono-800 text-white rounded-lg transition-colors inline-flex items-center gap-2"
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
              Tạo Tag Đầu Tiên
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Tags Table */}
          <div className="overflow-x-auto shadow rounded-lg">
            <table className="min-w-full bg-white rounded-md overflow-hidden border">
              <thead className="bg-mono-50 text-mono-700 text-sm font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4 text-left border-b">ID</th>
                  <th className="py-3 px-4 text-left border-b">Tên Tag</th>
                  <th className="py-3 px-4 text-left border-b">Loại</th>
                  <th className="py-3 px-4 text-left border-b">Mô Tả</th>
                  <th className="py-3 px-4 text-center border-b">Trạng Thái</th>
                  <th className="py-3 px-4 text-center border-b">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {displayTags.map((tag) => (
                  <tr key={tag._id} className="hover:bg-mono-50 border-t">
                    <td className="py-2 px-4 border-b font-mono text-xs">
                      {tag._id.slice(-8)}
                    </td>
                    <td className="py-2 px-4 border-b text-sm font-semibold">
                      {tag.name}
                    </td>
                    <td className="py-2 px-4 border-b text-sm">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-mono-200 text-mono-800">
                        {TAG_TYPE_LABELS[tag.type]}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b text-sm text-mono-600">
                      {tag.description?.substring(0, 50) || "—"}
                      {tag.description && tag.description.length > 50 && "..."}
                    </td>
                    <td className="py-2 px-4 border-b text-center text-sm">
                      {tag.isActive ? (
                        <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-mono-100 text-mono-800">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-mono-100 text-mono-800">
                          Vô hiệu
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-center text-sm">
                      <div className="flex flex-wrap gap-1.5 justify-center min-w-[140px]">
                        {!showDeleted ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTag(tag);
                                setShowDetailModal(true);
                              }}
                              className="px-3 py-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 text-xs font-medium rounded-lg border border-mono-200 transition-colors flex items-center gap-1.5"
                            >
                              <svg
                                className="w-3.5 h-3.5"
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
                              Xem
                            </button>
                            {canUpdate() && (
                              <button
                                onClick={() => {
                                  setSelectedTag(tag);
                                  setShowEditModal(true);
                                }}
                                className="px-3 py-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 text-xs font-medium rounded-lg border border-mono-200 transition-colors flex items-center gap-1.5"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
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
                                onClick={() => handleDeleteTag(tag)}
                                className="px-3 py-1.5 bg-mono-100 hover:bg-mono-200 text-mono-800 text-xs font-medium rounded-lg border border-mono-300 transition-colors flex items-center gap-1.5"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
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
                                  handleToggleStatus(tag._id, tag.isActive)
                                }
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                                  tag.isActive
                                    ? "bg-mono-100 hover:bg-mono-100 text-mono-700 border-mono-200"
                                    : "bg-mono-50 hover:bg-mono-100 text-mono-700 border-mono-200"
                                }`}
                              >
                                <svg
                                  className="w-3.5 h-3.5"
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
                                {tag.isActive ? "Tắt" : "Bật"}
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTag(tag);
                                setShowDetailModal(true);
                              }}
                              className="px-3 py-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 text-xs font-medium rounded-lg border border-mono-200 transition-colors flex items-center gap-1.5"
                            >
                              <svg
                                className="w-3.5 h-3.5"
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
                              Xem
                            </button>
                            {canDelete() && (
                              <button
                                onClick={() => handleRestoreTag(tag._id)}
                                className="px-3 py-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 text-xs font-medium rounded-lg border border-mono-200 transition-colors flex items-center gap-1.5"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - Giống BrandPage */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-mono-600">
              Trang {currentPage} / {totalPages} • Tổng: {totalCount} tags
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? "bg-mono-300 text-mono-500 cursor-not-allowed"
                    : "bg-mono-200 text-mono-700 hover:bg-mono-300"
                }`}
              >
                Trước
              </button>

              {/* Page Numbers */}
              {(() => {
                const pages = [];
                const showPages = 5;
                let startPage = Math.max(
                  1,
                  currentPage - Math.floor(showPages / 2)
                );
                const endPage = Math.min(totalPages, startPage + showPages - 1);

                if (endPage - startPage < showPages - 1) {
                  startPage = Math.max(1, endPage - showPages + 1);
                }

                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-2 rounded-lg font-medium bg-mono-200 text-mono-700 hover:bg-mono-300 transition-all"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="px-2 text-mono-500">
                        ...
                      </span>
                    );
                  }
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-2 rounded-lg font-medium transition-all ${
                        i === currentPage
                          ? "bg-mono-black text-white"
                          : "bg-mono-200 text-mono-700 hover:bg-mono-300"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className="px-2 text-mono-500">
                        ...
                      </span>
                    );
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 rounded-lg font-medium bg-mono-200 text-mono-700 hover:bg-mono-300 transition-all"
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
                    ? "bg-mono-300 text-mono-500 cursor-not-allowed"
                    : "bg-mono-200 text-mono-700 hover:bg-mono-300"
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

export default TagPage;
