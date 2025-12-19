import React from "react";

interface OrderCardProps {
  name: string;
  quantity: number;
  price: number;
  image?: string;
  size?: string | number;
  color?: string;
  showTotal?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  name,
  quantity,
  price,
  image,
  size,
  color,
  showTotal = true,
}) => {
  return (
    <div className="flex items-center gap-4 p-4 border border-mono-200 rounded-lg hover:shadow-md transition-shadow">
      {/* ẩnh sản phẩm */}
      <div className="w-16 h-16 bg-mono-200 flex items-center justify-center rounded-lg overflow-hidden flex-shrink-0">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-mono-400 text-xs">No image</span>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex-1">
        <h4 className="font-medium text-mono-800 mb-1">{name}</h4>
        <div className="flex flex-wrap gap-4 text-sm text-mono-600 mb-2">
          {size && (
            <span className="flex items-center gap-1">
              <strong>Size:</strong> {size}
            </span>
          )}
          {color && (
            <span className="flex items-center gap-1">
              <strong>Màu:</strong> {color}
            </span>
          )}
          <span className="flex items-center gap-1">
            <strong>SL:</strong> {quantity}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-mono-600">
            Đơn giá: {price?.toLocaleString()}đ
          </span>
          {showTotal && (
            <span className="text-mono-800 font-semibold">
              Tổng: {(price * quantity).toLocaleString()}d
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
