import React from "react";
import { useNavigate } from "react-router-dom";
import { useCompare } from "../../contexts/CompareContext";
import { ArrowsRightLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CompareFloatingButton: React.FC = () => {
  const navigate = useNavigate();
  const { compareCount, clearCompare } = useCompare();

  if (compareCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3">
      {/* Clear Button */}
      <button
        onClick={clearCompare}
        className="bg-mono-100 hover:bg-mono-200 text-mono-700 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        title="Xóa tất cả"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>

      {/* Main Compare Button */}
      <button
        onClick={() => navigate("/compare")}
        className="bg-mono-black hover:bg-mono-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 transition-all duration-200 hover:scale-105"
      >
        <ArrowsRightLeftIcon className="h-5 w-5" />
        <span className="font-medium">So sánh ({compareCount})</span>
      </button>
    </div>
  );
};

export default CompareFloatingButton;
