import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import AuthLayout from "../../components/Auth/AuthLayout";
import authService from "../../services/AuthService";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
      await authService.forgotPassword(email.trim());
      toast.success("Mã OTP đã được gửi đến email của bạn!");
      navigate("/otp-verification", {
        state: { email: email.trim(), type: "reset-password" },
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Gửi yêu cầu thất bại!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <AuthLayout
      title="Quên mật khẩu?"
      subtitle="Nhập email để nhận mã xác thực"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="space-y-6">
          {/* Description */}
          <p className="text-slate-600 text-center">
            Vui lòng nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mã OTP để
            xác thực và đặt lại mật khẩu.
          </p>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
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
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20"
          >
            {loading ? "Đang gửi..." : "Gửi mã xác thực"}
          </button>

          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
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
