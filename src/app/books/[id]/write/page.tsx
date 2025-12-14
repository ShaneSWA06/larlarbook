"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ChapterEditor from "@/components/books/chapter-editor";
import { ArrowLeft, Save, Eye } from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export default function WriteBookPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const bookId = params.id as string;

  const [bookTitle, setBookTitle] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: "1",
      title: "Chapter 1",
      content: "<p>Start writing your story here...</p>",
      order: 1,
    },
  ]);
  const [currentChapterId, setCurrentChapterId] = useState("1");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookStatus, setBookStatus] = useState<string | null>(null);

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
        setBookTitle(data.book.bookName);
        setBookStatus(data.book.status || null);
        // Load chapters if they exist
        if (data.book.chapters && data.book.chapters.length > 0) {
          setChapters(data.book.chapters);
          setCurrentChapterId(data.book.chapters[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching book:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChapter = () => {
    const newChapterNumber = chapters.length + 1;
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: `Chapter ${newChapterNumber}`,
      content: "<p>Start writing...</p>",
      order: newChapterNumber,
    };
    setChapters([...chapters, newChapter]);
    setCurrentChapterId(newChapter.id);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (chapters.length === 1) {
      alert("You must have at least one chapter");
      return;
    }
    setChapters(chapters.filter((ch) => ch.id !== chapterId));
    if (currentChapterId === chapterId) {
      setCurrentChapterId(chapters[0].id);
    }
  };

  const handleContentChange = (chapterId: string, content: string) => {
    setChapters(
      chapters.map((ch) => (ch.id === chapterId ? { ...ch, content } : ch))
    );
  };

  const handleSaveDraft = async (showAlert = true) => {
    setSaving(true);
    try {
      console.log("Saving draft with chapters:", chapters);
      const response = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapters: chapters,
          status: "draft",
        }),
      });

      const data = await response.json();
      console.log("Save draft response:", data);
      if (data.success) {
        setBookStatus("draft");
        if (showAlert) {
          alert("Draft saved successfully!");
        }
        return true;
      } else {
        if (showAlert) {
          alert(`Failed to save draft: ${data.error || "Unknown error"}`);
        }
        return false;
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      if (showAlert) {
        alert(
          `Error saving draft: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm("Are you sure you want to publish this book?")) {
      return;
    }

    setSaving(true);
    try {
      console.log("Publishing book with chapters:", chapters);
      const response = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapters: chapters,
          status: "published",
        }),
      });

      const data = await response.json();
      console.log("Publish response:", data);
      if (data.success) {
        alert("Book published successfully!");
        router.push("/books");
      } else {
        alert(`Failed to publish book: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error publishing book:", error);
      alert(
        `Error publishing book: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
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
      {/* Top Action Bar */}
      <div className="bg-[#1E1E1E] border-b border-[#454545] p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              // Save as draft first if there are changes
              const saved = await handleSaveDraft(false);

              // If book is draft, go to upload page to edit details
              // If published, go to books page
              if (bookStatus === "draft" || !bookStatus) {
                router.push(`/books/upload?bookId=${bookId}`);
              } else {
                router.push("/books");
              }
            }}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Details</span>
          </button>
          <div className="w-px h-6 bg-[#454545]"></div>
          <h2 className="text-white font-medium">
            {bookTitle || "Untitled Book"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#333333] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            {saving ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Chapter Editor */}
      <ChapterEditor
        chapters={chapters}
        currentChapterId={currentChapterId}
        onChapterChange={setCurrentChapterId}
        onContentChange={handleContentChange}
        onAddChapter={handleAddChapter}
        onDeleteChapter={handleDeleteChapter}
      />
    </div>
  );
}
