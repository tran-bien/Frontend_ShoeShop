import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ProductCard from "../../../components/ProductCard/ProductCard";
import {
  productPublicService,
  convertToProductCardProduct,
} from "../../../services/ProductService";
import { Product } from "../../../types/product";
import { bannerPublicService } from "../../../services/BannerService";
import type { Banner } from "../../../types/banner";
import { userRecommendationService } from "../../../services/RecommendationService";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-hot-toast";
import { FiChevronRight } from "react-icons/fi";
import { BsArrowLeft, BsArrowRight, BsStars } from "react-icons/bs";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
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
        const [featuredRes, bestSellersRes, newArrivalsRes, bannersRes] =
          await Promise.all([
            productPublicService.getFeaturedProducts({ limit: 8 }),
            productPublicService.getBestSellers({ limit: 8 }),
            productPublicService.getNewArrivals({ limit: 8 }),
            // Lấy banner hiển thị
            bannerPublicService.getPublicBanners(),
          ]);

        // Kiểm tra và xử lý dữ liệu trả về từ API
        if (featuredRes.data.success) {
          // API có thể trả về dữ liệu trong data, products hoặc trường khác
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const resData = featuredRes.data as any;
          const products = resData.data || resData.products || [];
          const flattenedProducts = Array.isArray(products)
            ? products.flat().filter((p: Product) => p && p._id)
            : [];
          setFeaturedProducts(flattenedProducts);
        }

        if (bestSellersRes.data.success) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const resData = bestSellersRes.data as any;
          const products = resData.data || resData.products || [];
          const flattenedProducts = Array.isArray(products)
            ? products.flat().filter((p: Product) => p && p._id)
            : [];
          setBestSellers(flattenedProducts);
        }

        if (newArrivalsRes.data.success) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const resData = newArrivalsRes.data as any;
          const products = resData.data || resData.products || [];
          const flattenedProducts = Array.isArray(products)
            ? products.flat().filter((p: Product) => p && p._id)
            : [];
          setNewArrivals(flattenedProducts);
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

  // Fetch recommendations khi user đã đăng nhập
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthenticated) {
        setRecommendedProducts([]);
        return;
      }

      try {
        setLoadingRecommendations(true);
        const res =
          await userRecommendationService.getPersonalizedRecommendations({
            limit: 8,
          });

        if (res.data.success) {
          // Handle multiple response formats:
          // 1. { data: { products: [...] } } - new format
          // 2. { data: { recommendations: [...] } }
          // 3. { products: [...] }
          let products: Product[] = [];

          if (res.data.data?.products) {
            // Format 1: New format - products in data object
            products = (res.data.data.products as Product[]).filter(
              (p: Product) => !!p && !!p._id
            );
          } else if (res.data.data?.recommendations) {
            // Format 2: Extract products from recommendations
            products = res.data.data.recommendations
              .map((rec: { product?: Product }) => rec.product)
              .filter((p: Product | undefined): p is Product => !!p && !!p._id);
          } else if (res.data.products) {
            // Format 3: Direct products array from BE
            products = (res.data.products as Product[]).filter(
              (p: Product) => !!p && !!p._id
            );
          } else if (res.data.recommendations) {
            // Format 4: recommendations at root level
            const recs = res.data.recommendations as Array<
              { product?: Product } | Product
            >;
            products = recs
              .map((rec) => ("product" in rec ? rec.product : rec) as Product)
              .filter((p: Product | undefined): p is Product => !!p && !!p._id);
          }

          setRecommendedProducts(products);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        toast.error("Không thể tải gợi ý sản phẩm");
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [isAuthenticated]);

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
          title="Sản phẩm bán chạy"
          linkTo="/products?sort=popular"
          linkText="Xem tất cả"
        />
        <ProductGrid
          products={bestSellers}
          emptyMessage="Không có sản phẩm bán chạy nào"
        />
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

      {/* Gợi ý dành cho bạn - Chỉ hiển thị khi đã đăng nhập */}
      {isAuthenticated && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <BsStars className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Gợi ý dành cho bạn</h2>
                  <p className="text-mono-500 text-sm">
                    Dựa trên lịch sử xem và sở thích của bạn
                  </p>
                </div>
              </div>
              <Link
                to="/recommendations"
                className="px-4 py-2 bg-mono-800 text-white rounded-lg hover:bg-mono-900 transition-colors flex items-center"
              >
                <span>Xem thêm</span>
                <FiChevronRight className="ml-1" />
              </Link>
            </div>

            {loadingRecommendations ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-mono-800 mx-auto"></div>
                  <p className="mt-4 text-mono-500 text-sm">
                    Đang tải gợi ý...
                  </p>
                </div>
              </div>
            ) : recommendedProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {recommendedProducts.map((product) => {
                  const cardProduct = convertToProductCardProduct(product);
                  if (!cardProduct || !cardProduct._id) return null;
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
              <div className="text-center py-12 bg-mono-50 rounded-lg">
                <BsStars className="w-12 h-12 text-mono-300 mx-auto mb-4" />
                <p className="text-mono-500">
                  Hãy xem thêm sản phẩm để chúng tôi có thể gợi ý tốt hơn cho
                  bạn!
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-mono-800 transition-colors"
                >
                  Khám phá sản phẩm
                  <FiChevronRight className="ml-1" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;
