import React from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiShield,
  FiLock,
  FiEye,
  FiDatabase,
} from "react-icons/fi";

const PrivacyPolicyPage: React.FC = () => {
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
            Chính sách bảo mật
          </h1>

          <p className="text-mono-600 mb-8">
            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
          </p>

          {/* Quick Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="flex items-start gap-4 p-4 bg-mono-50 rounded-xl">
              <div className="p-2 bg-mono-black rounded-lg text-white">
                <FiShield size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-mono-900">Bảo vệ dữ liệu</h3>
                <p className="text-sm text-mono-600">
                  Dữ liệu được mã hóa và bảo mật
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-mono-50 rounded-xl">
              <div className="p-2 bg-mono-black rounded-lg text-white">
                <FiLock size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-mono-900">Quyền riêng tư</h3>
                <p className="text-sm text-mono-600">
                  Không chia sẻ thông tin với bên thứ ba
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-mono-50 rounded-xl">
              <div className="p-2 bg-mono-black rounded-lg text-white">
                <FiEye size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-mono-900">Minh bạch</h3>
                <p className="text-sm text-mono-600">
                  Rõ ràng về cách sử dụng dữ liệu
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-mono-50 rounded-xl">
              <div className="p-2 bg-mono-black rounded-lg text-white">
                <FiDatabase size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-mono-900">Quyền kiểm soát</h3>
                <p className="text-sm text-mono-600">
                  Bạn có quyền quản lý dữ liệu của mình
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-mono max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                1. Thông tin chúng tôi thu thập
              </h2>
              <p className="text-mono-700 leading-relaxed mb-4">
                Chúng tôi thu thập các loại thông tin sau để cung cấp dịch vụ
                tốt nhất cho bạn:
              </p>

              <h3 className="text-lg font-medium text-mono-800 mt-4 mb-2">
                Thông tin bạn cung cấp:
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-mono-700">
                <li>
                  Thông tin tài khoản: Họ tên, email, số điện thoại, mật khẩu
                </li>
                <li>
                  Thông tin giao hàng: Địa chỉ, tên người nhận, số điện thoại
                  liên hệ
                </li>
                <li>
                  Thông tin thanh toán: Phương thức thanh toán (không lưu trữ
                  thông tin thẻ)
                </li>
                <li>Nội dung giao tiếp: Tin nhắn, đánh giá, phản hồi</li>
              </ul>

              <h3 className="text-lg font-medium text-mono-800 mt-4 mb-2">
                Thông tin tự động thu thập:
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-mono-700">
                <li>
                  Thông tin thiết bị: Loại trình duyệt, hệ điều hành, độ phân
                  giải màn hình
                </li>
                <li>
                  Thông tin hoạt động: Trang đã xem, sản phẩm đã xem, thời gian
                  truy cập
                </li>
                <li>Cookies và công nghệ theo dõi tương tự</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                2. Mục đích sử dụng thông tin
              </h2>
              <p className="text-mono-700 leading-relaxed mb-4">
                Chúng tôi sử dụng thông tin của bạn đ?:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-mono-700">
                <li>Xử lý và giao đơn hàng của bạn</li>
                <li>Cung cấp hỗ trợ khách hàng</li>
                <li>
                  Gửi thông tin về đơn hàng, cập nhật sản phẩm và khuyến mãi
                </li>
                <li>Cá nhân hóa trải nghiệm mua sắm của bạn</li>
                <li>Cải thiện sản phẩm và dịch vụ của chúng tôi</li>
                <li>Phát hiện và ngăn chặn gian lận</li>
                <li>Tuân thủ các nghĩa vụ pháp lý</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                3. Chia sẻ thông tin
              </h2>
              <p className="text-mono-700 leading-relaxed mb-4">
                Chúng tôi chỉ chia sẻ thông tin của bạn trong các trường hợp
                sau:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-mono-700">
                <li>
                  <strong>Đối tác vận chuyển:</strong> Để giao hàng đến bạn
                </li>
                <li>
                  <strong>Nhà cung cấp dịch vụ thanh toán:</strong> Để xử lý
                  thanh toán
                </li>
                <li>
                  <strong>Theo yêu cầu pháp luật:</strong> Khi có yêu cầu từ cơ
                  quan có thẩm quyền
                </li>
              </ul>
              <p className="text-mono-700 leading-relaxed mt-4">
                <strong>
                  Chúng tôi cam kết không bán hoặc cho thuê thông tin cá nhân
                  của bạn cho bên thứ ba vì mục đích thương mại.
                </strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                4. Bảo mật thông tin
              </h2>
              <p className="text-mono-700 leading-relaxed mb-4">
                Chúng tôi áp dụng các biện pháp bảo mật sau để bảo vệ thông tin
                của bạn:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-mono-700">
                <li>Mã hóa SSL/TLS cho tất cả kết nối</li>
                <li>Mã hóa mật khẩu bằng thuật toán bcrypt</li>
                <li>Hệ thống tường lửa và giám sát 24/7</li>
                <li>Kiểm tra bảo mật định kỳ</li>
                <li>Giới hạn quyền truy cập dữ liệu</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                5. Cookies và công nghệ theo dõi
              </h2>
              <p className="text-mono-700 leading-relaxed mb-4">
                Chúng tôi sử dụng cookies đ?:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-mono-700">
                <li>Duy trì phiên đăng nhập của bạn</li>
                <li>Nhớ các tùy chọn của bạn</li>
                <li>Phân tích lưu lượng truy cập website</li>
                <li>Cá nhân hóa nội dung và quảng cáo</li>
              </ul>
              <p className="text-mono-700 leading-relaxed mt-4">
                Bạn có thể quản lý cookies thông qua cài đặt trình duyệt của
                mình. Tuy nhiên, việc tắt cookies có thể ảnh hưởng đến trải
                nghiệm sử dụng website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                6. Quyền của bạn
              </h2>
              <p className="text-mono-700 leading-relaxed mb-4">
                Bạn có các quyền sau đối với dữ liệu cá nhân của mình:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-mono-700">
                <li>
                  <strong>Quyền truy cập:</strong> Xem và tải về dữ liệu cá nhân
                  của bạn
                </li>
                <li>
                  <strong>Quyền chỉnh sửa:</strong> Cập nhật thông tin không
                  chính xác
                </li>
                <li>
                  <strong>Quyền xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu
                </li>
                <li>
                  <strong>Quyền từ chối:</strong> Hủy đăng ký nhận email
                  marketing
                </li>
                <li>
                  <strong>Quyền phản đối:</strong> Phản đối việc xử lý dữ liệu
                  nhất định
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                7. Lưu trữ dữ liệu
              </h2>
              <p className="text-mono-700 leading-relaxed">
                Chúng tôi lưu trữ dữ liệu của bạn trong thời gian cần thiết để
                cung cấp dịch vụ và tuân thủ các nghĩa vụ pháp lý. Khi bạn yêu
                cầu xóa tài khoản, chúng tôi sẽ xóa hoặc ẩn danh hóa dữ liệu của
                bạn trong vòng 30 ngày, trừ trường hợp cần giữ lại vì lý đo pháp
                lý.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                8. Thay đổi chính sách
              </h2>
              <p className="text-mono-700 leading-relaxed">
                Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian.
                Mọi thay đổi quan trọng sẽ được thông báo qua email hoặc thông
                báo trên website. Chúng tôi khuyến khích bạn xem lại chính sách
                này định kỳ.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-mono-900 mb-4">
                9. Liên hệ
              </h2>
              <p className="text-mono-700 leading-relaxed mb-4">
                Nếu bạn có câu hỏi về chính sách bảo mật hoặc muốn thực hiện các
                quyền của mình, vui lòng liên h?:
              </p>
              <div className="bg-mono-50 rounded-xl p-6">
                <p className="text-mono-700">
                  <strong>ShoeStore</strong>
                </p>
                <p className="text-mono-700">Email: privacy@shoestore.com</p>
                <p className="text-mono-700">Hotline: 1900 xxxx</p>
                <p className="text-mono-700">
                  Địa ch?: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

