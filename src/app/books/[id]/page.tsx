"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import {
  Bookmark,
  Download,
  Share2,
  Eye,
  Users,
  BookOpen,
  Star,
  ChevronDown,
} from "lucide-react";
import { getBookCoverUrl } from "@/lib/r2";

interface Book {
  id: string;
  bookName: string;
  subtitle?: string;
  description?: string;
  bookCoverPath?: string;
  language?: string;
  price?: number;
  authors?: Array<{
    id: string;
    authorName: string;
    authorProfileImageUrl?: string;
  }>;
  bookGenres?: Array<{
    genre: {
      genreName: string;
    };
  }>;
}

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const { expanded: sidebarExpanded, toggle } = useSidebar();
  const bookId = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  useEffect(() => {
    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/books/${bookId}`);
      const data = await response.json();

      if (data.success && data.book) {
        setBook(data.book);
        if (data.book.language) {
          setSelectedLanguage(data.book.language);
        }
      }
    } catch (error) {
      console.error("Error fetching book:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center text-[#eeeeee]">
        <div>Loading...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center text-[#eeeeee]">
        <div>Book not found</div>
      </div>
    );
  }

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
          <div className="flex gap-8 max-w-7xl mx-auto">
            {/* Left Panel - Book Cover and Actions */}
            <div className="flex-shrink-0 w-80">
              {/* Book Cover */}
              <div className="relative aspect-[2/3] bg-[#2A2A2A] rounded-lg overflow-hidden mb-6">
                {(() => {
                  const coverUrl = getBookCoverUrl(book.bookCoverPath);
                  return coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={book.bookName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl font-bold">
                      {book.bookName.charAt(0)}
                    </div>
                  );
                })()}
              </div>

              {/* Read Button */}
              <button
                onClick={() => router.push(`/books/${bookId}/read`)}
                className="w-full bg-[#67377e] hover:bg-[#5a2f6b] text-white font-semibold py-3 px-6 rounded-lg mb-3 transition-colors"
              >
                Read
              </button>

              {/* Read Later Button */}
              <button className="w-full bg-[#221f20] hover:bg-[#2A2A2A] text-[#eeeeee] font-medium py-3 px-6 rounded-lg mb-4 transition-colors">
                Read Later
              </button>

              {/* Language Selector */}
              <div className="mb-4">
                <button className="w-full bg-[#221f20] hover:bg-[#2A2A2A] text-[#eeeeee] font-medium py-3 px-4 rounded-lg flex items-center justify-between transition-colors">
                  <span>{selectedLanguage}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Action Icons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-[#221f20] hover:bg-[#2A2A2A] text-[#9d6db8] hover:text-[#67377e] p-3 rounded-lg transition-colors flex items-center justify-center">
                  <Bookmark className="w-5 h-5" strokeWidth={2.5} />
                </button>
                <button className="flex-1 bg-[#221f20] hover:bg-[#2A2A2A] text-[#9d6db8] hover:text-[#67377e] p-3 rounded-lg transition-colors flex items-center justify-center">
                  <Download className="w-5 h-5" strokeWidth={2.5} />
                </button>
                <button className="flex-1 bg-[#221f20] hover:bg-[#2A2A2A] text-[#9d6db8] hover:text-[#67377e] p-3 rounded-lg transition-colors flex items-center justify-center">
                  <Share2 className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Right Panel - Book Details */}
            <div className="flex-1">
              {/* Title */}
              <h1 className="text-[#eeeeee] text-4xl font-bold mb-2">
                {book.bookName}
              </h1>

              {/* Subtitle */}
              {book.subtitle && (
                <p className="text-[#eeeeee] text-xl opacity-80 mb-4">
                  {book.subtitle}
                </p>
              )}

              {/* Authors */}
              {book.authors && book.authors.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  {book.authors.map((author, idx) => (
                    <div key={author.id} className="flex items-center gap-2">
                      {author.authorProfileImageUrl ? (
                        <img
                          src={author.authorProfileImageUrl}
                          alt={author.authorName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#67377e] flex items-center justify-center text-white text-xs">
                          {author.authorName.charAt(0)}
                        </div>
                      )}
                      <span className="text-[#eeeeee] text-sm">
                        {author.authorName}
                      </span>
                      {idx < book.authors!.length - 1 && (
                        <span className="text-[#eeeeee] opacity-50">,</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Engagement Metrics */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2 text-[#eeeeee]">
                  <Eye className="w-5 h-5 text-[#9d6db8]" />
                  <span className="text-sm">
                    {book.price ? `${book.price} kyats` : "Free"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#eeeeee]">
                  <Users className="w-5 h-5 text-[#9d6db8]" />
                  <span className="text-sm">2k+ read</span>
                </div>
                <div className="flex items-center gap-2 text-[#eeeeee]">
                  <BookOpen className="w-5 h-5 text-[#9d6db8]" />
                  <span className="text-sm">5 Books</span>
                </div>
                <div className="flex items-center gap-2 text-[#eeeeee]">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm">25k+</span>
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div className="mb-6">
                  <p className="text-[#eeeeee] leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Tags/Genres */}
              {book.bookGenres && book.bookGenres.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {book.bookGenres.map((bg, idx) => (
                      <span
                        key={idx}
                        className="bg-[#221f20] border border-[#454545] text-[#d1b9f0] px-4 py-2 rounded-lg text-sm"
                      >
                        {bg.genre.genreName} 34K
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="mb-8">
                <button className="bg-[#221f20] hover:bg-[#2A2A2A] text-[#eeeeee] font-medium py-3 px-6 rounded-lg transition-colors">
                  Comments
                </button>
              </div>

              {/* Recommended Books Section */}
              <div>
                <h2 className="text-[#eeeeee] text-2xl font-bold mb-4">
                  Recommended Books
                </h2>
                <div className="grid grid-cols-5 gap-4">
                  {/* Placeholder for recommended books */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="aspect-[2/3] bg-[#2A2A2A] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        Book {i}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
