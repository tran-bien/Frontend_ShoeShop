import React from "react";
import EmptyState from "./EmptyState";
import { ClockIcon } from "@heroicons/react/24/outline";

const EmptyViewHistory: React.FC = () => {
  return (
    <EmptyState
      icon={<ClockIcon className="h-24 w-24" />}
      title="Chưa có lịch sử xem"
      description="Bạn chưa xem sản phẩm nào. Hãy khám phá các sản phẩm để chúng tôi có thể gợi ý phù hợp hơn!"
      actionLabel="Khám phá ngay"
      actionLink="/products"
    />
  );
};

export default EmptyViewHistory;

