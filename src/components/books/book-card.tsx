import Image from "next/image";
import Link from "next/link";
import { BookWithRelations } from "@/types";
import { getBookCoverUrl } from "@/lib/r2";

interface BookCardProps {
  book: BookWithRelations;
}

export default function BookCard({ book }: BookCardProps) {
  const genres = book.bookGenres?.map((bg) => bg.genre?.genreName).filter(Boolean).join(", ") || "Uncategorized";
  const authorName = book.author?.authorName || "Unknown Author";

  const coverImageSrc = getBookCoverUrl(book.bookCoverPath);

  return (
    <Link href={`/books/${book.id}`} className="group">
      <div className="bg-brown rounded-lg overflow-hidden border border-[#454545] hover:border-p3 transition-all duration-200 hover:scale-105">
        {/* Book Cover */}
        <div className="relative aspect-[2/3] bg-[#232323]">
          {coverImageSrc ? (
            <Image
              src={coverImageSrc}
              alt={book.bookName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="p-3">
          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1 group-hover:text-p3 transition-colors">
            {book.bookName}
          </h3>
          <p className="text-gray-400 text-xs mb-2">{authorName}</p>
          <p className="text-gray-500 text-xs line-clamp-1">{genres}</p>
          {book.price && (
            <p className="text-p3 font-semibold text-sm mt-2">
              ${Number(book.price).toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
