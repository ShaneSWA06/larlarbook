import Header from "@/components/ui/header";
import BookCard from "@/components/ui/book-card";
import FallbackImage from "@/components/ui/fallback-image";

// Sample data for demonstration
const continueReadingBooks = [
  {
    id: "1",
    title: "A Guide to Good Life",
    author: "William B. Irvine",
    progress: 60,
    coverUrl: "/books/guide-good-life.jpg",
  },
  {
    id: "2",
    title: "လူ့ဘဝမှတ်တမ်း",
    author: "Robert Greene",
    progress: 60,
    coverUrl: "/books/human-record.jpg",
  },
  {
    id: "3",
    title: "သုံးစာမျက်နှာ စီးပွားရေး",
    author: "Allan Dib",
    progress: 60,
    coverUrl: "/books/three-page-business.jpg",
  },
  {
    id: "4",
    title: "The Intelligent Investor",
    author: "Benjamin Graham",
    progress: 60,
    coverUrl: "/books/intelligent-investor.jpg",
  },
];

const recommendedBooks = [
  {
    id: "1",
    title: "A Guide to Good Life",
    author: "William B. Irvine",
    price: 5000,
    rating: 4.5,
    description:
      "The rise of Buddhist nationalism and the creation of the Muslim other in Myanmar. A boy gets kicked out of school for missing attendance, he'll now have to forfeit his tuition grant. Further...",
    coverUrl: "/books/guide-good-life.jpg",
    category: "Politics",
  },
  {
    id: "2",
    title: "Myanmar's Enemy Within",
    author: "Francis Wade",
    price: 3500,
    rating: 4.2,
    description:
      "The rise of Buddhist nationalism and the creation of the Muslim other in Myanmar.",
    coverUrl: "/books/myanmar-enemy.jpg",
    category: "Politics",
  },
  {
    id: "3",
    title: "သုံးစာမျက်နှာ စီးပွားရေး",
    author: "Allan Dib",
    price: 0,
    rating: 4.8,
    description:
      "မြန်မာ့စီးပွားရေး နည်းလမ်းများကို ရိုးရှင်းစွာ ဖော်ပြထားသည့် စာအုပ်။",
    coverUrl: "/books/three-page-business.jpg",
    category: "Politics",
  },
  {
    id: "4",
    title: "The Bluest Eyes",
    author: "Pecola Breedlove",
    price: 8000,
    rating: 4.6,
    description:
      "Pecola Breedlove longs for blond hair and blue eyes, so that she will be as beautiful and beloved as all the blond, blue-eyed children in America. In the autumn of 1941, the marigolds in her garden will not bloom, and her wish will not come...",
    coverUrl: "/books/bluest-eyes.jpg",
    category: "Politics",
  },
  {
    id: "5",
    title: "The Bluest Eyes",
    author: "Pecola Breedlove",
    price: 8000,
    rating: 4.6,
    description:
      "Pecola Breedlove longs for blond hair and blue eyes, so that she will be as beautiful and beloved as all the blond, blue-eyed children in America. In the autumn of 1941, the marigolds in her garden will not bloom, and her wish will not come...",
    coverUrl: "/books/bluest-eyes.jpg",
    category: "Politics",
  },
];

const trendingBooks = [
  {
    id: "1",
    title: "The Bluest Eyes",
    author: "Pecola Breedlove",
    description:
      "Pecola Breedlove longs for blond hair and blue eyes, so that she will be as beautiful and beloved as all the blond, blue-eyed children in America. In the autumn of 1941, the marigolds in her garden will not bloom, and her wish will not come...",
    coverUrl: "/books/bluest-eyes.jpg",
    category: "Politics",
    rank: 1,
  },
  {
    id: "2",
    title: "The Bluest Eyes",
    author: "Pecola Breedlove",
    description:
      "Pecola Breedlove longs for blond hair and blue eyes, so that she will be as beautiful and beloved as all the blond, blue-eyed children in America. In the autumn of 1941, the marigolds in her garden will not bloom, and her wish will not come...",
    coverUrl: "/books/bluest-eyes.jpg",
    category: "Politics",
    rank: 2,
  },
  {
    id: "3",
    title: "The Bluest Eyes",
    author: "Pecola Breedlove",
    description:
      "Pecola Breedlove longs for blond hair and blue eyes, so that she will be as beautiful and beloved as all the blond, blue-eyed children in America. In the autumn of 1941, the marigolds in her garden will not bloom, and her wish will not come...",
    coverUrl: "/books/bluest-eyes.jpg",
    category: "Politics",
    rank: 3,
  },
];

const categories = [
  "History",
  "Economics",
  "Romance",
  "History",
  "Economics",
  "Romance",
  "History",
  "Economics",
  "History",
  "Romance",
  "Economics",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Main Content */}
      <div className="min-h-screen">
        {/* Header */}
        <Header />
        {/* Divider below header */}
        <div className="w-[95%] mx-auto h-[1px] bg-[#454545]"></div>

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

          {/* Continue Reading Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Continue Reading
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {continueReadingBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="aspect-[3/4] bg-gray-200 relative">
                    <FallbackImage
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      fallbackText={book.title}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{book.author}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-logo-purple h-2 rounded-full"
                        style={{ width: `${book.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">{book.progress}%</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended Books Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recommended Books
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {recommendedBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="aspect-[3/4] bg-gray-200 relative">
                    <FallbackImage
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      fallbackText={book.title}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-3">
                      {book.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {book.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Books Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Trending Books
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trendingBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden relative"
                >
                  {/* Rank Number */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="w-12 h-12 bg-logo-purple text-white rounded-full flex items-center justify-center text-xl font-bold">
                      {book.rank}
                    </div>
                  </div>

                  <div className="flex">
                    <div className="w-32 aspect-[3/4] bg-gray-200 flex-shrink-0">
                      <FallbackImage
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        fallbackText={book.title}
                      />
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {book.author}
                      </p>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-4">
                        {book.description}
                      </p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {book.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
