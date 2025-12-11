import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import AuthLayout from "../../components/Auth/AuthLayout";
import authService from "../../services/AuthService";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Vui lòng nhập email!");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email không hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      toast.success("Link đặt lại mật khẩu đã được gửi đến email của bạn!");
      setEmailSent(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message || "Gửi yêu cầu thất bại!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  // Hiển thị thông báo thành công sau khi gửi email
  if (emailSent) {
    return (
      <AuthLayout
        title="Kiểm tra email của bạn"
        subtitle="Chúng tôi đã gửi link đặt lại mật khẩu"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-mono-200 p-8">
          <div className="space-y-6 text-center">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <p className="text-mono-700 font-medium">
                Email đã được gửi đến:
              </p>
              <p className="text-mono-900 font-semibold">{email}</p>
            </div>

            <p className="text-mono-600 text-sm">
              Vui lòng kiểm tra hộp thư (bao gồm cả thư mục Spam) và nhấp vào
              link trong email để đặt lại mật khẩu. Link có hiệu lực trong 1
              giờ.
            </p>

            {/* Resend Button */}
            <button
              onClick={() => setEmailSent(false)}
              className="text-mono-600 hover:text-mono-900 underline text-sm transition-colors"
            >
              Không nhận được email? Thử lại
            </button>

            {/* Back to Login */}
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-mono-600 hover:text-mono-900 transition-colors pt-4 border-t border-mono-200"
            >
              <FiArrowLeft />
              <span>Quay lại đăng nhập</span>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Quên mật khẩu?"
      subtitle="Nhập email để nhận link đặt lại mật khẩu"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-mono-200 p-8">
        <div className="space-y-6">
          {/* Description */}
          <p className="text-mono-600 text-center">
            Vui lòng nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi link để đặt
            lại mật khẩu qua email.
          </p>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-mono-400" />
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="w-full pl-11 pr-4 py-3 bg-mono-50 border border-mono-200 rounded-xl text-mono-700 placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-900 focus:border-transparent transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-mono-900 text-white rounded-xl font-semibold hover:bg-mono-800 disabled:bg-mono-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-mono-900/20"
          >
            {loading ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
          </button>

          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-mono-600 hover:text-mono-900 transition-colors"
          >
            <FiArrowLeft />
            <span>Quay lại đăng nhập</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
