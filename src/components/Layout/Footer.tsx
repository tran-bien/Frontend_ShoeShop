import React from "react";
import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
} from "react-icons/fi";
// @ts-expect-error - Font import doesn't have TypeScript types
import "@fontsource/lobster";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-mono-50 border-t border-mono-200">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: About */}
          <div>
            <Link to="/" className="inline-block mb-6">
              <h3
                style={{
                  fontFamily: "'Lobster', cursive",
                  fontSize: "2rem",
                }}
                className="text-mono-black"
              >
                ShoeStore
              </h3>
            </Link>
            <p className="text-mono-600 mb-6 text-sm leading-relaxed">
              Cá»­a hÃ ng giÃ y chÃ­nh hÃ£ng vá»›i nhiá»u máº«u mÃ£ Ä‘a dáº¡ng, phÃ¹ há»£p vá»›i má»i
              nhu cáº§u vÃ  phong cÃ¡ch. Cam káº¿t cháº¥t lÆ°á»£ng, giÃ¡ tá»‘t nháº¥t.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 rounded-full bg-mono-200 text-mono-700 hover:bg-mono-black hover:text-white transition-all duration-200"
                aria-label="Facebook"
              >
                <FiFacebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-mono-200 text-mono-700 hover:bg-mono-black hover:text-white transition-all duration-200"
                aria-label="Instagram"
              >
                <FiInstagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-mono-200 text-mono-700 hover:bg-mono-black hover:text-white transition-all duration-200"
                aria-label="Twitter"
              >
                <FiTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-mono-black mb-6 tracking-tight">
              LiÃªn káº¿t nhanh
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Sáº£n pháº©m má»›i", href: "/products?sort=newest" },
                { label: "BÃ¡n cháº¡y nháº¥t", href: "/products?sort=popular" },
                { label: "GiÃ y Nam", href: "/products?gender=male" },
                { label: "GiÃ y Ná»¯", href: "/products?gender=female" },
                { label: "Khuyáº¿n mÃ£i", href: "/coupons" },
                { label: "Blog", href: "/blog" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-mono-600 hover:text-mono-black transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="text-lg font-semibold text-mono-black mb-6 tracking-tight">
              Há»— trá»£ khÃ¡ch hÃ ng
            </h4>
            <ul className="space-y-3">
              {[
                { label: "CÃ¢u há»i thÆ°á»ng gáº·p", href: "/faq" },
                { label: "HÆ°á»›ng dáº«n mua hÃ ng", href: "/faq" },
                { label: "ChÃ­nh sÃ¡ch Ä‘á»•i tráº£", href: "/returns" },
                { label: "HÆ°á»›ng dáº«n chá»n size", href: "/products" },
                { label: "LiÃªn há»‡", href: "/contact" },
                { label: "Äiá»u khoáº£n sá»­ dá»¥ng", href: "/terms" },
              ].map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    to={link.href}
                    className="text-mono-600 hover:text-mono-black transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-lg font-semibold text-mono-black mb-6 tracking-tight">
              LiÃªn há»‡ vá»›i chÃºng tÃ´i
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiMapPin className="w-5 h-5 text-mono-500 flex-shrink-0 mt-0.5" />
                <span className="text-mono-600 text-sm">
                  123 ÄÆ°á»ng ABC, Quáº­n 1, TP. Há»“ ChÃ­ Minh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="w-5 h-5 text-mono-500 flex-shrink-0" />
                <a
                  href="tel:19001234"
                  className="text-mono-600 hover:text-mono-black transition-colors text-sm"
                >
                  1900 1234
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="w-5 h-5 text-mono-500 flex-shrink-0" />
                <a
                  href="mailto:support@shoestore.vn"
                  className="text-mono-600 hover:text-mono-black transition-colors text-sm"
                >
                  support@shoestore.vn
                </a>
              </li>
            </ul>

            {/* Business Hours */}
            <div className="mt-6 pt-6 border-t border-mono-200">
              <div className="flex items-center gap-3">
                <FiClock className="w-5 h-5 text-mono-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-mono-700">
                    Giá» lÃ m viá»‡c
                  </p>
                  <p className="text-sm text-mono-600">
                    8:00 - 22:00 (Thá»© 2 - CN)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-mono-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-mono-600">Cháº¥p nháº­n thanh toÃ¡n</p>
            <div className="flex items-center gap-4">
              <img
                src="/image/vnpay.jpg"
                alt="VNPay"
                className="h-10 rounded-md border border-mono-200 bg-white object-contain p-1.5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-mono-200 bg-mono-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-mono-600">
              Â© {currentYear} ShoeStore. Táº¥t cáº£ cÃ¡c quyá»n Ä‘Æ°á»£c báº£o lÆ°u.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                to="/privacy"
                className="text-mono-600 hover:text-mono-black transition-colors"
              >
                ChÃ­nh sÃ¡ch báº£o máº­t
              </Link>
              <Link
                to="/terms"
                className="text-mono-600 hover:text-mono-black transition-colors"
              >
                Äiá»u khoáº£n sá»­ dá»¥ng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

