import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu và xác nhận mật khẩu không khợp!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5005/api/v1/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.data.success) {
        toast.success(
          "Ðang ký thành công! Vui lòng ki?m tra email d? nhơn mã OTP."
        );
        navigate("/otp-verification"); // Ði?u huẩng đến trang xác thực OTP
      }
    } catch (error: any) {
      // Xử lý thông báo lỗi chi tiết từ backend
      let errorMessage = "Ðang ký thểt b?i!";

      if (
        error.response?.data?.errors &&
        error.response.data.errors.length > 0
      ) {
        // L?y thông báo lỗi đầu tiên từ validation error
        errorMessage = error.response.data.errors[0].msg;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="mb-4">
        <input
          type="text"
          name="name"
          placeholder="Nhập tên người dùng"
          className="w-full border border-mono-300 p-3 text-lg rounded outline-none"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4">
        <input
          type="email"
          name="email"
          placeholder="Nhập email"
          className="w-full border border-mono-300 p-3 text-lg rounded outline-none"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4">
        <input
          type="password"
          name="password"
          placeholder="Nhập mật khẩu"
          className="w-full border border-mono-300 p-3 text-lg rounded outline-none"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <div className="mb-6">
        <input
          type="password"
          name="confirmPassword"
          placeholder="Nhập lỗi mật khẩu"
          className="w-full border border-mono-300 p-3 text-lg rounded outline-none"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
      </div>

      <button
        className="w-full bg-mono-700 text-white py-3 text-xl font-bold rounded"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? "Ðang xử lý..." : "Ðang ký"}
      </button>
      <ToastContainer />
    </div>
  );
};

export default RegisterForm;

