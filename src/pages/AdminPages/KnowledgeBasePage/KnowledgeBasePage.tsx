import React, { useState, useEffect, useCallback } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiDownload,
  FiUpload,
  FiDatabase,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiBook,
  FiTag,
  FiFilter,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { adminKnowledgeService } from "../../../services/KnowledgeService";
import type {
  KnowledgeDocument,
  KnowledgeCategory,
} from "../../../types/knowledge";
import { KnowledgeModal, ImportModal, DeleteConfirmModal } from "./components";

// Các category có sẵn - khớp với BE enum
const CATEGORIES: { value: KnowledgeCategory; label: string; icon: string }[] =
  [
    { value: "category_info", label: "Danh mục Sản phẩm", icon: "📚" },
    { value: "policy", label: "Chính sách", icon: "📋" },
    { value: "faq", label: "FAQ", icon: "❓" },
    { value: "brand_info", label: "Thương hiệu", icon: "🏷️" },
    { value: "product_info", label: "Thông tin Sản phẩm", icon: "👟" },
    { value: "how_to_size", label: "Hướng dẫn size", icon: "📏" },
  ];

// Interface khớp với BE response
interface Statistics {
  total: number;
  active: number;
  inactive: number;
  byCategory: Array<{ _id: string; count: number }>;
  bySource: Array<{ _id: string; count: number }>;
  recentUpdates: Array<{
    _id: string;
    title: string;
    category: string;
    updatedAt: string;
  }>;
}

