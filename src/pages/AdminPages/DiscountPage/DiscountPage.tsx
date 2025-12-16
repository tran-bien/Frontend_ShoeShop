import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import {
  adminCouponService,
  CreateCouponData,
} from "../../../services/CouponService";
import { productAdminService } from "../../../services/ProductService";
import { adminCategoryService } from "../../../services/CategoryService";
import { adminLoyaltyService } from "../../../services/LoyaltyService";
import { useAuth } from "../../../hooks/useAuth";
import toast from "react-hot-toast";
import type {
  Coupon,
  CouponPriority,
  CouponScope,
  CouponConditions,
} from "../../../types/coupon";

type Discount = Coupon & {
  id: string;
  currentUses: number;
  status: string;
  users?: unknown[];
  userUsage?: unknown[];
  applicableProducts?: (
    | string
    | { _id: string; name: string; slug?: string }
  )[];
  applicableCategories?: (
    | string
    | { _id: string; name: string; slug?: string }
  )[];
  conditions?: CouponConditions & {
    requiredTiers?: (
      | string
      | { _id: string; name: string; displayOrder?: number }
    )[];
  };
};

interface ProductOption {
  _id: string;
  name: string;
}

interface CategoryOption {
  _id: string;
  name: string;
}

interface TierOption {
  _id: string;
  name: string;
}

const initialForm = {
  code: "",
  description: "",
  type: "percent" as "percent" | "fixed",
  value: 0,
  maxDiscount: 0,
  minOrderValue: 0,
  startDate: "",
  endDate: "",
  maxUses: 1,
  isPublic: true,
  isRedeemable: false,
  pointCost: 0,
  maxRedeemPerUser: 0,
  priority: "MEDIUM" as CouponPriority,
  // Advanced fields
  scope: "ALL" as CouponScope,
  applicableProducts: [] as string[],
  applicableCategories: [] as string[],
  conditions: {
    minQuantity: 0,
    maxUsagePerUser: 0,
    requiredTiers: [] as string[],
    firstOrderOnly: false,
  } as CouponConditions,
};

