import React from "react";
import EmptyState from "./EmptyState";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";

const EmptyCompare: React.FC = () => {
  return (
    <EmptyState
      icon={<ArrowsRightLeftIcon className="h-24 w-24" />}
      title="Chưa có sản phẩm để so sánh"
      description="Thêm sản phẩm vào danh sách so sánh để xem chi tiết và đưa ra quyết định tốt nhất."
      actionLabel="Khám phá sản phẩm"
      actionLink="/products"
    />
  );
};

export default EmptyCompare;

