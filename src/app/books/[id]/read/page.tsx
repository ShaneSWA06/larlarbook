"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  List,
  Menu,
  Copy,
  BookOpen,
  Download,
} from "lucide-react";
import { getBookCoverUrl, getPdfUrl } from "@/lib/r2";
import PDFReader from "@/components/pdf/PDFReader";

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export default function ReadBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  const [bookTitle, setBookTitle] = useState("");
  const [bookCoverPath, setBookCoverPath] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [contentType, setContentType] = useState<"json" | "pdf" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notesPanelOpen, setNotesPanelOpen] = useState(false);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(
    "medium"
  );
  const [viewMode, setViewMode] = useState<"default" | "copy" | "book">("copy");
  const [theme, setTheme] = useState<"thic" | "focus" | "calm" | "light">(
    "focus"
  );
  const [loading, setLoading] = useState(true);

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
        setBookTitle(data.book.bookName || "");
        setBookCoverPath(data.book.bookCoverPath || "");
        
        // Check if book has PDF content
        if (data.book.bookContent?.pdfPath && data.book.bookContent?.contentType === "pdf") {
          setPdfPath(data.book.bookContent.pdfPath);
          setContentType("pdf");
        } else if (data.book.chapters && data.book.chapters.length > 0) {
          // Use JSON chapters
          setChapters(data.book.chapters);
          setCurrentChapterIndex(0);
          setContentType("json");
        } else {
          setContentType(null);
        }
      }
    } catch (error) {
      console.error("Error fetching book:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentChapter = chapters[currentChapterIndex];

  // Get theme colors
  const getThemeColors = () => {
    switch (theme) {
      case "thic":
        return {
          bg: "bg-gray-200",
          text: "text-gray-900",
        };
      case "focus":
        return {
          bg: "bg-[#181818]",
          text: "text-[#eeeeee]",
        };
      case "calm":
        return {
          bg: "bg-gray-800",
          text: "text-[#eeeeee]",
        };
      case "light":
        return {
          bg: "bg-amber-50",
          text: "text-gray-900",
        };
      default:
        return {
          bg: "bg-[#181818]",
          text: "text-[#eeeeee]",
        };
    }
  };

  const themeColors = getThemeColors();

  // Get font size class
  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small":
        return "text-sm";
      case "medium":
        return "text-base";
      case "large":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center text-[#eeeeee]">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${themeColors.bg} ${themeColors.text} relative`}
    >
      {/* Header Bar */}
      <div className="bg-[#181818] border-b border-[#454545] px-6 py-4 flex items-center justify-between sticky top-0 z-30 relative">
        {/* Left: Back Button */}
        <button
          onClick={() => router.back()}
          className="text-[#9d6db8] hover:text-[#67377e] transition-colors z-10"
        >
          <ArrowLeft className="w-7 h-7" strokeWidth={3} />
        </button>

        {/* Center: Book Cover/Title Circle - Hidden when menu is open */}
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
            menuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="w-22 h-22 rounded-full bg-[#221f20] flex items-center justify-center overflow-hidden mt-13">
            {(() => {
              const coverUrl = getBookCoverUrl(bookCoverPath);
              return coverUrl ? (
                <img
                  src={coverUrl}
                  alt={bookTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#eeeeee] text-xs font-semibold text-center px-2 line-clamp-1">
                  {bookTitle || "Book"}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-4 ml-auto z-10">
          <button className="text-[#9d6db8] hover:text-[#67377e] transition-colors">
            <Search className="w-7 h-7" strokeWidth={3} />
          </button>
          <button
            onClick={() => setNotesPanelOpen(!notesPanelOpen)}
            className={`transition-all rounded-lg p-1.5 ${
              notesPanelOpen
                ? "bg-[#67377e]"
                : "text-[#9d6db8] hover:text-[#67377e] hover:bg-[#221f20]"
            }`}
          >
            <img
              src={notesPanelOpen ? "/listWhite.png" : "/list.png"}
              alt="List"
              className="w-7 h-7"
            />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`transition-all rounded-lg p-1.5 ${
              menuOpen
                ? "bg-[#67377e] text-white"
                : "text-[#9d6db8] hover:text-[#67377e] hover:bg-[#221f20]"
            }`}
          >
            <Menu className="w-7 h-7" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex">
        {/* Reading Content */}
        <div
          className={`flex-1 transition-all duration-300 ${
            contentType === "pdf" ? "pb-0" : "pb-32"
          } ${
            menuOpen ? "mr-80" : notesPanelOpen ? "mr-96" : "mr-0"
          }`}
        >
          {contentType === "pdf" && pdfPath ? (
            <div className="h-[calc(100vh-57px)]">
              <PDFReader pdfUrl={getPdfUrl(pdfPath) || ""} />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-6 py-8">
              {currentChapter ? (
                <>
                  {/* Chapter Content - No title/subtitle here */}
                  <div
                    className={`prose max-w-none ${getFontSizeClass()} ${
                      theme === "focus" || theme === "calm"
                        ? "text-[#eeeeee] prose-invert reading-content-white"
                        : theme === "thic" || theme === "light"
                        ? "text-gray-900"
                        : "text-[#eeeeee] reading-content-white"
                    }`}
                    dangerouslySetInnerHTML={{ __html: currentChapter.content }}
                    style={{
                      color:
                        theme === "thic" || theme === "light"
                          ? "#111827 !important"
                          : "#eeeeee !important", // White for focus, calm, and default
                    }}
                  />
                </>
              ) : (
                <div className="text-center py-20">
                  <p className={themeColors.text}>No content available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes N' Highlights Panel */}
        <div
          className={`fixed top-[57px] right-0 h-[calc(100vh-57px)] w-96 bg-[#181818] border-l border-[#454545] transform transition-transform duration-300 z-20 ${
            notesPanelOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 h-full overflow-y-auto">
            {/* Title */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#eeeeee] text-lg font-semibold">
                Notes N' Highlights
              </h3>
              <button className="text-[#9d6db8] hover:text-[#67377e] transition-colors">
                <Search className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            {/* Notes by Chapter */}
            {chapters.length > 0 ? (
              chapters.map((chapter, chapterIndex) => {
                // Extract notes and highlights from chapter content if available
                // For now, show chapter info - this will be updated when notes/highlights are implemented
                const hasNotesOrHighlights = false; // Will be true when notes/highlights data exists

                return (
                  <div key={chapter.id} className="mb-6">
                    {/* Chapter Header */}
                    <div className="mb-4">
                      <h4 className="text-[#eeeeee] font-medium mb-2">
                        {chapter.title || `Chapter ${chapterIndex + 1}`}
                      </h4>
                      <div className="h-px bg-[#454545]"></div>
                    </div>

                    {/* Notes/Highlights - Will display when data is available */}
                    {hasNotesOrHighlights ? (
                      <div className="space-y-3">
                        {/* Highlights will have green bar */}
                        {/* Notes will not have green bar */}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-[#eeeeee] text-xs opacity-50">
                          No notes or highlights for this chapter
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20">
                <p className="text-[#eeeeee] text-sm opacity-70">
                  No chapters available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reading Preferences Sidebar */}
        <div
          className={`fixed top-[57px] right-0 h-[calc(100vh-57px)] w-80 bg-[#181818] border-l border-[#454545] transform transition-transform duration-300 z-20 ${
            menuOpen
              ? notesPanelOpen
                ? "translate-x-96"
                : "translate-x-0"
              : "translate-x-full"
          }`}
        >
          <div className="p-6 h-full overflow-y-auto">
            {/* Title */}
            <h3 className="text-[#eeeeee] text-lg font-semibold mb-6 pb-2 border-b-2 border-[#67377e]">
              Reading Preferences
            </h3>

            {/* Font Size Controls */}
            <div className="mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setFontSize("small")}
                  className={`flex-1 py-2 px-4 rounded ${
                    fontSize === "small"
                      ? "bg-[#67377e] text-white"
                      : "bg-[#221f20] text-[#eeeeee] hover:bg-[#2A2A2A]"
                  } transition-colors`}
                >
                  <span className="text-sm">A</span>
                </button>
                <button
                  onClick={() => setFontSize("large")}
                  className={`flex-1 py-2 px-4 rounded ${
                    fontSize === "large"
                      ? "bg-[#67377e] text-white"
                      : "bg-[#221f20] text-[#eeeeee] hover:bg-[#2A2A2A]"
                  } transition-colors`}
                >
                  <span className="text-lg">A</span>
                </button>
              </div>
            </div>

            {/* View/Layout Controls */}
            <div className="mb-6">
              <div className="flex gap-2">
                <button
                  className={`w-12 h-12 rounded bg-[#221f20] text-[#eeeeee] hover:bg-[#2A2A2A] transition-colors flex items-center justify-center ${
                    viewMode === "default" ? "ring-2 ring-[#67377e]" : ""
                  }`}
                  onClick={() => setViewMode("default")}
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  className={`w-12 h-12 rounded bg-[#221f20] text-[#eeeeee] hover:bg-[#2A2A2A] transition-colors flex items-center justify-center ${
                    viewMode === "copy" ? "ring-2 ring-[#67377e]" : ""
                  }`}
                  onClick={() => setViewMode("copy")}
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  className={`w-12 h-12 rounded bg-[#221f20] text-[#eeeeee] hover:bg-[#2A2A2A] transition-colors flex items-center justify-center ${
                    viewMode === "book" ? "ring-2 ring-[#67377e]" : ""
                  }`}
                  onClick={() => setViewMode("book")}
                >
                  <BookOpen className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme("thic")}
                  className={`py-4 px-4 rounded-lg transition-all ${
                    theme === "thic"
                      ? "bg-gray-200 text-gray-900 ring-2 ring-[#67377e]"
                      : "bg-gray-200 text-gray-900 hover:opacity-80"
                  }`}
                >
                  Thic
                </button>
                <button
                  onClick={() => setTheme("focus")}
                  className={`py-4 px-4 rounded-lg transition-all ${
                    theme === "focus"
                      ? "bg-[#181818] text-[#eeeeee] ring-2 ring-[#67377e]"
                      : "bg-[#181818] text-[#eeeeee] hover:opacity-80"
                  }`}
                >
                  Focus
                </button>
                <button
                  onClick={() => setTheme("calm")}
                  className={`py-4 px-4 rounded-lg transition-all ${
                    theme === "calm"
                      ? "bg-gray-800 text-[#eeeeee] ring-2 ring-[#67377e]"
                      : "bg-gray-800 text-[#eeeeee] hover:opacity-80"
                  }`}
                >
                  Calm
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className={`py-4 px-4 rounded-lg transition-all ${
                    theme === "light"
                      ? "bg-amber-50 text-gray-900 ring-2 ring-[#67377e]"
                      : "bg-amber-50 text-gray-900 hover:opacity-80"
                  }`}
                >
                  Light
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator - Bottom with Title */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#454545] px-6 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Book Title and Chapter Number */}
          <div className="text-center mb-4">
            <h2 className="text-[#eeeeee] text-2xl font-bold mb-1">
              {bookTitle || "Untitled Book"}
            </h2>
            {currentChapter && (
              <p className="text-[#eeeeee] text-sm font-bold opacity-70">
                Chapter {currentChapterIndex + 1}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div className="relative flex items-center justify-center">
            {/* Timeline Line - Background */}
            <div className="absolute left-0 right-0 h-px bg-[#454545] top-1/2 transform -translate-y-1/2"></div>

            {/* Chapter Nodes - Evenly Spaced */}
            <div className="relative flex items-center justify-between w-full">
              {chapters.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentChapterIndex(index)}
                  className={`relative z-10 w-3 h-3 rounded-full transition-all ${
                    index === currentChapterIndex
                      ? "bg-[#67377e] ring-2 ring-[#67377e] ring-offset-2 ring-offset-[#181818] scale-125"
                      : "bg-[#454545] hover:bg-[#555555]"
                  }`}
                  aria-label={`Chapter ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