const KnowledgeBasePage: React.FC = () => {
  // State
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<KnowledgeDocument | null>(null);
  const [documentToDelete, setDocumentToDelete] =
    useState<KnowledgeDocument | null>(null);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: 10,
      };
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.isActive = statusFilter === "active";

      const response = await adminKnowledgeService.getAllDocuments(params);
      if (response.data.success && response.data.data) {
        // BE trả về: { data: [...documents], pagination: { page, limit, total, pages } }
        setDocuments(response.data.data.data || []);
        if (response.data.data.pagination) {
          setTotalPages(response.data.data.pagination.pages || 1);
        }
      }
    } catch (error) {
      console.error("Fetch documents error:", error);
      toast.error("Không thể tải danh sách tài liệu");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, categoryFilter, statusFilter]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await adminKnowledgeService.getStatistics();
      if (response.data.success && response.data.data) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("Fetch statistics error:", error);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchStatistics();
  }, [fetchDocuments, fetchStatistics]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDocuments();
  };

  const handleCreateNew = () => {
    setSelectedDocument(null);
    setIsModalOpen(true);
  };

  const handleEdit = (doc: KnowledgeDocument) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const handleDelete = (doc: KnowledgeDocument) => {
    setDocumentToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    try {
      await adminKnowledgeService.deleteDocument(documentToDelete._id);
      toast.success("Đã xóa tài liệu");
      setIsDeleteModalOpen(false);
      setDocumentToDelete(null);
      fetchDocuments();
      fetchStatistics();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Không thể xóa tài liệu");
    }
  };

  // Clear All Documents - DANGEROUS
  const handleClearAll = async () => {
    try {
      const response = await adminKnowledgeService.clearAllDocuments();
      if (response.data.success) {
        toast.success(
          response.data.message || "Đã xóa toàn bộ dữ liệu huấn luyện"
        );
        // Cast to check for warning property
        const resData = response.data as { warning?: string };
        if (resData.warning) {
          toast(resData.warning, { icon: "⚠️", duration: 5000 });
        }
        setIsClearAllModalOpen(false);
        fetchDocuments();
        fetchStatistics();
      }
    } catch (error) {
      console.error("Clear all error:", error);
      toast.error("Không thể xóa dữ liệu");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await adminKnowledgeService.downloadExcelTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "knowledge_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Đã tải template Excel");
    } catch (error) {
      console.error("Download template error:", error);
      toast.error("Không thể tải template");
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
    fetchDocuments();
    fetchStatistics();
  };

  const handleImportSuccess = () => {
    setIsImportModalOpen(false);
    fetchDocuments();
    fetchStatistics();
  };

  const getCategoryInfo = (category: string) => {
    return (
      CATEGORIES.find((c) => c.value === category) || {
        value: category,
        label: category,
        icon: "📄",
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-mono-900 flex items-center gap-2">
            <FiDatabase className="text-mono-600" />
            Knowledge Base
          </h1>
          <p className="text-mono-500 mt-1">
            Quản lý dữ liệu huấn luyện cho AI Chatbot
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsClearAllModalOpen(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            title="Xóa toàn bộ dữ liệu huấn luyện"
          >
            <FiTrash2 className="w-4 h-4" />
            Clear All
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-mono-100 text-mono-700 rounded-lg hover:bg-mono-200 transition-colors flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <FiUpload className="w-4 h-4" />
            Import Excel
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-mono-900 text-white rounded-lg hover:bg-mono-800 transition-colors flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-mono-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiFileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-mono-500 text-sm">Tổng tài liệu</p>
                <p className="text-2xl font-bold text-mono-900">
                  {statistics.total}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-mono-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-mono-500 text-sm">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">
                  {statistics.active}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-mono-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FiXCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-mono-500 text-sm">Đã tắt</p>
                <p className="text-2xl font-bold text-red-600">
                  {statistics.inactive}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-mono-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiBook className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-mono-500 text-sm">Danh mục</p>
                <p className="text-2xl font-bold text-purple-600">
                  {statistics.byCategory?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-mono-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm tài liệu..."
                className="w-full pl-10 pr-4 py-2 border border-mono-200 rounded-lg focus:ring-2 focus:ring-mono-900 focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-48">
            <div className="relative">
              <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-mono-200 rounded-lg focus:ring-2 focus:ring-mono-900 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Tất cả danh mục</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-40">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-mono-200 rounded-lg focus:ring-2 focus:ring-mono-900 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Đã tắt</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-mono-900 text-white rounded-lg hover:bg-mono-800 transition-colors"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-mono-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mono-900"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FiAlertTriangle className="w-12 h-12 text-mono-300 mx-auto mb-4" />
            <p className="text-mono-500">Không tìm thấy tài liệu nào</p>
            <button
              onClick={handleCreateNew}
              className="mt-4 px-4 py-2 bg-mono-900 text-white rounded-lg hover:bg-mono-800 transition-colors"
            >
              Thêm tài liệu đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-mono-50 border-b border-mono-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-mono-700">
                    Tiêu đề
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-mono-700">
                    Danh mục
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-mono-700">
                    Tags
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-mono-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-mono-700">
                    Nguồn
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-mono-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mono-100">
                {documents.map((doc) => {
                  const catInfo = getCategoryInfo(doc.category);
                  return (
                    <tr key={doc._id} className="hover:bg-mono-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-mono-900 line-clamp-1">
                            {doc.title}
                          </p>
                          <p className="text-sm text-mono-500 line-clamp-1 mt-0.5">
                            {doc.content.substring(0, 80)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-mono-100 rounded-full text-sm">
                          {catInfo.icon} {catInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {doc.tags.length > 3 && (
                            <span className="px-2 py-0.5 bg-mono-100 text-mono-500 rounded text-xs">
                              +{doc.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {doc.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            <FiCheckCircle className="w-3 h-3" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                            <FiXCircle className="w-3 h-3" />
                            Đã tắt
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-mono-500">
                          {doc.metadata?.source === "excel_import"
                            ? "Excel Import"
                            : "Manual"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(doc)}
                            className="p-2 text-mono-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc)}
                            className="p-2 text-mono-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-mono-200">
            <p className="text-sm text-mono-500">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-mono-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-mono-50"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-mono-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-mono-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <KnowledgeModal
          document={selectedDocument}
          categories={CATEGORIES}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDocument(null);
          }}
          onSuccess={handleModalSuccess}
        />
      )}

      {isImportModalOpen && (
        <ImportModal
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={handleImportSuccess}
        />
      )}

      {isDeleteModalOpen && documentToDelete && (
        <DeleteConfirmModal
          title={documentToDelete.title}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDocumentToDelete(null);
          }}
          onConfirm={confirmDelete}
        />
      )}

      {/* Clear All Confirmation Modal */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiAlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-mono-900">
                  Xóa toàn bộ Knowledge Base?
                </h3>
                <p className="text-sm text-mono-500">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                <strong>⚠️ Cảnh báo:</strong> Thao tác này sẽ xóa{" "}
                <strong>{statistics?.total || 0}</strong> tài liệu và AI sẽ quay
                về trạng thái chưa được huấn luyện.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 border border-mono-200 rounded-lg hover:bg-mono-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xác nhận xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBasePage;
