import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast"; // Thay đổi import

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isHuman, setIsHuman] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; captcha?: string }>(
    {}
  );

  // Validate email với regex đơn giản
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors: { email?: string; captcha?: string } = {};
    let isValid = true;

    // Validate email
    if (!email) {
      newErrors.email = "Vui lòng cung cấp email";
      isValid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    // Validate captcha
    if (!isHuman) {
      newErrors.captcha = "Vui lòng xác nhận bạn không phải là người máy";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      console.log("Đang gửi yêu cầu quên mật khẩu với email:", email);

      const response = await axios.post(
        "http://localhost:5005/api/v1/auth/forgot-password",
        { email }
      );

      console.log("Response từ server:", response.data);

      // Kiểm tra response thành công
      if (response.status === 200 || response.data.success) {
        const message =
          response.data.message ||
          "Link đặt lại mật khẩu đã được gửi đến email của bạn!";
        console.log("Hiển thị thông báo thành công:", message);

        toast.success(message);

        // Chuyển hướng sau khi gửi thành công
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        // Trường hợp response không thành công
        const errorMessage =
          response.data.message || "Có lỗi xảy ra khi gửi yêu cầu";
        console.log("Response không thành công:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi yêu cầu quên mật khẩu:", error);

      // Xử lý thông báo lỗi chi tiết từ BE
      let errorMessage = "Không thể gửi yêu cầu đặt lại mật khẩu!";
      let fieldErrors: { email?: string; captcha?: string } = {};

      if (
        error.response?.data?.errors &&
        error.response.data.errors.length > 0
      ) {
        const backendErrors = error.response.data.errors;
        // Xử lý từng loại lỗi theo path
        backendErrors.forEach((err: any) => {
          if (err.path === "email") {
            fieldErrors.email = err.msg;
          }
        });

        // Sử dụng thông báo lỗi đầu tiên nếu không có lỗi cụ thể
        errorMessage = backendErrors[0].msg;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        if (
          error.message.includes("Network Error") ||
          error.code === "ERR_NETWORK"
        ) {
          errorMessage =
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!";
        } else {
          errorMessage = error.message;
        }
      }

      console.log("Hiển thị thông báo lỗi:", errorMessage);

      // Hiển thị lỗi
      setErrors({ ...errors, ...fieldErrors });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[100%] flex items-center justify-center h-screen bg-white">
      <div className="w-[35%] p-8 bg-white rounded-lg flex flex-col items-center justify-center h-auto">
        <h2 className="text-2xl mb-6 text-center">LẤY LẠI MẬT KHẨU</h2>

        {/* Email */}
        <div className="w-full mb-4">
          <label className="block text-left mb-1 text-base text-mono-500 font-light pl-2">
            Email
          </label>
          <input
            type="email"
            className={`border ${
              errors.email ? "border-mono-800" : "border-black"
            } rounded-md p-2 w-full`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              // Clear error when user types
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            disabled={loading}
          />
          {errors.email && (
            <p className="text-mono-800 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Tôi không phải là người máy */}
        <div className="w-[40%] mb-2 flex items-center border border-black rounded-md p-2 bg-mono-100 justify-start self-start">
          <input
            type="checkbox"
            id="notRobot"
            className="mr-2"
            checked={isHuman}
            onChange={(e) => {
              setIsHuman(e.target.checked);
              // Clear error when user checks
              if (errors.captcha) setErrors({ ...errors, captcha: undefined });
            }}
            disabled={loading}
          />
          <label
            htmlFor="notRobot"
            className="text-base text-mono-500 font-light"
          >
            Tôi không phải là người máy
          </label>
        </div>

        {/* Error message for captcha */}
        {errors.captcha && (
          <div className="w-full mb-4">
            <p className="text-mono-800 text-sm">{errors.captcha}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-start w-full mt-6">
          <button
            className="bg-black text-white px-4 py-2 rounded-md w-[48%] transition-all duration-300 hover:bg-opacity-90 hover:shadow-lg disabled:opacity-50"
            onClick={handleForgotPassword}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Lấy lại mật khẩu"}
          </button>
          <button
            className="text-black text-base ml-[5cm] transition-all duration-300 hover:text-mono-600 hover:scale-105"
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
