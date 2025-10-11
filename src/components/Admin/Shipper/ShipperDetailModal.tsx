import { Shipper } from "../../../services/ShipperService";

interface Props {
  shipper: Shipper;
  onClose: () => void;
}

const ShipperDetailModal = ({ shipper, onClose }: Props) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-xl font-bold mb-4">
          Chi tiết Shipper - {shipper.name}
        </h2>
        <div className="space-y-2">
          <p>
            <strong>Email:</strong> {shipper.email}
          </p>
          <p>
            <strong>Phone:</strong> {shipper.phone}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            {shipper.shipper.isAvailable ? "Đang hoạt động" : "Không hoạt động"}
          </p>
          <p>
            <strong>Đơn đang giao:</strong> {shipper.shipper.activeOrders} /{" "}
            {shipper.shipper.maxOrders}
          </p>
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

export default ShipperDetailModal;
