// src/utils/roleHelpers.ts
export const ROLES = {
  USER: "user",
  STAFF: "staff",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const roleHelpers = {
  // Kiểm tra có phải admin không
  isAdmin: (role: string): boolean => role === ROLES.ADMIN,

  // Kiểm tra có phải staff không
  isStaff: (role: string): boolean => role === ROLES.STAFF,

  // Kiểm tra có quyền staff trở lên (staff hoặc admin)
  hasStaffAccess: (role: string): boolean =>
    role === ROLES.STAFF || role === ROLES.ADMIN,

  // Kiểm tra có quyền admin only
  hasAdminOnlyAccess: (role: string): boolean => role === ROLES.ADMIN,

  // Lấy tên hiển thị của role
  getRoleDisplayName: (role: string): string => {
    switch (role) {
      case ROLES.ADMIN:
        return "Quản trị viên";
      case ROLES.STAFF:
        return "Nhân viên";
      case ROLES.USER:
        return "Khách hàng";
      default:
        return "Người dùng";
    }
  },

  // Kiểm tra có thể xóa dữ liệu không (staff và admin)
  canDelete: (role: string): boolean =>
    role === ROLES.STAFF || role === ROLES.ADMIN,

  // Kiểm tra có thể tạo dữ liệu không (staff và admin)
  canCreate: (role: string): boolean =>
    role === ROLES.STAFF || role === ROLES.ADMIN,

  // Kiểm tra có thể sửa dữ liệu không (staff và admin)
  canUpdate: (role: string): boolean =>
    role === ROLES.STAFF || role === ROLES.ADMIN,

  // Kiểm tra có thể toggle status không (staff và admin)
  canToggleStatus: (role: string): boolean =>
    role === ROLES.STAFF || role === ROLES.ADMIN,

  // Kiểm tra có thể truy cập dashboard không (chỉ admin)
  canAccessDashboard: (role: string): boolean => role === ROLES.ADMIN,

  // Kiểm tra có thể xử lý orders không (staff và admin)
  canProcessOrders: (role: string): boolean =>
    role === ROLES.STAFF || role === ROLES.ADMIN,

  // Kiểm tra có thể quản lý inventory không (chỉ admin)
  canManageInventory: (role: string): boolean => role === ROLES.ADMIN,

  // Kiểm tra có thể quản lý ảnh không (chỉ admin)
  canManageImages: (role: string): boolean => role === ROLES.ADMIN,

  // Kiểm tra có thể xem báo cáo tài chính không (chỉ admin)
  canViewFinancialReports: (role: string): boolean => role === ROLES.ADMIN,

  // Kiểm tra có thể quản lý người dùng không (chỉ admin)
  canManageUsers: (role: string): boolean => role === ROLES.ADMIN,
};

// Helper cho component conditional rendering
export const RoleGuard = {
  // Kiểm tra có thể hiển thị component không
  canRender: (userRole: string, requiredRoles: UserRole[]): boolean => {
    return requiredRoles.includes(userRole as UserRole);
  },

  // Hiển thị component nếu có quyền
  renderIf: (
    userRole: string,
    requiredRoles: UserRole[],
    component: React.ReactNode
  ): React.ReactNode => {
    return RoleGuard.canRender(userRole, requiredRoles) ? component : null;
  },
};
