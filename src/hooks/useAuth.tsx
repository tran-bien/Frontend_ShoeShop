import React, {
  createContext,
  ReactNode,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { toast } from "react-hot-toast";
import authService from "../services/AuthService";
import { AuthResponse, SessionInfo } from "../types/auth";
import type { UserRole } from "../types/user";
import type { User } from "../types/user";
import { jwtDecode } from "jwt-decode";
import { roleHelpers } from "../utils/roleHelpers";

interface LoginResult {
  success: boolean;
  user: User;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<AuthResponse>;
  verifyOTP: (email: string, otp: string) => Promise<AuthResponse>;
  resetPassword: (
    token: string,
    password: string,
    confirmPassword: string
  ) => Promise<AuthResponse>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<AuthResponse>;
  getSessions: () => Promise<AuthResponse<SessionInfo[]>>;
  logoutSession: (sessionId: string) => Promise<AuthResponse>;
  logoutAllOtherSessions: () => Promise<AuthResponse>;
  logoutAll: () => Promise<AuthResponse>;
  isLoading: boolean;

  // Role helper methods
  isStaff: () => boolean;
  hasStaffAccess: () => boolean;
  hasAdminOnlyAccess: () => boolean;
  getRoleDisplayName: () => string;
  canDelete: () => boolean;
  canViewFinancialReports: () => boolean;
  canManageUsers: () => boolean;
  canCreate: () => boolean;
  canUpdate: () => boolean;
  canToggleStatus: () => boolean;
  canAccessDashboard: () => boolean;
  canProcessOrders: () => boolean;
  canManageInventory: () => boolean;
  canManageImages: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Các hàm xử lý token
  const removeTokens = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  // Kiểm tra xem người dùng đã đăng nhập hay chưa khi khởi động
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          // Kiểm tra xem token có hợp lệ không
          const decodedToken = jwtDecode<{ exp: number }>(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp < currentTime) {
            // Token đã hết hạn
            removeTokens();
            setIsAuthenticated(false);
            setUser(null);
          } else {
            // Token còn hạn
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
          }
        } catch {
          // Token không hợp lệ
          removeTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Đăng nhập
  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      setLoading(true);

      // Gọi API login
      const response = await authService.login(email, password);

      console.log("Login response:", response); // Debug log

      // Backend trả về direct object, không có success wrapper
      // Kiểm tra xem response có token không
      if (response && response.token) {
        const {
          token,
          refreshToken,
          _id,
          name,
          email: userEmail,
          role,
          avatar,
          isVerified,
          shipper, // Include shipper info for shipper role
        } = response;

        // Kiểm tra xem token có tồn tại không
        if (!token) {
          console.error("Access token missing in response", response);
          throw new Error("Đăng nhập thất bại: Thiếu token xác thực");
        }

        // Lưu tokens
        localStorage.setItem("accessToken", token);
        localStorage.setItem("token", token); // Cho backwards compatibility

        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        // Tạo user info từ response
        const userInfo: User = {
          _id: _id,
          name: name,
          email: userEmail,
          role: role as UserRole,
          avatar: avatar
            ? typeof avatar === "string"
              ? { url: avatar, public_id: "" }
              : avatar
            : undefined,
          isVerified: isVerified,
          shipper: shipper, // Include shipper info
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Lưu user info
        localStorage.setItem("user", JSON.stringify(userInfo));
        setUser(userInfo);
        setIsAuthenticated(true);

        return { success: true, user: userInfo };
      } else {
        // Xử lý trường hợp không có token trong response
        console.error("Login failed: No token in response", response);
        throw new Error("Đăng nhập thất bại: Phản hồi không hợp lệ");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);

      // Xử lý phản hồi từ server một cách chi tiết hơn
      if (error && typeof error === "object" && "response" in error) {
        // Phản hồi từ server với mã lỗi
        const axiosError = error as {
          response: {
            data?: { message?: string; errors?: Array<{ msg: string }> };
          };
        };
        const errorMessage =
          axiosError.response.data?.message ||
          axiosError.response.data?.errors?.[0]?.msg ||
          "Đăng nhập thất bại: Vui lòng kiểm tra thông tin đăng nhập";
        throw new Error(errorMessage);
      } else if (error && typeof error === "object" && "request" in error) {
        // Không nhận được phản hồi từ server
        throw new Error("Đăng nhập thất bại: Không thể kết nối đến máy chủ");
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Đăng nhập thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const logout = useCallback(async () => {
    try {
      // Hiển thị toast trước khi thực hiện logout
      toast.success("Đăng xuất thành công!", {
        duration: 2000,
      });

      // Delay ngắn để toast kịp hiển thị
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Thực hiện logout
      await authService.logout();

      // Clear state
      setUser(null);
      setIsAuthenticated(false);

      // Clear localStorage - Dùng removeTokens() để đảm bảo xóa đủ 4 keys
      removeTokens();
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn clear state local nếu API lỗi
      setUser(null);
      setIsAuthenticated(false);
      removeTokens();

      toast.success("Đăng xuất thành công!", {
        duration: 2000,
      });
    }
  }, []);

  // Đăng ký
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authService.register({ name, email, password });
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Đăng ký thất bại");
      }
    } catch (error: unknown) {
      console.error("Register error:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response: { data: { message?: string } };
        };
        throw new Error(axiosError.response.data.message || "Đăng ký thất bại");
      } else {
        throw error;
      }
    }
  };

  // Xác thực OTP
  const verifyOTP = async (email: string, otp: string) => {
    try {
      // Sửa từ verifyOTP thành verifyOtp theo đúng định nghĩa trong AuthService
      const response = await authService.verifyOtp({ email, otp });
      return response.data;
    } catch (error) {
      console.error("Verify OTP error:", error);
      throw error;
    }
  };

  // Đặt lại mật khẩu
  const resetPassword = async (
    token: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      // Sửa lại tham số phù hợp với định nghĩa trong AuthService
      const response = await authService.resetPassword(
        token,
        password,
        confirmPassword
      );
      return response.data;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  }; // Đổi mật khẩu  // Đổi mật khẩu
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      // Validate parameters
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Xác nhận mật khẩu không khớp");
      }

      // Gọi API đổi mật khẩu
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      return response.data;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  };

  // Lấy danh sách sessions
  const getSessions = async () => {
    try {
      const response = await authService.getSessions();
      return response.data;
    } catch (error) {
      console.error("Get sessions error:", error);
      throw error;
    }
  };

  // Đăng xuất session cụ thể
  const logoutSession = async (sessionId: string) => {
    try {
      const response = await authService.logoutSession(sessionId);
      return response.data;
    } catch (error) {
      console.error("Logout session error:", error);
      throw error;
    }
  };

  // Đăng xuất tất cả sessions khác
  const logoutAllOtherSessions = async () => {
    try {
      const response = await authService.logoutAllOtherSessions();
      return response.data;
    } catch (error) {
      console.error("Logout all other sessions error:", error);
      throw error;
    }
  };

  // Đăng xuất tất cả sessions
  const logoutAll = async () => {
    try {
      const response = await authService.logoutAll();
      // Sau khi đăng xuất tất cả, cần clear local storage
      removeTokens();
      setIsAuthenticated(false);
      setUser(null);
      return response.data;
    } catch (error) {
      console.error("Logout all error:", error);
      throw error;
    }
  };

  // Role helper methods
  const isStaff = useCallback(() => {
    return user ? roleHelpers.isStaff(user.role) : false;
  }, [user]);

  const hasStaffAccess = useCallback(() => {
    return user ? roleHelpers.hasStaffAccess(user.role) : false;
  }, [user]);

  const hasAdminOnlyAccess = useCallback(() => {
    return user ? roleHelpers.hasAdminOnlyAccess(user.role) : false;
  }, [user]);

  const getRoleDisplayName = useCallback(() => {
    return user ? roleHelpers.getRoleDisplayName(user.role) : "Khách";
  }, [user]);

  const canDelete = useCallback(() => {
    return user ? roleHelpers.canDelete(user.role) : false;
  }, [user]);

  const canViewFinancialReports = useCallback(() => {
    return user ? roleHelpers.canViewFinancialReports(user.role) : false;
  }, [user]);

  const canManageUsers = useCallback(() => {
    return user ? roleHelpers.canManageUsers(user.role) : false;
  }, [user]);

  // Thêm các helper methods mới
  const canCreate = useCallback(() => {
    return user ? roleHelpers.canCreate(user.role) : false;
  }, [user]);

  const canUpdate = useCallback(() => {
    return user ? roleHelpers.canUpdate(user.role) : false;
  }, [user]);

  const canToggleStatus = useCallback(() => {
    return user ? roleHelpers.canToggleStatus(user.role) : false;
  }, [user]);

  const canAccessDashboard = useCallback(() => {
    return user ? roleHelpers.canAccessDashboard(user.role) : false;
  }, [user]);

  const canProcessOrders = useCallback(() => {
    return user ? roleHelpers.canProcessOrders(user.role) : false;
  }, [user]);

  const canManageInventory = useCallback(() => {
    return user ? roleHelpers.canManageInventory(user.role) : false;
  }, [user]);

  const canManageImages = useCallback(() => {
    return user ? roleHelpers.canManageImages(user.role) : false;
  }, [user]);

  const value = {
    isAuthenticated,
    isAdmin: user?.role === "admin",
    user,
    loading,
    login,
    logout,
    register,
    verifyOTP, // Giữ tên là verifyOtp trong context để tránh thay đổi code quá nhiều
    resetPassword,
    changePassword,
    getSessions,
    logoutSession,
    logoutAllOtherSessions,
    logoutAll,
    isLoading,

    // Role helper methods
    isStaff,
    hasStaffAccess,
    hasAdminOnlyAccess,
    getRoleDisplayName,
    canDelete,
    canCreate,
    canUpdate,
    canToggleStatus,
    canAccessDashboard,
    canProcessOrders,
    canManageInventory,
    canManageImages,
    canViewFinancialReports,
    canManageUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
