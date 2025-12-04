import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const OTPVerificationForm: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP } = useAuth();

  // L?y thông tin email từ state của route n?u có
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const validateForm = () => {
    // Reset error
    setError("");

    // Ki?m tra email
    if (!email) {
      setError("Vui lòng nhập email của bẩn");
      return false;
    }

    // Ki?m tra OTP
    if (!otp) {
      setError("Vui lòng nhập mã OTP");
      return false;
    }

    if (otp.length !== 6) {
      setError("Mã OTP ph?i có 6 ký t?");
      return false;
    }

    if (!/^\d+$/.test(otp)) {
      setError("Mã OTP ph?i là s?");
      return false;
    }

    return true;
  };

  const handleVerify = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await verifyOTP(email, otp);
      toast.success("Xác thực thành công!");

      // Chuyện huẩng đến trang đang nhập sau khi xác thực thành công
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      // Xử lý thông báo lỗi chi tiết từ BE
      let errorMessage = "Xác thực thất bại!";

      if (
        error.response?.data?.errors &&
        error.response.data.errors.length > 0
      ) {
        // Hiển thị lỗi cụ thể từ validator của BE
        errorMessage = error.response.data.errors[0].msg;
        setError(errorMessage);
      } else if (error.response?.data?.message) {
        // Hiển thị thông báo lỗi từ BE
        errorMessage = error.response.data.message;
        setError(errorMessage);
      } else if (error.message) {
        errorMessage = error.message;
        setError(errorMessage);
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý nhập OTP - chỉ cho phép nhập số
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Chỉ cho phép nhập số và giới hạn 6 ký tự
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
      if (error) setError("");
    }
  };

  return (
    <div className="w-[100%] flex items-center justify-center h-screen bg-white">
      <div className="w-[35%] p-8 bg-white rounded-lg flex flex-col items-center justify-center h-auto">
        <h2 className="text-2xl mb-6 text-center">XÁC NHẬN ĐĂNG KÝ</h2>

        {/* Email */}
        <div className="w-full mb-4">
          <label className="block text-left mb-1 text-base text-mono-500 font-light pl-2">
            Email
          </label>
          <input
            type="email"
            className={`border ${
              error && !otp ? "border-mono-800" : "border-black"
            } rounded-md p-2 w-full`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            disabled={loading}
          />
        </div>

        {/* Mã xác nhận */}
        <div className="w-full mb-4">
          <label className="block text-left mb-1 text-base text-mono-500 font-light pl-2">
            Mã xác nhận
          </label>
          <input
            type="text"
            className={`border ${
              error && !email ? "border-mono-800" : "border-black"
            } rounded-md p-2 w-full`}
            value={otp}
            onChange={handleOtpChange}
            placeholder="Nhập mã OTP 6 chữ số"
            disabled={loading}
          />
        </div>

        {/* Hiển thị thông báo lỗi */}
        {error && (
          <div className="w-full mb-4">
            <p className="text-mono-800 text-sm">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between w-full mt-6">
          <button
            className="bg-black text-white px-4 py-2 rounded-md w-[48%] transition-all duration-300 hover:bg-opacity-90 hover:shadow-lg disabled:opacity-50"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? "Đang xác thực..." : "Xác nhận"}
          </button>
          <button
            className="text-black text-base transition-all duration-300 hover:text-mono-600 hover:scale-105"
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            Ðang nhập
          </button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default OTPVerificationForm;
