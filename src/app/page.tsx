"use client";
import { useState } from "react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import CategoryChips from "@/components/ui/category-chips";
import { defaultCategories } from "@/data/categories";

// Section templates to scaffold the body
const sectionTitles = [
  "Continue Reading",
  "Recommended Books",
  "Trending Books",
  "Recommended Series",
  "Business",
];

export default function Home() {
  const { expanded: sidebarExpanded, toggle } = useSidebar();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    defaultCategories[0]
  );
  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Header (full width) */}
      <Header onToggleSidebar={toggle} />
      {/* Divider below header (full width) */}
      <div className="w-full h-[1px] bg-[#454545]"></div>

      {/* Sidebar */}
      <Sidebar expanded={sidebarExpanded} />

      {/* Main Content */}
      <div
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          sidebarExpanded ? "ml-64" : "ml-20"
        }`}
      >
        {/* Main Content Area */}
        <main className="p-6">
          <CategoryChips
            categories={defaultCategories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />

          {/* Template Sections (no books yet) */}
          {sectionTitles.map((title) => (
            <section key={title} className="mt-10">
              <h2 className="text-white text-lg font-semibold">{title}</h2>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
