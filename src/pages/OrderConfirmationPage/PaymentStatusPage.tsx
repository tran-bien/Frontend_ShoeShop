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
  responseCode?: string; // Thêm mã phần h?i d? ki?m tra
}

// Hàm d? lệy thông báo lỗi từ mã VNPAY
const getVnpayErrorMessage = (responseCode?: string | null): string => {
  if (!responseCode) return "Lỗi không xác đếnh";

  const errorMessages: Record<string, string> = {
    "00": "Giao d?ch thành công",
    "01": "Giao d?ch dã tên tại",
    "02": "Merchant không hợp lệ (ki?m tra lỗi vnp_TmnCode)",
    "03": "Dữ liệu gửi sang không dúng đếnh đếng",
    "04": "Kh?i t?o GD không thành công đo Website đang bỏ tạm khóa",
    "05": "Giao d?ch không thành công do: Quý khách nhập sai mật khẩu quá số lẩn quy đếnh.",
    "06": "Giao d?ch không thành công đo Quý khách nhập sai mật khẩu",
    "07": "Giao d?ch bỏ nghi ng? gian lẩn",
    "09": "Giao d?ch không thành công do: Thể/Tài khoẩn của khách hàng chua đang ký d?ch v? InternetBanking tại ngân hàng",
    "10": "Giao d?ch không thành công do: Khách hàng xác thực thông tin thể/tài khoẩn không dúng quá 3 lẩn",
    "11": "Giao d?ch không thành công do: Ðã h?t hơn chờ thanh toán",
    "12": "Giao d?ch không thành công do: Thể/Tài khoẩn của khách hàng bỏ khóa",
    "13": "Giao d?ch không thành công đo Quý khách nhập sai mật khẩu",
    "24": "Giao d?ch không thành công do: Khách hàng hủy giao d?ch",
    "51": "Giao d?ch không thành công do: Tài khoẩn của quý khách không d? số du d? thực hiện giao d?ch",
    "65": "Giao d?ch không thành công do: Tài khoẩn của Quý khách dã vu?t quá hơn m?c giao d?ch trong ngày",
    "75": "Ngân hàng thanh toán đang b?o trì",
    "79": "Giao d?ch không thành công do: KH nhập sai mật khẩu thanh toán quá số lẩn quy đếnh.",
    "99": "Lỗi không xác đếnh",
  };

  return (
    errorMessages[responseCode] || `Lỗi không xác đếnh (mã: ${responseCode})`
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

      // Các tham số bỏ sung từ backend redirect
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

      // CASE 1: Backend dã xử lý và redirect v? /payment/result với status/message
      if (currentPath.includes("/payment/result") && status && message) {
        console.log("?? Xử lý k?t qu? từ backend redirect...");

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

      // CASE 2: VNPAY redirect trởc tiếp v? /payment/status với params VNPAY
      if (currentPath.includes("/payment/status") && responseCode) {
        console.log("?? Xử lý callback VNPAY trởc tiếp...");

        // Hiện thọ k?t qu? ngay lệp t?c d?a trên responseCode từ VNPAY
        const isSuccessfulVnpayResponse = responseCode === "00";

        if (isSuccessfulVnpayResponse) {
          // Hiện thọ thành công ngay lệp t?c
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
          // Hiện thọ thểt b?i ngay lệp t?c
          setPaymentStatus({
            status: "failed",
            message: getVnpayErrorMessage(responseCode),
            transactionId: transactionId || undefined,
            responseCode: responseCode,
          });
        }

        // Gửi API backend d? cập nhật DB trong background (không chờ k?t qu?)
        try {
          const vnpayParams: Partial<VnpayCallbackParams> = {};
          queryParams.forEach((value, key) => {
            if (key.startsWith("vnp_")) {
              (vnpayParams as any)[key] = value;
            }
          });

          if (vnpayParams.vnp_TxnRef && vnpayParams.vnp_ResponseCode) {
            // Gửi API trong background d? đếng bỏ dữ liệu
            paymentService
              .vnpayCallback(vnpayParams as VnpayCallbackParams)
              .then((response) => {
                console.log("? Backend dã cập nhật DB:", response);

                // Cập nhật thông tin bỏ sung n?u có
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
                  "?? Lỗi khi đếng bỏ DB (không ẩnh huẩng UX):",
                  error
                );
              });
          }
        } catch (error) {
          console.warn(
            "?? Lỗi khi chuẩn bỏ params cho API (không ẩnh huẩng UX):",
            error
          );
        }

        return;
      }

      // CASE 3: Truy c?p trởc tiếp ho?c không có params hợp lệ
      console.log("?? Không tìm thủy thông tin thanh toán hợp lệ");
      setPaymentStatus({
        status: "error",
        message: "Không tìm thủy thông tin thanh toán",
        errorDetails: "Vui lòng thực hiện thanh toán từ trang đặt hàng.",
      });
    };

    // Chờ set timeout cho các truẩng hợp thực số cẩn thi?t
    const timeout = setTimeout(() => {
      setPaymentStatus((prev) => {
        // Chờ hiện thọ timeout error n?u vẩn đang loading và chua có k?t qu? rõ ràng
        if (prev.status === "loading" && !prev.responseCode) {
          console.log("? Timeout - hiện thọ thông báo lỗi");
          return {
            status: "error",
            message: "Timeout - Không nhơn được k?t qu? thanh toán",
            errorDetails:
              "Vui lòng ki?m tra lỗi trạng thái don hàng trong danh sách don hàng của bẩn.",
          };
        }
        // Giỏ nguyên trạng thái hiện tại n?u dã có k?t qu?
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
            <FaSpinner className="animate-spin text-6xl text-mono-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-mono-700 mb-2">
              Ðang xử lý thanh toán...
            </h2>
            <p className="text-mono-500">Vui lòng đổi trong giây lát</p>
            <div className="mt-4 text-sm text-mono-400">
              <p>Ðang xác thực k?t qu? thanh toán với VNPAY...</p>
              <p>Ðang cập nhật trạng thái don hàng...</p>
              {paymentStatus.responseCode === "00" && (
                <p className="text-mono-700 font-medium mt-2">
                  Mã phần h?i từ VNPAY cho thủy giao d?ch dã thành công! Ðang
                  cập nhật dữ liệu...
                </p>
              )}
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-12">
            <FaCheckCircle className="text-6xl text-mono-700 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-mono-800 mb-4">
              Thanh toán thành công!
            </h2>
            <div className="bg-mono-50 border border-mono-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <p className="text-mono-700 mb-2">
                <strong>Thông báo:</strong> {paymentStatus.message}
              </p>
              {paymentStatus.orderCode && (
                <p className="text-mono-600 text-sm mb-1">
                  <strong>Mã don hàng:</strong> {paymentStatus.orderCode}
                </p>
              )}
              {paymentStatus.transactionId && (
                <p className="text-mono-600 text-sm mb-1">
                  <strong>Mã giao d?ch:</strong> {paymentStatus.transactionId}
                </p>
              )}
              {paymentStatus.amount && (
                <p className="text-mono-600 text-sm">
                  <strong>Số tiền:</strong> {paymentStatus.amount} VNÐ
                </p>
              )}
            </div>
            <p className="text-mono-600 mb-6">
              C?m on bẩn dã mua hàng. Ðon hàng của bẩn dã được xác nhận và đang
              được xử lý.
            </p>
          </div>
        );

      case "failed":
        return (
          <div className="text-center py-12">
            <FaTimesCircle className="text-6xl text-mono-800 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-mono-900 mb-4">
              Thanh toán thểt b?i!
            </h2>
            <div className="bg-mono-100 border border-mono-300 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <p className="text-mono-800 mb-2">
                <strong>Lý do:</strong> {paymentStatus.message}
              </p>
              {paymentStatus.orderCode && (
                <p className="text-mono-600 text-sm mb-1">
                  <strong>Mã don hàng:</strong> {paymentStatus.orderCode}
                </p>
              )}
              {paymentStatus.transactionId && (
                <p className="text-mono-600 text-sm">
                  <strong>Mã giao d?ch:</strong> {paymentStatus.transactionId}
                </p>
              )}
            </div>
            <div className="bg-mono-100 border border-mono-300 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-mono-700 text-sm">
                ?? Ðon hàng vẩn được giỏ nguyên trong họ thàng
                <br />
                ?? Bẩn có thọ thọ thanh toán lỗi trong danh sách don hàng
                <br />
                ?? Tên kho chua bỏ trở đo thanh toán thểt b?i
              </p>
            </div>
            <p className="text-mono-600 mb-6">
              Ðã có lỗi x?y ra trong quá trình thanh toán. Bẩn có thọ thọ thanh
              toán lỗi trong danh sách don hàng.
            </p>
          </div>
        );

      case "error":
        return (
          <div className="text-center py-12">
            <FaExclamationTriangle className="text-6xl text-mono-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-mono-700 mb-4">
              Có lỗi x?y ra!
            </h2>
            <div className="bg-mono-100 border border-mono-300 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <p className="text-mono-700 mb-2">
                <strong>Thông báo:</strong> {paymentStatus.message}
              </p>
              {paymentStatus.errorDetails && (
                <p className="text-mono-600 text-sm">
                  <strong>Chi tiết:</strong> {paymentStatus.errorDetails}
                </p>
              )}
              {paymentStatus.transactionId && (
                <p className="text-mono-600 text-sm mt-2">
                  <strong>Mã giao d?ch:</strong> {paymentStatus.transactionId}
                </p>
              )}
            </div>
            <p className="text-mono-600 mb-6">
              Vui lòng ki?m tra lỗi trạng thái don hàng ho?c liên họ họ trở
              khách hàng.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-mono-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg">
        <div className="p-8">
          {renderContent()}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-mono-black text-white font-medium rounded-lg hover:bg-mono-800 transition-colors"
            >
              <FaHome className="mr-2" />
              V? trang chỉ
            </Link>

            <Link
              to="/user-manage-order"
              className="inline-flex items-center justify-center px-6 py-3 bg-mono-600 text-white font-medium rounded-lg hover:bg-mono-700 transition-colors"
            >
              <FaList className="mr-2" />
              Xem don hàng
            </Link>

            {paymentStatus.status === "failed" && (
              <button
                onClick={() => navigate("/cart")}
                className="inline-flex items-center justify-center px-6 py-3 bg-mono-700 text-white font-medium rounded-lg hover:bg-mono-800 transition-colors"
              >
                Quay lỗi giỏ hàng
              </button>
            )}

            {paymentStatus.status === "error" && (
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-6 py-3 bg-mono-700 text-white font-medium rounded-lg hover:bg-mono-800 transition-colors"
              >
                Thọ lỗi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;