const DiscountPage = () => {
  const { canCreate, canUpdate, canToggleStatus, canDelete } = useAuth();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDiscount, setEditDiscount] = useState<Discount | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [redeemableFilter, setRedeemableFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingDiscount, setViewingDiscount] = useState<Discount | null>(null);
  const [loadingView, setLoadingView] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archivingDiscount, setArchivingDiscount] = useState<Discount | null>(
    null
  );
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDiscount, setDeletingDiscount] = useState<Discount | null>(
    null
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Options for advanced fields
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [tiers, setTiers] = useState<TierOption[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchDiscounts();
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    statusFilter,
    typeFilter,
    scopeFilter,
    redeemableFilter,
    searchQuery,
  ]);

  const fetchOptions = async () => {
    try {
      const [productsRes, categoriesRes, tiersRes] = await Promise.all([
        productAdminService.getProducts({ limit: 100 }),
        adminCategoryService.getAll(),
        adminLoyaltyService.getAllTiers({}),
      ]);

      if (productsRes.data?.data) {
        setProducts(
          productsRes.data.data.map((p: { _id: string; name: string }) => ({
            _id: p._id,
            name: p.name,
          }))
        );
      }
      if (categoriesRes.data?.data) {
        const catsData = categoriesRes.data.data as
          | { _id: string; name: string }[]
          | { categories?: { _id: string; name: string }[] };
        const cats = Array.isArray(catsData)
          ? catsData
          : (catsData as { categories?: { _id: string; name: string }[] })
              ?.categories || [];
        setCategories(
          cats.map((c: { _id: string; name: string }) => ({
            _id: c._id,
            name: c.name,
          }))
        );
      }
      if (tiersRes.data?.data) {
        const tiersData = tiersRes.data.data as
          | { _id: string; name: string }[]
          | { tiers?: { _id: string; name: string }[] };
        const tierData = Array.isArray(tiersData)
          ? tiersData
          : (tiersData as { tiers?: { _id: string; name: string }[] })?.tiers ||
            [];
        setTiers(
          tierData.map((t: { _id: string; name: string }) => ({
            _id: t._id,
            name: t.name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        limit,
      };
      if (searchQuery) {
        params.search = searchQuery;
      }
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (typeFilter !== "all") {
        params.type = typeFilter;
      }
      if (scopeFilter !== "all") {
        params.scope = scopeFilter;
      }
      if (redeemableFilter !== "all") {
        params.isRedeemable = redeemableFilter === "yes";
      }
      const res = await adminCouponService.getAllCoupons(params);
      const coupons = Array.isArray(res.data.data)
        ? res.data.data
        : res.data.data?.coupons || [];

      // Extract pagination info if available
      type PaginationInfo = { totalPages?: number; total?: number };
      const resData = res.data as {
        pagination?: PaginationInfo;
        data?: { pagination?: PaginationInfo };
      };
      const pagination = resData.pagination || resData.data?.pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
        setTotalCount(pagination.total || coupons.length);
      } else {
        setTotalPages(1);
        setTotalCount(coupons.length);
      }

      setDiscounts(
        coupons.map((c: Coupon) => ({
          _id: c._id,
          id: c._id,
          code: c.code,
          description: c.description,
          type: c.type,
          value: c.value,
          maxDiscount: c.maxDiscount,
          minOrderValue: c.minOrderValue,
          startDate: c.startDate ? c.startDate.slice(0, 10) : "",
          endDate: c.endDate ? c.endDate.slice(0, 10) : "",
          maxUses: c.maxUses,
          currentUses: c.currentUses,
          status: c.status,
          isPublic: c.isPublic,
          createdAt: c.createdAt || "",
          updatedAt: c.updatedAt || "",
          isRedeemable: c.isRedeemable || false,
          pointCost: c.pointCost || 0,
          maxRedeemPerUser: c.maxRedeemPerUser || 0,
          priority: c.priority || "MEDIUM",
          scope: c.scope || "ALL",
          applicableProducts: c.applicableProducts || [],
          applicableCategories: c.applicableCategories || [],
          conditions: c.conditions || {},
        }))
      );
    } catch {
      setDiscounts([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditDiscount(null);
    setForm(initialForm);
    setShowAdvanced(false);
    setShowModal(true);
  };

  const openEditModal = (discount: Discount) => {
    setEditDiscount(discount);
    setForm({
      code: discount.code,
      description: discount.description,
      type: discount.type,
      value: discount.value,
      maxDiscount: discount.maxDiscount || 0,
      minOrderValue: discount.minOrderValue,
      startDate: discount.startDate,
      endDate: discount.endDate,
      maxUses: discount.maxUses ?? 0,
      isPublic: discount.isPublic,
      isRedeemable: discount.isRedeemable || false,
      pointCost: discount.pointCost || 0,
      maxRedeemPerUser: discount.maxRedeemPerUser || 0,
      priority: discount.priority || "MEDIUM",
      scope: discount.scope || "ALL",
      applicableProducts: discount.applicableProducts || [],
      applicableCategories: discount.applicableCategories || [],
      conditions: {
        minQuantity: discount.conditions?.minQuantity || 0,
        maxUsagePerUser: discount.conditions?.maxUsagePerUser || 0,
        requiredTiers: discount.conditions?.requiredTiers || [],
        firstOrderOnly: discount.conditions?.firstOrderOnly || false,
      },
    });
    // Show advanced section if any advanced field is set
    const hasAdvanced =
      discount.scope !== "ALL" ||
      (discount.conditions?.minQuantity ?? 0) > 0 ||
      (discount.conditions?.maxUsagePerUser ?? 0) > 0 ||
      (discount.conditions?.requiredTiers?.length ?? 0) > 0 ||
      discount.conditions?.firstOrderOnly;
    setShowAdvanced(!!hasAdvanced);
    setShowModal(true);
  };

  const openViewModal = async (discount: Discount) => {
    setShowViewModal(true);
    setViewingDiscount(discount);
    setLoadingView(true);
    try {
      // Fetch full coupon detail including populated fields
      const res = await adminCouponService.getCouponById(discount.id);
      if (res.data?.data) {
        const fullCoupon = res.data.data as Discount;
        setViewingDiscount({
          ...discount,
          ...fullCoupon,
          id: discount.id,
        } as Discount);
      }
    } catch {
      // Keep discount with basic info
    } finally {
      setLoadingView(false);
    }
  };

  // Helper to get display name for products/categories/tiers
  const getItemDisplayName = (
    item: string | { _id: string; name: string; slug?: string },
    fallbackList?: { _id: string; name: string }[]
  ): string => {
    if (typeof item === "object" && item.name) {
      return item.name;
    }
    // If it's a string (ID), try to find name from fallback list
    const id = typeof item === "string" ? item : item._id;
    const found = fallbackList?.find((f) => f._id === id);
    return found?.name || id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // FE Validation - match BE logic
    if (form.type === "percent" && (form.value < 0 || form.value > 100)) {
      toast.error("Giá trị phần trăm phải từ 0 đến 100");
      setSubmitting(false);
      return;
    }

    if (form.isRedeemable && form.pointCost <= 0) {
      toast.error("Coupon đổi bằng điểm phải có số điểm cần đổi > 0");
      setSubmitting(false);
      return;
    }

    if (form.scope === "PRODUCTS" && form.applicableProducts.length === 0) {
      toast.error("Phạm vi 'Sản phẩm cụ thể' cần chọn ít nhất 1 sản phẩm");
      setSubmitting(false);
      return;
    }

    if (form.scope === "CATEGORIES" && form.applicableCategories.length === 0) {
      toast.error("Phạm vi 'Danh mục cụ thể' cần chọn ít nhất 1 danh mục");
      setSubmitting(false);
      return;
    }

    const data = {
      code: form.code,
      description: form.description,
      type: form.type,
      value: form.value,
      minOrderValue: form.minOrderValue,
      startDate: form.startDate,
      endDate: form.endDate,
      maxUses: form.maxUses,
      isPublic: form.isPublic,
      isRedeemable: form.isRedeemable,
      pointCost: form.isRedeemable ? form.pointCost : 0,
      maxRedeemPerUser: form.maxRedeemPerUser,
      priority: form.priority,
      scope: form.scope,
      maxDiscount: form.type === "percent" ? form.maxDiscount : undefined,
      applicableProducts:
        form.scope === "PRODUCTS" ? form.applicableProducts : undefined,
      applicableCategories:
        form.scope === "CATEGORIES" ? form.applicableCategories : undefined,
      conditions: showAdvanced
        ? {
            minQuantity:
              (form.conditions?.minQuantity ?? 0) > 0
                ? form.conditions?.minQuantity
                : undefined,
            maxUsagePerUser:
              (form.conditions?.maxUsagePerUser ?? 0) > 0
                ? form.conditions?.maxUsagePerUser
                : undefined,
            requiredTiers:
              (form.conditions?.requiredTiers?.length ?? 0) > 0
                ? form.conditions?.requiredTiers
                : undefined,
            firstOrderOnly: form.conditions?.firstOrderOnly || undefined,
          }
        : undefined,
    };

    try {
      if (editDiscount) {
        await adminCouponService.updateCoupon(editDiscount.id, data);
        toast.success("Cập nhật coupon thành công!");
      } else {
        await adminCouponService.createCoupon(
          data as unknown as CreateCouponData
        );
        toast.success("Thêm coupon thành công!");
      }
      setShowModal(false);
      setEditDiscount(null);
      setForm(initialForm);
      fetchDiscounts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message ||
          (editDiscount ? "Cập nhật coupon thất bại!" : "Thêm coupon thất bại!")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (discount: Discount) => {
    // Open confirmation modal instead of immediate delete
    setShowDeleteModal(true);
    setDeletingDiscount(discount);
  };

  const confirmDeleteCoupon = async () => {
    if (!deletingDiscount) return;
    try {
      await adminCouponService.deleteCoupon(deletingDiscount.id);
      toast.success("Xóa coupon thành công!");
      fetchDiscounts();
    } catch {
      toast.error("Xóa coupon thất bại!");
    } finally {
      setShowDeleteModal(false);
      setDeletingDiscount(null);
    }
  };

  const handleToggleStatus = async (discount: Discount) => {
    const newStatus = discount.status === "active" ? "inactive" : "active";
    try {
      await adminCouponService.updateCouponStatus(discount.id, {
        status: newStatus,
      });
      toast.success(
        `Đã ${newStatus === "active" ? "kích hoạt" : "tạm ngừng"} coupon!`
      );
      fetchDiscounts();
    } catch {
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  const handleArchive = async (discount: Discount) => {
    setArchivingDiscount(discount);
    setShowArchiveModal(true);
  };

  const confirmArchive = async () => {
    if (!archivingDiscount) return;
    try {
      await adminCouponService.updateCouponStatus(archivingDiscount.id, {
        status: "archived",
      });
      toast.success("Đã lưu trữ coupon!");
      fetchDiscounts();
    } catch {
      toast.error("Lưu trữ coupon thất bại!");
    } finally {
      setShowArchiveModal(false);
      setArchivingDiscount(null);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (
      [
        "value",
        "maxDiscount",
        "minOrderValue",
        "maxUses",
        "pointCost",
        "maxRedeemPerUser",
      ].includes(name)
    ) {
      setForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Client-side additional filtering (if server doesn't filter)
  const displayedDiscounts = discounts;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-mono-900 text-white",
      inactive: "bg-mono-200 text-mono-700",
      expired: "bg-mono-100 text-mono-500",
      archived: "bg-mono-100 text-mono-400",
    };
    const labels: Record<string, string> = {
      active: "Hoạt động",
      inactive: "Tạm ngừng",
      expired: "Hết hạn",
      archived: "Lưu trữ",
    };
    return (
      <span
        className={`${
          styles[status] || "bg-mono-100 text-mono-600"
        } px-2.5 py-1 rounded-full text-xs font-medium`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      HIGH: "text-mono-900",
      MEDIUM: "text-mono-600",
      LOW: "text-mono-400",
    };
    const labels: Record<string, string> = {
      HIGH: "Cao",
      MEDIUM: "Trung bình",
      LOW: "Thấp",
    };
    return (
      <span className={`text-xs font-medium ${styles[priority] || ""}`}>
        {labels[priority] || ""}
      </span>
    );
  };

  return (
    <div className="p-6 w-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-mono-900">Quản lý Coupon</h2>
          <p className="text-sm text-mono-500 mt-1">
            Quản lý mã giảm giá và khuyến mãi
          </p>
        </div>
        {canCreate() && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-mono-900 hover:bg-mono-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Thêm Coupon
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-mono-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            {!isSearchVisible ? (
              <button
                onClick={() => setIsSearchVisible(true)}
                className="flex items-center gap-2 px-4 py-2 border border-mono-300 bg-white hover:bg-mono-50 text-mono-700 rounded-lg transition-colors"
              >
                <IoIosSearch className="text-lg text-mono-500" />
                <span className="text-sm">Tìm kiếm...</span>
              </button>
            ) : (
              <div className="relative">
                <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Tìm theo mã hoặc mô tả..."
                  className="w-full pl-10 pr-10 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsSearchVisible(false);
                    setSearchQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mono-400 hover:text-mono-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm ngừng</option>
            <option value="expired">Hết hạn</option>
            <option value="archived">Lưu trữ</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 text-sm"
          >
            <option value="all">Tất cả loại</option>
            <option value="percent">Phần trăm (%)</option>
            <option value="fixed">Số tiền cố định</option>
          </select>
          <select
            value={scopeFilter}
            onChange={(e) => {
              setScopeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 text-sm"
          >
            <option value="all">Tất cả phạm vi</option>
            <option value="ALL">Toàn bộ SP</option>
            <option value="PRODUCTS">Sản phẩm cụ thể</option>
            <option value="CATEGORIES">Danh mục</option>
          </select>
          <select
            value={redeemableFilter}
            onChange={(e) => {
              setRedeemableFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="yes">Đổi điểm</option>
            <option value="no">Không đổi điểm</option>
          </select>
          <div className="flex items-center gap-2 text-sm text-mono-500">
            <span className="font-medium">{totalCount}</span>
            <span>coupon</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-mono-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="animate-spin h-8 w-8 text-mono-400"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-mono-500 text-sm">Đang tải...</span>
            </div>
          </div>
        ) : displayedDiscounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-mono-400">
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <p className="text-lg font-medium">Không có coupon nào</p>
            <p className="text-sm mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Thử thay đổi bộ lọc"
                : "Bắt đầu bằng cách thêm coupon mới"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-mono-50 border-b border-mono-200">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Mã Coupon
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Giảm giá
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Điều kiện
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Thời hạn
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Lượt dùng
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-mono-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mono-100">
                {displayedDiscounts.map((discount) => (
                  <tr
                    key={discount.id}
                    className="hover:bg-mono-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-mono-900">
                          {discount.code}
                        </span>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          {getPriorityBadge(discount.priority || "MEDIUM")}
                          {discount.isPublic ? (
                            <span className="text-[10px] text-mono-500">
                              Công khai
                            </span>
                          ) : (
                            <span className="text-[10px] text-mono-400">
                              Riêng tư
                            </span>
                          )}
                          {discount.isRedeemable && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                              🎁 {discount.pointCost || 0}đ
                            </span>
                          )}
                          {discount.scope && discount.scope !== "ALL" && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              {discount.scope === "PRODUCTS" && "📦 Sản phẩm"}
                              {discount.scope === "CATEGORIES" && "📁 Danh mục"}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p
                        className="text-sm text-mono-700 line-clamp-2 max-w-[200px]"
                        title={discount.description}
                      >
                        {discount.description}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-mono-900">
                          {discount.type === "percent"
                            ? `${discount.value}%`
                            : `${discount.value.toLocaleString("vi-VN")}đ`}
                        </span>
                        {discount.type === "percent" &&
                          (discount.maxDiscount ?? 0) > 0 && (
                            <span className="text-xs text-mono-500">
                              Tối đa{" "}
                              {(discount.maxDiscount ?? 0).toLocaleString(
                                "vi-VN"
                              )}
                              đ
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-mono-600">
                        {discount.minOrderValue > 0
                          ? `≥ ${discount.minOrderValue.toLocaleString(
                              "vi-VN"
                            )}đ`
                          : "Không"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-xs text-mono-600">
                        <div>{discount.startDate}</div>
                        <div className="text-mono-400">đến</div>
                        <div>{discount.endDate}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-mono-900">
                          {discount.currentUses}/{discount.maxUses || "∞"}
                        </span>
                        {discount.maxUses && (
                          <div className="w-16 h-1.5 bg-mono-200 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-mono-700 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (discount.currentUses / discount.maxUses) *
                                    100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(discount.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => openViewModal(discount)}
                          className="p-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        {canUpdate() && (
                          <button
                            onClick={() => openEditModal(discount)}
                            className="p-1.5 bg-mono-50 hover:bg-mono-100 text-mono-700 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        )}
                        {canToggleStatus() && (
                          <button
                            onClick={() => handleToggleStatus(discount)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              discount.status === "active"
                                ? "bg-mono-100 hover:bg-mono-200 text-mono-700"
                                : "bg-mono-50 hover:bg-mono-100 text-mono-600"
                            }`}
                            title={
                              discount.status === "active"
                                ? "Tạm ngừng"
                                : "Kích hoạt"
                            }
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={
                                  discount.status === "active"
                                    ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                    : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                }
                              />
                            </svg>
                          </button>
                        )}
                        {canDelete() && (
                          <button
                            onClick={() => handleDelete(discount)}
                            className="p-1.5 bg-mono-100 hover:bg-mono-200 text-mono-700 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                        {canToggleStatus() &&
                          discount.status !== "archived" && (
                            <button
                              onClick={() => handleArchive(discount)}
                              className="p-1.5 bg-mono-100 hover:bg-mono-200 text-mono-700 rounded-lg transition-colors"
                              title="Lưu trữ"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                />
                              </svg>
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination - Always show if totalCount > 0 */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-mono-600">
            Trang {currentPage} / {totalPages || 1} • Tổng: {totalCount} coupon
          </div>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? "bg-mono-300 text-mono-500 cursor-not-allowed"
                    : "bg-mono-200 text-mono-700 hover:bg-mono-300"
                }`}
              >
                Trước
              </button>

              {/* Page Numbers */}
              {(() => {
                const pages = [];
                const showPages = 5;
                let startPage = Math.max(
                  1,
                  currentPage - Math.floor(showPages / 2)
                );
                const endPage = Math.min(totalPages, startPage + showPages - 1);

                if (endPage - startPage < showPages - 1) {
                  startPage = Math.max(1, endPage - showPages + 1);
                }

                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-2 rounded-lg font-medium bg-mono-200 text-mono-700 hover:bg-mono-300 transition-all"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="px-2 text-mono-500">
                        ...
                      </span>
                    );
                  }
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-2 rounded-lg font-medium transition-all ${
                        i === currentPage
                          ? "bg-mono-black text-white"
                          : "bg-mono-200 text-mono-700 hover:bg-mono-300"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className="px-2 text-mono-500">
                        ...
                      </span>
                    );
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 rounded-lg font-medium bg-mono-200 text-mono-700 hover:bg-mono-300 transition-all"
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pages;
              })()}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? "bg-mono-300 text-mono-500 cursor-not-allowed"
                    : "bg-mono-200 text-mono-700 hover:bg-mono-300"
                }`}
              >
                Tiếp
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-mono-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-mono-900">
                {editDiscount ? "Chỉnh sửa Coupon" : "Thêm Coupon mới"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-mono-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-mono-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto max-h-[calc(90vh-140px)]"
            >
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-1.5">
                      Mã coupon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      placeholder="VD: SALE50"
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-1.5">
                      Loại giảm giá
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                    >
                      <option value="percent">Phần trăm (%)</option>
                      <option value="fixed">Số tiền cố định (đ)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1.5">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Mô tả ngắn gọn về coupon..."
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm resize-none"
                    rows={2}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-1.5">
                      Giá trị {form.type === "percent" ? "(%)" : "(đ)"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={form.value}
                      onChange={handleChange}
                      placeholder={
                        form.type === "percent" ? "VD: 10" : "VD: 50000"
                      }
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                      required
                      min={1}
                      max={form.type === "percent" ? 100 : undefined}
                    />
                  </div>
                  {form.type === "percent" && (
                    <div>
                      <label className="block text-sm font-medium text-mono-700 mb-1.5">
                        Giảm tối đa (đ)
                      </label>
                      <input
                        type="number"
                        name="maxDiscount"
                        value={form.maxDiscount}
                        onChange={handleChange}
                        placeholder="VD: 100000"
                        className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                        min={0}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1.5">
                    Đơn tối thiểu (đ)
                  </label>
                  <input
                    type="number"
                    name="minOrderValue"
                    value={form.minOrderValue}
                    onChange={handleChange}
                    placeholder="VD: 200000"
                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                    min={0}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-1.5">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-1.5">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-1.5">
                      Số lượt sử dụng tối đa
                    </label>
                    <input
                      type="number"
                      name="maxUses"
                      value={form.maxUses}
                      onChange={handleChange}
                      placeholder="VD: 100"
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-1.5">
                      Độ ưu tiên
                    </label>
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                    >
                      <option value="HIGH">Cao</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="LOW">Thấp</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={form.isPublic}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-mono-300 text-mono-900 focus:ring-mono-500"
                    />
                    <span className="text-sm text-mono-700">Công khai</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isRedeemable"
                      checked={form.isRedeemable}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-mono-300 text-mono-900 focus:ring-mono-500"
                    />
                    <span className="text-sm text-mono-700">Đổi bằng điểm</span>
                  </label>
                </div>
                {form.isRedeemable && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-mono-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-mono-700 mb-1.5">
                        Số điểm cần đổi
                      </label>
                      <input
                        type="number"
                        name="pointCost"
                        value={form.pointCost}
                        onChange={handleChange}
                        placeholder="VD: 500"
                        className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mono-700 mb-1.5">
                        Giới hạn đổi/người
                      </label>
                      <input
                        type="number"
                        name="maxRedeemPerUser"
                        value={form.maxRedeemPerUser}
                        onChange={handleChange}
                        placeholder="0 = không giới hạn"
                        className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                        min={0}
                      />
                    </div>
                  </div>
                )}

                {/* Advanced Settings Toggle */}
                <div className="border-t border-mono-200 pt-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm font-medium text-mono-700 hover:text-mono-900"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        showAdvanced ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    Cài đặt nâng cao
                  </button>
                </div>

                {showAdvanced && (
                  <div className="space-y-4 p-4 bg-mono-50 rounded-lg">
                    {/* Scope */}
                    <div>
                      <label className="block text-sm font-medium text-mono-700 mb-1.5">
                        Phạm vi áp dụng
                      </label>
                      <select
                        name="scope"
                        value={form.scope}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                      >
                        <option value="ALL">Tất cả sản phẩm</option>
                        <option value="PRODUCTS">Sản phẩm cụ thể</option>
                        <option value="CATEGORIES">Danh mục cụ thể</option>
                      </select>
                    </div>

                    {/* Applicable Products */}
                    {form.scope === "PRODUCTS" && (
                      <div>
                        <label className="block text-sm font-medium text-mono-700 mb-1.5">
                          Chọn sản phẩm áp dụng
                        </label>
                        <div className="border border-mono-300 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                          {products.map((p) => (
                            <label
                              key={p._id}
                              className="flex items-center gap-2 px-2 py-1.5 hover:bg-mono-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={form.applicableProducts.includes(
                                  p._id
                                )}
                                onChange={(e) => {
                                  setForm((prev) => ({
                                    ...prev,
                                    applicableProducts: e.target.checked
                                      ? [...prev.applicableProducts, p._id]
                                      : prev.applicableProducts.filter(
                                          (id) => id !== p._id
                                        ),
                                  }));
                                }}
                                className="w-4 h-4 rounded border-mono-300 text-mono-900 focus:ring-mono-500"
                              />
                              <span className="text-sm text-mono-700 truncate">
                                {p.name}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-mono-500 mt-1">
                          Đã chọn: {form.applicableProducts.length} sản phẩm
                        </p>
                      </div>
                    )}

                    {/* Applicable Categories */}
                    {form.scope === "CATEGORIES" && (
                      <div>
                        <label className="block text-sm font-medium text-mono-700 mb-1.5">
                          Chọn danh mục áp dụng
                        </label>
                        <div className="border border-mono-300 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                          {categories.map((c) => (
                            <label
                              key={c._id}
                              className="flex items-center gap-2 px-2 py-1.5 hover:bg-mono-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={form.applicableCategories.includes(
                                  c._id
                                )}
                                onChange={(e) => {
                                  setForm((prev) => ({
                                    ...prev,
                                    applicableCategories: e.target.checked
                                      ? [...prev.applicableCategories, c._id]
                                      : prev.applicableCategories.filter(
                                          (id) => id !== c._id
                                        ),
                                  }));
                                }}
                                className="w-4 h-4 rounded border-mono-300 text-mono-900 focus:ring-mono-500"
                              />
                              <span className="text-sm text-mono-700 truncate">
                                {c.name}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-mono-500 mt-1">
                          Đã chọn: {form.applicableCategories.length} danh mục
                        </p>
                      </div>
                    )}

                    {/* Conditions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-mono-700 mb-1.5">
                          SL sản phẩm tối thiểu
                        </label>
                        <input
                          type="number"
                          value={form.conditions.minQuantity || 0}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              conditions: {
                                ...prev.conditions,
                                minQuantity: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mono-700 mb-1.5">
                          Số lần dùng/người
                        </label>
                        <input
                          type="number"
                          value={form.conditions.maxUsagePerUser || 0}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              conditions: {
                                ...prev.conditions,
                                maxUsagePerUser: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-500 focus:border-transparent text-sm"
                          min={0}
                        />
                      </div>
                    </div>

                    {/* Required Tiers */}
                    {tiers.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-mono-700 mb-1.5">
                          Yêu cầu hạng thành viên
                        </label>
                        <div className="border border-mono-300 rounded-lg max-h-36 overflow-y-auto p-2 space-y-1">
                          {tiers.map((t) => (
                            <label
                              key={t._id}
                              className="flex items-center gap-2 px-2 py-1.5 hover:bg-mono-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={(
                                  form.conditions.requiredTiers || []
                                ).includes(t._id)}
                                onChange={(e) => {
                                  setForm((prev) => ({
                                    ...prev,
                                    conditions: {
                                      ...prev.conditions,
                                      requiredTiers: e.target.checked
                                        ? [
                                            ...(prev.conditions.requiredTiers ||
                                              []),
                                            t._id,
                                          ]
                                        : (
                                            prev.conditions.requiredTiers || []
                                          ).filter((id) => id !== t._id),
                                    },
                                  }));
                                }}
                                className="w-4 h-4 rounded border-mono-300 text-mono-900 focus:ring-mono-500"
                              />
                              <span className="text-sm text-mono-700">
                                {t.name}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-mono-500 mt-1">
                          Để trống = tất cả hạng đều dùng được
                        </p>
                      </div>
                    )}

                    {/* First Order Only */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.conditions.firstOrderOnly || false}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            conditions: {
                              ...prev.conditions,
                              firstOrderOnly: e.target.checked,
                            },
                          }))
                        }
                        className="w-4 h-4 rounded border-mono-300 text-mono-900 focus:ring-mono-500"
                      />
                      <span className="text-sm text-mono-700">
                        Chỉ áp dụng cho đơn hàng đầu tiên
                      </span>
                    </label>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-mono-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-mono-700 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-mono-900 hover:bg-mono-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  )}
                  {editDiscount ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {showViewModal && viewingDiscount && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-mono-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-mono-900">
                Chi tiết Coupon
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingDiscount(null);
                }}
                className="p-1.5 hover:bg-mono-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-mono-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6 space-y-4">
              {/* Basic Info */}
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xl text-mono-900">
                  {viewingDiscount.code}
                </span>
                {getStatusBadge(viewingDiscount.status)}
              </div>

              <p className="text-mono-700">{viewingDiscount.description}</p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-mono-50 rounded-lg p-3">
                  <p className="text-xs text-mono-500 mb-1">Loại giảm giá</p>
                  <p className="font-semibold text-mono-900">
                    {viewingDiscount.type === "percent"
                      ? `${viewingDiscount.value}%`
                      : `${viewingDiscount.value.toLocaleString("vi-VN")}đ`}
                  </p>
                  {viewingDiscount.type === "percent" &&
                    (viewingDiscount.maxDiscount ?? 0) > 0 && (
                      <p className="text-xs text-mono-500 mt-1">
                        Tối đa{" "}
                        {(viewingDiscount.maxDiscount ?? 0).toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </p>
                    )}
                </div>
                <div className="bg-mono-50 rounded-lg p-3">
                  <p className="text-xs text-mono-500 mb-1">Đơn tối thiểu</p>
                  <p className="font-semibold text-mono-900">
                    {viewingDiscount.minOrderValue > 0
                      ? `${viewingDiscount.minOrderValue.toLocaleString(
                          "vi-VN"
                        )}đ`
                      : "Không yêu cầu"}
                  </p>
                </div>
                <div className="bg-mono-50 rounded-lg p-3">
                  <p className="text-xs text-mono-500 mb-1">Thời hạn</p>
                  <p className="font-semibold text-mono-900 text-sm">
                    {viewingDiscount.startDate} → {viewingDiscount.endDate}
                  </p>
                </div>
                <div className="bg-mono-50 rounded-lg p-3">
                  <p className="text-xs text-mono-500 mb-1">Lượt sử dụng</p>
                  <p className="font-semibold text-mono-900">
                    {viewingDiscount.currentUses} /{" "}
                    {viewingDiscount.maxUses || "∞"}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {viewingDiscount.isPublic && (
                  <span className="px-2 py-1 bg-mono-200 text-mono-700 text-xs rounded-full">
                    Công khai
                  </span>
                )}
                {viewingDiscount.isRedeemable && (
                  <span className="px-2 py-1 bg-mono-200 text-mono-700 text-xs rounded-full">
                    Đổi điểm: {viewingDiscount.pointCost} điểm
                  </span>
                )}
                <span className="px-2 py-1 bg-mono-200 text-mono-700 text-xs rounded-full">
                  Ưu tiên: {viewingDiscount.priority || "MEDIUM"}
                </span>
              </div>

              {/* Advanced Info */}
              <div className="border-t border-mono-200 pt-4 space-y-3">
                <h4 className="font-semibold text-mono-900">
                  Cài đặt nâng cao
                </h4>

                {loadingView ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mono-900"></div>
                    <span className="ml-2 text-sm text-mono-500">
                      Đang tải chi tiết...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="bg-mono-50 rounded-lg p-3">
                      <p className="text-xs text-mono-500 mb-1">
                        Phạm vi áp dụng
                      </p>
                      <p className="font-semibold text-mono-900">
                        {viewingDiscount.scope === "ALL" && "Tất cả sản phẩm"}
                        {viewingDiscount.scope === "PRODUCTS" &&
                          "Sản phẩm cụ thể"}
                        {viewingDiscount.scope === "CATEGORIES" &&
                          "Danh mục cụ thể"}
                      </p>
                      {viewingDiscount.scope === "PRODUCTS" &&
                        (viewingDiscount.applicableProducts?.length ?? 0) >
                          0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-mono-500">
                              Sản phẩm áp dụng (
                              {viewingDiscount.applicableProducts?.length}):
                            </p>
                            <div className="max-h-32 overflow-y-auto">
                              {(viewingDiscount.applicableProducts || []).map(
                                (p, idx) => (
                                  <span
                                    key={idx}
                                    className="block text-sm text-mono-700 py-0.5"
                                  >
                                    • {getItemDisplayName(p, products)}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      {viewingDiscount.scope === "CATEGORIES" &&
                        (viewingDiscount.applicableCategories?.length ?? 0) >
                          0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-mono-500">
                              Danh mục áp dụng (
                              {viewingDiscount.applicableCategories?.length}):
                            </p>
                            <div className="max-h-32 overflow-y-auto">
                              {(viewingDiscount.applicableCategories || []).map(
                                (c, idx) => (
                                  <span
                                    key={idx}
                                    className="block text-sm text-mono-700 py-0.5"
                                  >
                                    • {getItemDisplayName(c, categories)}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>

                    {viewingDiscount.conditions && (
                      <div className="bg-mono-50 rounded-lg p-3">
                        <p className="text-xs text-mono-500 mb-2">Điều kiện</p>
                        <div className="space-y-1 text-sm">
                          {(viewingDiscount.conditions.minQuantity ?? 0) >
                            0 && (
                            <p className="text-mono-700">
                              • SL sản phẩm tối thiểu:{" "}
                              {viewingDiscount.conditions.minQuantity}
                            </p>
                          )}
                          {(viewingDiscount.conditions.maxUsagePerUser ?? 0) >
                            0 && (
                            <p className="text-mono-700">
                              • Số lần dùng/người:{" "}
                              {viewingDiscount.conditions.maxUsagePerUser}
                            </p>
                          )}
                          {viewingDiscount.conditions.firstOrderOnly && (
                            <p className="text-mono-700">
                              • Chỉ áp dụng đơn hàng đầu tiên
                            </p>
                          )}
                          {(viewingDiscount.conditions.requiredTiers?.length ??
                            0) > 0 && (
                            <p className="text-mono-700">
                              • Yêu cầu hạng:{" "}
                              {viewingDiscount.conditions.requiredTiers
                                ?.map((t) => getItemDisplayName(t, tiers))
                                .join(", ")}
                            </p>
                          )}
                          {!(viewingDiscount.conditions.minQuantity ?? 0) &&
                            !(
                              viewingDiscount.conditions.maxUsagePerUser ?? 0
                            ) &&
                            !viewingDiscount.conditions.firstOrderOnly &&
                            !(
                              viewingDiscount.conditions.requiredTiers
                                ?.length ?? 0
                            ) && (
                              <p className="text-mono-500">
                                Không có điều kiện đặc biệt
                              </p>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Users collected */}
                    {(viewingDiscount.users?.length ?? 0) > 0 && (
                      <div className="bg-mono-50 rounded-lg p-3">
                        <p className="text-xs text-mono-500 mb-1">
                          Số người đã thu thập
                        </p>
                        <p className="font-semibold text-mono-900">
                          {viewingDiscount.users?.length} người
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingDiscount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center text-mono-900 mb-2">
                Xác nhận xóa coupon
              </h3>
              <p className="text-center text-mono-600 mb-6">
                Bạn có chắc chắn muốn xóa coupon
                <span className="font-semibold text-mono-900">
                  {" "}
                  "{deletingDiscount.code || deletingDiscount.description}"
                </span>
                ? Hành động này có thể được khôi phục sau.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingDiscount(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-mono-100 hover:bg-mono-200 text-mono-700 font-medium rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDeleteCoupon}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && archivingDiscount && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-mono-200">
              <h3 className="text-lg font-bold text-mono-900">
                Xác nhận lưu trữ Coupon
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-mono font-bold text-lg text-mono-900">
                    {archivingDiscount.code}
                  </p>
                  <p className="text-sm text-mono-600">
                    {archivingDiscount.description}
                  </p>
                </div>
              </div>
              <p className="text-mono-700 mb-2">
                Bạn có chắc chắn muốn lưu trữ coupon này?
              </p>
              <p className="text-sm text-mono-500">
                • Coupon sẽ không còn hoạt động và không thể được sử dụng
                <br />• Bạn có thể xem lại trong danh sách với trạng thái "Lưu
                trữ"
              </p>
            </div>
            <div className="px-6 py-4 border-t border-mono-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowArchiveModal(false);
                  setArchivingDiscount(null);
                }}
                className="px-4 py-2 text-sm font-medium text-mono-700 bg-mono-100 hover:bg-mono-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmArchive}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
              >
                Xác nhận lưu trữ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountPage;
