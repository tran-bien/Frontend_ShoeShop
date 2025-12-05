import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import AuthLayout from "../../components/Auth/AuthLayout";
import authService from "../../services/AuthService";

const OTPVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const type = location.state?.type || "register"; // "register" or "reset-password"

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only last digit
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    const newOtp = [...otp];
    for (let i = 0; i < 6 && i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số OTP!");
      return;
    }

    setLoading(true);
    try {
      if (type === "reset-password") {
        // Verify OTP for password reset
        await authService.verifyOTP(email, otpCode);
        toast.success("Xác thực thành công!");
        navigate("/reset-password", {
          state: { email, otp: otpCode },
        });
      } else {
        // Verify OTP for registration
        await authService.verifyOTP(email, otpCode);
        toast.success("Xác thực thành công! Vui lòng đăng nhập.");
        navigate("/login");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Mã OTP không hợp lệ!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      if (type === "reset-password") {
        await authService.forgotPassword(email);
      } else {
        await authService.resendOTP(email);
      }
      toast.success("Mã OTP mới đã được gửi!");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error("Gửi lại OTP thất bại!");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout title="Xác thực OTP" subtitle="Nhập mã xác thực để tiếp tục">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="space-y-6">
          {/* Email Info */}
          <div className="flex items-center justify-center gap-2 text-slate-600 bg-slate-50 py-3 px-4 rounded-xl">
            <FiMail className="text-slate-500" />
            <span className="text-sm">Mã OTP đã được gửi đến</span>
            <span className="font-medium text-slate-900">{email}</span>
          </div>

          {/* Description */}
          <p className="text-slate-600 text-center text-sm">
            Vui lòng kiểm tra hộp thư (bao gồm cả thư rác) và nhập mã 6 số
          </p>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20"
          >
            {loading ? "Đang xác thực..." : "Xác thực"}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-slate-500 text-sm">
                Gửi lại mã sau{" "}
                <span className="font-semibold text-slate-900">
                  {countdown}s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-slate-900 font-semibold hover:underline disabled:text-slate-400"
              >
                {resendLoading ? "Đang gửi..." : "Gửi lại mã OTP"}
              </button>
            )}
          </div>

          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <FiArrowLeft />
            <span>Quay lại đăng nhập</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default OTPVerificationPage;
