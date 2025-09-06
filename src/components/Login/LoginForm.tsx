import React, { useState } from "react";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FormikErrors,
  FormikTouched,
} from "formik";
import * as Yup from "yup";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: Yup.string().required("Mật khẩu là bắt buộc"),
});

// Định nghĩa type cho form values
interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy returnUrl từ query params
  const params = new URLSearchParams(location.search);
  const returnUrl = params.get("returnUrl") || "/";

  const handleLogin = async (values: { email: string; password: string }) => {
    if (isSubmitting) return; // Tránh gửi nhiều lần

    setIsSubmitting(true);
    try {
      console.log("Login attempt with:", values.email);
      await login(values.email, values.password);
      toast.success("Đăng nhập thành công!");
      navigate(returnUrl); // Chuyển hướng sau đăng nhập thành công
    } catch (error: any) {
      console.error("🚨 Đăng nhập thất bại:", error);

      // Hiển thị lỗi cụ thể từ server
      const errorMessage = error.message || "Đăng nhập thất bại";

      // Kiểm tra các dạng lỗi cụ thể để hiển thị thông báo thân thiện hơn
      if (
        errorMessage.includes("Tài khoản không tồn tại") ||
        errorMessage.includes("Email không tồn tại")
      ) {
        toast.error("Email không tồn tại trong hệ thống");
      } else if (errorMessage.includes("Mật khẩu không chính xác")) {
        toast.error("Mật khẩu không chính xác");
      } else if (
        errorMessage.includes("không được kích hoạt") ||
        errorMessage.includes("chưa kích hoạt")
      ) {
        toast.error("Tài khoản chưa được kích hoạt, vui lòng kiểm tra email");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Đăng nhập
      </h2>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({
          errors,
          touched,
        }: {
          errors: FormikErrors<LoginFormValues>;
          touched: FormikTouched<LoginFormValues>;
        }) => (
          <Form className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 mb-2 font-medium"
              >
                Email
              </label>
              <Field
                id="email"
                name="email"
                type="email"
                placeholder="example@gmail.com"
                className={`w-full p-3 border ${
                  errors.email && touched.email
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-medium"
                >
                  Mật khẩu
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Field
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className={`w-full p-3 border ${
                  errors.password && touched.password
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium ${
                isSubmitting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-700"
              } transition-colors duration-300`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                  Đang xử lý...
                </div>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </Form>
        )}
      </Formik>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-800">
            Đăng ký ngay
          </Link>
        </p>
      </div>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-3 text-gray-500 text-sm">Hoặc đăng nhập với</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <div className="flex gap-4">
        {/* Social login buttons */}
        <button
          className="flex-1 flex justify-center items-center gap-2 border border-gray-300 p-2 rounded-lg hover:bg-gray-50"
          onClick={() => toast.success("Đang xử lý đăng nhập bằng Google...")}
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          <span>Google</span>
        </button>
        <button
          className="flex-1 flex justify-center items-center gap-2 border border-gray-300 p-2 rounded-lg hover:bg-gray-50"
          onClick={() => toast.success("Đang xử lý đăng nhập bằng Facebook...")}
        >
          <img src="/facebook-icon.svg" alt="Facebook" className="w-5 h-5" />
          <span>Facebook</span>
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
