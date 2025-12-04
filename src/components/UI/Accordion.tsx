import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className = "",
}) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`divide-y divide-mono-200 ${className}`}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        return (
          <div key={item.id}>
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between py-4 text-left transition-colors hover:bg-mono-50"
            >
              <span className="font-medium text-mono-900">{item.title}</span>
              <FiChevronDown
                className={`w-5 h-5 text-mono-500 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? "max-h-screen pb-4" : "max-h-0"
              }`}
            >
              <div className="text-mono-600">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;

