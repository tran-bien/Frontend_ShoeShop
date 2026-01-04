import React, { useState, useEffect, useRef } from "react";
import { BiSearch } from "react-icons/bi";
import {
  AiOutlineShoppingCart,
  AiOutlineUser,
  AiOutlineDashboard,
  AiOutlineLogin,
  AiOutlineLogout,
} from "react-icons/ai";
import { FaTruck } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { filterService, SearchSuggestion } from "../../services/FilterService";
import { useAuth } from "../../hooks/useAuth";
import NotificationBell from "./NotificationBell";
// @ts-expect-error - Google Fonts import does not have TypeScript declarations
import "@fontsource/lobster";

const MainNavbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setLoading(true);
        try {
          const response = await filterService.getSuggestions({
            keyword: searchQuery,
            limit: 8,
          });
          if (response.data.success) {
            setSuggestions(response.data.suggestions);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?name=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    setSearchQuery("");

    if (suggestion.type === "product") {
      navigate(`/product/${suggestion.slug || suggestion.id}`);
    } else if (suggestion.type === "category") {
      navigate(`/products?category=${suggestion.id}`);
    } else if (suggestion.type === "brand") {
      navigate(`/products?brand=${suggestion.id}`);
    }
  };

  // Get suggestion display image
  const getSuggestionImage = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "product" && suggestion.image) {
      return suggestion.image;
    } else if (suggestion.type === "brand" && suggestion.logo?.url) {
      return suggestion.logo.url;
    }
    return "/image/product.jpg"; // default fallback
  };

  return (
    <nav className="flex items-center justify-between px-6 lg:px-12 py-5 shadow-luxury sticky top-0 bg-white z-50 border-b border-mono-100">
      {/* logo */}
      <div className="h-10 flex items-center flex-shrink-0">
        <Link to="/" className="group">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <span className="text-lg font-black italic text-white">S</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none text-black">
                ShoeShop
              </h1>
              <p className="text-[10px] text-neutral-500 tracking-widest uppercase font-bold">
                Premium Sneakers
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* navigation links - thu nhỏ để search bar có không gian rộng hơn */}
      <ul className="hidden lg:flex gap-4 xl:gap-6 flex-shrink-0 ml-4 lg:ml-6">
        <li>
          <Link
            to="/products?sort=newest"
            className="hover:text-mono-black transition-colors font-medium tracking-tight text-xs xl:text-sm whitespace-nowrap"
          >
            SẢN PHẨM MỚI
          </Link>
        </li>
        <li>
          <Link
            to="/products?sort=popular"
            className="hover:text-mono-black transition-colors font-medium tracking-tight text-xs xl:text-sm whitespace-nowrap"
          >
            PHỔ BIẾN
          </Link>
        </li>
        <li>
          <Link
            to="/products?gender=male"
            className="hover:text-mono-black transition-colors font-medium tracking-tight text-xs xl:text-sm whitespace-nowrap"
          >
            GIÀY NAM
          </Link>
        </li>
        <li>
          <Link
            to="/products?gender=female"
            className="hover:text-mono-black transition-colors font-medium tracking-tight text-xs xl:text-sm whitespace-nowrap"
          >
            GIÀY NỮ
          </Link>
        </li>
        <li>
          <Link
            to="/blog"
            className="hover:text-mono-black transition-colors font-medium tracking-tight text-xs xl:text-sm whitespace-nowrap"
          >
            BLOG
          </Link>
        </li>
      </ul>

      {/* search bar - mở rộng để có không gian tìm kiếm lớn hơn */}
      <div
        className="flex items-center flex-1 lg:max-w-[400px] xl:max-w-[500px] min-w-[180px] mx-2 lg:mx-4 relative"
        ref={searchRef}
      >
        <form onSubmit={handleSearch} className="w-full relative">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
            className="border border-mono-300 p-2 px-5 rounded-3xl w-full pr-10 focus:outline-none focus:border-mono-500 focus:ring-1 focus:ring-mono-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:text-mono-black transition-colors"
          >
            <BiSearch className="text-mono-500" />
          </button>
        </form>

        {/* Search suggestions dropdown - căn giữa và responsive */}
        {showSuggestions && (suggestions.length > 0 || loading) && (
          <div className="absolute top-full left-0 right-0 bg-white border border-mono-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50 min-w-[320px]">
            {loading ? (
              <div className="p-4 text-center text-mono-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mono-500 mx-auto"></div>
                <span className="mt-2 block">Đang tìm kiếm...</span>
              </div>
            ) : (
              <ul className="py-2">
                {suggestions.map((suggestion, index) => (
                  <li key={`${suggestion.type}-${suggestion.id}-${index}`}>
                    <button
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 hover:bg-mono-50 flex items-center gap-3 text-left transition-colors"
                    >
                      {/* Suggestion image */}
                      <div className="w-10 h-10 bg-mono-100 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={getSuggestionImage(suggestion)}
                          alt={suggestion.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/image/product.png";
                          }}
                        />
                      </div>

                      {/* Suggestion content */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-mono-900 truncate">
                          {suggestion.name}
                        </div>
                        <div className="text-sm text-mono-500 capitalize">
                          {suggestion.type === "product" && "Sản phẩm"}
                          {suggestion.type === "category" && "Danh mục"}
                          {suggestion.type === "brand" && "Thương hiệu"}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}

                {/* Show all results option */}
                <li className="border-t border-mono-100">
                  <button
                    onClick={() => {
                      navigate(
                        `/products?search=${encodeURIComponent(searchQuery)}`
                      );
                      setShowSuggestions(false);
                      setSearchQuery("");
                    }}
                    className="w-full px-4 py-3 hover:bg-mono-50 text-left transition-colors text-mono-black font-medium"
                  >
                    Xem tất cả kết quả cho "{searchQuery}"
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>

      <ul className="flex gap-1 xl:gap-2 items-center flex-shrink-0">
        {/* Notifications - Chỉ hiển thị khi đã đăng nhập */}
        {isAuthenticated && (
          <li className="mr-1">
            <NotificationBell />
          </li>
        )}

        {/* Giỏ hàng - Hiển thị cho tất cả */}
        <li>
          <Link
            to="/cart"
            className="flex items-center justify-center w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-mono-50 hover:bg-mono-200 transition-all duration-200"
            title="Giỏ hàng"
          >
            <AiOutlineShoppingCart className="text-2xl xl:text-[26px] text-mono-700" />
          </Link>
        </li>

        {/* Trang cá nhân - Chỉ hiển thị khi đã đăng nhập */}
        {isAuthenticated && (
          <li>
            <Link
              to="/user-information"
              className="flex items-center justify-center w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-mono-50 hover:bg-mono-200 transition-all duration-200"
              title={`Tài khoản: ${user?.name || "Người dùng"}`}
            >
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.name}
                  className="w-8 h-8 xl:w-9 xl:h-9 rounded-full object-cover border-2 border-mono-300"
                />
              ) : (
                <AiOutlineUser className="text-2xl xl:text-[26px] text-mono-700" />
              )}
            </Link>
          </li>
        )}

        {/* Dashboard - Cho Admin và Staff */}
        {isAuthenticated &&
          (user?.role === "admin" || user?.role === "staff") && (
            <li>
              <Link
                to={
                  user?.role === "admin"
                    ? "/admin/dashboard"
                    : "/admin/products"
                }
                className="flex items-center justify-center w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-mono-50 hover:bg-mono-200 transition-all duration-200"
                title={
                  user?.role === "admin" ? "Admin Dashboard" : "Staff Panel"
                }
              >
                <AiOutlineDashboard className="text-2xl xl:text-[26px] text-mono-700" />
              </Link>
            </li>
          )}

        {/* Shipper Panel - Cho Shipper */}
        {isAuthenticated && user?.role === "shipper" && (
          <li>
            <Link
              to="/shipper/dashboard"
              className="flex items-center justify-center w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-mono-50 hover:bg-mono-200 transition-all duration-200"
              title="Shipper Dashboard"
            >
              <FaTruck className="text-xl xl:text-2xl text-mono-700" />
            </Link>
          </li>
        )}

        {/* Đăng nhập - Chỉ hiển thị khi chưa đăng nhập */}
        {!isAuthenticated && (
          <li>
            <Link
              to="/login"
              className="flex items-center justify-center w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-mono-900 hover:bg-mono-700 transition-all duration-200"
              title="Đăng nhập"
            >
              <AiOutlineLogin className="text-2xl xl:text-[26px] text-white" />
            </Link>
          </li>
        )}

        {/* Đăng xuất - Chỉ hiển thị khi đã đăng nhập */}
        {isAuthenticated && (
          <li className="ml-1">
            <button
              onClick={() => logout()}
              className="flex items-center justify-center w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-mono-50 hover:bg-red-100 transition-all duration-200"
              title="Đăng xuất"
            >
              <AiOutlineLogout className="text-2xl xl:text-[26px] text-mono-700 hover:text-red-600" />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default MainNavbar;
