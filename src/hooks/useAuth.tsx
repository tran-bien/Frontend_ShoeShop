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

  // CÃ¡c hÃ m xá»­ lÃ½ token
  const removeTokens = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  // Kiá»ƒm tra xem ngÆ°á»i dÃ¹ng Ä‘Ã£ Ä‘Äƒng nháº­p hay chÆ°a khi khá»Ÿi Ä‘á»™ng
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          // Kiá»ƒm tra xem token cÃ³ há»£p lá»‡ khÃ´ng
          const decodedToken = jwtDecode<{ exp: number }>(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp < currentTime) {
            // Token Ä‘Ã£ háº¿t háº¡n
            removeTokens();
            setIsAuthenticated(false);
            setUser(null);
          } else {
            // Token cÃ²n háº¡n
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
          }
        } catch {
          // Token khÃ´ng há»£p lá»‡
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

  // ÄÄƒng nháº­p
  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      setLoading(true);

      // Gá»i API login
      const response = await authService.login(email, password);

      console.log("Login response:", response); // Debug log

      // Backend tráº£ vá» direct object, khÃ´ng cÃ³ success wrapper
      // Kiá»ƒm tra xem response cÃ³ token khÃ´ng
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
        } = response;

        // Kiá»ƒm tra xem token cÃ³ tá»“n táº¡i khÃ´ng
        if (!token) {
          console.error("Access token missing in response", response);
          throw new Error("ÄÄƒng nháº­p tháº¥t báº¡i: Thiáº¿u token xÃ¡c thá»±c");
        }

        // LÆ°u tokens
        localStorage.setItem("accessToken", token);
        localStorage.setItem("token", token); // Cho backwards compatibility

        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        // Táº¡o user info tá»« response
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // LÆ°u user info
        localStorage.setItem("user", JSON.stringify(userInfo));
        setUser(userInfo);
        setIsAuthenticated(true);

        return { success: true, user: userInfo };
      } else {
        // Xá»­ lÃ½ trÆ°á»ng há»£p khÃ´ng cÃ³ token trong response
        console.error("Login failed: No token in response", response);
        throw new Error("ÄÄƒng nháº­p tháº¥t báº¡i: Pháº£n há»“i khÃ´ng há»£p lá»‡");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);

      // Xá»­ lÃ½ pháº£n há»“i tá»« server má»™t cÃ¡ch chi tiáº¿t hÆ¡n
      if (error && typeof error === "object" && "response" in error) {
        // Pháº£n há»“i tá»« server vá»›i mÃ£ lá»—i
        const axiosError = error as {
          response: {
            data?: { message?: string; errors?: Array<{ msg: string }> };
          };
        };
        const errorMessage =
          axiosError.response.data?.message ||
          axiosError.response.data?.errors?.[0]?.msg ||
          "ÄÄƒng nháº­p tháº¥t báº¡i: Vui lÃ²ng kiá»ƒm tra thÃ´ng tin Ä‘Äƒng nháº­p";
        throw new Error(errorMessage);
      } else if (error && typeof error === "object" && "request" in error) {
        // KhÃ´ng nháº­n Ä‘Æ°á»£c pháº£n há»“i tá»« server
        throw new Error("ÄÄƒng nháº­p tháº¥t báº¡i: KhÃ´ng thá»ƒ káº¿t ná»‘i Ä‘áº¿n mÃ¡y chá»§");
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("ÄÄƒng nháº­p tháº¥t báº¡i");
      }
    } finally {
      setLoading(false);
    }
  };

  // ÄÄƒng xuáº¥t
  const logout = useCallback(async () => {
    try {
      // Hiá»ƒn thá»‹ toast trÆ°á»›c khi thá»±c hiá»‡n logout
      toast.success("ÄÄƒng xuáº¥t thÃ nh cÃ´ng!", {
        duration: 2000,
      });

      // Delay ngáº¯n Ä‘á»ƒ toast ká»‹p hiá»ƒn thá»‹
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Thá»±c hiá»‡n logout
      await authService.logout();

      // Clear state
      setUser(null);
      setIsAuthenticated(false);

      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout error:", error);
      // Váº«n clear state local náº¿u API lá»—i
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      toast.success("ÄÄƒng xuáº¥t thÃ nh cÃ´ng!", {
        duration: 2000,
      });
    }
  }, []);

  // ÄÄƒng kÃ½
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authService.register({ name, email, password });
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "ÄÄƒng kÃ½ tháº¥t báº¡i");
      }
    } catch (error: unknown) {
      console.error("Register error:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response: { data: { message?: string } };
        };
        throw new Error(axiosError.response.data.message || "ÄÄƒng kÃ½ tháº¥t báº¡i");
      } else {
        throw error;
      }
    }
  };

  // XÃ¡c thá»±c OTP
  const verifyOTP = async (email: string, otp: string) => {
    try {
      // Sá»­a tá»« verifyOTP thÃ nh verifyOtp theo Ä‘Ãºng Ä‘á»‹nh nghÄ©a trong AuthService
      const response = await authService.verifyOtp({ email, otp });
      return response.data;
    } catch (error) {
      console.error("Verify OTP error:", error);
      throw error;
    }
  };

  // Äáº·t láº¡i máº­t kháº©u
  const resetPassword = async (
    token: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      // Sá»­a láº¡i tham sá»‘ phÃ¹ há»£p vá»›i Ä‘á»‹nh nghÄ©a trong AuthService
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
  }; // Äá»•i máº­t kháº©u  // Äá»•i máº­t kháº©u
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      // Validate parameters
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error("Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("XÃ¡c nháº­n máº­t kháº©u khÃ´ng khá»›p");
      }

      // Gá»i API Ä‘á»•i máº­t kháº©u
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

  // Láº¥y danh sÃ¡ch sessions
  const getSessions = async () => {
    try {
      const response = await authService.getSessions();
      return response.data;
    } catch (error) {
      console.error("Get sessions error:", error);
      throw error;
    }
  };

  // ÄÄƒng xuáº¥t session cá»¥ thá»ƒ
  const logoutSession = async (sessionId: string) => {
    try {
      const response = await authService.logoutSession(sessionId);
      return response.data;
    } catch (error) {
      console.error("Logout session error:", error);
      throw error;
    }
  };

  // ÄÄƒng xuáº¥t táº¥t cáº£ sessions khÃ¡c
  const logoutAllOtherSessions = async () => {
    try {
      const response = await authService.logoutAllOtherSessions();
      return response.data;
    } catch (error) {
      console.error("Logout all other sessions error:", error);
      throw error;
    }
  };

  // ÄÄƒng xuáº¥t táº¥t cáº£ sessions
  const logoutAll = async () => {
    try {
      const response = await authService.logoutAll();
      // Sau khi Ä‘Äƒng xuáº¥t táº¥t cáº£, cáº§n clear local storage
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
    return user ? roleHelpers.getRoleDisplayName(user.role) : "KhÃ¡ch";
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

  // ThÃªm cÃ¡c helper methods má»›i
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
    verifyOTP, // Giá»¯ tÃªn lÃ  verifyOTP trong context Ä‘á»ƒ trÃ¡nh thay Ä‘á»•i code quÃ¡ nhiá»u
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

