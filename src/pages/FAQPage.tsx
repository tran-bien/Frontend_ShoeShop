import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronDown,
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiRefreshCw,
  FiCreditCard,
  FiUser,
  FiHelpCircle,
  FiMessageCircle,
} from "react-icons/fi";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: FAQItem[];
}

const FAQPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("orders");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const faqCategories: FAQCategory[] = [
    {
      id: "orders",
      name: "Đặt hàng",
      icon: FiShoppingBag,
      items: [
        {
          question: "Làm thế nào để đặt hàng trên ShoeStore?",
          answer:
            "Bạn có thể đặt hàng theo các bước sau: 1) Tìm kiếm hoặc duyệt sản phẩm yêu thích, 2) Chọn size và màu sắc phù hợp, 3) Thêm vào giỏ hàng, 4) Tiến hành thanh toán và điền thông tin giao hàng, 5) Xác nhận đơn hàng. Bạn sẽ nhận được email xác nhận ngay sau khi đặt hàng thành công.",
        },
        {
          question: "Tôi có thể đặt hàng mà không cần đăng ký tài khoản không?",
          answer:
            "Hiện tại, bạn cần đăng ký tài khoản để đặt hàng. Việc này giúp bạn theo dõi đơn hàng, tích điểm thành viên và nhận nhiều ưu đãi hấp dẫn. Quá trình đăng ký chỉ mất khoảng 1 phút.",
        },
        {
          question: "Tôi có thể hủy đơn hàng đã đặt không?",
          answer:
            "Bạn có thể hủy đơn hàng nếu đơn hàng chưa được xử lý (trạng thái 'Chờ xác nhận'). Để hủy, vào mục 'Đơn hàng của tôi' và chọn 'Hủy đơn'. Nếu đơn hàng đã được xử lý, vui lòng liên hệ hotline 1900 1234 để được hỗ trợ.",
        },
        {
          question: "Làm sao để theo dõi tình trạng đơn hàng?",
          answer:
            "Sau khi đăng nhập, vào mục 'Đơn hàng của tôi' để xem tất cả đơn hàng và trạng thái chi tiết. Bạn cũng sẽ nhận được email và thông báo khi đơn hàng được cập nhật trạng thái.",
        },
      ],
    },
    {
      id: "shipping",
      name: "Vận chuyển",
      icon: FiTruck,
      items: [
        {
          question: "Phí vận chuyển là bao nhiêu?",
          answer:
            "Phí vận chuyển tùy thuộc vào địa chỉ giao hàng: Nội thành HCM: 20,000đ, Các tỉnh thành khác: 30,000đ - 50,000đ. Đơn hàng từ 500,000đ trở lên được miễn phí vận chuyển toàn quốc.",
        },
        {
          question: "Thời gian giao hàng mất bao lâu?",
          answer:
            "Thời gian giao hàng dự kiến: Nội thành HCM: 1-2 ngày làm việc, Các tỉnh thành lân cận: 2-3 ngày làm việc, Các tỉnh xa: 3-5 ngày làm việc. Thời gian có thể thay đổi trong các dịp lễ tết.",
        },
        {
          question: "Tôi có thể chọn thời gian giao hàng không?",
          answer:
            "Hiện tại chúng tôi giao hàng trong khung giờ 8:00 - 18:00 các ngày trong tuần. Shipper sẽ liên hệ trước khi giao để xác nhận. Nếu bạn không có mặt, đơn hàng sẽ được giao lại vào ngày làm việc tiếp theo.",
        },
        {
          question: "ShoeStore giao hàng đến những khu vực nào?",
          answer:
            "Chúng tôi giao hàng toàn quốc 63 tỉnh thành. Một số khu vực vùng sâu vùng xa có thể mất thêm 1-2 ngày làm việc. Liên hệ hotline để biết thêm chi tiết về khu vực của bạn.",
        },
      ],
    },
    {
      id: "returns",
      name: "Đổi trả",
      icon: FiRefreshCw,
      items: [
        {
          question: "Chính sách đổi trả của ShoeStore như thế nào?",
          answer:
            "ShoeStore hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện: Sản phẩm còn nguyên tem mác, chưa qua sử dụng, còn đầy đủ hộp và phụ kiện đi kèm. Lưu ý: Một số sản phẩm khuyến mãi có thể không áp dụng đổi trả.",
        },
        {
          question: "Làm thế nào để yêu cầu đổi/trả hàng?",
          answer:
            "Để yêu cầu đổi/trả: 1) Đăng nhập vào tài khoản, 2) Vào 'Đơn hàng của tôi', 3) Chọn đơn hàng cần đổi/trả, 4) Nhấn 'Yêu cầu đổi trả' và điền thông tin, 5) Chờ xác nhận từ shop (trong vòng 24h). Sau khi được xác nhận, bạn có thể gửi hàng về địa chỉ shop hoặc đợi shipper đến lấy.",
        },
        {
          question: "Phí đổi trả hàng ai chịu?",
          answer:
            "Nếu lỗi từ shop (gửi sai size, màu, sản phẩm lỗi), ShoeStore sẽ chịu toàn bộ phí vận chuyển đổi trả. Nếu đổi trả vì lý do cá nhân (không vừa, không thích), khách hàng sẽ chịu phí vận chuyển 2 chiều.",
        },
        {
          question: "Thời gian hoàn tiền mất bao lâu?",
          answer:
            "Sau khi shop nhận được hàng trả và kiểm tra đạt yêu cầu: Hoàn tiền vào ví ShoeStore: ngay lập tức. Hoàn tiền vào tài khoản ngân hàng: 3-5 ngày làm việc. Hoàn tiền qua VNPay: 7-15 ngày làm việc tùy ngân hàng.",
        },
      ],
    },
    {
      id: "payment",
      name: "Thanh toán",
      icon: FiCreditCard,
      items: [
        {
          question: "ShoeStore hỗ trợ những phương thức thanh toán nào?",
          answer:
            "Chúng tôi hỗ trợ các phương thức: 1) Thanh toán khi nhận hàng (COD), 2) Thanh toán qua VNPay (ATM nội địa, Visa/Mastercard, QR Code), 3) Chuyển khoản ngân hàng. Tất cả giao dịch được bảo mật tuyệt đối.",
        },
        {
          question: "Thanh toán online có an toàn không?",
          answer:
            "Hoàn toàn an toàn. ShoeStore sử dụng cổng thanh toán VNPay - đơn vị thanh toán uy tín hàng đầu Việt Nam. Tất cả thông tin thẻ được mã hóa SSL 256-bit và chúng tôi không lưu trữ thông tin thẻ của bạn.",
        },
        {
          question:
            "Tôi có thể sử dụng nhiều mã giảm giá cho một đơn hàng không?",
          answer:
            "Mỗi đơn hàng chỉ được áp dụng 1 mã giảm giá. Tuy nhiên, bạn có thể kết hợp mã giảm giá với các chương trình khuyến mãi sẵn có (nếu điều kiện cho phép) và sử dụng điểm tích lũy để giảm thêm.",
        },
        {
          question: "Làm sao để sử dụng mã giảm giá?",
          answer:
            "Khi thanh toán, nhập mã giảm giá vào ô 'Mã giảm giá' và nhấn 'Áp dụng'. Hệ thống sẽ tự động tính toán giảm giá nếu mã hợp lệ. Lưu ý kiểm tra điều kiện áp dụng của từng mã (giá trị đơn hàng tối thiểu, danh mục sản phẩm áp dụng...).",
        },
      ],
    },
    {
      id: "account",
      name: "Tài khoản",
      icon: FiUser,
      items: [
        {
          question: "Làm thế nào để đăng ký tài khoản?",
          answer:
            "Nhấn 'Đăng ký' ở góc trên phải trang web, điền email, mật khẩu và thông tin cá nhân. Bạn sẽ nhận được email xác nhận, nhấn vào link trong email để kích hoạt tài khoản. Bạn cũng có thể đăng ký nhanh bằng tài khoản Google.",
        },
        {
          question: "Tôi quên mật khẩu, phải làm sao?",
          answer:
            "Nhấn 'Quên mật khẩu' ở trang đăng nhập, nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu qua email. Link có hiệu lực trong 24 giờ. Nếu không nhận được email, kiểm tra thư mục Spam hoặc liên hệ hỗ trợ.",
        },
        {
          question: "Chương trình tích điểm hoạt động như thế nào?",
          answer:
            "Mỗi 10,000đ chi tiêu = 1 điểm. Điểm có thể đổi thành voucher giảm giá (100 điểm = 10,000đ). Ngoài ra, bạn còn được tích điểm khi viết đánh giá sản phẩm, mời bạn bè... Điểm có hiệu lực 12 tháng kể từ ngày tích lũy.",
        },
        {
          question: "Làm sao để thay đổi thông tin tài khoản?",
          answer:
            "Đăng nhập và vào 'Tài khoản của tôi' > 'Thông tin cá nhân'. Tại đây bạn có thể cập nhật tên, số điện thoại, địa chỉ, ảnh đại diện... Riêng email chỉ có thể thay đổi bằng cách liên hệ hỗ trợ khách hàng.",
        },
      ],
    },
    {
      id: "other",
      name: "Khác",
      icon: FiHelpCircle,
      items: [
        {
          question: "Làm sao để chọn đúng size giày?",
          answer:
            "ShoeStore cung cấp hướng dẫn chọn size chi tiết cho từng sản phẩm. Vào trang sản phẩm và nhấn 'Hướng dẫn chọn size' để xem bảng quy đổi. Nếu bạn mang size giữa hai cỡ, khuyến nghị chọn size lớn hơn.",
        },
        {
          question: "Sản phẩm trên ShoeStore có phải hàng chính hãng không?",
          answer:
            "100% sản phẩm tại ShoeStore là hàng chính hãng, được nhập khẩu trực tiếp từ hãng hoặc qua nhà phân phối ủy quyền. Chúng tôi cam kết hoàn tiền 200% nếu phát hiện hàng giả.",
        },
        {
          question: "ShoeStore có cửa hàng thực tế không?",
          answer:
            "Có, cửa hàng chính của chúng tôi tại: 123 Đường ABC, Quận 1, TP.HCM. Mở cửa từ 8:00 - 22:00 tất cả các ngày. Bạn có thể đến trực tiếp để xem và thử sản phẩm trước khi mua.",
        },
        {
          question: "Tôi có thể trở thành đối tác/cộng tác viên không?",
          answer:
            "Chúng tôi luôn chào đón hợp tác. Với chương trình Affiliate, bạn có thể kiếm hoa hồng 5-10% cho mỗi đơn hàng giới thiệu thành công. Liên hệ email: partner@shoestore.vn để biết thêm chi tiết.",
        },
      ],
    },
  ];

  const toggleItem = (categoryId: string, index: number) => {
    const key = `${categoryId}-${index}`;
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const currentCategory = faqCategories.find(
    (cat) => cat.id === activeCategory
  );

  // Filter items based on search
  const filteredItems = searchQuery
    ? faqCategories.flatMap((category) =>
        category.items
          .filter(
            (item) =>
              item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.answer.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((item, index) => ({
            ...item,
            categoryId: category.id,
            categoryName: category.name,
            originalIndex: index,
          }))
      )
    : [];

  return (
    <div className="min-h-screen bg-mono-50">
      {/* Header */}
      <div className="bg-mono-black text-white">
        <div className="container mx-auto px-4 py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-mono-400 hover:text-white transition-colors mb-6"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Quay lại trang chủ</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Câu hỏi thường gặp
          </h1>
          <p className="text-mono-300 max-w-2xl mb-8">
            Tìm câu trả lời nhanh chóng cho các thắc mắc thường gặp. Không tìm
            thấy câu trả lời? Hãy liên hệ với chúng tôi.
          </p>

          {/* Search */}
          <div className="max-w-xl relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-mono-500 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-mono-900 border border-mono-700 text-white placeholder-mono-500 focus:ring-2 focus:ring-white focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {searchQuery ? (
          /* Search Results */
          <div>
            <p className="text-mono-600 mb-6">
              Tìm thấy {filteredItems.length} kết quả cho "{searchQuery}"
            </p>
            {filteredItems.length > 0 ? (
              <div className="space-y-4">
                {filteredItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-mono-200 overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        toggleItem(
                          `search-${item.categoryId}`,
                          item.originalIndex
                        )
                      }
                      className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left hover:bg-mono-50 transition-colors"
                    >
                      <div>
                        <span className="text-xs font-medium text-mono-500 mb-1 block">
                          {item.categoryName}
                        </span>
                        <span className="font-medium text-mono-black">
                          {item.question}
                        </span>
                      </div>
                      <FiChevronDown
                        className={`w-5 h-5 text-mono-500 flex-shrink-0 transition-transform ${
                          expandedItems.has(
                            `search-${item.categoryId}-${item.originalIndex}`
                          )
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                    {expandedItems.has(
                      `search-${item.categoryId}-${item.originalIndex}`
                    ) && (
                      <div className="px-6 pb-5 pt-0">
                        <p className="text-mono-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-mono-200">
                <div className="w-16 h-16 rounded-full bg-mono-100 flex items-center justify-center mx-auto mb-4">
                  <FiHelpCircle className="w-8 h-8 text-mono-400" />
                </div>
                <h3 className="text-xl font-semibold text-mono-800 mb-2">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-mono-600 mb-6">
                  Thử tìm kiếm với từ khóa khác hoặc liên hệ với chúng tôi
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-mono-black text-white rounded-lg font-medium hover:bg-mono-800 transition-colors"
                >
                  <FiMessageCircle className="w-5 h-5" />
                  Liên hệ hỗ trợ
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Categories View */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-mono-200 p-4 sticky top-4">
                <h3 className="font-semibold text-mono-800 px-3 py-2 mb-2">
                  Danh mục
                </h3>
                <nav className="space-y-1">
                  {faqCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                        activeCategory === category.id
                          ? "bg-mono-black text-white"
                          : "text-mono-700 hover:bg-mono-100"
                      }`}
                    >
                      <category.icon className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                      <span
                        className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                          activeCategory === category.id
                            ? "bg-white/20 text-white"
                            : "bg-mono-200 text-mono-600"
                        }`}
                      >
                        {category.items.length}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* FAQ Items */}
            <div className="lg:col-span-3">
              {currentCategory && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-mono-black flex items-center justify-center">
                      <currentCategory.icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-mono-black">
                      {currentCategory.name}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {currentCategory.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl border border-mono-200 overflow-hidden hover:border-mono-300 transition-colors"
                      >
                        <button
                          onClick={() => toggleItem(currentCategory.id, index)}
                          className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                        >
                          <span className="font-medium text-mono-black">
                            {item.question}
                          </span>
                          <FiChevronDown
                            className={`w-5 h-5 text-mono-500 flex-shrink-0 transition-transform ${
                              expandedItems.has(
                                `${currentCategory.id}-${index}`
                              )
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>
                        {expandedItems.has(
                          `${currentCategory.id}-${index}`
                        ) && (
                          <div className="px-6 pb-5 pt-0 border-t border-mono-100">
                            <p className="text-mono-600 leading-relaxed pt-4">
                              {item.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-16 bg-mono-100 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl font-bold text-mono-black mb-4">
            Vẫn chưa tìm được câu trả lời?
          </h3>
          <p className="text-mono-600 mb-8 max-w-xl mx-auto">
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn. Liên hệ ngay
            qua các kênh dưới đây.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-mono-black text-white rounded-xl font-semibold hover:bg-mono-800 transition-colors"
            >
              <FiMessageCircle className="w-5 h-5" />
              Gửi tin nhắn
            </Link>
            <a
              href="tel:19001234"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border border-mono-300 text-mono-800 rounded-xl font-semibold hover:border-mono-500 transition-colors"
            >
              Gọi hotline: 1900 1234
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
