import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { FiEye, FiEyeOff, FiLock, FiArrowLeft } from "react-icons/fi";

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) {
      toast.error("Token không hợp lệ");
      navigate("/login");
    }
  }, [token, navigate]);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return "Mật khẩu phải có ít nhất 8 ký tự";
    }
    if (!hasUpperCase) {
      return "Mật khẩu phải có ít nhất 1 chữ hoa";
    }
    if (!hasLowerCase) {
      return "Mật khẩu phải có ít nhất 1 chữ thường";
    }
    if (!hasNumbers) {
      return "Mật khẩu phải có ít nhất 1 số";
    }
    if (!hasSpecialChar) {
      return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    }
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Validate password confirmation in real-time
    if (name === "confirmPassword" && formData.password && value) {
      if (formData.password !== value) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Mật khẩu xác nhận không khớp",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }

    // If the password field changes, validate the confirmation field if it has a value
    if (name === "password" && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Mật khẩu xác nhận không khớp",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra cơ bản ở client
    const newErrors: Record<string, string> = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu mới";
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    // Confirmation validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      // Ensure exact string comparison
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!token) {
      toast.error("Token không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      // Trim passwords to ensure no whitespace issues
      const trimmedPassword = formData.password.trim();
      const trimmedConfirmPassword = formData.confirmPassword.trim();

      // Pass both password and confirmPassword to the resetPassword function
      await resetPassword(token, trimmedPassword, trimmedConfirmPassword);
      toast.success("Đặt lại mật khẩu thành công!");

      // Chuyển hướng sau khi đặt lại mật khẩu thành công
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Reset password error:", error);

      // Xử lý thông báo lỗi chi tiết từ backend
      let errorMessage = "Đặt lại mật khẩu thất bại";

      if (
        error.response?.data?.errors &&
        error.response.data.errors.length > 0
      ) {
        // Nếu là lỗi validation từ validator của backend
        errorMessage = error.response.data.errors[0].msg;

        // Chỉ xử lý lỗi mật khẩu không khớp để hiển thị trên form
        if (errorMessage.includes("không khớp")) {
          setErrors({
            confirmPassword: errorMessage,
          });
          // Không show toast cho lỗi này vì đã hiển thị trên form
          return;
        }
      } else if (error.response?.data?.message) {
        // Nếu là lỗi khác từ API
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Chỉ hiển thị toast, không hiển thị trên form nữa
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mono-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <FiLock className="text-4xl text-mono-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-mono-900 tracking-tight">
          Đặt lại mật khẩu
        </h2>
        <p className="mt-2 text-center text-sm text-mono-600 leading-relaxed">
          Vui lòng nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-mono-700"
              >
                Mật khẩu mới
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? "border-red-300" : "border-mono-300"
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-mono-500 focus:border-mono-500 sm:text-sm`}
                  placeholder="Nhập mật khẩu mới"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-mono-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-mono-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-mono-900">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-mono-700"
              >
                Xác nhận mật khẩu
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.confirmPassword
                      ? "border-red-300"
                      : "border-mono-300"
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-mono-500 focus:border-mono-500 sm:text-sm`}
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-mono-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-mono-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-mono-900">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="text-xs text-mono-600 bg-mono-50 p-3 rounded-md">
              <p className="font-medium mb-1">Mật khẩu phải chứa:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Ít nhất 8 ký tự</li>
                <li>Ít nhất 1 chữ hoa</li>
                <li>Ít nhất 1 chữ thường</li>
                <li>Ít nhất 1 số</li>
                <li>Ít nhất 1 ký tự đặc biệt</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-mono-600 hover:bg-mono-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mono-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </button>
            </div>
          </form>

          {/* Back to login */}
          <div className="mt-6">
            <Link
              to="/login"
              className="flex items-center justify-center space-x-2 text-sm text-mono-600 hover:text-mono-500"
            >
              <FiArrowLeft />
              <span>Quay lại đăng nhập</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
