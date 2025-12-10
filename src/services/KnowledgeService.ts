import { axiosInstanceAuth } from "../utils/axiosIntance";
import type { ApiResponse } from "../types/api";
import type {
  KnowledgeDocument,
  CreateKnowledgeDocumentData,
  UpdateKnowledgeDocumentData,
  KnowledgeQueryParams,
  KnowledgeDocumentsResponse,
  KnowledgeStatisticsResponse,
  ExcelValidationResponse,
  ExcelImportResponse,
} from "../types/knowledge";

// Re-export types để tiện sử dụng
export type {
  KnowledgeDocument,
  CreateKnowledgeDocumentData,
  UpdateKnowledgeDocumentData,
  KnowledgeQueryParams,
  KnowledgeDocumentsResponse,
  KnowledgeStatisticsResponse,
  ExcelValidationResponse,
  ExcelImportResponse,
};

// =======================
// ADMIN KNOWLEDGE SERVICE
// =======================

export const adminKnowledgeService = {
  // Lấy danh sách knowledge documents
  getAllDocuments: (
    params?: KnowledgeQueryParams
  ): Promise<{ data: ApiResponse<KnowledgeDocumentsResponse> }> =>
    axiosInstanceAuth.get("/api/v1/admin/knowledge-base", { params }),

  // Lấy chi tiết document
  getDocumentById: (
    id: string
  ): Promise<{ data: ApiResponse<KnowledgeDocument> }> =>
    axiosInstanceAuth.get(`/api/v1/admin/knowledge-base/${id}`),

  // Tạo document mới
  createDocument: (
    data: CreateKnowledgeDocumentData
  ): Promise<{ data: ApiResponse<KnowledgeDocument> }> =>
    axiosInstanceAuth.post("/api/v1/admin/knowledge-base", data),

  // Cập nhật document
  updateDocument: (
    id: string,
    data: UpdateKnowledgeDocumentData
  ): Promise<{ data: ApiResponse<KnowledgeDocument> }> =>
    axiosInstanceAuth.put(`/api/v1/admin/knowledge-base/${id}`, data),

  // Xóa document
  deleteDocument: (id: string): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(`/api/v1/admin/knowledge-base/${id}`),

  // Lấy thống kê knowledge base
  getStatistics: (): Promise<{
    data: ApiResponse<KnowledgeStatisticsResponse>;
  }> => axiosInstanceAuth.get("/api/v1/admin/knowledge-base/statistics"),

  // Clear all documents (Admin only - DANGEROUS)
  clearAllDocuments: (): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete("/api/v1/admin/knowledge-base/clear-all"),

  // Download Excel template
  downloadExcelTemplate: (): Promise<Blob> =>
    axiosInstanceAuth
      .get("/api/v1/admin/knowledge-base/excel/template", {
        responseType: "blob",
      })
      .then((res) => res.data),

  // Validate Excel file before import
  validateExcelFile: (
    formData: FormData
  ): Promise<{ data: ApiResponse<ExcelValidationResponse> }> =>
    axiosInstanceAuth.post(
      "/api/v1/admin/knowledge-base/excel/validate",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    ),

  // Import from Excel
  importFromExcel: (
    formData: FormData
  ): Promise<{ data: ApiResponse<ExcelImportResponse> }> =>
    axiosInstanceAuth.post(
      "/api/v1/admin/knowledge-base/excel/import",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    ),

  // Clear Excel training data
  clearExcelTraining: (): Promise<{ data: ApiResponse }> =>
    axiosInstanceAuth.delete(
      "/api/v1/admin/knowledge-base/excel/clear-training"
    ),
};

export default adminKnowledgeService;
