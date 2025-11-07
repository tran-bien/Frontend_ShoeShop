import React from "react";
import EmptyState from "./EmptyState";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface EmptySearchResultsProps {
  searchQuery?: string;
  onClearFilters?: () => void;
}

const EmptySearchResults: React.FC<EmptySearchResultsProps> = ({
  searchQuery,
  onClearFilters,
}) => {
  return (
    <EmptyState
      icon={<MagnifyingGlassIcon className="h-24 w-24" />}
      title={
        searchQuery
          ? `Không tìm thấy "${searchQuery}"`
          : "Không tìm thấy sản phẩm"
      }
      description="Không có sản phẩm nào phù hợp với tìm kiếm của bạn. Hãy thử từ khóa khác hoặc xóa bộ lọc."
      actionLabel={onClearFilters ? "Xóa bộ lọc" : "Xem tất cả sản phẩm"}
      actionLink={onClearFilters ? undefined : "/products"}
      onAction={onClearFilters}
    />
  );
};

export default EmptySearchResults;
