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
          ? `KhÃ´ng tÃ¬m tháº¥y "${searchQuery}"`
          : "KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m"
      }
      description="KhÃ´ng cÃ³ sáº£n pháº©m nÃ o phÃ¹ há»£p vá»›i tÃ¬m kiáº¿m cá»§a báº¡n. HÃ£y thá»­ tá»« khÃ³a khÃ¡c hoáº·c xÃ³a bá»™ lá»c."
      actionLabel={onClearFilters ? "XÃ³a bá»™ lá»c" : "Xem táº¥t cáº£ sáº£n pháº©m"}
      actionLink={onClearFilters ? undefined : "/products"}
      onAction={onClearFilters}
    />
  );
};

export default EmptySearchResults;

