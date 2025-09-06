import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-hot-toast";

// Khóa API
const API_URL = import.meta.env.VITE_API_URL;

// Tạo instance axios với baseURL
export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // 20 giây
});

// Instance dùng cho các route yêu cầu authentication
export const axiosInstanceAuth = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// Thêm _retry property vào InternalAxiosRequestConfig
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Request interceptor cho authenticated routes
axiosInstanceAuth.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor cho authenticated routes
axiosInstanceAuth.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Kiểm tra nếu lỗi 401 (Unauthorized) và chưa thử refresh token
    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Lấy refresh token từ localStorage
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          // Nếu không có refresh token, đăng xuất
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");

          // Thông báo và chuyển hướng
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Gọi API refresh token
        const response = await axios.post(
          `${API_URL}/api/v1/auth/refresh-token`,
          { refreshToken }
        );

        if (response.data.success) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            response.data.data;

          // Lưu token mới vào localStorage
          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          // Cập nhật Authorization header và thực hiện lại request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Thực hiện lại request ban đầu với token mới
          return axiosInstanceAuth(originalRequest as AxiosRequestConfig);
        } else {
          // Nếu refresh không thành công, đăng xuất
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");

          window.location.href = "/login";
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Xử lý lỗi refresh token
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Không hiển thị toast ở đây để tránh conflict với logout toast
        // toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Xử lý các lỗi khác 401
    if (error.response) {
      const errorMessage = error.response.data?.message || "Có lỗi xảy ra";

      // Tối ưu: Không hiển thị toast cho một số endpoint cụ thể để tránh delay
      const skipToastUrls = [
        "/api/v1/auth/login",
        "/api/v1/auth/logout",
        "/api/v1/orders/vnpay/callback",
        "/api/v1/orders/vnpay/ipn",
      ];

      const shouldSkipToast =
        error.config &&
        error.config.url &&
        skipToastUrls.some((url) => error.config.url.includes(url));

      if (!shouldSkipToast && error.response.status !== 401) {
        // Sử dụng setTimeout để tránh block UI
        setTimeout(() => {
          toast.error(errorMessage);
        }, 0);
      }
    } else if (error.request) {
      // Request gửi đi nhưng không nhận được response
      setTimeout(() => {
        toast.error("Không thể kết nối với máy chủ");
      }, 0);
    } else {
      // Lỗi khi thiết lập request
      setTimeout(() => {
        toast.error("Có lỗi xảy ra khi gửi yêu cầu");
      }, 0);
    }

    return Promise.reject(error);
  }
);

export default { axiosInstance, axiosInstanceAuth };
