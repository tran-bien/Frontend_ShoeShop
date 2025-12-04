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
  MATERIAL: "Ch?t li?u",
  USECASE: "Nhu c?u s? d?ng",
  CUSTOM: "Tùy ch?nh",
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

      // L?y stats t?ng th?
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
        `${currentStatus ? "Vô hi?u hóa" : "Kích ho?t"} tag thành công!`
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
            "Có l?i x?y ra khi thay d?i tr?ng thái."
        );
      } else {
        toast.error("Có l?i x?y ra khi thay d?i tr?ng thái.");
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
          axiosError.response?.data?.message || "Có l?i x?y ra khi xóa tag"
        );
      } else {
        toast.error("Có l?i x?y ra khi xóa tag");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestoreTag = async (tagId: string) => {
    try {
      await adminTagService.restore(tagId);
      toast.success("Khôi ph?c tag thành công!");
      fetchDeletedTags();
    } catch (error: unknown) {
      console.error("Error restoring tag:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message ||
            "Có l?i x?y ra khi khôi ph?c tag"
        );
      } else {
        toast.error("Có l?i x?y ra khi khôi ph?c tag");
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
            axiosError.response?.data?.message || "Có l?i x?y ra khi thêm tag."
          );
        } else {
          toast.error("Có l?i x?y ra khi thêm tag.");
        }
      } finally {
        setSubmitting(false);
      }
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4">Thêm Tag M?i</h3>
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
                Lo?i tag
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
                Mô t?
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
                H?y
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-mono-black hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-mono-400"
              >
                {submitting ? "Ðang thêm..." : "Thêm"}
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
        toast.success("C?p nh?t tag thành công!");
      } catch (error: unknown) {
        console.error("Error updating tag:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosError.response?.data?.message ||
              "Có l?i x?y ra khi c?p nh?t tag."
          );
        } else {
          toast.error("Có l?i x?y ra khi c?p nh?t tag.");
        }
      } finally {
        setSubmitting(false);
      }
    };

    if (!showEditModal || !selectedTag) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4">Ch?nh S?a Tag</h3>
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
                Lo?i tag
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
                Mô t?
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
                H?y
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-mono-black hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-mono-400"
              >
                {submitting ? "Ðang c?p nh?t..." : "C?p nh?t"}
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
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4 text-mono-900">Xác Nh?n Xóa</h3>
          <p className="text-mono-700 mb-6">
            B?n có ch?c ch?n mu?n xóa tag <strong>"{selectedTag.name}"</strong>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedTag(null);
              }}
              disabled={submitting}
              className="flex-1 px-4 py-2 text-mono-600 border border-mono-300 rounded-lg hover:bg-mono-50 transition-colors"
            >
              H?y
            </button>
            <button
              onClick={confirmDeleteTag}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-mono-900 hover:bg-red-700 text-white rounded-lg transition-colors disabled:bg-mono-400"
            >
              {submitting ? "Ðang xóa..." : "Xóa"}
            </button>
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
            <h3 className="text-2xl font-bold text-mono-900">Chi Ti?t Tag</h3>
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
            {/* Tên và Tr?ng thái */}
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
                    Lo?i:{" "}
                    <span className="font-semibold">
                      {TAG_TYPE_LABELS[selectedTag.type]}
                    </span>
                  </p>
                </div>
                <div>
                  {selectedTag.deletedAt ? (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                      Ðã xóa
                    </span>
                  ) : selectedTag.isActive ? (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      Ho?t d?ng
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                      Vô hi?u
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mô t? */}
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-mono-500 mb-2">Mô T?</h4>
              <p className="text-mono-900">
                {selectedTag.description || "Không có mô t?"}
              </p>
            </div>

            {/* Thông tin chi ti?t */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-mono-500 mb-2">
                  Ngày T?o
                </h4>
                <p className="text-mono-900">
                  {selectedTag.createdAt
                    ? new Date(selectedTag.createdAt).toLocaleString("vi-VN")
                    : "N/A"}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-mono-500 mb-2">
                  C?p Nh?t L?n Cu?i
                </h4>
                <p className="text-mono-900">
                  {selectedTag.updatedAt
                    ? new Date(selectedTag.updatedAt).toLocaleString("vi-VN")
                    : "N/A"}
                </p>
              </div>
            </div>

            {selectedTag.deletedAt && (
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-700 mb-2">
                  Thông Tin Xóa
                </h4>
                <div className="space-y-1">
                  <p className="text-sm text-red-900">
                    Ngày xóa:{" "}
                    {new Date(selectedTag.deletedAt).toLocaleString("vi-VN")}
                  </p>
                  {selectedTag.deletedBy && (
                    <p className="text-sm text-red-900">
                      Ngu?i xóa:{" "}
                      {typeof selectedTag.deletedBy === "object"
                        ? selectedTag.deletedBy.name || "N/A"
                        : selectedTag.deletedBy}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {!selectedTag.deletedAt && (
                <>
                  {canUpdate() && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setShowEditModal(true);
                      }}
                      className="px-6 py-2 bg-mono-black hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Ch?nh S?a
                    </button>
                  )}
                  {canToggleStatus() && (
                    <button
                      onClick={async () => {
                        await handleToggleStatus(
                          selectedTag._id,
                          selectedTag.isActive
                        );
                        setShowDetailModal(false);
                        setSelectedTag(null);
                      }}
                      className={`px-6 py-2 rounded-lg transition-colors ${
                        selectedTag.isActive
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                          : "bg-mono-700 hover:bg-mono-800 text-white"
                      }`}
                    >
                      {selectedTag.isActive ? "Vô hi?u hóa" : "Kích ho?t"}
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedTag(null);
                }}
                className="px-6 py-2 text-mono-600 border border-mono-300 rounded-lg hover:bg-mono-50 transition-colors"
              >
                Ðóng
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
          Qu?n Lý Tags
        </h2>
        {!isSearchVisible ? (
          <div className="flex gap-3">
            <button
              onClick={toggleSearchVisibility}
              className="flex items-center gap-2 border border-mono-300 bg-white hover:bg-mono-100 text-mono-700 px-5 py-2 rounded-3xl shadow transition-colors font-medium"
            >
              <IoIosSearch className="text-xl" />
              <span>Tìm ki?m</span>
            </button>
            {canCreate() && !showDeleted && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2 bg-mono-black hover:bg-blue-700 text-white rounded-3xl shadow transition-colors font-medium"
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
      {!showDeleted ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-mono-50 to-mono-100 rounded-xl p-6 shadow-sm border border-mono-200">
            <h3 className="text-sm font-medium text-mono-black mb-1">
              T?ng s? tags
            </h3>
            <p className="text-3xl font-bold text-blue-900">{totalCount}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200">
            <h3 className="text-sm font-medium text-mono-800 mb-1">
              Tags ho?t d?ng
            </h3>
            <p className="text-3xl font-bold text-green-900">{activeCount}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 shadow-sm border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-600 mb-1">
              Tags vô hi?u
            </h3>
            <p className="text-3xl font-bold text-yellow-900">
              {inactiveCount}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-sm border border-red-200 mb-6">
          <h3 className="text-sm font-medium text-mono-900 mb-1">
            Tags dã xóa
          </h3>
          <p className="text-3xl font-bold text-red-900">{deletedCount}</p>
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
            Tags dang ho?t d?ng
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
            Tags dã xóa
          </button>
        </div>

        {/* Type Filter */}
        {!showDeleted && (
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-mono-700">
              L?c theo lo?i:
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-600"
            >
              <option value="">T?t c?</option>
              {Object.entries(TAG_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <label className="text-sm font-medium text-mono-700">
              S?p x?p:
            </label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-4 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-600"
            >
              <option value="created_at_desc">M?i nh?t</option>
              <option value="created_at_asc">Cu nh?t</option>
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
            {showDeleted ? "Không có tags dã xóa" : "Chua có tags nào"}
          </p>
          {canCreate() && !showDeleted && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-mono-black hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
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
              T?o Tag Ð?u Tiên
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
                  <th className="py-3 px-4 text-left border-b">Lo?i</th>
                  <th className="py-3 px-4 text-left border-b">Mô T?</th>
                  <th className="py-3 px-4 text-center border-b">Tr?ng Thái</th>
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
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {TAG_TYPE_LABELS[tag.type]}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b text-sm text-mono-600">
                      {tag.description?.substring(0, 50) || "—"}
                      {tag.description && tag.description.length > 50 && "..."}
                    </td>
                    <td className="py-2 px-4 border-b text-center text-sm">
                      {tag.isActive ? (
                        <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Ho?t d?ng
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          Vô hi?u
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-center text-sm">
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {!showDeleted ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTag(tag);
                                setShowDetailModal(true);
                              }}
                              className="px-3 py-1.5 bg-mono-50 hover:bg-mono-100 text-blue-700 text-xs rounded-lg border border-mono-200"
                            >
                              Xem
                            </button>
                            {canUpdate() && (
                              <button
                                onClick={() => {
                                  setSelectedTag(tag);
                                  setShowEditModal(true);
                                }}
                                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded-lg border border-green-200"
                              >
                                S?a
                              </button>
                            )}
                            {canDelete() && (
                              <button
                                onClick={() => handleDeleteTag(tag)}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs rounded-lg border border-red-200"
                              >
                                Xóa
                              </button>
                            )}
                            {canToggleStatus() && (
                              <button
                                onClick={() =>
                                  handleToggleStatus(tag._id, tag.isActive)
                                }
                                className={`px-3 py-1.5 text-xs rounded-lg border ${
                                  tag.isActive
                                    ? "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                                    : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                }`}
                              >
                                {tag.isActive ? "T?t" : "B?t"}
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
                              className="px-3 py-1.5 bg-mono-50 hover:bg-mono-100 text-blue-700 text-xs rounded-lg border border-mono-200"
                            >
                              Xem
                            </button>
                            {canDelete() && (
                              <button
                                onClick={() => handleRestoreTag(tag._id)}
                                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded-lg border border-green-200"
                              >
                                Khôi ph?c
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

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-mono-600">
              Trang {currentPage} / {totalPages} • T?ng: {totalCount} tags
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium ${
                  currentPage === 1
                    ? "bg-mono-300 text-mono-500 cursor-not-allowed"
                    : "bg-mono-200 text-mono-700 hover:bg-mono-300"
                }`}
              >
                Tru?c
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium ${
                  currentPage === totalPages
                    ? "bg-mono-300 text-mono-500 cursor-not-allowed"
                    : "bg-mono-200 text-mono-700 hover:bg-mono-300"
                }`}
              >
                Ti?p
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
