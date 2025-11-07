import React from "react";
import EmptyState from "./EmptyState";
import { HeartIcon } from "@heroicons/react/24/outline";

const EmptyWishlist: React.FC = () => {
  return (
    <EmptyState
      icon={<HeartIcon className="h-24 w-24" />}
      title="Danh sách yêu thích trống"
      description="Bạn chưa lưu sản phẩm nào vào danh sách yêu thích. Thêm sản phẩm để dễ dàng tìm lại sau này!"
      actionLabel="Khám phá sản phẩm"
      actionLink="/products"
    />
  );
};

export default EmptyWishlist;
