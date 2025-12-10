/**
 * Knowledge Types
 * Định nghĩa các interface liên quan đến Knowledge Base
 */

// =======================
// KNOWLEDGE CATEGORY ENUM
// =======================

export type KnowledgeCategory =
  | "category_info" // Danh mục sản phẩm
  | "policy" // Chính sách (đổi trả, vận chuyển, thanh toán)
  | "faq" // Câu hỏi thường gặp
  | "brand_info" // Thông tin thương hiệu
  | "product_info" // Thông tin sản phẩm
  | "how_to_size"; // Hướng dẫn chọn size

export const KNOWLEDGE_CATEGORIES: {
  value: KnowledgeCategory;
  label: string;
  icon: string;
}[] = [
  { value: "category_info", label: "Danh mục SP", icon: "📚" },
  { value: "policy", label: "Chính sách", icon: "📋" },
  { value: "faq", label: "FAQ", icon: "❓" },
  { value: "brand_info", label: "Thương hiệu", icon: "🏷️" },
  { value: "product_info", label: "Thông tin Sản phẩm", icon: "👟" },
  { value: "how_to_size", label: "Hướng dẫn size", icon: "📏" },
];

// =======================
// KNOWLEDGE DOCUMENT TYPES
// =======================

export interface KnowledgeDocument {
  _id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  tags: string[];
  priority?: number;
  isActive: boolean;
  metadata?: {
    source?: "manual" | "excel_import";
    lastUpdatedBy?: {
      _id: string;
      name: string;
      email: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateKnowledgeDocumentData {
  title: string;
  content: string;
  category: KnowledgeCategory;
  tags?: string[];
  priority?: number;
  isActive?: boolean;
}

export interface UpdateKnowledgeDocumentData {
  title?: string;
  content?: string;
  category?: KnowledgeCategory;
  tags?: string[];
  priority?: number;
  isActive?: boolean;
}

export interface KnowledgeQueryParams {
  page?: number;
  limit?: number;
  category?: KnowledgeCategory;
  isActive?: boolean;
  search?: string;
}

// =======================
// RESPONSE TYPES
// =======================

/**
 * Response cho danh sách documents
 * GET /api/v1/admin/knowledge-base
 */
export interface KnowledgeDocumentsResponse {
  data: KnowledgeDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Response cho thống kê KB
 * GET /api/v1/admin/knowledge-base/statistics
 */
export interface KnowledgeStatisticsResponse {
  total: number;
  active: number;
  inactive: number;
  byCategory: Array<{ _id: string; count: number }>;
  bySource: Array<{ _id: string; count: number }>;
  recentUpdates: Array<{
    _id: string;
    title: string;
    category: KnowledgeCategory;
    updatedAt: string;
  }>;
}

/**
 * Response cho validate Excel
 * POST /api/v1/admin/knowledge-base/excel/validate
 */
export interface ExcelValidationResponse {
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: Array<{ row: number; message: string }>;
  warnings: string[];
  preview: Array<{
    category: KnowledgeCategory;
    title: string;
    content: string;
  }>;
}

/**
 * Response cho import Excel
 * POST /api/v1/admin/knowledge-base/excel/import
 */
export interface ExcelImportResponse {
  totalRows: number;
  imported: number;
  skipped: number;
}

/**
 * Response cho clear documents
 */
export interface ClearDocumentsResponse {
  deleted: number;
}
