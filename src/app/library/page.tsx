"use client";
import { useSidebar } from "@/components/providers/sidebar-provider";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";

// Library sections based on the provided screenshot
const librarySections = [
  "Continue Reading",
  "Notes",
  "Purchased Books",
  "Read Later Books",
  "Read Later Series",
];

export default function LibraryPage() {
  const { expanded: sidebarExpanded, toggle } = useSidebar();

  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Header */}
      <Header onToggleSidebar={toggle} />
      {/* Divider */}
      <div className="w-full h-[1px] bg-[#454545]"></div>

      {/* Sidebar */}
      <Sidebar expanded={sidebarExpanded} />

      {/* Main Content */}
      <div
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          sidebarExpanded ? "ml-64" : "ml-20"
        }`}
      >
        <main className="p-6">
          {/* Page Title */}
          <h1 className="text-white text-2xl font-bold mb-4">Library</h1>

          {/* Sections */}
          {librarySections.map((title) => (
            <section key={title} className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-semibold">{title}</h2>
                {/* Placeholder actions (filter, view all) */}
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 rounded-md text-sm bg-[#232323] text-gray-300 border border-[#454545]">
                    View All
                  </button>
                </div>
              </div>

              {/* Placeholder grid for future dynamic content */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, idx) => (
                  <div
                    key={idx}
                    className="h-40 bg-brown border border-[#454545] rounded-lg flex items-center justify-center text-gray-400"
                  >
                    Coming soon
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}