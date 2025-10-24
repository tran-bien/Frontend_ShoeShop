import type { ReturnRequest } from "../../../types/return";

interface Props {
  returnRequest: ReturnRequest;
  onClose: () => void;
}

const ReturnDetailModal = ({ returnRequest, onClose }: Props) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chi tiết yêu cầu đổi trả</h2>
        <div className="space-y-3">
          <p>
            <strong>Mã:</strong> #{returnRequest._id.slice(-8)}
          </p>
          <p>
            <strong>Loại:</strong>{" "}
            {returnRequest.type === "RETURN" ? "Hoàn trả" : "Đổi hàng"}
          </p>
          <p>
            <strong>Trạng thái:</strong> {returnRequest.status}
          </p>
          <p>
            <strong>Lý do:</strong> {returnRequest.reason}
          </p>
          <div>
            <strong>Sản phẩm ({returnRequest.items.length}):</strong>
            <ul className="mt-2 space-y-2">
              {returnRequest.items.map((item, idx) => (
                <li key={idx} className="bg-gray-50 p-2 rounded">
                  Số lượng: {item.quantity} - Giá:{" "}
                  {item.priceAtPurchase?.toLocaleString()}₫
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-gray-200 px-4 py-2 rounded"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default ReturnDetailModal;
