import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import AuthLayout from "../../components/Auth/AuthLayout";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      if (!email.trim() || !password.trim()) {
        toast.error("Vui lòng nhập đầy đủ email và mật khẩu!");
        return;
      }

      const response = await login(email.trim(), password);
      toast.success("Đăng nhập thành công!");

      if (response.user?.role === "admin" || response.user?.role === "staff") {
        navigate("/admin");
      } else if (response.user?.role === "shipper") {
        navigate("/shipper/dashboard");
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get("redirect") || "/";
        navigate(redirectTo);
      }
    } catch (error: unknown) {
      let errorMessage = "Đăng nhập thất bại!";

      const err = error as {
        response?: {
          data?: {
            errors?: Array<{ msg: string }>;
            message?: string;
          };
        };
        message?: string;
        code?: string;
      };

      if (err.response?.data?.errors?.length) {
        errorMessage = err.response.data.errors[0].msg;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        if (
          err.message.includes("Network Error") ||
          err.code === "ERR_NETWORK"
        ) {
          errorMessage = "Không thể kết nối đến server!";
        } else {
          errorMessage = err.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Đăng nhập để tiếp tục mua sắm">
      <div className="bg-white rounded-2xl shadow-xl border border-mono-200 p-8">
        <div className="space-y-5">
          {/* Email */}
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

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-mono-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                className="w-full pl-11 pr-12 py-3 bg-mono-50 border border-mono-200 rounded-xl text-mono-700 placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-900 focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-mono-400 hover:text-mono-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              to="/forgotpassword"
              className="text-sm text-mono-600 hover:text-mono-900 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 bg-mono-900 text-white rounded-xl font-semibold hover:bg-mono-800 disabled:bg-mono-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-mono-900/20"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-mono-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-mono-500">
                Chưa có tài khoản?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="block w-full py-3.5 text-center border-2 border-mono-900 text-mono-900 rounded-xl font-semibold hover:bg-mono-900 hover:text-white transition-all"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
