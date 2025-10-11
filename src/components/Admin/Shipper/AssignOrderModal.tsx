import { Shipper } from "../../../services/ShipperService";

interface Props {
  shippers: Shipper[];
  onClose: () => void;
  onSuccess: () => void;
}

const AssignOrderModal = ({ onClose }: Props) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Gán đơn hàng cho Shipper</h2>
        <p className="text-gray-600 mb-4">Chức năng đang phát triển...</p>
        <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">
          Đóng
        </button>
      </div>
    </div>
  );
};

export default AssignOrderModal;
