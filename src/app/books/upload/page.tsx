"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import { ImagePlus, X, Plus, ChevronDown, Upload, Check } from "lucide-react";
import { getBookCoverUrl } from "@/lib/r2";

interface Genre {
  id: string;
  genreName: string;
}

interface Author {
  id: string;
  authorName: string;
  authorProfileImageUrl?: string;
}

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Korean",
  "Portuguese",
  "Russian",
  "Arabic",
  "Hindi",
  "Italian",
];

export default function UploadBookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { expanded: sidebarExpanded, toggle } = useSidebar();
  const bookId = searchParams.get("bookId");

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    language: "English",
    synopsis: "",
    bookCoverPath: "",
  });

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [userAuthorId, setUserAuthorId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [bookStatus, setBookStatus] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  // Modal states
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfPath, setPdfPath] = useState<string>("");

  // Load saved data from sessionStorage on mount (only if not editing existing book)
  useEffect(() => {
    // Don't load from sessionStorage if editing an existing book
    if (bookId) return;

    const savedData = sessionStorage.getItem("bookUploadData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.formData || formData);
        setSelectedGenres(parsed.selectedGenres || []);
        setSelectedAuthors(parsed.selectedAuthors || []);
        // Use bookCoverPath URL if available, otherwise use coverPreview (if it's a URL)
        const coverUrl =
          parsed.formData?.bookCoverPath || parsed.coverPreview || "";
        // Only set preview if it's a URL (not base64)
        if (coverUrl && !coverUrl.startsWith("data:")) {
          setCoverPreview(coverUrl);
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, [bookId]);

  // Save form data to sessionStorage whenever it changes
  // Don't save base64 coverPreview to avoid quota errors - only save URLs
  useEffect(() => {
    // Only save coverPreview if it's a URL (not base64 data)
    const coverToSave =
      coverPreview && !coverPreview.startsWith("data:")
        ? coverPreview
        : formData.bookCoverPath || "";

    const dataToSave = {
      formData: {
        ...formData,
        // Ensure we're saving the URL, not base64
        bookCoverPath: formData.bookCoverPath || coverToSave,
      },
      selectedGenres,
      selectedAuthors,
      // Only save URL, not base64 preview
      coverPreview: coverToSave,
    };

    try {
      sessionStorage.setItem("bookUploadData", JSON.stringify(dataToSave));
    } catch (error) {
      // If storage quota exceeded, try saving without coverPreview
      console.warn(
        "SessionStorage quota exceeded, saving without cover preview"
      );
      const dataToSaveWithoutCover = {
        formData: {
          ...formData,
          bookCoverPath: formData.bookCoverPath || "",
        },
        selectedGenres,
        selectedAuthors,
        coverPreview: "",
      };
      sessionStorage.setItem(
        "bookUploadData",
        JSON.stringify(dataToSaveWithoutCover)
      );
    }
  }, [formData, selectedGenres, selectedAuthors, coverPreview]);

  useEffect(() => {
    fetchGenres();
    fetchAuthors();
    if (session?.user?.id) {
      checkOrCreateAuthorProfile();
    }
    // If editing an existing book, fetch its data
    if (bookId) {
      fetchBookData();
    }
  }, [session, bookId]);

  const fetchBookData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/books/${bookId}`);
      const data = await response.json();

      if (data.success && data.book) {
        const book = data.book;
        setBookStatus(book.status || null);
        setIsPublished(book.status === "published");

        // Populate form with existing book data
        setFormData({
          title: book.bookName || "",
          subtitle: (book as any).subtitle || "",
          language: book.language || "English",
          synopsis: book.description || "",
          bookCoverPath: book.bookCoverPath || "",
        });

        if (book.bookCoverPath && book.bookCoverPath.trim() !== "") {
          const path = book.bookCoverPath.trim();
          // Only set preview if it's a valid path (not a placeholder that might not exist)
          // Skip paths that look like placeholders (e.g., "untitled-book.jpg" without timestamp)
          const isPlaceholder =
            path.includes("untitled-book") && !path.match(/\d{13}/); // Check for timestamp
          if (!isPlaceholder) {
            const coverUrl = getBookCoverUrl(book.bookCoverPath);
            if (coverUrl) {
              setCoverPreview(coverUrl);
            }
          } else {
            // Clear invalid placeholder path
            setFormData({ ...formData, bookCoverPath: "" });
          }
        }

        // Set selected genres
        if (book.bookGenres && book.bookGenres.length > 0) {
          const genreIds = book.bookGenres
            .map((bg: any) => {
              // Handle different possible structures
              if (bg.genreId) return bg.genreId;
              if (bg.genre?.id) return bg.genre.id;
              return bg.id;
            })
            .filter(Boolean);
          setSelectedGenres(genreIds);
        }

        // Set selected authors - support multiple authors
        if (
          (book as any).authors &&
          Array.isArray((book as any).authors) &&
          (book as any).authors.length > 0
        ) {
          setSelectedAuthors((book as any).authors);
        } else if (book.author) {
          // Fallback to single author for backward compatibility
          setSelectedAuthors([book.author]);
        }
      }
    } catch (err) {
      console.error("Error fetching book data:", err);
      setError("Failed to load book data");
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await fetch("/api/genres");
      const data = await response.json();
      if (data.success) {
        setGenres(data.genres || []);
      }
    } catch (err) {
      console.error("Error fetching genres:", err);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await fetch("/api/authors");
      const data = await response.json();
      if (data.success) {
        setAuthors(data.authors || []);
      }
    } catch (err) {
      console.error("Error fetching authors:", err);
    }
  };

  const checkOrCreateAuthorProfile = async () => {
    try {
      const response = await fetch(`/api/authors?userId=${session?.user?.id}`);
      const data = await response.json();

      if (data.success && data.authors && data.authors.length > 0) {
        const userAuthor = data.authors[0];
        setUserAuthorId(userAuthor.id);
        if (selectedAuthors.length === 0) {
          setSelectedAuthors([userAuthor]);
        }
      } else {
        const createResponse = await fetch("/api/authors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authorName: session?.user?.name || "Anonymous Author",
            userId: session?.user?.id,
          }),
        });
        const createData = await createResponse.json();
        if (createData.success) {
          setUserAuthorId(createData.author.id);
          if (selectedAuthors.length === 0) {
            setSelectedAuthors([createData.author]);
          }
        }
      }
    } catch (err) {
      console.error("Error checking author profile:", err);
    }
  };

  const handleGenreToggle = (genreId: string) => {
    // Don't allow changes if book is published
    if (isPublished) return;

    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleAddAuthor = (author: Author) => {
    // Don't allow changes if book is published
    if (isPublished) {
      setShowAuthorModal(false);
      return;
    }

    if (!selectedAuthors.find((a) => a.id === author.id)) {
      const updatedAuthors = [...selectedAuthors, author];
      setSelectedAuthors(updatedAuthors);
      console.log("Author added:", author, "Selected authors:", updatedAuthors);
    }
    setShowAuthorModal(false);
  };

  const handleRemoveAuthor = (authorId: string) => {
    // Don't allow changes if book is published
    if (isPublished) return;

    setSelectedAuthors((prev) => prev.filter((a) => a.id !== authorId));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Don't allow changes if book is published
    if (isPublished) return;

    const url = e.target.value;
    setFormData({ ...formData, bookCoverPath: url });
    setCoverPreview(url);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Don't allow upload if book is published
    if (isPublished) {
      e.target.value = ""; // Reset file input
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes("pdf")) {
      setError("Please upload a PDF file");
      e.target.value = ""; // Reset file input
      return;
    }

    setUploadingPdf(true);
    setError("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      if (bookId) {
        uploadFormData.append("bookId", bookId);
      }
      uploadFormData.append("bookName", formData.title || "Untitled Book");

      const uploadResponse = await fetch("/api/upload/pdf", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.success) {
        setPdfPath(uploadData.path);

        // Auto-save and publish the book when PDF is uploaded
        await handleAutoPublishWithPdf(uploadData.path);
      } else {
        throw new Error(uploadData.error || "Failed to upload PDF");
      }
    } catch (err) {
      console.error("Error uploading PDF:", err);
      setError(err instanceof Error ? err.message : "Failed to upload PDF");
      setPdfPath("");
    } finally {
      setUploadingPdf(false);
      e.target.value = ""; // Reset file input
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow image uploads even if PDF is uploaded (cover can be changed)
    // Only block if book is manually published via "Write Here" button
    // We check if it's published AND has no PDF (meaning it was published via Write Here)
    if (isPublished && !pdfPath) {
      e.target.value = ""; // Reset file input
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setError("");

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const dataUrl = reader.result as string;

          // Show preview immediately
          setCoverPreview(dataUrl);

          // Upload to R2
          const uploadResponse = await fetch("/api/upload/cover", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              dataUrl: dataUrl,
              bookName: formData.title || "Untitled Book",
              filename: file.name,
            }),
          });

          const uploadData = await uploadResponse.json();

          if (uploadData.success) {
            // Store only the path (e.g., "book-covers/my-book.jpg")
            const coverPath = uploadData.path;
            setFormData({ ...formData, bookCoverPath: coverPath });
            // For preview, construct the full URL
            const previewUrl = `https://pub-2bfaf8b6468e4b76ac7209e67f8b0fba.r2.dev/${coverPath}`;
            setCoverPreview(previewUrl);
          } else {
            throw new Error(uploadData.error || "Failed to upload cover");
          }
        } catch (err) {
          console.error("Error uploading to R2:", err);
          setError(
            err instanceof Error ? err.message : "Failed to upload cover"
          );
          // Fallback: keep base64 for preview only, but don't save to formData
          // This prevents sessionStorage quota issues
          // The base64 will only be in coverPreview for display, not persisted
          const dataUrl = reader.result as string;
          // Keep base64 in coverPreview for immediate display
          // But don't save it to formData to avoid sessionStorage quota
          // User will need to retry upload or use URL input instead
        } finally {
          setUploadingCover(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error reading file:", err);
      setError("Failed to read file");
      setUploadingCover(false);
    }
  };

  const handleAutoPublishWithPdf = async (pdfPathValue: string) => {
    if (!formData.title) {
      setError("Please enter a book title first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get all author IDs from selected authors
      const authorIds =
        selectedAuthors.length > 0
          ? selectedAuthors.map((a) => a.id)
          : userAuthorId
          ? [userAuthorId]
          : [];

      const bookData = {
        bookName: formData.title,
        description: formData.synopsis,
        subtitle: formData.subtitle,
        language: formData.language,
        status: "published", // Auto-publish when PDF is uploaded
        bookCoverPath: formData.bookCoverPath,
        authorIds: authorIds,
        genreIds: selectedGenres,
        userId: session?.user?.id,
        pdfPath: pdfPathValue,
      };

      // If editing existing book, use PATCH
      if (bookId) {
        const response = await fetch(`/api/books/${bookId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookName: bookData.bookName,
            description: bookData.description,
            subtitle: bookData.subtitle,
            language: bookData.language,
            bookCoverPath: bookData.bookCoverPath,
            authorIds: bookData.authorIds,
            genreIds: bookData.genreIds,
            status: "published", // Auto-publish
            pdfPath: pdfPathValue,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setIsPublished(true);
          setBookStatus("published");
        } else {
          setError(data.error || "Failed to publish book");
        }
      } else {
        // Creating new book
        const response = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bookData,
            pdfPath: pdfPathValue,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setIsPublished(true);
          setBookStatus("published");
          // Update bookId so the book can be edited later
          if (data.book?.id) {
            router.replace(`/books/upload?bookId=${data.book.id}`);
          }
        } else {
          setError(data.error || "Failed to publish book");
        }
      }
    } catch (err) {
      console.error("Error auto-publishing book:", err);
      setError(err instanceof Error ? err.message : "Failed to publish book");
    } finally {
      setLoading(false);
    }
  };

  const handleWriteHere = async () => {
    // Don't allow saving if book is published
    if (isPublished) {
      setError("Cannot modify published books. Please create a new draft.");
      return;
    }

    if (!formData.title) {
      setError("Please enter a book title first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get all author IDs from selected authors
      const authorIds =
        selectedAuthors.length > 0
          ? selectedAuthors.map((a) => a.id)
          : userAuthorId
          ? [userAuthorId]
          : [];

      console.log("Author selection:", {
        selectedAuthors: selectedAuthors.map((a) => ({
          id: a.id,
          name: a.authorName,
        })),
        userAuthorId: userAuthorId,
        authorIds: authorIds,
      });

      const bookData = {
        bookName: formData.title,
        description: formData.synopsis,
        subtitle: formData.subtitle,
        language: formData.language,
        status: "draft",
        bookCoverPath: formData.bookCoverPath,
        authorIds: authorIds,
        genreIds: selectedGenres,
        userId: session?.user?.id, // Add userId for publisher creation
      };

      console.log("Saving book data:", {
        bookName: bookData.bookName,
        subtitle: bookData.subtitle,
        authorIds: bookData.authorIds,
        genreIds: bookData.genreIds,
      });

      // If editing existing book, use PATCH
      if (bookId) {
        const response = await fetch(`/api/books/${bookId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookName: bookData.bookName,
            description: bookData.description,
            subtitle: bookData.subtitle,
            language: bookData.language,
            bookCoverPath: bookData.bookCoverPath,
            authorIds: bookData.authorIds,
            genreIds: bookData.genreIds,
            status: "draft",
            ...(pdfPath && { pdfPath: pdfPath }),
          }),
        });

        const data = await response.json();
        if (data.success) {
          router.push(`/books/${bookId}/write`);
        } else {
          setError(data.error || "Failed to update book");
        }
      } else {
        // Creating new book
        const response = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bookData,
            ...(pdfPath && { pdfPath: pdfPath }),
          }),
        });

        const data = await response.json();
        if (data.success) {
          // DON'T clear sessionStorage - keep data for when user navigates back
          router.push(`/books/${data.book.id}/write`);
        } else {
          setError(data.error || "Failed to save book");
        }
      }
    } catch (err) {
      setError("Error saving book");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    sessionStorage.removeItem("bookUploadData");
    setFormData({
      title: "",
      subtitle: "",
      language: "English",
      synopsis: "",
      bookCoverPath: "",
    });
    setSelectedGenres([]);
    setSelectedAuthors(
      userAuthorId ? authors.filter((a) => a.id === userAuthorId) : []
    );
    setCoverPreview("");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
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
        <main className="p-8 flex gap-8 max-w-7xl mx-auto">
          {/* Left Sidebar - Book Cover */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-[#232323] border-2 border-dashed border-[#454545] rounded-lg h-80 flex items-center justify-center mb-4 overflow-hidden relative group">
              {coverPreview ? (
                <>
                  <img
                    src={coverPreview}
                    alt="Book cover"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Clear invalid cover path to prevent 404 loops
                      setCoverPreview("");
                      setFormData((prev) => ({ ...prev, bookCoverPath: "" }));
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML =
                          '<div class="text-center text-gray-500"><div class="w-12 h-12 mx-auto mb-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div><p class="text-sm">Image failed to load</p></div>';
                      }
                    }}
                  />
                  {(!isPublished || pdfPath) && (
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Upload className="w-8 h-8 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </>
              ) : (
                (!isPublished || pdfPath) && (
                  <label className="text-center text-gray-500 cursor-pointer">
                    <ImagePlus className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Click to upload cover</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )
              )}
              {uploadingCover && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-white">Uploading...</div>
                </div>
              )}
            </div>

            {!isPublished && !pdfPath && (
              <button
                onClick={handleWriteHere}
                disabled={loading}
                className="w-full bg-[#67377e] hover:bg-[#5a2f6b] text-white font-medium py-3 px-4 rounded-lg transition-colors mb-3 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Write Here"}
              </button>
            )}

            {pdfPath && (
              <div className="w-full bg-green-900/50 border border-green-500 text-green-400 p-3 rounded-lg mb-3 text-sm">
                ✓ PDF uploaded - Book will be published automatically
              </div>
            )}

            <label className="w-full bg-[#2A2A2A] hover:bg-[#333333] text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Upload className="w-4 h-4" />
              {uploadingPdf ? "Uploading PDF..." : "Upload PDF"}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={isPublished || uploadingPdf}
                onChange={handlePdfUpload}
              />
            </label>
            {pdfPath && (
              <div className="mt-2 text-sm text-green-400">
                ✓ PDF uploaded successfully
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError("")}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="space-y-6">
              {/* Title with Clear Button */}
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  disabled={isPublished}
                  className="flex-1 bg-transparent border-none text-white text-4xl font-bold placeholder-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Title"
                />
                {formData.title && (
                  <button
                    onClick={() => {
                      if (confirm("Clear all data and start a new book?")) {
                        clearForm();
                      }
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap"
                  >
                    Clear Form
                  </button>
                )}
              </div>

              {/* Subtitle */}
              <div>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  disabled={isPublished}
                  className="w-full bg-transparent border-none text-gray-400 text-2xl placeholder-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Sub Title"
                />
              </div>

              {/* Authors */}
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  {selectedAuthors.map((author) => (
                    <div
                      key={author.id}
                      className="flex items-center gap-2 bg-[#2A2A2A] rounded-full px-4 py-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center text-xs text-white">
                        {author.authorName.charAt(0)}
                      </div>
                      <span className="text-white text-sm">
                        {author.authorName}
                      </span>
                      {selectedAuthors.length > 1 && (
                        <button
                          onClick={() => handleRemoveAuthor(author.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {!isPublished && (
                    <button
                      onClick={() => setShowAuthorModal(true)}
                      className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Author
                    </button>
                  )}
                </div>
              </div>

              {/* Language */}
              <div className="flex items-center gap-3 relative">
                <button
                  onClick={() =>
                    !isPublished &&
                    setShowLanguageDropdown(!showLanguageDropdown)
                  }
                  disabled={isPublished}
                  className="flex items-center gap-2 text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{formData.language}</span>
                  {!isPublished && <ChevronDown className="w-4 h-4" />}
                </button>

                {showLanguageDropdown && (
                  <div className="absolute top-full mt-2 bg-[#2A2A2A] border border-[#454545] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setFormData({ ...formData, language: lang });
                          setShowLanguageDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#333333] hover:text-white flex items-center justify-between min-w-[150px]"
                      >
                        {lang}
                        {formData.language === lang && (
                          <Check className="w-4 h-4 text-[#8B5CF6]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Synopsis */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Synopsis
                </label>
                <textarea
                  value={formData.synopsis}
                  onChange={(e) =>
                    setFormData({ ...formData, synopsis: e.target.value })
                  }
                  disabled={isPublished}
                  rows={4}
                  className="w-full bg-[#232323] border border-[#454545] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] p-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Write a brief description of your book..."
                />
              </div>

              {/* Tags/Genres */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedGenres.map((genreId) => {
                    const genre = genres.find((g) => g.id === genreId);
                    return genre ? (
                      <button
                        key={genre.id}
                        onClick={() => handleGenreToggle(genre.id)}
                        disabled={isPublished}
                        className="px-4 py-2 rounded-lg text-sm bg-[#67377e] text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {genre.genreName}
                        {!isPublished && <X className="w-3 h-3" />}
                      </button>
                    ) : null;
                  })}
                  {!isPublished && (
                    <button
                      onClick={() => setShowGenreModal(true)}
                      className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Tags
                    </button>
                  )}
                </div>
              </div>

              {/* Book Cover URL Input */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Book Cover URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.bookCoverPath}
                  onChange={handleCoverChange}
                  disabled={isPublished}
                  className="w-full bg-[#232323] border border-[#454545] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] p-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Author Selection Modal */}
      {showAuthorModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#232323] border border-[#454545] rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-bold">Select Author</h3>
              <button
                onClick={() => setShowAuthorModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {authors.map((author) => (
                <button
                  key={author.id}
                  onClick={() => handleAddAuthor(author)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden flex-shrink-0 flex items-center justify-center text-white">
                    {author.authorName.charAt(0)}
                  </div>
                  <span className="text-white">{author.authorName}</span>
                  {selectedAuthors.find((a) => a.id === author.id) && (
                    <Check className="w-5 h-5 text-[#8B5CF6] ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Genre Selection Modal */}
      {showGenreModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#232323] border border-[#454545] rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-bold">Select Genres</h3>
              <button
                onClick={() => setShowGenreModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreToggle(genre.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedGenres.includes(genre.id)
                      ? "bg-[#8B5CF6] text-white"
                      : "hover:bg-[#2A2A2A] text-gray-300"
                  }`}
                >
                  <span>{genre.genreName}</span>
                  {selectedGenres.includes(genre.id) && (
                    <Check className="w-5 h-5" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowGenreModal(false)}
              className="w-full mt-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
