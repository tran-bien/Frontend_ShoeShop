import React from "react";
import EmptyState from "./EmptyState";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

const EmptyOrders: React.FC = () => {
  return (
    <EmptyState
      icon={<ShoppingBagIcon className="h-24 w-24" />}
      title="Chưa có đơn hàng"
      description="Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm để tạo đơn hàng đầu tiên của bạn!"
      actionLabel="Bắt đầu mua sắm"
      actionLink="/products"
    />
  );
};

export default EmptyOrders;

