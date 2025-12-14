"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import { PenLine, Layers } from "lucide-react";
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

export default function BooksPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { expanded: sidebarExpanded, toggle } = useSidebar();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBooks();
    } else if (session === null) {
      // Session loaded but no user - set loading to false
      setLoading(false);
    }
  }, [session]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      if (!session?.user?.id) {
        console.error("No user ID available");
        setBooks([]);
        return;
      }
      // Fetch only the current user's books
      const response = await fetch(`/api/books?limit=50&offset=0&userId=${session.user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setBooks(data.books || []);
      } else {
        console.error("Failed to fetch books:", data.error);
        setBooks([]);
      }
    } catch (err) {
      console.error("Error loading books:", err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter books by status
  const drafts = books.filter((book) => book.status === "draft");
  const published = books.filter((book) => book.status === "published");

  const BookCard = ({ book }: { book: Book }) => (
    <div
      onClick={() => router.push(`/books/${book.id}/write`)}
      className="group cursor-pointer bg-[#221f20] rounded-lg overflow-hidden hover:opacity-90 transition-opacity flex flex-col"
    >
      <div className="flex gap-4 p-4 flex-1">
        {/* Book Cover - Left Side */}
        <div className="flex-shrink-0 w-32">
          <div className="relative aspect-[2/3] bg-[#2A2A2A] rounded-lg overflow-hidden">
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
                      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-500 text-2xl font-bold">${book.bookName.charAt(0)}</div>`;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl font-bold">
                  {book.bookName.charAt(0)}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Book Info - Right Side */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1">
            <h3 className="text-[#eeeeee] font-semibold text-lg mb-2 line-clamp-2">
              {book.bookName}
            </h3>
            {book.description && (
              <p className="text-[#eeeeee] text-sm mb-3 line-clamp-2">
                {book.description}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Genre Tags - Bottom */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-1">
          {book.bookGenres?.slice(0, 5).map((bg, idx) => (
            <span
              key={idx}
              className="text-xs text-[#d1b9f0] bg-[#221f20] px-2 py-1 rounded border border-[#454545]"
            >
              {bg.genre.genreName}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const SeriesCard = ({ books }: { books: Book[] }) => (
    <div className="group cursor-pointer flex-shrink-0 w-80">
      {/* Series Preview - Show multiple book covers side by side */}
      <div className="flex gap-2 mb-3">
        {books.slice(0, 5).map((book, idx) => {
          const coverUrl = getBookCoverUrl(book.bookCoverPath);
          return (
            <div key={idx} className="flex-shrink-0 w-16">
              <div className="relative aspect-[2/3] bg-[#2A2A2A] rounded-lg overflow-hidden">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={book.bookName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold">
                    {book.bookName.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Series Info */}
      <div>
        <h3 className="text-white font-semibold text-base mb-2">
          {books[0]?.bookName}
        </h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-3">
          {books[0]?.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {books[0]?.bookGenres?.slice(0, 5).map((bg, idx) => (
            <span
              key={idx}
              className="text-xs text-gray-400 bg-[#2A2A2A] px-2 py-1 rounded"
            >
              {bg.genre.genreName}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#181818]">
      <Header onToggleSidebar={toggle} />
      <div className="w-full h-[1px] bg-[#454545]"></div>
      <Sidebar expanded={sidebarExpanded} />

      <div
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          sidebarExpanded ? "ml-64" : "ml-20"
        }`}
      >
        <main className="p-8">
          {/* Header with Actions */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-white text-3xl font-bold">Write</h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/books/upload")}
                className="flex items-center gap-2 bg-[#67377e] hover:bg-[#5a2f6b] text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <PenLine className="w-5 h-5" />
                Write Book
              </button>
              <button
                onClick={() => alert("Make Series feature coming soon!")}
                className="flex items-center gap-2 bg-[#67377e] hover:bg-[#5a2f6b] text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <Layers className="w-5 h-5" />
                Make Series
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-20">
              Loading books...
            </div>
          ) : (
            <>
              {/* Drafts Section */}
              {drafts.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-white text-xl font-semibold mb-4">
                    Drafts
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {drafts.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                </section>
              )}

              {/* Published Books Section */}
              {published.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-white text-xl font-semibold mb-4">
                    Published Books
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {published.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                </section>
              )}

              {/* Published Series Section */}
              {published.length >= 3 && (
                <section className="mb-12">
                  <h2 className="text-white text-xl font-semibold mb-4">
                    Published Series
                  </h2>
                  <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    <SeriesCard books={published.slice(0, 3)} />
                    {published.length >= 6 && (
                      <SeriesCard books={published.slice(3, 6)} />
                    )}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {books.length === 0 && (
                <div className="text-center text-gray-400 py-20">
                  <PenLine className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No books yet</p>
                  <p className="text-sm mb-6">
                    Start writing your first book!
                  </p>
                  <button
                    onClick={() => router.push("/books/upload")}
                    className="bg-[#67377e] hover:bg-[#5a2f6b] text-white font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    Write Book
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
