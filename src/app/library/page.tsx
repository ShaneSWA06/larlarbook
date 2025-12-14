"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/providers/sidebar-provider";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import { getBookCoverUrl } from "@/lib/r2";

interface Book {
  id: string;
  bookName: string;
  bookCoverPath?: string;
  description?: string;
  status?: string;
  author?: {
    authorName: string;
  };
  bookGenres?: Array<{
    genre: {
      genreName: string;
    };
  }>;
}

export default function LibraryPage() {
  const { expanded: sidebarExpanded, toggle } = useSidebar();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      // Fetch all books
      const response = await fetch(`/api/books?limit=100&offset=0`);
      const data = await response.json();

      if (data.success) {
        setBooks(data.books || []);
      }
    } catch (err) {
      console.error("Error loading books:", err);
    } finally {
      setLoading(false);
    }
  };

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

          {loading ? (
            <div className="text-center text-gray-400 py-20">
              Loading books...
            </div>
          ) : books.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              <p className="text-lg mb-2">No books in library yet</p>
              <p className="text-sm">Books will appear here as they are added</p>
            </div>
          ) : (
            <section className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-semibold">All Books</h2>
                <p className="text-gray-400 text-sm">{books.length} books</p>
              </div>

              {/* Books Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {books.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => router.push(`/books/${book.id}`)}
                    className="group cursor-pointer"
                  >
                    {/* Book Cover */}
                    <div className="relative aspect-[2/3] bg-[#2A2A2A] rounded-lg overflow-hidden mb-2">
                      {(() => {
                        const coverUrl = getBookCoverUrl(book.bookCoverPath);
                        return coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={book.bookName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-500 text-3xl font-bold">${book.bookName.charAt(0)}</div>`;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-3xl font-bold">
                            {book.bookName.charAt(0)}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Book Info */}
                    <div>
                      <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
                        {book.bookName}
                      </h3>
                      {book.author && (
                        <p className="text-gray-400 text-xs">
                          {book.author.authorName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}