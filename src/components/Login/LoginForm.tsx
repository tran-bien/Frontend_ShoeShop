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

// Ðẩnh nghia type cho form values
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

  // L?y returnUrl từ query params
  const params = new URLSearchParams(location.search);
  const returnUrl = params.get("returnUrl") || "/";

  const handleLogin = async (values: { email: string; password: string }) => {
    if (isSubmitting) return; // Tránh gửi nhi?u lẩn

    setIsSubmitting(true);
    try {
      console.log("Login attempt with:", values.email);
      await login(values.email, values.password);
      toast.success("Ðang nhập thành công!");
      navigate(returnUrl); // Chuyện huẩng sau đang nhập thành công
    } catch (error: any) {
      console.error("?? Ðang nhập thểt b?i:", error);

      // Hiện thọ lỗi c? thọ từ server
      const errorMessage = error.message || "Ðang nhập thểt b?i";

      // Ki?m tra các đếng lỗi c? thọ d? hiện thọ thông báo thân thiện hon
      if (
        errorMessage.includes("Tài khoẩn không tên tại") ||
        errorMessage.includes("Email không tên tại")
      ) {
        toast.error("Email không tên tại trong họ thàng");
      } else if (errorMessage.includes("Mật khẩu không chính xác")) {
        toast.error("Mật khẩu không chính xác");
      } else if (
        errorMessage.includes("không được kích ho?t") ||
        errorMessage.includes("chua kích ho?t")
      ) {
        toast.error("Tài khoẩn chua được kích ho?t, vui lòng ki?m tra email");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-mono-800">
        Ðang nhập
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
                className="block text-mono-700 mb-2 font-medium"
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
                    ? "border-mono-800"
                    : "border-mono-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500`}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-mono-800 text-sm mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-mono-700 font-medium"
                >
                  Mật khẩu
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-mono-black hover:text-mono-800"
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
                    ? "border-mono-800"
                    : "border-mono-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500`}
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-mono-800 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-mono-black text-white py-3 rounded-lg font-medium ${
                isSubmitting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-mono-800"
              } transition-colors duration-300`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                  Ðang xử lý...
                </div>
              ) : (
                "Ðang nhập"
              )}
            </button>
          </Form>
        )}
      </Formik>

      <div className="mt-6 text-center">
        <p className="text-mono-600">
          Chua có tài khoẩn?{" "}
          <Link to="/register" className="text-mono-black hover:text-mono-800">
            Ðang ký ngay
          </Link>
        </p>
      </div>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-mono-300"></div>
        <span className="px-3 text-mono-500 text-sm">Ho?c đang nhập với</span>
        <div className="flex-1 border-t border-mono-300"></div>
      </div>

      <div className="flex gap-4">
        {/* Social login buttons */}
        <button
          className="flex-1 flex justify-center items-center gap-2 border border-mono-300 p-2 rounded-lg hover:bg-mono-50"
          onClick={() => toast.success("Ðang xử lý đang nhập bảng Google...")}
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          <span>Google</span>
        </button>
        <button
          className="flex-1 flex justify-center items-center gap-2 border border-mono-300 p-2 rounded-lg hover:bg-mono-50"
          onClick={() => toast.success("Ðang xử lý đang nhập bảng Facebook...")}
        >
          <img src="/facebook-icon.svg" alt="Facebook" className="w-5 h-5" />
          <span>Facebook</span>
        </button>
      </div>
    </div>
  );
};

export default LoginForm;


