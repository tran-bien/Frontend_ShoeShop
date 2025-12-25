import React, { useState, useRef } from "react";
import {
  FiX,
  FiUpload,
  FiFileText,
  FiLoader,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { adminKnowledgeService } from "../../../../services/KnowledgeService";

interface ImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors?: Array<{ row: number; message: string }>;
    rowCount?: number;
    totalRows?: number;
    validRows?: number;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
        return;
      }
      setSelectedFile(file);
      setValidationResult(null);
    }
  };

  const handleValidate = async () => {
    if (!selectedFile) return;

    setIsValidating(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await adminKnowledgeService.validateExcelFile(formData);
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        const isValid = data.errorRows === 0;
        setValidationResult({
          valid: isValid,
          errors: data.errors,
          rowCount: data.totalRows,
          totalRows: data.totalRows,
          validRows: data.validRows,
        });
        if (isValid) {
          toast.success(`File hợp lệ! Có ${data.totalRows} dòng dữ liệu`);
        } else {
          toast.error("File có lỗi, vui lòng kiểm tra lại");
        }
      }
    } catch (error) {
      console.error("Validate error:", error);
      toast.error("Không thể xác thực file");
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !validationResult?.valid) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await adminKnowledgeService.importFromExcel(formData);
      if (response.data.success && response.data.data) {
        const { imported, skipped } = response.data.data;
        toast.success(
          `Đã import ${imported} dữ liệu${
            skipped > 0 ? `, bỏ qua ${skipped}` : ""
          }`
        );
        onSuccess();
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Không thể import file");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mono-200">
          <h2 className="text-xl font-semibold text-mono-900">
            Import từ Excel
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-mono-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* File Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-mono-300 rounded-xl p-8 text-center cursor-pointer hover:border-mono-400 hover:bg-mono-50 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <FiFileText className="w-12 h-12 text-green-600 mb-2" />
                <p className="font-medium text-mono-900">{selectedFile.name}</p>
                <p className="text-sm text-mono-500 mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FiUpload className="w-12 h-12 text-mono-400 mb-2" />
                <p className="font-medium text-mono-700">Chọn file Excel</p>
                <p className="text-sm text-mono-500 mt-1">
                  Hỗ trợ .xlsx và .xls
                </p>
              </div>
            )}
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div
              className={`p-4 rounded-xl ${
                validationResult.valid
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {validationResult.valid ? (
                  <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p
                    className={`font-medium ${
                      validationResult.valid ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {validationResult.valid
                      ? `File hợp lệ - ${validationResult.rowCount} dòng dữ liệu`
                      : "File có lỗi"}
                  </p>
                  {validationResult.errors &&
                    validationResult.errors.length > 0 && (
                      <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                        {validationResult.errors.slice(0, 5).map((err, idx) => (
                          <li key={idx}>
                            Dòng {err.row}: {err.message}
                          </li>
                        ))}
                        {validationResult.errors.length > 5 && (
                          <li>
                            ... và {validationResult.errors.length - 5} lỗi khác
                          </li>
                        )}
                      </ul>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Hướng dẫn:</strong> File Excel cần có các cột: title,
              content, category, tags (phân cách bằng dấu phẩy), isActive
              (true/false). Tải template để xem mẫu chuẩn.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-mono-200 bg-mono-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-mono-200 rounded-lg hover:bg-mono-100 transition-colors"
          >
            Hủy
          </button>
          {selectedFile && !validationResult?.valid && (
            <button
              onClick={handleValidate}
              disabled={isValidating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isValidating ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiCheckCircle className="w-4 h-4" />
              )}
              Xác thực
            </button>
          )}
          {validationResult?.valid && (
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isImporting ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiUpload className="w-4 h-4" />
              )}
              Import
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
