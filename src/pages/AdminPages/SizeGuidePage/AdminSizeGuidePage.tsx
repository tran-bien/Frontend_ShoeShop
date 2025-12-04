import { useState, useEffect, useCallback } from "react";
import { adminSizeGuideService } from "../../../services/SizeGuideService";
import type { LegacySizeGuide } from "../../../types/sizeGuide";
import { useAuth } from "../../../hooks/useAuth";
import toast from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import SizeGuideFormModal from "../../../components/Admin/SizeGuide/SizeGuideFormModal";

const AdminSizeGuidePage = () => {
  const { canCreate, canUpdate, canDelete } = useAuth();

  const [sizeGuides, setSizeGuides] = useState<LegacySizeGuide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<LegacySizeGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSizeGuide, setEditingSizeGuide] =
    useState<LegacySizeGuide | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch size guides
  const fetchSizeGuides = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminSizeGuideService.getAllSizeGuides();
      const sizeGuidesData = (response.data.data || []) as LegacySizeGuide[];
      setSizeGuides(sizeGuidesData);
      setFilteredGuides(sizeGuidesData);
    } catch (error) {
      console.error("Failed to fetch size guides:", error);
      toast.error("Không thể tải danh sách hướng dẫn size");
      setSizeGuides([]);
      setFilteredGuides([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSizeGuides();
  }, [fetchSizeGuides]);

  // Filter by search
  useEffect(() => {
    if (searchQuery) {
      const filtered = sizeGuides.filter((guide) =>
        guide.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGuides(filtered);
    } else {
      setFilteredGuides(sizeGuides);
    }
  }, [searchQuery, sizeGuides]);

  // Delete size guide
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa hướng dẫn size này?")) return;

    try {
      await adminSizeGuideService.deleteSizeGuide(id);
      toast.success("Đã xóa hướng dẫn size");
      fetchSizeGuides();
    } catch (error) {
      console.error("Failed to delete size guide:", error);
      toast.error("Không thể xóa hướng dẫn size");
    }
  };

  // Stats
  const stats = {
    total: sizeGuides.length,
    active: sizeGuides.filter((g) => g.isActive).length,
    withImages: sizeGuides.filter(
      (g) => g.sizeChart?.image || g.measurementGuide?.image
    ).length,
  };

  return (
    <div className="min-h-screen bg-mono-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-mono-black mb-2">
            Quản lý Size Guide
          </h1>
          <p className="text-mono-600">
            Quản lý hướng dẫn chọn size cho từng sản phẩm
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border border-mono-200 rounded-xl p-6 hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-mono-600 uppercase tracking-wider mb-1">
                  Tổng số
                </p>
                <p className="text-3xl font-bold text-mono-black">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-mono-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-mono-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border border-mono-200 rounded-xl p-6 hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-mono-600 uppercase tracking-wider mb-1">
                  Đang hoạt động
                </p>
                <p className="text-3xl font-bold text-mono-black">
                  {stats.active}
                </p>
              </div>
              <div className="w-12 h-12 bg-mono-50 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-mono-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
          </div>

          <div className="bg-white border border-mono-200 rounded-xl p-6 hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-mono-600 uppercase tracking-wider mb-1">
                  Có hình ảnh
                </p>
                <p className="text-3xl font-bold text-mono-black">
                  {stats.withImages}
                </p>
              </div>
              <div className="w-12 h-12 bg-mono-100 rounded-xl flex items-center justify-center">
                <PhotoIcon className="w-6 h-6 text-mono-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white border border-mono-200 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3 flex-wrap flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[240px]">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
                />
              </div>
            </div>

            {/* Create Button */}
            {canCreate() && (
              <button
                onClick={() => {
                  setEditingSizeGuide(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Tạo Size Guide
              </button>
            )}
          </div>
        </div>

        {/* Size Guides List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-mono-300 border-t-mono-black rounded-full animate-spin" />
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="bg-white border border-mono-200 rounded-xl p-12 text-center">
            <p className="text-mono-600">
              {searchQuery
                ? "Không tìm thấy size guide phù hợp"
                : "Chưa có size guide nào"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGuides.map((guide) => (
              <div
                key={guide._id}
                className="bg-white border border-mono-200 rounded-xl p-6 hover:shadow-medium transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-mono-black mb-1">
                      {guide.product.name}
                    </h3>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        guide.isActive
                          ? "bg-mono-100 text-mono-700"
                          : "bg-mono-100 text-mono-500"
                      }`}
                    >
                      {guide.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {canUpdate() && (
                      <button
                        onClick={() => {
                          setEditingSizeGuide(guide);
                          setShowModal(true);
                        }}
                        className="p-2 text-mono-600 hover:text-mono-black hover:bg-mono-100 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                    {canDelete() && (
                      <button
                        onClick={() => handleDelete(guide._id)}
                        className="p-2 text-mono-700 hover:text-mono-800 hover:bg-mono-100 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Size Chart */}
                <div className="space-y-4">
                  <div className="border border-mono-200 rounded-lg p-4 bg-mono-50">
                    <h4 className="text-sm font-semibold text-mono-700 mb-2 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Bảng size
                    </h4>
                    {guide.sizeChart.image && (
                      <img
                        src={guide.sizeChart.image.url}
                        alt="Size chart"
                        className="w-full h-40 object-contain bg-white rounded-lg mb-2"
                      />
                    )}
                    <p className="text-xs text-mono-600 line-clamp-3">
                      {guide.sizeChart.description || "Chưa có mô tả"}
                    </p>
                  </div>

                  {/* Measurement Guide */}
                  <div className="border border-mono-200 rounded-lg p-4 bg-mono-50">
                    <h4 className="text-sm font-semibold text-mono-700 mb-2 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                        />
                      </svg>
                      Hướng dẫn đo
                    </h4>
                    {guide.measurementGuide.image && (
                      <img
                        src={guide.measurementGuide.image.url}
                        alt="Measurement guide"
                        className="w-full h-40 object-contain bg-white rounded-lg mb-2"
                      />
                    )}
                    <p className="text-xs text-mono-600 line-clamp-3">
                      {guide.measurementGuide.description || "Chưa có mô tả"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <SizeGuideFormModal
            sizeGuide={editingSizeGuide}
            onClose={() => {
              setShowModal(false);
              setEditingSizeGuide(null);
            }}
            onSuccess={() => {
              setShowModal(false);
              setEditingSizeGuide(null);
              fetchSizeGuides();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminSizeGuidePage;




