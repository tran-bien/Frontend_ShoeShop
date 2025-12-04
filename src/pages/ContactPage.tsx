import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiMessageCircle,
  FiUser,
  FiEdit3,
} from "react-icons/fi";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
      icon: FiMapPin,
      title: "Địa chỉ",
      content: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
      subContent: "Mở cửa: T2 - CN",
    },
    {
      icon: FiPhone,
      title: "Điện thoại",
      content: "1900 1234",
      subContent: "Hotline miễn phí",
    },
    {
      icon: FiMail,
      title: "Email",
      content: "support@shoestore.vn",
      subContent: "Phản hồi trong 24h",
    },
    {
      icon: FiClock,
      title: "Giờ làm việc",
      content: "8:00 - 22:00",
      subContent: "Tất cả các ngày trong tuần",
    },
  ];

  const subjects = [
    "Thắc mắc về sản phẩm",
    "Hỗ trợ đơn hàng",
    "Đổi trả / Hoàn tiền",
    "Góp ý / Phản hồi",
    "Hợp tác kinh doanh",
    "Khác",
  ];

  return (
    <div className="min-h-screen bg-mono-50">
      {/* Header */}
      <div className="bg-white border-b border-mono-200">
        <div className="container mx-auto px-4 py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-mono-600 hover:text-mono-black transition-colors mb-6"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Quay lại trang chủ</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-mono-black mb-4">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-mono-600 max-w-2xl">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với
            ShoeStore qua các kênh dưới đây hoặc gửi tin nhắn trực tiếp.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-mono-200 p-6 hover:border-mono-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-mono-100 flex items-center justify-center mb-4">
                <info.icon className="w-6 h-6 text-mono-700" />
              </div>
              <h3 className="font-semibold text-mono-black mb-2">
                {info.title}
              </h3>
              <p className="text-mono-800 font-medium">{info.content}</p>
              <p className="text-sm text-mono-500 mt-1">{info.subContent}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-mono-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-mono-black flex items-center justify-center">
                <FiMessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-mono-black">
                  Gửi tin nhắn
                </h2>
                <p className="text-sm text-mono-500">
                  Điền thông tin và chúng tôi sẽ phản hồi sớm nhất
                </p>
              </div>
            </div>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-mono-100 flex items-center justify-center mx-auto mb-4">
                  <FiSend className="w-8 h-8 text-mono-600" />
                </div>
                <h3 className="text-xl font-semibold text-mono-black mb-2">
                  Gửi tin nhắn thành công!
                </h3>
                <p className="text-mono-600 mb-6">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24
                  giờ.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-mono-black text-white rounded-lg font-medium hover:bg-mono-800 transition-colors"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-2">
                      Họ tên *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-mono-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Nhập họ tên"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-mono-300 focus:ring-2 focus:ring-mono-black focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-mono-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-mono-300 focus:ring-2 focus:ring-mono-black focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-2">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-mono-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0123 456 789"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-mono-300 focus:ring-2 focus:ring-mono-black focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-2">
                      Chủ đề *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-mono-300 focus:ring-2 focus:ring-mono-black focus:border-transparent transition-all outline-none bg-white"
                    >
                      <option value="">Chọn chủ đề</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-2">
                    Nội dung tin nhắn *
                  </label>
                  <div className="relative">
                    <FiEdit3 className="absolute left-4 top-4 text-mono-400 w-5 h-5" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Mô tả chi tiết vấn đề hoặc câu hỏi của bạn..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-mono-300 focus:ring-2 focus:ring-mono-black focus:border-transparent transition-all outline-none resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-mono-black text-white rounded-xl font-semibold hover:bg-mono-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-5 h-5" />
                      <span>Gửi tin nhắn</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Map & Store Info */}
          <div className="space-y-6">
            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl border border-mono-200 overflow-hidden">
              <div className="aspect-[4/3] bg-mono-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-mono-300 flex items-center justify-center mx-auto mb-3">
                      <FiMapPin className="w-8 h-8 text-mono-600" />
                    </div>
                    <p className="text-mono-600 font-medium">Google Maps</p>
                    <p className="text-sm text-mono-500">
                      123 Đường ABC, Quận 1, HCM
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-mono-200">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 text-mono-700 hover:text-mono-black font-medium transition-colors"
                >
                  <FiMapPin className="w-4 h-4" />
                  Xem bản đồ lớn hơn
                </a>
              </div>
            </div>

            {/* Store Info */}
            <div className="bg-mono-black rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Cửa hàng chính</h3>
              <p className="text-mono-300 mb-6 leading-relaxed">
                Ghé thăm cửa hàng để trải nghiệm trực tiếp sản phẩm và nhận tư
                vấn từ đội ngũ nhân viên chuyên nghiệp của chúng tôi.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FiMapPin className="w-5 h-5 text-mono-400 flex-shrink-0 mt-0.5" />
                  <span className="text-mono-200">
                    123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <FiClock className="w-5 h-5 text-mono-400 flex-shrink-0" />
                  <span className="text-mono-200">
                    8:00 - 22:00 (Tất cả các ngày)
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <FiPhone className="w-5 h-5 text-mono-400 flex-shrink-0" />
                  <span className="text-mono-200">Hotline: 1900 1234</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-mono-200 p-6">
              <h3 className="font-semibold text-mono-black mb-4">
                Có thể bạn cần
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/faq"
                  className="p-4 rounded-xl border border-mono-200 hover:border-mono-400 hover:shadow-md transition-all text-center"
                >
                  <span className="text-sm font-medium text-mono-700">
                    Câu hỏi thường gặp
                  </span>
                </Link>
                <Link
                  to="/returns"
                  className="p-4 rounded-xl border border-mono-200 hover:border-mono-400 hover:shadow-md transition-all text-center"
                >
                  <span className="text-sm font-medium text-mono-700">
                    Chính sách đổi trả
                  </span>
                </Link>
                <Link
                  to="/products"
                  className="p-4 rounded-xl border border-mono-200 hover:border-mono-400 hover:shadow-md transition-all text-center"
                >
                  <span className="text-sm font-medium text-mono-700">
                    Xem sản phẩm
                  </span>
                </Link>
                <Link
                  to="/user-orders"
                  className="p-4 rounded-xl border border-mono-200 hover:border-mono-400 hover:shadow-md transition-all text-center"
                >
                  <span className="text-sm font-medium text-mono-700">
                    Tra cứu đơn hàng
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;


