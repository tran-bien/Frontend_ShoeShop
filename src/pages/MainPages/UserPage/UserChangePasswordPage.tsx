import React, { useState } from "react";
import Sidebar from "../../../components/User/Sidebar";
import { useAuth } from "../../../hooks/useAuth";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa";

const UserChangePasswordPage: React.FC = () => {
  const { changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Xóa lỗi khi người dùng b?t đầu nhập
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate currentPassword
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    // Validate newPassword
    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu mới ph?i có ít nh?t 8 ký t?";
    } else if (!/[A-Za-z]/.test(formData.newPassword)) {
      newErrors.newPassword = "Mật khẩu mới ph?i có ít nh?t 1 chờ cái";
    } else if (!/\d/.test(formData.newPassword)) {
      newErrors.newPassword = "Mật khẩu mới ph?i có ít nh?t 1 s?";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)) {
      newErrors.newPassword = "Mật khẩu mới ph?i có ít nh?t 1 ký từ d?c bi?t";
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = "Mật khẩu mới ph?i khác mật khẩu hiện tại";
    }

    // Validate confirmPassword
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword =
        "Mật khẩu mới và xác nhận mật khẩu không khợp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      if (response.success) {
        toast.success(
          response.message || "Mật khẩu dã được thay đổi thành công"
        );

        // Reset form sau khi thay đổi thành công
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // Ðang xuất sau vài giây vì backend cung dã logout h?t các phiên
        setTimeout(() => {
          toast.success("Họ thàng số đang xuất d? áp dụng thay đổi mật khẩu");
          setTimeout(() => {
            // Redirect to login
            window.location.href = "/login";
          }, 5000); // 4 giây d? người dùng d?c thông báo
        }, 1000);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi x?y ra khi thay đổi mật khẩu";
      toast.error(errorMessage);

      // Thêm lỗi c? thọ vào form n?u API trở về
      if (error.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.param) {
            apiErrors[err.param] = err.msg;
          }
        });
        setErrors({ ...errors, ...apiErrors });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-mono-100">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <FaKey className="text-mono-black" />
              Ð?i mật khẩu
            </h1>

            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mật khẩu hiện tại */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-mono-700 mb-1"
                  >
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent ${
                        errors.currentPassword
                          ? "border-mono-800"
                          : "border-mono-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showCurrentPassword ? (
                        <FaEyeSlash className="text-mono-500" />
                      ) : (
                        <FaEye className="text-mono-500" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-mono-900">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                {/* Mật khẩu mới */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-mono-700 mb-1"
                  >
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent ${
                        errors.newPassword
                          ? "border-mono-800"
                          : "border-mono-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showNewPassword ? (
                        <FaEyeSlash className="text-mono-500" />
                      ) : (
                        <FaEye className="text-mono-500" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-mono-900">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Xác nhận mật khẩu */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-mono-700 mb-1"
                  >
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mono-500 focus:border-transparent ${
                        errors.confirmPassword
                          ? "border-mono-800"
                          : "border-mono-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="text-mono-500" />
                      ) : (
                        <FaEye className="text-mono-500" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-mono-900">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Huẩng đến mật khẩu */}
                <div className="bg-mono-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-mono-800 mb-2">
                    Yêu c?u mật khẩu:
                  </h3>
                  <ul className="text-xs text-mono-700 list-disc pl-5 space-y-1">
                    <li>Ít nh?t 8 ký t?</li>
                    <li>Ít nh?t 1 chờ cái</li>
                    <li>Ít nh?t 1 s?</li>
                    <li>
                      Ít nh?t 1 ký từ d?c bi?t (!@#$%^&*(),.?":{}|&lt;&gt;)
                    </li>
                    <li>Ph?i khác mật khẩu hiện tại</li>
                  </ul>
                </div>

                {/* Nút submit */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-mono-black text-white font-medium rounded-lg hover:bg-mono-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Ðang xử lý..." : "Ð?i mật khẩu"}
                  </button>
                </div>

                {/* Thông báo quan trống */}
                <div className="bg-mono-100 p-4 rounded-lg">
                  <p className="text-sm text-mono-800">
                    <strong>Luu ý:</strong> Sau khi đổi mật khẩu thành công, bẩn
                    số được đang xuất kh?i tất cả các thi?t bỏ và cẩn đang nhập
                    lỗi.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChangePasswordPage;



