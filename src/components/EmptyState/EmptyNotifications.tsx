import React from "react";
import EmptyState from "./EmptyState";
import { BellIcon } from "@heroicons/react/24/outline";

const EmptyNotifications: React.FC = () => {
  return (
    <EmptyState
      icon={<BellIcon className="h-24 w-24" />}
      title="Không có thông báo"
      description="Bạn không có thông báo mới. Chúng tôi sẽ thông báo cho bạn khi có cập nhật mới!"
      actionLabel="Quay lại trang chủ"
      actionLink="/"
    />
  );
};

export default EmptyNotifications;

