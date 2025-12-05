import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import AuthLayout from "../../components/Auth/AuthLayout";
import authService from "../../services/AuthService";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập họ và tên!");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Vui lòng nhập email!");
      return;
    }
    if (!formData.password) {
      toast.error("Vui lòng nhập mật khẩu!");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
      navigate("/otp-verification", {
        state: { email: formData.email.trim() },
      });
    } catch (error: any) {
      let errorMessage = "Đăng ký thất bại!";

      if (error.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0].msg;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <AuthLayout
      title="Tạo tài khoản mới"
      subtitle="Đăng ký để nhận nhiều ưu đãi hấp dẫn"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-mono-200 p-8">
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
                name="name"
                placeholder="Nhập họ và tên"
                className="w-full pl-11 pr-4 py-3 bg-mono-50 border border-mono-200 rounded-xl text-mono-700 placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-900 focus:border-transparent transition-all"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
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
                name="email"
                placeholder="Nhập email của bạn"
                className="w-full pl-11 pr-4 py-3 bg-mono-50 border border-mono-200 rounded-xl text-mono-700 placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-900 focus:border-transparent transition-all"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                placeholder="Tạo mật khẩu"
                className="w-full pl-11 pr-12 py-3 bg-mono-50 border border-mono-200 rounded-xl text-mono-700 placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-900 focus:border-transparent transition-all"
                value={formData.password}
                onChange={handleChange}
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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-mono-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                className="w-full pl-11 pr-12 py-3 bg-mono-50 border border-mono-200 rounded-xl text-mono-700 placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-900 focus:border-transparent transition-all"
                value={formData.confirmPassword}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-mono-400 hover:text-mono-600"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-3.5 bg-mono-900 text-white rounded-xl font-semibold hover:bg-mono-800 disabled:bg-mono-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-mono-900/20"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>

          {/* Terms */}
          <p className="text-center text-xs text-mono-500">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <Link to="/terms" className="text-mono-900 hover:underline">
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link to="/privacy" className="text-mono-900 hover:underline">
              Chính sách bảo mật
            </Link>
          </p>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-mono-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-mono-500">
                Đã có tài khoản?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="block w-full py-3.5 text-center border-2 border-mono-900 text-mono-900 rounded-xl font-semibold hover:bg-mono-900 hover:text-white transition-all"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
