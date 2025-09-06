import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ProductCard from "../../../components/ProductCard/ProductCard";
import {
  Product,
  productPublicService,
  convertToProductCardProduct,
} from "../../../services/ProductServiceV2";
import { publicCouponService } from "../../../services/CouponServiceV2";
import { Coupon } from "../../../types/coupon";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const bannerImages = [
    {
      url: "https://res.cloudinary.com/dlettieyo/image/upload/v1748965117/uppnq8h5ztvk6spbdvl7.jpg",
    },
    {
      url: "https://res.cloudinary.com/dlettieyo/image/upload/v1748965117/ipfybtskefkig8miiy2n.jpg",
    },
    {
      url: "https://res.cloudinary.com/dlettieyo/image/upload/v1748966099/axvwuull9ul3ohkwslm6.jpg",
    },
  ];

  const nextBanner = () => {
    setCurrentBannerIndex((prevIndex) =>
      prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prevIndex) =>
      prevIndex === 0 ? bannerImages.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    // Auto rotate banner mỗi 5 giây
    const interval = setInterval(() => {
      nextBanner();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
        ] = await Promise.all([
          productPublicService.getFeaturedProducts({ limit: 8 }),
          productPublicService.getBestSellers({ limit: 8 }),
          productPublicService.getNewArrivals({ limit: 8 }),
          productPublicService.getProducts({ limit: 8 }),
          // Lấy 5 mã giảm giá để hiển thị trên trang chủ
          publicCouponService.getPublicCoupons({ limit: 5, status: "active" }),
        ]);

        // Kiểm tra và xử lý dữ liệu trả về từ API
        if (featuredRes.data.success) {
          // API có thể trả về dữ liệu trong data, products hoặc trường khác
          const products =
            featuredRes.data.data || featuredRes.data.products || [];
          console.log("Featured products:", products);
          setFeaturedProducts(products);
        }

        if (bestSellersRes.data.success) {
          const products =
            bestSellersRes.data.data || bestSellersRes.data.products || [];
          console.log("Best sellers:", products);
          setBestSellers(products);
        }

        if (newArrivalsRes.data.success) {
          const products =
            newArrivalsRes.data.data || newArrivalsRes.data.products || [];
          console.log("New arrivals:", products);
          setNewArrivals(products);
        }

        if (allProductsRes.data.success) {
          const products =
            allProductsRes.data.data || allProductsRes.data.products || [];
          console.log("All products:", products);
          setAllProducts(products);
        }

        // Xử lý dữ liệu coupon - sửa để khớp với cấu trúc response
        if (couponsRes.data.success) {
          // Dữ liệu coupons nằm ở level root của response, không phải trong data
          const coupons = couponsRes.data.coupons || [];
          console.log("Public coupons:", coupons);
          setPublicCoupons(coupons);
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
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
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
              className="h-16 w-16 text-red-500 mx-auto mb-4"
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
            <p className="text-xl font-semibold text-gray-800">
              Không thể tải dữ liệu
            </p>
            <p className="text-gray-600 mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
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
          {products.map((product) => (
            <div key={product._id} className="px-2">
              <ProductCard
                product={convertToProductCardProduct(product)}
                onClick={() => {
                  navigate(`/product/${product.slug || product._id}`);
                  window.scrollTo(0, 0); // Add this line to scroll to top
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </>
  );

  // Coupon Card Component - Thiết kế với height đồng đều và màu copy nhạt
  const CouponCard = ({ coupon }: { coupon: Coupon }) => (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-gray-800 hover:shadow-md transition-all duration-300 relative overflow-hidden min-w-0 h-full flex flex-col">
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-4 h-4 bg-gray-800 transform rotate-45 translate-x-2 -translate-y-2"></div>

      <div className="relative flex flex-col h-full">
        {/* Header với icon và type */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            {coupon.type === "percent" ? (
              <FiPercent className="text-gray-800 w-3 h-3" />
            ) : (
              <FiDollarSign className="text-gray-800 w-3 h-3" />
            )}
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {coupon.type === "percent" ? "Giảm %" : "Giảm tiền"}
            </span>
          </div>
          <FiTag className="text-gray-400 w-3 h-3" />
        </div>

        {/* Giá trị giảm giá */}
        <div className="mb-2">
          <div className="text-lg font-bold text-gray-900 mb-1">
            {coupon.type === "percent"
              ? `${coupon.value}%`
              : formatCurrency(coupon.value)}
          </div>
          {coupon.maxDiscount && coupon.type === "percent" && (
            <div className="text-xs text-gray-600">
              Tối đa {formatCurrency(coupon.maxDiscount)}
            </div>
          )}
        </div>

        {/* Mô tả */}
        <div className="mb-3 flex-grow">
          <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
            {coupon.description}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Đơn tối thiểu {formatCurrency(coupon.minOrderValue)}
          </p>
        </div>

        {/* Footer với ngày hết hạn */}
        <div className="mb-2">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <FiCalendar size={10} />
            <span>HSD: {formatDate(coupon.endDate)}</span>
          </div>
        </div>

        {/* Copy button - với màu nhạt hơn */}
        <button
          onClick={() => copyCouponCode(coupon.code)}
          className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors mt-auto"
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
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="relative">
            <div className="overflow-hidden h-[400px] rounded-lg">
              <img
                src={bannerImages[currentBannerIndex].url}
                alt={`Banner ${currentBannerIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 ease-out"
              />
            </div>

            {/* Nút điều hướng trái */}
            <button
              onClick={prevBanner}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300"
            >
              <BsArrowLeft size={24} />
            </button>

            {/* Nút điều hướng phải */}
            <button
              onClick={nextBanner}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300"
            >
              <BsArrowRight size={24} />
            </button>

            {/* Chỉ báo (dots) */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentBannerIndex === index ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={() => setCurrentBannerIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mã giảm giá - Layout ngang với height đồng đều */}
      {publicCoupons && publicCoupons.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Mã giảm giá hấp dẫn
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto text-sm">
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
                className="inline-flex items-center px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors font-medium text-sm"
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
      <section className="py-16 bg-gray-50">
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
          title="Sản phẩm bán chạy"
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
      <section className="bg-gray-50 py-16">
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

      {/* Footer */}
      <footer className="bg-gray-800 text-white pt-14 pb-8">
        <div className="container mx-auto px-4">
          {/* Footer Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Column 1: About */}
            <div>
              <h3 className="text-xl font-bold mb-4">ShoeShop</h3>
              <p className="text-gray-300 mb-4">
                Cửa hàng giày chính hãng với nhiều mẫu mã đa dạng, phù hợp với
                mọi nhu cầu và phong cách.
              </p>
              <div className="flex space-x-4 mt-4">
                <a
                  href="#"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Categories */}
            <div>
              <h3 className="text-xl font-bold mb-4">Danh mục sản phẩm</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="products?gender=male"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Giày Nam
                  </Link>
                </li>
                <li>
                  <Link
                    to="products?gender=female"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Giày Nữ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Customer Service */}
            <div>
              <h3 className="text-xl font-bold mb-4">Dịch vụ khách hàng</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/returns"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Chính sách đổi trả
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shipping"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Thông tin vận chuyển
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Câu hỏi thường gặp
                  </Link>
                </li>
                <li>
                  <Link
                    to="/size-guide"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Hướng dẫn chọn size
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <h3 className="text-xl font-bold mb-4">Đăng ký nhận tin</h3>
              <p className="text-gray-300 mb-4">
                Đăng ký để nhận thông tin về sản phẩm mới và khuyến mãi đặc biệt
              </p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="px-4 py-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-md font-medium"
                >
                  Đăng ký
                </button>
              </form>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t border-gray-700 pt-8 pb-6">
            <p className="text-sm font-medium mb-4 text-center">
              Chấp nhận thanh toán
            </p>
            <div className="flex justify-center items-center">
              <img
                src="/image/vnpay.jpg"
                alt="VNPay"
                className="h-12 md:h-14 rounded-md bg-white object-contain p-2 shadow-sm hover:shadow-md transition-shadow"
              />
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 pt-6 mt-2 text-center">
            <p className="text-sm">
              © {new Date().getFullYear()} ShoeShop. Tất cả các quyền được bảo
              lưu.
            </p>
            <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-400">
              <Link
                to="/privacy-policy"
                className="hover:text-white transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link
                to="/sitemap"
                className="hover:text-white transition-colors"
              >
                Sơ đồ trang
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
