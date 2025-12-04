import React from "react";
import EmptyState from "./EmptyState";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

const EmptyCart: React.FC = () => {
  return (
    <EmptyState
      icon={<ShoppingCartIcon className="h-24 w-24" />}
      title="Giỏ hàng trống"
      description="Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!"
      actionLabel="Khám phá sản phẩm"
      actionLink="/products"
    />
  );
};

export default EmptyCart;

