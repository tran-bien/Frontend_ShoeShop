import React, { useState, useEffect, useMemo } from "react";
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const passwordRules = useMemo(() => {
    const pw = formData.newPassword || "";
    return {
      minLength: pw.length >= 8,
      hasLetter: /[A-Za-z]/.test(pw),
      hasNumber: /\d/.test(pw),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
      notSameAsCurrent: pw.length > 0 && pw !== formData.currentPassword,
    };
  }, [formData.newPassword, formData.currentPassword]);

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
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự";
    } else if (!/[A-Za-z]/.test(formData.newPassword)) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 1 chữ cái";
    } else if (!/\d/.test(formData.newPassword)) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 1 số";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt";
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }

    // Validate confirmPassword
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Mật khẩu mới và xác nhận mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      if (response.success) {
        toast.success(response.message || "Mật khẩu đã được thay đổi thành công");

        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          toast.success("Hệ thống sẽ đăng xuất để áp dụng thay đổi mật khẩu");
          setTimeout(() => {
            window.location.href = "/login";
          }, 5000);
        }, 1000);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi thay đổi mật khẩu";
      toast.error(errorMessage);

      // Thêm lỗi cụ thể vào form nếu API trả về
      if (error.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.param) apiErrors[err.param] = err.msg;
        });
        setErrors((prev) => ({ ...prev, ...apiErrors }));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatRuleClass = (ok: boolean) =>
    formData.newPassword
      ? ok
        ? "text-emerald-700"
        : "text-rose-600"
      : "text-mono-700";

  return (
    <div className="flex flex-col min-h-screen bg-mono-100">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <FaKey className="text-mono-black" />
              Đổi mật khẩu
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
                      aria-invalid={!!errors.currentPassword}
                      aria-describedby={
                        errors.currentPassword ? "currentPassword-error" : undefined
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.currentPassword
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-mono-300 focus:ring-mono-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                    <p
                      id="currentPassword-error"
                      className="mt-1 text-sm text-rose-600"
                    >
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
                      aria-invalid={!!errors.newPassword}
                      aria-describedby={errors.newPassword ? "newPassword-error" : undefined}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.newPassword
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-mono-300 focus:ring-mono-200"
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
                    <p id="newPassword-error" className="mt-1 text-sm text-rose-600">
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
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={
                        errors.confirmPassword ? "confirmPassword-error" : undefined
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.confirmPassword
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-mono-300 focus:ring-mono-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    <p
                      id="confirmPassword-error"
                      className="mt-1 text-sm text-rose-600"
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Hướng dẫn mật khẩu */}
                <div className="bg-mono-50 p-4 rounded-lg border border-mono-200">
                  <h3 className="text-sm font-medium text-mono-800 mb-2">
                    Yêu cầu mật khẩu:
                  </h3>
                  <ul className="text-xs list-disc pl-5 space-y-1">
                    <li className={formatRuleClass(passwordRules.minLength)}>
                      Ít nhất 8 ký tự
                    </li>
                    <li className={formatRuleClass(passwordRules.hasLetter)}>
                      Ít nhất 1 chữ cái
                    </li>
                    <li className={formatRuleClass(passwordRules.hasNumber)}>
                      Ít nhất 1 số
                    </li>
                    <li className={formatRuleClass(passwordRules.hasSpecial)}>
                      Ít nhất 1 ký tự đặc biệt (!@#$%^&*(),.?":{}|&lt;&gt;)
                    </li>
                    <li className={formatRuleClass(passwordRules.notSameAsCurrent)}>
                      Phải khác mật khẩu hiện tại
                    </li>
                  </ul>
                </div>

                {/* Nút submit */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-mono-black text-white font-medium rounded-lg hover:bg-mono-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </button>
                </div>

                {/* Thông báo quan trọng */}
                <div className="bg-mono-100 p-4 rounded-lg border border-mono-200">
                  <p className="text-sm text-mono-800">
                    <strong>Lưu ý:</strong> Sau khi đổi mật khẩu thành công, bạn sẽ
                    được đăng xuất khỏi tất cả các thiết bị và cần đăng nhập lại.
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
