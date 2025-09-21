import React, { useState, useEffect, useRef } from "react";
import { BiSearch } from "react-icons/bi";
import {
  AiOutlineShoppingCart,
  AiOutlineUser,
  AiOutlineDashboard,
} from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { filterService, SearchSuggestion } from "../../services/FilterService";
import { useAuth } from "../../hooks/useAuth";
// @ts-ignore
import "@fontsource/lobster";

const MainNavbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    <nav className="flex items-center justify-between px-12 py-4 shadow-xl sticky top-0 bg-white z-50">
      {/* logo */}
      <div className="h-10 flex items-center">
        <Link to="/">
          <h1
            style={{
              fontFamily: "'Lobster', cursive",
              fontSize: "3rem",
              color: "black",
            }}
            className="text-2xl"
          >
            ShoeStore
          </h1>
        </Link>
      </div>

      {/* navigation links */}
      <ul className="flex gap-16">
        <li>
          <Link
            to="/products?sort=newest"
            className="hover:text-blue-600 transition-colors font-medium"
          >
            SẢN PHẨM MỚI
          </Link>
        </li>
        <li>
          <Link
            to="/products?sort=popular"
            className="hover:text-blue-600 transition-colors font-medium"
          >
            SẢN PHẨM PHỔ BIẾN
          </Link>
        </li>
        <li>
          <Link
            to="/products?gender=male"
            className="hover:text-blue-600 transition-colors font-medium"
          >
            GIÀY NAM
          </Link>
        </li>
        <li>
          <Link
            to="/products?gender=female"
            className="hover:text-blue-600 transition-colors font-medium"
          >
            GIÀY NỮ
          </Link>
        </li>
      </ul>

      {/* search bar */}
      <div className="flex items-center w-1/3 relative" ref={searchRef}>
        <form onSubmit={handleSearch} className="w-full relative">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
            className="border border-gray-300 p-2 px-5 rounded-3xl w-full pr-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:text-blue-600 transition-colors"
          >
            <BiSearch className="text-gray-500" />
          </button>
        </form>

        {/* Search suggestions dropdown */}
        {showSuggestions && (suggestions.length > 0 || loading) && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <span className="mt-2 block">Đang tìm kiếm...</span>
              </div>
            ) : (
              <ul className="py-2">
                {suggestions.map((suggestion, index) => (
                  <li key={`${suggestion.type}-${suggestion.id}-${index}`}>
                    <button
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors"
                    >
                      {/* Suggestion image */}
                      <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
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
                        <div className="font-medium text-gray-900 truncate">
                          {suggestion.name}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {suggestion.type === "product" && "Sản phẩm"}
                          {suggestion.type === "category" && "Danh mục"}
                          {suggestion.type === "brand" && "Thương hiệu"}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}

                {/* Show all results option */}
                <li className="border-t border-gray-100">
                  <button
                    onClick={() => {
                      navigate(
                        `/products?search=${encodeURIComponent(searchQuery)}`
                      );
                      setShowSuggestions(false);
                      setSearchQuery("");
                    }}
                    className="w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors text-blue-600 font-medium"
                  >
                    Xem tất cả kết quả cho "{searchQuery}"
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>

      <ul className="flex gap-2">
        {/* Giỏ hàng */}
        <li>
          <Link
            to="/cart"
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <AiOutlineShoppingCart className="text-2xl text-gray-700 hover:text-blue-600 transition" />
          </Link>
        </li>

        {/* User */}
        <li>
          <Link
            to="/user-information"
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <AiOutlineUser className="text-2xl text-gray-700 hover:text-red-500 transition" />
          </Link>
        </li>
        {/* Dashboard/Admin Panel - Hiển thị cho cả admin và staff */}
        {(user?.role === "admin" || user?.role === "staff") && (
          <li>
            <Link
              to={
                user?.role === "admin" ? "/admin/dashboard" : "/admin/products"
              }
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <AiOutlineDashboard className="text-2xl text-gray-700 hover:text-green-500 transition" />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default MainNavbar;
