import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-mono-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-mono-600 hover:text-mono-black mb-8 transition-colors"
        >
          <FiArrowLeft />
          Quay lại trang chủ
        </Link>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-mono-100 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-mono-900 mb-6">
            Điều khoản sử dụng
          </h1>

          <p className="text-mono-600 mb-8">
            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
          </p>

          <div className="prose prose-mono max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                1. Giới thiệu
              </h2>
              <p className="text-mono-700 leading-relaxed">
                Chào mừng bạn đến với ShoeShop. Bằng việc truy cập và sử dụng
                website của chúng tôi, bạn đồng ý tuân thủ các điều khoản và
                điều kiện được nêu dưới đây. Vui lòng đọc kỹ các điều khoản này
                trước khi sử dụng dịch vụ của chúng tôi.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                2. Tài khoản người dùng
              </h2>
              <p className="text-mono-700 leading-relaxed mb-4">
                Khi đăng ký tài khoản tại ShoeShop, bạn đồng ý:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-mono-700">
                <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
                <li>Bảo mật thông tin đăng nhập của bạn</li>
                <li>
                  Chịu trách nhiệm với mọi hoạt động xảy ra trên tài khoản của
                  bạn
                </li>
                <li>
                  Thông báo ngay cho chúng tôi nếu phát hiện sử dụng trái phép
                  tài khoản
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                3. Đặt hàng và thanh toán
              </h2>
              <p className="text-mono-700 leading-relaxed mb-4">
                Khi đặt hàng tại ShoeShop:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-mono-700">
                <li>Giá sản phẩm được hiển thị đã bao gồm VAT (nếu có)</li>
                <li>
                  Chúng tôi có quyền từ chối hoặc hủy đơn hàng trong trường hợp
                  có lỗi về giá
                </li>
                <li>
                  Đơn hàng chỉ được xác nhận khi chúng tôi gửi email xác nhận
                </li>
                <li>
                  Bạn có thể thanh toán bằng các phương thức được hỗ trợ trên
                  website
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                4. Giao hàng
              </h2>
              <p className="text-mono-700 leading-relaxed">
                Thời gian giao hàng phụ thuộc vào địa điểm và phương thức vận
                chuyển bạn chọn. Chúng tôi sẽ cố gắng giao hàng trong thời gian
                đã thông báo, tuy nhiên không thể cam kết thời gian giao hàng
                chính xác đo các yếu tố bất khả kháng.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                5. Đổi trả và hoàn tiền
              </h2>
              <p className="text-mono-700 leading-relaxed mb-4">
                Chính sách đổi trả của chúng tôi:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-mono-700">
                <li>
                  Sản phẩm có thể đổi trả trong vòng 7 ngày kể từ ngày nhận hàng
                </li>
                <li>Sản phẩm phải còn nguyên tem, nhãn và chưa qua sử dụng</li>
                <li>Hoàn tiền sẽ được thực hiện trong 5-7 ngày làm việc</li>
                <li>
                  Phí vận chuyển đổi trả đo khách hàng chịu trách nhiệm (trừ lỗi
                  từ phía chúng tôi)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                6. Quyền sở hữu trí tuệ
              </h2>
              <p className="text-mono-700 leading-relaxed">
                Tất cả nội dung trên website bao gồm hình ảnh, logo, văn bản,
                thiết kế đều thuộc quyền sở hữu của ShoeShop hoặc các đối tác
                được cấp phép. Việc sao chép, sử dụng mà không có sự cho phép là
                vi phạm pháp luật.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                7. Giới hạn trách nhiệm
              </h2>
              <p className="text-mono-700 leading-relaxed">
                ShoeShop không chịu trách nhiệm về bất kỳ thiệt hại trực tiếp,
                gián tiếp, ngẫu nhiên hoặc đo hậu quả phát sinh từ việc sử dụng
                hoặc không thể sử dụng dịch vụ của chúng tôi.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                8. Thay đổi điều khoản
              </h2>
              <p className="text-mono-700 leading-relaxed">
                Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào.
                Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website.
                Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với
                việc bạn chấp nhận các điều khoản mới.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                9. Liên hệ
              </h2>
              <p className="text-mono-700 leading-relaxed">
                Nếu bạn có bất kỳ câu hỏi nào về điều khoản sử dụng, vui lòng
                liên hệ với chúng tôi qua email: support@shoeshop.com hoặc
                hotline: 1900 xxxx.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

