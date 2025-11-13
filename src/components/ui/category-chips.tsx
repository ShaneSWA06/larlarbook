"use client";
import { useState, useMemo } from "react";

type CategoryChipsProps = {
  categories: string[];
  selected?: string;
  onChange?: (category: string) => void;
  className?: string;
};

export default function CategoryChips({ categories, selected, onChange, className }: CategoryChipsProps) {
  const [internalSelected, setInternalSelected] = useState<string>(selected ?? categories[0] ?? "");
  const active = selected ?? internalSelected;

  const items = useMemo(() => Array.from(new Set(categories)), [categories]);

  return (
    <div className={"mb-8 " + (className ?? "")}> 
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
        {items.map((category) => {
          const isActive = category === active;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                if (!selected) setInternalSelected(category);
                onChange?.(category);
              }}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all border ${
                isActive
                  ? "bg-logo-purple text-white border-transparent shadow-lg scale-105"
                  : "bg-[#232323] text-gray-300 border-[#454545] hover:bg-[#2a2a2a] hover:scale-105"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
