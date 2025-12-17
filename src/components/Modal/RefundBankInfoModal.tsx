import React, { useState } from "react";
import { FaTimes, FaUniversity, FaMoneyBillWave } from "react-icons/fa";
import toast from "react-hot-toast";

interface RefundBankInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => Promise<void>;
  orderCode: string;
  refundAmount: number;
  loading?: boolean;
}

// Danh sách ngân hàng phổ biến tại Việt Nam
const POPULAR_BANKS = [
  "Vietcombank - Ngân hàng TMCP Ngoại thương Việt Nam",
  "VietinBank - Ngân hàng TMCP Công Thương Việt Nam",
  "BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
  "Agribank - Ngân hàng NN&PTNT Việt Nam",
  "Techcombank - Ngân hàng TMCP Kỹ Thương Việt Nam",
  "MB Bank - Ngân hàng TMCP Quân đội",
  "ACB - Ngân hàng TMCP Á Châu",
  "VPBank - Ngân hàng TMCP Việt Nam Thịnh Vượng",
  "Sacombank - Ngân hàng TMCP Sài Gòn Thương Tín",
  "TPBank - Ngân hàng TMCP Tiên Phong",
  "HDBank - Ngân hàng TMCP Phát triển TP.HCM",
  "SHB - Ngân hàng TMCP Sài Gòn - Hà Nội",
  "OCB - Ngân hàng TMCP Phương Đông",
  "VIB - Ngân hàng TMCP Quốc tế Việt Nam",
  "SeABank - Ngân hàng TMCP Đông Nam Á",
  "MSB - Ngân hàng TMCP Hàng Hải Việt Nam",
  "LPBank - Ngân hàng TMCP Bưu điện Liên Việt",
  "NCB - Ngân hàng TMCP Quốc Dân",
  "PVcomBank - Ngân hàng TMCP Đại Chúng Việt Nam",
  "Khác",
];

const RefundBankInfoModal: React.FC<RefundBankInfoModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderCode,
  refundAmount,
  loading = false,
}) => {
  const [bankName, setBankName] = useState("");
  const [customBankName, setCustomBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [errors, setErrors] = useState<{
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate bank name
    const finalBankName = bankName === "Khác" ? customBankName : bankName;
    if (!finalBankName.trim()) {
      newErrors.bankName = "Vui lòng chọn hoặc nhập tên ngân hàng";
    }

    // Validate account number
    if (!accountNumber.trim()) {
      newErrors.accountNumber = "Vui lòng nhập số tài khoản";
    } else if (!/^[0-9]+$/.test(accountNumber.trim())) {
      newErrors.accountNumber = "Số tài khoản chỉ được chứa số";
    } else if (accountNumber.length < 6 || accountNumber.length > 20) {
      newErrors.accountNumber = "Số tài khoản phải từ 6-20 ký tự";
    }

    // Validate account name
    if (!accountName.trim()) {
      newErrors.accountName = "Vui lòng nhập tên chủ tài khoản";
    } else if (accountName.trim().length < 3) {
      newErrors.accountName = "Tên chủ tài khoản phải có ít nhất 3 ký tự";
    } else if (accountName.trim().length > 100) {
      newErrors.accountName = "Tên chủ tài khoản không được vượt quá 100 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const finalBankName = bankName === "Khác" ? customBankName : bankName;

    try {
      await onConfirm({
        bankName: finalBankName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim().toUpperCase(), // Tên chủ TK thường viết hoa
      });
      // Reset form sau khi thành công
      resetForm();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra khi gửi thông tin";
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setBankName("");
    setCustomBankName("");
    setAccountNumber("");
    setAccountName("");
    setErrors({});
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FaUniversity className="text-mono-700 text-xl" />
            <h2 className="text-xl font-semibold text-mono-800">
              Thông tin hoàn tiền
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-mono-400 hover:text-mono-600 disabled:opacity-50"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Order info */}
          <div className="mb-6 p-4 bg-mono-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-mono-600">Mã đơn hàng:</span>
              <span className="font-semibold text-mono-800">{orderCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-mono-600">Số tiền hoàn:</span>
              <span className="font-bold text-lg text-green-600 flex items-center gap-1">
                <FaMoneyBillWave />
                {refundAmount?.toLocaleString()}đ
              </span>
            </div>
          </div>

          {/* Notice */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Vui lòng kiểm tra kỹ thông tin ngân hàng
              trước khi gửi. Chúng tôi sẽ chuyển tiền vào tài khoản của bạn
              trong vòng 3-5 ngày làm việc sau khi xác nhận.
            </p>
          </div>

          {/* Bank Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Ngân hàng <span className="text-red-500">*</span>
            </label>
            <select
              value={bankName}
              onChange={(e) => {
                setBankName(e.target.value);
                if (e.target.value !== "Khác") {
                  setCustomBankName("");
                }
                setErrors((prev) => ({ ...prev, bankName: undefined }));
              }}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 disabled:bg-mono-100 ${
                errors.bankName ? "border-red-500" : "border-mono-300"
              }`}
            >
              <option value="">-- Chọn ngân hàng --</option>
              {POPULAR_BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
            {bankName === "Khác" && (
              <input
                type="text"
                value={customBankName}
                onChange={(e) => {
                  setCustomBankName(e.target.value);
                  setErrors((prev) => ({ ...prev, bankName: undefined }));
                }}
                placeholder="Nhập tên ngân hàng..."
                disabled={loading}
                className={`w-full mt-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 disabled:bg-mono-100 ${
                  errors.bankName ? "border-red-500" : "border-mono-300"
                }`}
              />
            )}
            {errors.bankName && (
              <p className="mt-1 text-sm text-red-500">{errors.bankName}</p>
            )}
          </div>

          {/* Account Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Số tài khoản <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => {
                setAccountNumber(e.target.value.replace(/\D/g, ""));
                setErrors((prev) => ({ ...prev, accountNumber: undefined }));
              }}
              placeholder="Nhập số tài khoản..."
              disabled={loading}
              maxLength={20}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 disabled:bg-mono-100 ${
                errors.accountNumber ? "border-red-500" : "border-mono-300"
              }`}
            />
            {errors.accountNumber && (
              <p className="mt-1 text-sm text-red-500">
                {errors.accountNumber}
              </p>
            )}
          </div>

          {/* Account Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Tên chủ tài khoản <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => {
                setAccountName(e.target.value.toUpperCase());
                setErrors((prev) => ({ ...prev, accountName: undefined }));
              }}
              placeholder="VD: NGUYEN VAN A"
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 disabled:bg-mono-100 ${
                errors.accountName ? "border-red-500" : "border-mono-300"
              }`}
            />
            {errors.accountName && (
              <p className="mt-1 text-sm text-red-500">{errors.accountName}</p>
            )}
            <p className="mt-1 text-xs text-mono-500">
              Tên phải khớp với tên chủ tài khoản ngân hàng
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-mono-300 text-mono-700 rounded-lg hover:bg-mono-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-mono-800 text-white rounded-lg hover:bg-mono-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang gửi...
                </>
              ) : (
                "Gửi thông tin"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundBankInfoModal;
