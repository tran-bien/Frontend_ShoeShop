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
      content: "01 Đ. Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. HCM",
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
      content: "support@shoeshop.vn",
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
            ShoeShop qua các kênh dưới đây hoặc gửi tin nhắn trực tiếp.
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

        {/* Map & Store Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Google Map Embed */}
          <div className="bg-white rounded-2xl border border-mono-200 overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.488488774476!2d106.76938757488988!3d10.85074508928359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527b8b7d2a3f5%3A0x2b8b7d2a3f5c0!2zMDEgVsO1IFbEg24gTmfFqSwgTGluaCBDaGl14buRdSwgVGjhu6UgROG7sWMgQ8O0bmcgVGjhu6UsIFRo4buDIGPGoSBt4buRIEjhu691IE3hu5l!5e0!3m2!1sen!2s!4v1697040000000!5m2!1sen!2s"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
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
          <div className="bg-mono-900 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4 text-white">
              Cửa hàng chính
            </h3>
            <p className="text-mono-300 mb-6 leading-relaxed">
              Ghé thăm cửa hàng để trải nghiệm trực tiếp sản phẩm và nhận tư vấn
              từ đội ngũ nhân viên chuyên nghiệp của chúng tôi.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiMapPin className="w-5 h-5 text-mono-400 flex-shrink-0 mt-0.5" />
                <span className="text-mono-200">
                  01 Đ. Võ Văn Ngân, Linh Chiểu, Thủ Đức, Thành phố Hồ Chí Minh,
                  Việt Nam
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
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-mono-200 p-6">
          <h3 className="font-semibold text-mono-black mb-4">Có thể bạn cần</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              to="/faq"
              className="p-4 rounded-xl border border-mono-200 hover:border-mono-400 hover:shadow-md transition-all text-center"
            >
              <span className="text-sm font-medium text-mono-700">
                Câu hỏi thường gặp
              </span>
            </Link>
            <Link
              to="/faq"
              className="p-4 rounded-xl border border-mono-200 hover:border-mono-400 hover:shadow-md transition-all text-center"
            >
              <span className="text-sm font-medium text-mono-700">
                Chính sách trả hàng
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
              to="/user-manage-order"
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
  );
};

export default ContactPage;
