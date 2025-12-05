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
            <Link to="/" className="inline-block mb-6 group">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-lg font-black italic text-white">
                    S
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none text-black">
                    ShoeStore
                  </h1>
                  <p className="text-[10px] text-neutral-500 tracking-widest uppercase font-bold">
                    Premium Sneakers
                  </p>
                </div>
              </div>
            </Link>
            <p className="text-mono-600 mb-6 text-sm leading-relaxed">
              Cửa hàng giày chính hãng với nhiều mẫu mã đa dạng, phù hợp với mọi
              nhu cầu và phong cách. Cam kết chất lượng, giá tốt nhất.
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
              Liên kết nhanh
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Sản phẩm mới", href: "/products?sort=newest" },
                { label: "Bán chạy nhất", href: "/products?sort=popular" },
                { label: "Giày Nam", href: "/products?gender=male" },
                { label: "Giày Nữ", href: "/products?gender=female" },
                { label: "Khuyến mãi", href: "/coupons" },
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
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Câu hỏi thường gặp", href: "/faq" },
                { label: "Hướng dẫn mua hàng", href: "/faq" },
                { label: "Chính sách đổi trả", href: "/returns" },
                { label: "Hướng dẫn chọn size", href: "/products" },
                { label: "Liên hệ", href: "/contact" },
                { label: "Điều khoản sử dụng", href: "/terms" },
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
              Liên hệ với chúng tôi
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiMapPin className="w-5 h-5 text-mono-500 flex-shrink-0 mt-0.5" />
                <span className="text-mono-600 text-sm">
                  123 Đường ABC, Quận 1, TP. Hồ Chí Minh
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
                    Giờ làm việc
                  </p>
                  <p className="text-sm text-mono-600">
                    8:00 - 22:00 (Thứ 2 - CN)
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
            <p className="text-sm text-mono-600">Chấp nhận thanh toán</p>
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
              © {currentYear} ShoeStore. Tất cả các quyền được bảo lưu.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                to="/privacy"
                className="text-mono-600 hover:text-mono-black transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link
                to="/terms"
                className="text-mono-600 hover:text-mono-black transition-colors"
              >
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
