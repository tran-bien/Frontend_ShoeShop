import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import { adminSizeGuideService } from "../../../services/SizeGuideService";

interface SizeGuide {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
  };
  sizeChart: {
    description: string;
    image?: {
      url: string;
      public_id: string;
    };
  };
  measurementGuide: {
    description: string;
    image?: {
      url: string;
      public_id: string;
    };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const SizeGuideManagement: React.FC = () => {
  const [sizeGuides, setSizeGuides] = useState<SizeGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<SizeGuide | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch size guides
  useEffect(() => {
    fetchSizeGuides();
  }, []);

  const fetchSizeGuides = async () => {
    try {
      setLoading(true);
      const response = await adminSizeGuideService.getAllSizeGuides();
      if (response.data.success) {
        // Handle both old and new response structure
        const guides = Array.isArray(response.data.data)
          ? response.data.data
          : (response.data.data as unknown as { sizeGuides: SizeGuide[] })
              .sizeGuides || [];
        setSizeGuides(guides as SizeGuide[]);
      }
    } catch (error) {
      console.error("Error fetching size guides:", error);
      toast.error("Không thể tải danh sách size guide");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa size guide này?")) return;

    try {
      await adminSizeGuideService.deleteSizeGuide(id);
      toast.success("Xóa size guide thành công");
      fetchSizeGuides();
    } catch (error) {
      console.error("Error deleting size guide:", error);
      toast.error("Không thể xóa size guide");
    }
  };

  // Note: handleToggleActive is available but not currently used in UI
  // Uncomment and use when needed:
  // const handleToggleActive = async (id: string, currentStatus: boolean) => {
  //   try {
  //     await adminSizeGuideService.updateSizeGuide(id, { isActive: !currentStatus });
  //     toast.success("Cập nhật trạng thái thành công");
  //     fetchSizeGuides();
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //     toast.error("Không thể cập nhật trạng thái");
  //   }
  // };

  const filteredGuides = sizeGuides.filter((guide) =>
    guide.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">
          Quản Lý Size Guide
        </h1>
        <p className="text-gray-600">
          Quản lý hướng dẫn chọn size cho sản phẩm
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Thêm Size Guide
        </button>
      </div>

      {/* Size Guides Grid */}
      {filteredGuides.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Chưa có size guide nào</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Tạo size guide đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <div
              key={guide._id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Product Name */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-black truncate">
                  {guide.product.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  ID: {guide.product._id}
                </p>
              </div>

              {/* Content Preview */}
              <div className="p-4">
                {/* Size Chart */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Bảng Size:
                  </p>
                  {guide.sizeChart.image ? (
                    <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={guide.sizeChart.image.url}
                        alt="Size Chart"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FiImage className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  {guide.sizeChart.description && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {guide.sizeChart.description}
                    </p>
                  )}
                </div>

                {/* Measurement Guide */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Hướng Dẫn Đo:
                  </p>
                  {guide.measurementGuide.image ? (
                    <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={guide.measurementGuide.image.url}
                        alt="Measurement Guide"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FiImage className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="px-4 pb-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    guide.isActive
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {guide.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex border-t border-gray-200">
                <button
                  onClick={() => setSelectedGuide(guide)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors border-r border-gray-200"
                >
                  <FiEye className="w-4 h-4" />
                  <span className="text-sm">Xem</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedGuide(guide);
                    setShowCreateModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors border-r border-gray-200"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span className="text-sm">Sửa</span>
                </button>
                <button
                  onClick={() => handleDelete(guide._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors text-red-600"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span className="text-sm">Xóa</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal - TODO: Implement */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {selectedGuide ? "Chỉnh Sửa" : "Thêm"} Size Guide
            </h2>
            <p className="text-gray-600">TODO: Implement form</p>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setSelectedGuide(null);
              }}
              className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SizeGuideManagement;
