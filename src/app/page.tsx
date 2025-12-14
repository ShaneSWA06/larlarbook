"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/providers/sidebar-provider";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import { Star } from "lucide-react";
import { getBookCoverUrl } from "@/lib/r2";

interface Book {
  id: string;
  bookName: string;
  subtitle?: string;
  description?: string;
  bookCoverPath?: string;
  authors?: Array<{
    authorName: string;
    authorProfileImageUrl?: string;
  }>;
  bookGenres?: Array<{
    genre: {
      genreName: string;
    };
  }>;
}

// Reusable Book Cover Component with error handling
const BookCover = ({
  bookCoverPath,
  bookName,
  className = "",
  textSize = "text-2xl",
}: {
  bookCoverPath?: string;
  bookName: string;
  className?: string;
  textSize?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const coverUrl = getBookCoverUrl(bookCoverPath);
  const hasValidCover = coverUrl && !imageError;

  return (
    <>
      {hasValidCover ? (
        <img
          src={coverUrl}
          alt={bookName}
          className={className}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center text-[#9d6db8] ${textSize} font-bold bg-[#2A2A2A]`}
        >
          {bookName.charAt(0).toUpperCase()}
        </div>
      )}
    </>
  );
};

export default function Home() {
  const router = useRouter();
  const { expanded: sidebarExpanded, toggle } = useSidebar();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const genres = ["History", "Economics", "Romance", "Fiction", "Politics"];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/books?limit=20&offset=0`);
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

  // Book Card Component
  const BookCard = ({
    book,
    showProgress = false,
    showRank = false,
    rank = 0,
  }: {
    book: Book;
    showProgress?: boolean;
    showRank?: boolean;
    rank?: number;
  }) => (
    <div
      onClick={() => router.push(`/books/${book.id}`)}
      className="group cursor-pointer flex-shrink-0"
    >
      <div className="relative">
        {showRank && (
          <div className="absolute -left-4 top-0 z-10 w-12 h-12 bg-[#67377e] rounded-full flex items-center justify-center text-white font-bold text-xl">
            {rank}
          </div>
        )}
        <div className="relative aspect-[2/3] bg-[#2A2A2A] rounded-lg overflow-hidden mb-2 w-40">
          <BookCover
            bookCoverPath={book.bookCoverPath}
            bookName={book.bookName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            textSize="text-2xl"
          />
        </div>
        {showProgress && (
          <div className="relative w-40 h-6 bg-[#454545] rounded overflow-hidden">
            <div
              className="h-full bg-[#67377e] flex items-center justify-end pr-2"
              style={{ width: "60%" }}
            >
              <span className="text-white text-xs font-medium">60%</span>
            </div>
          </div>
        )}
        <h3 className="text-[#eeeeee] font-medium text-sm line-clamp-2 mb-1">
          {book.bookName}
        </h3>
        {book.authors && book.authors.length > 0 && (
          <p className="text-gray-400 text-xs line-clamp-1">
            {book.authors[0].authorName}
          </p>
        )}
      </div>
    </div>
  );

  // Recommended Book Card (with description)
  const RecommendedBookCard = ({ book }: { book: Book }) => (
    <div
      onClick={() => router.push(`/books/${book.id}`)}
      className="group cursor-pointer flex-shrink-0 w-80"
    >
      <div className="flex gap-4">
        <div className="relative aspect-[2/3] bg-[#2A2A2A] rounded-lg overflow-hidden w-32 flex-shrink-0">
          <BookCover
            bookCoverPath={book.bookCoverPath}
            bookName={book.bookName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            textSize="text-xl"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-[#eeeeee] font-semibold text-lg mb-2 line-clamp-2">
            {book.bookName}
          </h3>
          {book.description && (
            <p className="text-[#eeeeee] text-sm mb-3 line-clamp-3 opacity-80">
              {book.description}
            </p>
          )}
          {book.bookGenres && book.bookGenres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {book.bookGenres.slice(0, 3).map((bg, idx) => (
                <span
                  key={idx}
                  className="bg-[#221f20] border border-[#454545] text-[#d1b9f0] px-2 py-1 rounded text-xs"
                >
                  {bg.genre.genreName}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Series Card
  const SeriesCard = ({ books }: { books: Book[] }) => (
    <div
      onClick={() => router.push(`/books/${books[0]?.id}`)}
      className="group cursor-pointer flex-shrink-0 w-96"
    >
      <div className="flex gap-2 mb-3">
        {books.slice(0, 6).map((book, idx) => (
          <div
            key={idx}
            className="relative aspect-[2/3] bg-[#2A2A2A] rounded-lg overflow-hidden w-16 flex-shrink-0"
          >
            <BookCover
              bookCoverPath={book.bookCoverPath}
              bookName={book.bookName}
              className="w-full h-full object-cover"
              textSize="text-xs"
            />
          </div>
        ))}
      </div>
      <h3 className="text-[#eeeeee] font-semibold text-base mb-2 line-clamp-1">
        {books[0]?.bookName}
      </h3>
      {books[0]?.description && (
        <p className="text-[#eeeeee] text-sm mb-3 line-clamp-2 opacity-80">
          {books[0].description}
        </p>
      )}
      {books[0]?.bookGenres && books[0].bookGenres.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {books[0].bookGenres.slice(0, 3).map((bg, idx) => (
            <span
              key={idx}
              className="bg-[#221f20] border border-[#454545] text-[#d1b9f0] px-2 py-1 rounded text-xs"
            >
              {bg.genre.genreName}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // Business Book Card
  const BusinessBookCard = ({ book }: { book: Book }) => (
    <div
      onClick={() => router.push(`/books/${book.id}`)}
      className="group cursor-pointer"
    >
      <div className="flex gap-4 mb-4">
        <div className="relative aspect-[2/3] bg-[#2A2A2A] rounded-lg overflow-hidden w-24 flex-shrink-0">
          <BookCover
            bookCoverPath={book.bookCoverPath}
            bookName={book.bookName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            textSize="text-lg"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-[#eeeeee] font-semibold text-base mb-1 line-clamp-2">
            {book.bookName}
          </h3>
          {book.authors && book.authors.length > 0 && (
            <p className="text-gray-400 text-sm mb-2">
              {book.authors[0].authorName}
            </p>
          )}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-4 h-4 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <span className="text-[#eeeeee] text-sm">25K</span>
          </div>
          {book.bookGenres && book.bookGenres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {book.bookGenres.slice(0, 3).map((bg, idx) => (
                <span
                  key={idx}
                  className="bg-[#221f20] border border-[#454545] text-[#d1b9f0] px-2 py-1 rounded text-xs"
                >
                  {bg.genre.genreName}
                </span>
              ))}
            </div>
          )}
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
        <main className="p-6">
          {/* Genre Tags - Horizontal Scrollable */}
          <div className="mb-8 overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 pb-2">
              {genres.map((genre, idx) => (
                <button
                  key={idx}
                  className="flex-shrink-0 bg-[#221f20] hover:bg-[#2A2A2A] text-[#eeeeee] px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-20">
              Loading books...
            </div>
          ) : (
            <>
              {/* Continue Reading Section */}
              <section className="mb-12">
                <h2 className="text-[#eeeeee] text-xl font-semibold mb-4">
                  Continue Reading
                </h2>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
                  {books.slice(0, 4).map((book) => (
                    <BookCard key={book.id} book={book} showProgress={true} />
                  ))}
                </div>
              </section>

              {/* Recommended Books Section */}
              <section className="mb-12">
                <h2 className="text-[#eeeeee] text-xl font-semibold mb-4">
                  Recommended Books
                </h2>
                <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                  {books.slice(0, 3).map((book) => (
                    <RecommendedBookCard key={book.id} book={book} />
                  ))}
                </div>
              </section>

              {/* Trending Books Section */}
              <section className="mb-12">
                <h2 className="text-[#eeeeee] text-xl font-semibold mb-4">
                  Trending Books
                </h2>
                <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                  {books.slice(0, 3).map((book, idx) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      showRank={true}
                      rank={idx + 1}
                    />
                  ))}
                </div>
              </section>

              {/* Recommended Series Section */}
              <section className="mb-12">
                <h2 className="text-[#eeeeee] text-xl font-semibold mb-4">
                  Recommended Series
                </h2>
                <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                  {books.length >= 6 && (
                    <>
                      <SeriesCard books={books.slice(0, 6)} />
                      {books.length >= 12 && (
                        <SeriesCard books={books.slice(6, 12)} />
                      )}
                    </>
                  )}
                </div>
              </section>

              {/* Business Section */}
              <section className="mb-12">
                <h2 className="text-[#eeeeee] text-xl font-semibold mb-4">
                  Business
                </h2>
                <div className="grid grid-cols-2 gap-6 max-w-4xl">
                  {books.slice(0, 6).map((book) => (
                    <BusinessBookCard key={book.id} book={book} />
                  ))}
                </div>
              </section>

              {/* Quotes Section */}
              <section className="mb-12">
                <h2 className="text-[#eeeeee] text-xl font-semibold mb-4">
                  Quotes
                </h2>
                <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-80 bg-[#221f20] rounded-lg p-6"
                    >
                      <div className="flex gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-[#67377e] flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-[#eeeeee] text-sm mb-2 line-clamp-3">
                            After 'Stand proud.' opened up his domain...
                          </p>
                          <p className="text-gray-400 text-xs">- Obama</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4].map((j) => (
                            <Star
                              key={j}
                              className="w-4 h-4 text-yellow-400 fill-yellow-400"
                            />
                          ))}
                        </div>
                        <span className="text-[#eeeeee] text-sm">25K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Similar to Barack Hussein Obanos Section */}
              <section className="mb-12">
                <h2 className="text-[#eeeeee] text-xl font-semibold mb-4">
                  Similar to Barack Hussein Obanos
                </h2>
                <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 text-center cursor-pointer group"
                    >
                      <div className="w-24 h-24 rounded-full bg-[#67377e] mx-auto mb-3 group-hover:opacity-80 transition-opacity"></div>
                      <p className="text-[#eeeeee] text-sm font-medium mb-1">
                        Barack Hussein Obanos
                      </p>
                      <p className="text-gray-400 text-xs">6,000 Followers</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Similar to The Bell Jar Section */}
              <section className="mb-12">
                <h2 className="text-[#eeeeee] text-xl font-semibold mb-4">
                  Similar to The Bell Jar
                </h2>
                <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                  {books.slice(0, 3).map((book) => (
                    <RecommendedBookCard key={book.id} book={book} />
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
