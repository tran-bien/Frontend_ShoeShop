import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaHome,
  FaList,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  paymentService,
  VnpayCallbackParams,
} from "../../services/OrderService";

interface PaymentStatus {
  status: "loading" | "success" | "failed" | "error";
  orderId?: string;
  orderCode?: string;
  message?: string;
  transactionId?: string;
  amount?: string;
  errorDetails?: string;
  responseCode?: string; // Thêm mã phản hồi để kiểm tra
}

// Hàm để lấy thông báo lỗi từ mã VNPAY
const getVnpayErrorMessage = (responseCode?: string | null): string => {
  if (!responseCode) return "Lỗi không xác định";

  const errorMessages: Record<string, string> = {
    "00": "Giao dịch thành công",
    "01": "Giao dịch đã tồn tại",
    "02": "Merchant không hợp lệ (kiểm tra lại vnp_TmnCode)",
    "03": "Dữ liệu gửi sang không đúng định dạng",
    "04": "Khởi tạo GD không thành công do Website đang bị tạm khóa",
    "05": "Giao dịch không thành công do: Quý khách nhập sai mật khẩu quá số lần quy định.",
    "06": "Giao dịch không thành công do Quý khách nhập sai mật khẩu",
    "07": "Giao dịch bị nghi ngờ gian lận",
    "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng",
    "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán",
    "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa",
    "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu",
    "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
    "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch",
    "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
    "75": "Ngân hàng thanh toán đang bảo trì",
    "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
    "99": "Lỗi không xác định",
  };

  return (
    errorMessages[responseCode] || `Lỗi không xác định (mã: ${responseCode})`
  );
};

const PaymentStatusPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: "loading",
  });

  useEffect(() => {
    const processPaymentCallback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const currentPath = location.pathname;

      // Các tham số từ VNPAY
      const responseCode = queryParams.get("vnp_ResponseCode");
      const transactionStatus = queryParams.get("vnp_TransactionStatus");
      const transactionId =
        queryParams.get("vnp_TransactionNo") || queryParams.get("vnp_TxnRef");
      const amount = queryParams.get("vnp_Amount");
      const orderInfo = queryParams.get("vnp_OrderInfo");

      // Các tham số bổ sung từ backend redirect
      const orderId = queryParams.get("orderId");
      const orderCode = queryParams.get("orderCode");
      const status = queryParams.get("status");
      const message = queryParams.get("message");

      console.log("Payment callback params:", {
        currentPath,
        responseCode,
        transactionStatus,
        orderId,
        orderCode,
        message,
        status,
        transactionId,
        amount,
        orderInfo,
      });

      // CASE 1: Backend đã xử lý và redirect về /payment/result với status/message
      if (currentPath.includes("/payment/result") && status && message) {
        console.log("🔄 Xử lý kết quả từ backend redirect...");

        if (status === "success") {
          setPaymentStatus({
            status: "success",
            orderId: orderId || undefined,
            orderCode: orderCode || undefined,
            message: message,
            transactionId: transactionId || undefined,
            amount: amount
              ? (parseInt(amount) / 100).toLocaleString()
              : undefined,
          });
        } else {
          setPaymentStatus({
            status: "failed",
            orderId: orderId || undefined,
            orderCode: orderCode || undefined,
            message: message,
            transactionId: transactionId || undefined,
          });
        }
        return;
      }

      // CASE 2: VNPAY redirect trực tiếp về /payment/status với params VNPAY
      if (currentPath.includes("/payment/status") && responseCode) {
        console.log("🔄 Xử lý callback VNPAY trực tiếp...");

        // Hiển thị kết quả ngay lập tức dựa trên responseCode từ VNPAY
        const isSuccessfulVnpayResponse = responseCode === "00";

        if (isSuccessfulVnpayResponse) {
          // Hiển thị thành công ngay lập tức
          setPaymentStatus({
            status: "success",
            message: "Thanh toán thành công",
            transactionId: transactionId || undefined,
            amount: amount
              ? (parseInt(amount) / 100).toLocaleString()
              : undefined,
            responseCode: responseCode,
          });
        } else {
          // Hiển thị thất bại ngay lập tức
          setPaymentStatus({
            status: "failed",
            message: getVnpayErrorMessage(responseCode),
            transactionId: transactionId || undefined,
            responseCode: responseCode,
          });
        }

        // Gọi API backend để cập nhật DB trong background (không chờ kết quả)
        try {
          const vnpayParams: Partial<VnpayCallbackParams> = {};
          queryParams.forEach((value, key) => {
            if (key.startsWith("vnp_")) {
              (vnpayParams as any)[key] = value;
            }
          });

          if (vnpayParams.vnp_TxnRef && vnpayParams.vnp_ResponseCode) {
            // Gọi API trong background để đồng bộ dữ liệu
            paymentService
              .vnpayCallback(vnpayParams as VnpayCallbackParams)
              .then((response) => {
                console.log("✅ Backend đã cập nhật DB:", response);

                // Cập nhật thông tin bổ sung nếu có
                if (
                  response.data.data?.orderId ||
                  response.data.data?.orderCode
                ) {
                  setPaymentStatus((prev) => ({
                    ...prev,
                    orderId: response.data.data?.orderId || prev.orderId,
                    orderCode: response.data.data?.orderCode || prev.orderCode,
                  }));
                }
              })
              .catch((error) => {
                console.warn(
                  "⚠️ Lỗi khi đồng bộ DB (không ảnh hưởng UX):",
                  error
                );
              });
          }
        } catch (error) {
          console.warn(
            "⚠️ Lỗi khi chuẩn bị params cho API (không ảnh hưởng UX):",
            error
          );
        }

        return;
      }

      // CASE 3: Truy cập trực tiếp hoặc không có params hợp lệ
      console.log("⚠️ Không tìm thấy thông tin thanh toán hợp lệ");
      setPaymentStatus({
        status: "error",
        message: "Không tìm thấy thông tin thanh toán",
        errorDetails: "Vui lòng thực hiện thanh toán từ trang đặt hàng.",
      });
    };

    // Chỉ set timeout cho các trường hợp thực sự cần thiết
    const timeout = setTimeout(() => {
      setPaymentStatus((prev) => {
        // Chỉ hiển thị timeout error nếu vẫn đang loading và chưa có kết quả rõ ràng
        if (prev.status === "loading" && !prev.responseCode) {
          console.log("⏰ Timeout - hiển thị thông báo lỗi");
          return {
            status: "error",
            message: "Timeout - Không nhận được kết quả thanh toán",
            errorDetails:
              "Vui lòng kiểm tra lại trạng thái đơn hàng trong danh sách đơn hàng của bạn.",
          };
        }
        // Giữ nguyên trạng thái hiện tại nếu đã có kết quả
        return prev;
      });
    }, 2000);

    processPaymentCallback();
    return () => clearTimeout(timeout);
  }, [location.search, location.pathname]);

  const renderContent = () => {
    switch (paymentStatus.status) {
      case "loading":
        return (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-6xl text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Đang xử lý thanh toán...
            </h2>
            <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
            <div className="mt-4 text-sm text-gray-400">
              <p>Đang xác thực kết quả thanh toán với VNPAY...</p>
              <p>Đang cập nhật trạng thái đơn hàng...</p>
              {paymentStatus.responseCode === "00" && (
                <p className="text-green-500 font-medium mt-2">
                  Mã phản hồi từ VNPAY cho thấy giao dịch đã thành công! Đang
                  cập nhật dữ liệu...
                </p>
              )}
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-12">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              Thanh toán thành công!
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <p className="text-green-700 mb-2">
                <strong>Thông báo:</strong> {paymentStatus.message}
              </p>
              {paymentStatus.orderCode && (
                <p className="text-gray-600 text-sm mb-1">
                  <strong>Mã đơn hàng:</strong> {paymentStatus.orderCode}
                </p>
              )}
              {paymentStatus.transactionId && (
                <p className="text-gray-600 text-sm mb-1">
                  <strong>Mã giao dịch:</strong> {paymentStatus.transactionId}
                </p>
              )}
              {paymentStatus.amount && (
                <p className="text-gray-600 text-sm">
                  <strong>Số tiền:</strong> {paymentStatus.amount} VNĐ
                </p>
              )}
            </div>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận và đang
              được xử lý.
            </p>
          </div>
        );

      case "failed":
        return (
          <div className="text-center py-12">
            <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-red-600 mb-4">
              Thanh toán thất bại!
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <p className="text-red-700 mb-2">
                <strong>Lý do:</strong> {paymentStatus.message}
              </p>
              {paymentStatus.orderCode && (
                <p className="text-gray-600 text-sm mb-1">
                  <strong>Mã đơn hàng:</strong> {paymentStatus.orderCode}
                </p>
              )}
              {paymentStatus.transactionId && (
                <p className="text-gray-600 text-sm">
                  <strong>Mã giao dịch:</strong> {paymentStatus.transactionId}
                </p>
              )}
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-orange-700 text-sm">
                ℹ️ Đơn hàng vẫn được giữ nguyên trong hệ thống
                <br />
                ℹ️ Bạn có thể thử thanh toán lại trong danh sách đơn hàng
                <br />
                ℹ️ Tồn kho chưa bị trừ do thanh toán thất bại
              </p>
            </div>
            <p className="text-gray-600 mb-6">
              Đã có lỗi xảy ra trong quá trình thanh toán. Bạn có thể thử thanh
              toán lại trong danh sách đơn hàng.
            </p>
          </div>
        );

      case "error":
        return (
          <div className="text-center py-12">
            <FaExclamationTriangle className="text-6xl text-orange-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-orange-600 mb-4">
              Có lỗi xảy ra!
            </h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <p className="text-orange-700 mb-2">
                <strong>Thông báo:</strong> {paymentStatus.message}
              </p>
              {paymentStatus.errorDetails && (
                <p className="text-gray-600 text-sm">
                  <strong>Chi tiết:</strong> {paymentStatus.errorDetails}
                </p>
              )}
              {paymentStatus.transactionId && (
                <p className="text-gray-600 text-sm mt-2">
                  <strong>Mã giao dịch:</strong> {paymentStatus.transactionId}
                </p>
              )}
            </div>
            <p className="text-gray-600 mb-6">
              Vui lòng kiểm tra lại trạng thái đơn hàng hoặc liên hệ hỗ trợ
              khách hàng.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg">
        <div className="p-8">
          {renderContent()}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaHome className="mr-2" />
              Về trang chủ
            </Link>

            <Link
              to="/user-manage-order"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaList className="mr-2" />
              Xem đơn hàng
            </Link>

            {paymentStatus.status === "failed" && (
              <button
                onClick={() => navigate("/cart")}
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Quay lại giỏ hàng
              </button>
            )}

            {paymentStatus.status === "error" && (
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Thử lại
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;
