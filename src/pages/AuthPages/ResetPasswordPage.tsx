import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { FiEye, FiEyeOff, FiLock, FiArrowLeft, FiCheck } from "react-icons/fi";
import AuthLayout from "../../components/Auth/AuthLayout";

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  // Get email and otp from location state (from OTP verification)
  const emailFromState = location.state?.email || "";
  const otpFromState = location.state?.otp || "";

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if we have token (from email link) or email+otp (from OTP verification)
    if (!token && !emailFromState) {
      toast.error("Truy cập không hợp lệ");
      navigate("/login");
    }
  }, [token, emailFromState, navigate]);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    };
  };

  const getPasswordError = (password: string) => {
    const checks = validatePassword(password);
    if (!checks.minLength) return "Mật khẩu phải có ít nhất 8 ký tự";
    if (!checks.hasUpperCase) return "Mật khẩu phải có ít nhất 1 chữ hoa";
    if (!checks.hasLowerCase) return "Mật khẩu phải có ít nhất 1 chữ thường";
    if (!checks.hasNumbers) return "Mật khẩu phải có ít nhất 1 số";
    if (!checks.hasSpecialChar)
      return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    return "";
  };

  const passwordChecks = validatePassword(formData.password);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu mới";
    } else {
      const passwordError = getPasswordError(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const trimmedPassword = formData.password.trim();
      const trimmedConfirmPassword = formData.confirmPassword.trim();

      if (token) {
        // Reset via email link token
        await resetPassword(token, trimmedPassword, trimmedConfirmPassword);
      } else {
        // Reset via OTP - need to implement this API call
        await resetPassword(
          otpFromState,
          trimmedPassword,
          trimmedConfirmPassword
        );
      }

      toast.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      let errorMessage = "Đặt lại mật khẩu thất bại";

      if (error.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0].msg;
        if (errorMessage.includes("không khớp")) {
          setErrors({ confirmPassword: errorMessage });
          return;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <li
      className={`flex items-center gap-2 ${
        met ? "text-green-600" : "text-mono-500"
      }`}
    >
      <FiCheck
        className={`w-4 h-4 ${met ? "text-green-600" : "text-mono-300"}`}
      />
      <span>{text}</span>
    </li>
  );

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle="Tạo mật khẩu mới cho tài khoản của bạn"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-mono-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-mono-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu mới"
                className={`w-full pl-11 pr-12 py-3 bg-mono-50 border rounded-xl text-mono-700 placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-900 focus:border-transparent transition-all ${
                  errors.password ? "border-red-400" : "border-mono-200"
                }`}
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-mono-400 hover:text-mono-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password}</p>
            )}
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
                placeholder="Nhập lại mật khẩu mới"
                className={`w-full pl-11 pr-12 py-3 bg-mono-50 border rounded-xl text-mono-700 placeholder:text-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-900 focus:border-transparent transition-all ${
                  errors.confirmPassword ? "border-red-400" : "border-mono-200"
                }`}
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-mono-400 hover:text-mono-600"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-mono-50 p-4 rounded-xl">
            <p className="text-sm font-medium text-mono-700 mb-3">
              Mật khẩu phải chứa:
            </p>
            <ul className="space-y-2 text-sm">
              <RequirementItem
                met={passwordChecks.minLength}
                text="Ít nhất 8 ký tự"
              />
              <RequirementItem
                met={passwordChecks.hasUpperCase}
                text="Ít nhất 1 chữ hoa"
              />
              <RequirementItem
                met={passwordChecks.hasLowerCase}
                text="Ít nhất 1 chữ thường"
              />
              <RequirementItem
                met={passwordChecks.hasNumbers}
                text="Ít nhất 1 số"
              />
              <RequirementItem
                met={passwordChecks.hasSpecialChar}
                text="Ít nhất 1 ký tự đặc biệt"
              />
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-mono-900 text-white rounded-xl font-semibold hover:bg-mono-800 disabled:bg-mono-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-mono-900/20"
          >
            {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
          </button>

          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-mono-600 hover:text-mono-900 transition-colors"
          >
            <FiArrowLeft />
            <span>Quay lại đăng nhập</span>
          </Link>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
