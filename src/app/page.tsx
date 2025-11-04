"use client";
import { useState } from "react";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";

// Category chips (History removed)
const categories = [
  "Economics",
  "Romance",
  "Economics",
  "Romance",
  "Economics",
  "Romance",
];

export default function Home() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Header (full width) */}
      <Header onToggleSidebar={() => setSidebarExpanded((v) => !v)} />
      {/* Divider below header (full width) */}
      <div className="w-full h-[1px] bg-[#454545]"></div>

      {/* Sidebar */}
      <Sidebar expanded={sidebarExpanded} />

      {/* Main Content */}
      <div className={`min-h-screen transition-all duration-300 ease-in-out ${sidebarExpanded ? "ml-64" : "ml-20"}`}>
        {/* Main Content Area */}
        <main className="p-6">
          {/* Category Navigation */}
          <div className="mb-8">
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    index === 0
                      ? "bg-logo-purple text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Book sections removed per request */}
        </main>
      </div>
    </div>
  );
}
