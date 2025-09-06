import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
// @ts-expect-error - Font import doesn't have TypeScript types
import "@fontsource/lobster";
// Đảm bảo import đúng từ service
import { register as registerUser } from "../../services/AuthenticationService";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get("redirect") || "/";
        navigate(redirectTo);
      }
    } catch (error: any) {
      console.error("🚨 Đăng nhập thất bại:", error);

      // Hiển thị thông báo lỗi từ backend
      let errorMessage = "Đăng nhập thất bại!";

      // Trường hợp lỗi validation từ backend
      if (
        error.response?.data?.errors &&
        error.response.data.errors.length > 0
      ) {
        // Lấy thông báo lỗi đầu tiên
        errorMessage = error.response.data.errors[0].msg;
      }
      // Trường hợp lỗi thông thường
      else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Trường hợp lỗi network hoặc khác
      else if (error.message) {
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
    console.log("Hàm handleRegister được gọi");
    try {
      const response = await registerUser(
        registerName,
        registerEmail,
        registerPassword
      );
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
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      {/* Container chính */}
      <div className="flex items-center justify-between w-[1400px] mx-auto relative gap-x-56">
        {/* ĐĂNG NHẬP */}
        <div className="w-[40%] flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl mb-4 w-full text-center">ĐĂNG NHẬP</h2>

          {/* Email */}
          <div className="w-3/4 mb-4">
            <label className="block text-left mb-1 text-base text-gray-500 font-light pl-2">
              Email
            </label>
            <input
              type="email"
              className="border border-black rounded-md p-2 w-full"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
          </div>

          {/* Mật khẩu */}
          <div className="w-3/4 mb-4">
            <label className="block text-left mb-1 text-base text-gray-500 font-light pl-2">
              Mật khẩu
            </label>
            <input
              type="password"
              className="border border-black rounded-md p-2 w-full"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between w-3/4 mb-1">
            <button
              className="bg-black text-white px-4 py-2 rounded-md w-[40%]"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            <button
              className="text-black text-base ml-2"
              onClick={() => navigate("/forgotpassword")}
            >
              Quên mật khẩu ?
            </button>
          </div>
        </div>

        {/* Đường thẳng và chữ "Or" */}
        <div className="relative flex items-center justify-center h-full">
          <div
            className="bg-black"
            style={{
              width: "2px",
              height: "75vh",
            }}
          ></div>
          <div
            className="absolute bg-white border border-black flex items-center justify-center"
            style={{
              width: "100px",
              height: "63px",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              left: "50%",
              top: "50%",
            }}
          >
            <span
              className="text-black text-3xl"
              style={{
                fontFamily: "'Lobster', cursive",
              }}
            >
              Or
            </span>
          </div>
        </div>

        {/* ĐĂNG KÝ */}
        <div className="w-[40%] flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl mb-4 w-full text-center">ĐĂNG KÝ</h2>

          {/* Tên người dùng */}
          <div className="w-3/4 mb-4">
            <label className="block text-left mb-1 text-base text-gray-500 font-light pl-2">
              Tên người dùng
            </label>
            <input
              type="text"
              className="border border-black rounded-md p-2 w-full"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="w-3/4 mb-4">
            <label className="block text-left mb-1 text-base text-gray-500 font-light pl-2">
              Email
            </label>
            <input
              type="email"
              className="border border-black rounded-md p-2 w-full"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />
          </div>

          {/* Mật khẩu */}
          <div className="w-3/4 mb-4">
            <label className="block text-left mb-1 text-base text-gray-500 font-light pl-2">
              Mật khẩu
            </label>
            <input
              type="password"
              className="border border-black rounded-md p-2 w-full"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between w-3/4 mb-1">
            <button
              className="bg-black text-white px-4 py-2 rounded-md w-[40%]"
              onClick={handleRegister}
            >
              Đăng ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
