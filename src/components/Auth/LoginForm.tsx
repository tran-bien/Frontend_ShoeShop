import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
// @ts-expect-error - Font import doesn't have TypeScript types
import "@fontsource/lobster";
import authService from "../../services/AuthService";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const handleLogin = async () => {
    try {
      setLoading(true);

      // Validate input
      if (!loginEmail.trim() || !loginPassword.trim()) {
        toast.error("Vui lòng nhập đầy đủ email và mật khẩu!");
        return;
      }

      const response = await login(loginEmail.trim(), loginPassword);

      toast.success("Đăng nhập thành công!");

      if (response.user?.role === "admin") {
        navigate("/admin");
      } else if (response.user?.role === "staff") {
        navigate("/admin");
      } else if (response.user?.role === "shipper") {
        navigate("/shipper/dashboard");
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get("redirect") || "/";
        navigate(redirectTo);
      }
    } catch (error: any) {
      console.error("🚨 Đăng nhập thất bại:", error);

      let errorMessage = "Đăng nhập thất bại!";

      if (
        error.response?.data?.errors &&
        error.response.data.errors.length > 0
      ) {
        errorMessage = error.response.data.errors[0].msg;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        if (
          error.message.includes("Network Error") ||
          error.code === "ERR_NETWORK"
        ) {
          errorMessage =
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!";
        } else if (error.message.includes("404")) {
          errorMessage = "API đăng nhập không tồn tại. Vui lòng liên hệ admin!";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      const response = await authService.register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });
      console.log("Phản hồi từ API:", response);

      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
      navigate("/otp-verification", {
        state: { email: registerEmail },
      });
    } catch (error: any) {
      let errorMessage = "Đăng ký thất bại!";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      console.error("🚨 Đăng ký thất bại:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mono-50 to-mono-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1
              style={{
                fontFamily: "'Lobster', cursive",
                fontSize: "3rem",
              }}
              className="text-mono-black"
            >
              ShoeStore
            </h1>
          </Link>
          <p className="text-mono-500 mt-2">Chào mừng bạn đến với ShoeStore</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-mono-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-mono-100">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === "login"
                  ? "text-mono-black border-b-2 border-mono-black"
                  : "text-mono-400 hover:text-mono-600"
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === "register"
                  ? "text-mono-black border-b-2 border-mono-black"
                  : "text-mono-400 hover:text-mono-600"
              }`}
            >
              Đăng ký
            </button>
          </div>

          <div className="p-8">
            {activeTab === "login" ? (
              /* Login Form */
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
                      className="w-full pl-11 pr-4 py-3 bg-mono-50 border border-mono-200 rounded-xl text-mono-700 placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-black focus:border-transparent transition-all"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
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
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      className="w-full pl-11 pr-12 py-3 bg-mono-50 border border-mono-200 rounded-xl text-mono-700 placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-black focus:border-transparent transition-all"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-mono-400 hover:text-mono-600"
                    >
                      {showLoginPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate("/forgotpassword")}
                    className="text-sm text-mono-600 hover:text-mono-black transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-3.5 bg-mono-black text-white rounded-xl font-medium hover:bg-mono-800 disabled:bg-mono-300 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </div>
            ) : (
              /* Register Form */
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-2">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-mono-400" />
                    <input
                      type="text"
                      placeholder="Nhập họ và tên"
                      className="w-full pl-11 pr-4 py-3 bg-mono-50 border border-mono-200 rounded-xl text-mono-700 placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-black focus:border-transparent transition-all"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                    />
                  </div>
                </div>

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
                      className="w-full pl-11 pr-4 py-3 bg-mono-50 border border-mono-200 rounded-xl text-mono-700 placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-black focus:border-transparent transition-all"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
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
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Tạo mật khẩu"
                      className="w-full pl-11 pr-12 py-3 bg-mono-50 border border-mono-200 rounded-xl text-mono-700 placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-black focus:border-transparent transition-all"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowRegisterPassword(!showRegisterPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-mono-400 hover:text-mono-600"
                    >
                      {showRegisterPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Register Button */}
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full py-3.5 bg-mono-black text-white rounded-xl font-medium hover:bg-mono-800 disabled:bg-mono-300 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? "Đang đăng ký..." : "Đăng ký"}
                </button>

                {/* Terms */}
                <p className="text-center text-xs text-mono-500">
                  Bằng việc đăng ký, bạn đồng ý với{" "}
                  <Link to="/terms" className="text-mono-black hover:underline">
                    Điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link
                    to="/privacy"
                    className="text-mono-black hover:underline"
                  >
                    Chính sách bảo mật
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-mono-600 hover:text-mono-black transition-colors"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
