import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ProductCard from "../../../components/ProductCard/ProductCard";
import RecentlyViewed from "../../../components/ViewHistory/RecentlyViewed";
import {
  productPublicService,
  convertToProductCardProduct,
} from "../../../services/ProductService";
import { Product } from "../../../types/product";
import { publicCouponService } from "../../../services/CouponService";
import { Coupon } from "../../../types/coupon";
import { bannerPublicService } from "../../../services/BannerService";
import type { Banner } from "../../../types/banner";
import { toast } from "react-hot-toast";
import {
  FiChevronRight,
  FiTag,
  FiPercent,
  FiDollarSign,
  FiCopy,
  FiCalendar,
} from "react-icons/fi";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [publicCoupons, setPublicCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const nextBanner = useCallback(() => {
    setCurrentBannerIndex((prevIndex) =>
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  }, [banners.length]);

  const prevBanner = useCallback(() => {
    setCurrentBannerIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  }, [banners.length]);

  useEffect(() => {
    // Auto rotate banner mới 5 giây - chờ khi có banners
    if (banners.length > 1) {
      const interval = setInterval(() => {
        nextBanner();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [banners, nextBanner]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch song song để tăng performance
        const [
          featuredRes,
          bestSellersRes,
          newArrivalsRes,
          allProductsRes,
          couponsRes,
          bannersRes,
        ] = await Promise.all([
          productPublicService.getFeaturedProducts({ limit: 8 }),
          productPublicService.getBestSellers({ limit: 8 }),
          productPublicService.getNewArrivals({ limit: 8 }),
          productPublicService.getProducts({ limit: 8 }),
          // Lấy 5 mã giảm giá để hiển thị trên trang chủ
          publicCouponService.getPublicCoupons({ limit: 5, status: "active" }),
          // Lấy banner hiển thị
          bannerPublicService.getPublicBanners(),
        ]);

        // Kiểm tra và xử lý dữ liệu trả về từ API
        if (featuredRes.data.success) {
          // API có thể trả về dữ liệu trong data, products hoặc trường khác
          const products =
            featuredRes.data.data || featuredRes.data.products || [];
          console.log("Featured products:", products);
          const flattenedProducts = Array.isArray(products)
            ? products.flat().filter((p: Product) => p && p._id)
            : [];
          setFeaturedProducts(flattenedProducts);
        }

        if (bestSellersRes.data.success) {
          const products =
            bestSellersRes.data.data || bestSellersRes.data.products || [];
          console.log("Best sellers:", products);
          const flattenedProducts = Array.isArray(products)
            ? products.flat().filter((p: Product) => p && p._id)
            : [];
          setBestSellers(flattenedProducts);
        }

        if (newArrivalsRes.data.success) {
          const products =
            newArrivalsRes.data.data || newArrivalsRes.data.products || [];
          console.log("New arrivals:", products);
          const flattenedProducts = Array.isArray(products)
            ? products.flat().filter((p: Product) => p && p._id)
            : [];
          setNewArrivals(flattenedProducts);
        }

        if (allProductsRes.data.success) {
          const products =
            allProductsRes.data.data || allProductsRes.data.products || [];
          console.log("All products:", products);
          const flattenedProducts = Array.isArray(products)
            ? products.flat().filter((p: Product) => p && p._id)
            : [];
          setAllProducts(flattenedProducts);
        }

        // Xử lý dữ liệu coupon - sửa để khớp với cấu trúc response
        if (couponsRes.data.success) {
          // Dữ liệu coupons nằm ở level root của response, không phải trong data
          const coupons = couponsRes.data.coupons || [];
          console.log("Public coupons:", coupons);
          setPublicCoupons(coupons);
        }

        // Xử lý dữ liệu banners
        if (bannersRes.data.success) {
          // API trả về banners trong trường banners, không phải data
          const response = bannersRes.data as {
            success: boolean;
            banners?: Banner[];
            data?: Banner[];
          };
          const bannerData = response.banners || response.data || [];
          console.log("Banners response:", bannersRes.data);
          console.log("Banner data:", bannerData);
          setBanners(bannerData);
        }
      } catch (error) {
        console.error("Error fetching landing page data:", error);
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
        toast.error("Không thể tải dữ liệu sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Copy coupon code to clipboard
  const copyCouponCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Đã sao chép mã: ${code}`);
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
  const handleBannerClick = (banner: Banner) => {
    if (banner.link) {
      // Ki?m tra n?u link b?t đầu với http ho?c https thì m? tab mới
      if (
        banner.link.startsWith("http://") ||
        banner.link.startsWith("https://")
      ) {
        window.open(banner.link, "_blank");
      } else {
        // N?u là internal link, sử dụng navigate
        navigate(banner.link);
      }
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "d";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mono-800 mx-auto"></div>
            <p className="mt-4 text-mono-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-mono-800 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xl font-semibold text-mono-800">
              Không thể tải dữ liệu
            </p>
            <p className="text-mono-600 mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-mono-black text-white rounded-lg hover:bg-mono-800 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Component Section Title
  const SectionTitle = ({
    title,
    linkTo,
    linkText,
  }: {
    title: string;
    linkTo: string;
    linkText: string;
  }) => (
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-bold">{title}</h2>
      <Link
        to={linkTo}
        className="px-4 py-2 bg-mono-800 text-white rounded-lg hover:bg-mono-900 transition-colors flex items-center"
      >
        <span>{linkText}</span>
        <FiChevronRight className="ml-1" />
      </Link>
    </div>
  );

  // Product Grid Component
  const ProductGrid = ({
    products,
    emptyMessage,
  }: {
    products: Product[];
    emptyMessage: string;
  }) => (
    <>
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products
            .filter((product) => {
              // Filter out invalid products
              if (!product || !product._id) {
                console.warn("Skipping invalid product:", product);
                return false;
              }
              return true;
            })
            .map((product) => {
              const cardProduct = convertToProductCardProduct(product);
              // Double-check converted product is valid
              if (!cardProduct || !cardProduct._id) {
                console.warn(
                  "Skipping product with invalid conversion:",
                  product
                );
                return null;
              }
              return (
                <div key={product._id} className="px-2">
                  <ProductCard
                    product={cardProduct}
                    onClick={() => {
                      navigate(`/product/${product.slug || product._id}`);
                      window.scrollTo(0, 0);
                    }}
                  />
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center py-10 bg-mono-50 rounded-lg">
          <p className="text-mono-500">{emptyMessage}</p>
        </div>
      )}
    </>
  );

  // Coupon Card Component - Thiết kế với height đồng đều và màu copy nhạt
  const CouponCard = ({ coupon }: { coupon: Coupon }) => (
    <div className="bg-white border-2 border-mono-200 rounded-lg p-3 hover:border-mono-800 hover:shadow-md transition-all duration-300 relative overflow-hidden min-w-0 h-full flex flex-col">
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-4 h-4 bg-mono-800 transform rotate-45 translate-x-2 -translate-y-2"></div>

      <div className="relative flex flex-col h-full">
        {/* Header với icon và type */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            {coupon.type === "percent" ? (
              <FiPercent className="text-mono-800 w-3 h-3" />
            ) : (
              <FiDollarSign className="text-mono-800 w-3 h-3" />
            )}
            <span className="text-xs font-medium text-mono-600 uppercase tracking-wide">
              {coupon.type === "percent" ? "Giảm %" : "Giảm tiền"}
            </span>
          </div>
          <FiTag className="text-mono-400 w-3 h-3" />
        </div>

        {/* Giá trị giảm giá */}
        <div className="mb-2">
          <div className="text-lg font-bold text-mono-900 mb-1">
            {coupon.type === "percent"
              ? `${coupon.value}%`
              : formatCurrency(coupon.value)}
          </div>
          {coupon.maxDiscount && coupon.type === "percent" && (
            <div className="text-xs text-mono-600">
              Tại đã {formatCurrency(coupon.maxDiscount)}
            </div>
          )}
        </div>

        {/* Mô tả */}
        <div className="mb-3 flex-grow">
          <p className="text-xs text-mono-700 line-clamp-2 leading-relaxed">
            {coupon.description}
          </p>
          <p className="text-xs text-mono-500 mt-1">
            Đơn tối thiểu {formatCurrency(coupon.minOrderValue)}
          </p>
        </div>

        {/* Footer với ngày hết hạn */}
        <div className="mb-2">
          <div className="flex items-center space-x-1 text-xs text-mono-500">
            <FiCalendar size={10} />
            <span>HSD: {formatDate(coupon.endDate)}</span>
          </div>
        </div>

        {/* Copy button - với màu nhạt hơn */}
        <button
          onClick={() => copyCouponCode(coupon.code)}
          className="w-full flex items-center justify-center space-x-2 bg-mono-600 hover:bg-mono-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors mt-auto"
        >
          <span className="font-mono">{coupon.code}</span>
          <FiCopy size={10} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Section */}
      {banners.length > 0 && (
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="relative">
              {/* Banner container với chiều cao lớn hơn */}
              <div className="overflow-hidden h-[600px] md:h-[700px] lg:h-[800px] w-full rounded-xl shadow-lg">
                <div
                  className="relative w-full h-full cursor-pointer group"
                  onClick={() => handleBannerClick(banners[currentBannerIndex])}
                >
                  <img
                    src={
                      banners[currentBannerIndex]?.image?.url ||
                      "/image/default-banner.jpg"
                    }
                    alt={
                      banners[currentBannerIndex]?.title ||
                      `Banner ${currentBannerIndex + 1}`
                    }
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out transform group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Nút điều hướng trái - với hiệu ứng mờ */}
              {banners.length > 1 && (
                <button
                  onClick={prevBanner}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-4 rounded-full transition-all duration-300 backdrop-blur-sm opacity-70 hover:opacity-100 group"
                >
                  <BsArrowLeft
                    size={28}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>
              )}

              {/* Nút điều hướng phải - với hiệu ứng mờ */}
              {banners.length > 1 && (
                <button
                  onClick={nextBanner}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-4 rounded-full transition-all duration-300 backdrop-blur-sm opacity-70 hover:opacity-100 group"
                >
                  <BsArrowRight
                    size={28}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>
              )}

              {/* Chỉ báo (dots) - cải thiện design */}
              {banners.length > 1 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${
                        currentBannerIndex === index
                          ? "bg-white border-white scale-125"
                          : "bg-transparent border-white/60 hover:border-white hover:scale-110"
                      }`}
                      onClick={() => setCurrentBannerIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Mã giảm giá - Layout ngang với height đồng đều */}
      {publicCoupons && publicCoupons.length > 0 && (
        <section className="py-12 bg-mono-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-mono-900 mb-2">
                Mã giảm giá hấp dẫn
              </h2>
              <p className="text-mono-600 max-w-xl mx-auto text-sm">
                Sử dụng các mã giảm giá dưới đây để nhận ưu đãi tốt nhất cho đơn
                hàng của bạn
              </p>
            </div>

            {/* Grid ngang cho 5 mã giảm giá với height đồng đều */}
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-stretch">
                {publicCoupons.map((coupon) => (
                  <CouponCard key={coupon._id} coupon={coupon} />
                ))}
              </div>
            </div>

            <div className="text-center mt-8">
              <Link
                to="/coupons"
                className="inline-flex items-center px-6 py-2.5 bg-mono-800 text-white rounded-lg hover:bg-black transition-colors font-medium text-sm"
              >
                <span>Xem tất cả mã giảm giá</span>
                <FiChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Tất cả sản phẩm */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Tất cả sản phẩm"
            linkTo="/products"
            linkText="Xem tất cả"
          />
          <ProductGrid
            products={allProducts}
            emptyMessage="Không có sản phẩm nào"
          />
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="py-16 bg-mono-50">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Sản phẩm nổi bật"
            linkTo="/products?sort=rating"
            linkText="Xem tất cả"
          />
          <ProductGrid
            products={featuredProducts}
            emptyMessage="Không có sản phẩm nổi bật nào"
          />
        </div>
      </section>

      {/* Sản phẩm bán chạy */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <SectionTitle
          title="Sản phẩm bán chủy"
          linkTo="/products?sort=popular"
          linkText="Xem tất cả"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {bestSellers.map((product) => (
            <ProductCard
              key={product._id}
              product={convertToProductCardProduct(product)}
              onClick={() => {
                navigate(`/product/${product.slug || product._id}`);
                window.scrollTo(0, 0); // Add this line to scroll to top
              }}
            />
          ))}
        </div>
      </section>

      {/* Sản phẩm mới nhất */}
      <section className="bg-mono-50 py-16">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Sản phẩm mới nhất"
            linkTo="/products?sort=newest"
            linkText="Xem tất cả"
          />
          <ProductGrid
            products={newArrivals}
            emptyMessage="Không có sản phẩm mới nào"
          />
        </div>
      </section>

      {/* Sản phẩm dã xem gẩn dây */}
      <RecentlyViewed limit={8} title="Sản phẩm dã xem gẩn dây" />
    </div>
  );
};

export default LandingPage;
