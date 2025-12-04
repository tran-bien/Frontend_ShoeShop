import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { publicCouponService } from "../../../services/CouponService";
import { Coupon } from "../../../types/coupon";
import { toast } from "react-hot-toast";
import {
  FiPercent,
  FiDollarSign,
  FiTag,
  FiCopy,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiLoader,
  FiShoppingCart, // Added missing import
} from "react-icons/fi";

const CouponsPage: React.FC = () => {
  const navigate = useNavigate(); // We'll use this for returning to home page
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<"all" | "percent" | "fixed">(
    "all"
  );
  const limit = 12; // Số lượng coupon mới trang

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, filterType]);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);

    try {
      // Chuẩn bỏ params cho API call
      const params = {
        page: currentPage,
        limit,
        status: "active" as "active", // Fixed type by explicitly casting to the expected enum value
        ...(filterType !== "all" && { type: filterType }),
      };

      const response = await publicCouponService.getPublicCoupons(params);

      if (response.data.success) {
        setCoupons(response.data.coupons || []);

        // Cập nhật thông tin phân trang
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
        }
      } else {
        setError("Không thể tại danh sách mã giảm giá");
        toast.error("Không thể tại danh sách mã giảm giá");
      }
    } catch (error: any) {
      console.error("Error fetching coupons:", error);
      setError("Có lỗi x?y ra khi tại dữ liệu mã giảm giá");
      toast.error("Không thể tại danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  // Copy coupon code to clipboard
  const copyCouponCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Ðã sao chép mã: ${code}`);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Không thể sao chép mã giảm giá");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "d";
  };

  // Lọc coupon theo searchTerm
  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Component hiện thọ mã giảm giá
  const CouponCard = ({ coupon }: { coupon: Coupon }) => (
    <div className="bg-white border-2 border-mono-200 rounded-lg p-4 hover:border-mono-800 hover:shadow-md transition-all duration-300 relative overflow-hidden">
      {/* Badge góc trên bên ph?i */}
      <div className="absolute top-0 right-0 bg-mono-800 text-white text-xs px-2 py-1">
        {coupon.type === "percent" ? "GI?M %" : "GI?M TI?N"}
      </div>

      <div className="flex flex-col h-full">
        {/* Giá trở giảm giá */}
        <div className="mb-3">
          <div className="text-2xl font-bold text-mono-900 flex items-center">
            {coupon.type === "percent" ? (
              <>
                <FiPercent className="mr-1 text-mono-black" />
                <span>{coupon.value}%</span>
              </>
            ) : (
              <>
                <FiDollarSign className="mr-1 text-mono-800" />
                <span>{formatCurrency(coupon.value)}</span>
              </>
            )}
          </div>
          {coupon.maxDiscount && coupon.type === "percent" && (
            <div className="text-sm text-mono-600 mt-1">
              Tại đã {formatCurrency(coupon.maxDiscount)}
            </div>
          )}
        </div>

        {/* Mô từ */}
        <div className="mb-3 flex-grow">
          <p className="text-sm text-mono-700 line-clamp-2 leading-relaxed">
            {coupon.description}
          </p>
          <p className="text-xs text-mono-500 mt-2 flex items-center">
            <FiTag className="mr-1" />
            Ðon tại thi?u {formatCurrency(coupon.minOrderValue)}
          </p>
        </div>

        {/* Ngày h?t hơn */}
        <div className="mt-auto">
          <div className="flex items-center space-x-1 text-sm text-mono-600 mb-3">
            <FiCalendar size={14} />
            <span>HSD: {formatDate(coupon.endDate)}</span>
          </div>

          {/* Copy button */}
          <button
            onClick={() => copyCouponCode(coupon.code)}
            className="w-full flex items-center justify-center space-x-2 bg-mono-black hover:bg-mono-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <span className="font-mono">{coupon.code}</span>
            <FiCopy size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mono-50 py-10">
      <div className="container mx-auto px-4">
        {/* Tiêu d? trang và nút quay v? trang chờ */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-mono-900 mb-3">Mã giảm giá</h1>
          <p className="text-mono-600 max-w-2xl mx-auto">
            Khám phá các mã giảm giá hợp đến và áp dụng cho don hàng của bẩn d?
            nhơn uu dãi t?t nh?t
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-mono-black hover:text-mono-800 flex items-center mx-auto"
          >
            <span>&larr; Quay v? trang chỉ</span>
          </button>
        </div>

        {/* Bỏ lọc và tìm kiếm */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Thanh tìm kiếm */}
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Tìm mã giảm giá..."
                className="pl-10 pr-4 py-2 border border-mono-300 rounded-lg w-full focus:ring-2 focus:ring-mono-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mono-400" />
            </div>

            {/* Bỏ lọc */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <FiFilter className="text-mono-600" />
              <span className="text-mono-600">Lo?i:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filterType === "all"
                      ? "bg-mono-800 text-white"
                      : "bg-mono-100 text-mono-600 hover:bg-mono-200"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterType("percent")}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filterType === "percent"
                      ? "bg-mono-black text-white"
                      : "bg-mono-100 text-mono-600 hover:bg-mono-200"
                  }`}
                >
                  Giảm %
                </button>
                <button
                  onClick={() => setFilterType("fixed")}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filterType === "fixed"
                      ? "bg-mono-800 text-white"
                      : "bg-mono-100 text-mono-600 hover:bg-mono-200"
                  }`}
                >
                  Giảm tiền
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách mã giảm giá */}
        {loading ? (
          <div className="flex items-center justify-center h-60">
            <FiLoader className="animate-spin text-3xl text-mono-black" />
            <span className="ml-2 text-lg">Ðang tại mã giảm giá...</span>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <div className="text-mono-900 text-lg mb-2">{error}</div>
            <button
              onClick={fetchCoupons}
              className="px-4 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 transition-colors"
            >
              Thọ lỗi
            </button>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-10 bg-mono-100 rounded-lg">
            <FiTag className="mx-auto text-5xl text-mono-400 mb-3" />
            <p className="text-mono-600 text-lg">
              {searchTerm
                ? "Không tìm thủy mã giảm giá phù hợp"
                : "Hiện không có mã giảm giá nào"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCoupons.map((coupon) => (
                <CouponCard key={coupon._id} coupon={coupon} />
              ))}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-md border border-mono-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-mono-100"
                  >
                    Trước
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-md ${
                          currentPage === page
                            ? "bg-mono-black text-white"
                            : "border border-mono-300 hover:bg-mono-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-md border border-mono-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-mono-100"
                  >
                    Tiếp
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Huẩng đến sử dụng - Simplify this section */}
        <div className="mt-16 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-mono-900 mb-4">
            Huẩng đến sử dụng mã giảm giá
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-4">
              <div className="bg-mono-100 text-mono-black p-3 rounded-full">
                <FiCopy className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-mono-900 mb-2">
                  Sao chép mã
                </h3>
                <p className="text-sm text-mono-600">
                  Nhơn vào nút du?i mới mã giảm giá d? sao chép mã vào bỏ nh?
                  tạm
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-mono-100 text-mono-black p-3 rounded-full">
                <FiShoppingCart className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-mono-900 mb-2">
                  Thêm sản phẩm vào giỏ
                </h3>
                <p className="text-sm text-mono-600">
                  Thêm sản phẩm bẩn muẩn mua vào giỏ hàng với giá trở don tại
                  thi?u
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-mono-100 text-mono-black p-3 rounded-full">
                <FiTag className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-mono-900 mb-2">Áp dụng mã</h3>
                <p className="text-sm text-mono-600">
                  Dán mã giảm giá vào ô nhập mã trong trang giỏ hàng và b?m áp
                  đếng
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponsPage;


