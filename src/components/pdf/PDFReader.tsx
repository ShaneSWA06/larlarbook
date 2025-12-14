"use client";

import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker - use local worker file from public folder
if (typeof window !== "undefined") {
  // Try .js first, fallback to .mjs if needed
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

interface PDFReaderProps {
  pdfUrl: string;
  onPageChange?: (page: number, totalPages: number) => void;
  className?: string;
}

export default function PDFReader({
  pdfUrl,
  onPageChange,
  className = "",
}: PDFReaderProps) {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    loadPDF();
  }, [pdfUrl]);

  useEffect(() => {
    if (pdf) {
      renderPage(currentPage);
    }

    // Cleanup: cancel render task on unmount or when dependencies change
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdf, currentPage, scale]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      // If the URL is from R2, proxy it through our API to avoid CORS issues
      let finalUrl = pdfUrl;
      if (
        pdfUrl.includes("r2.dev") ||
        pdfUrl.includes("r2.cloudflarestorage.com")
      ) {
        // Extract the path from the R2 URL
        try {
          const urlObj = new URL(pdfUrl);
          const path = urlObj.pathname.substring(1); // Remove leading slash
          // Use our proxy API route
          finalUrl = `/api/pdf/${encodeURIComponent(path)}`;
        } catch (e) {
          // If URL parsing fails, use original URL
          console.warn("Failed to parse PDF URL, using original:", e);
        }
      }

      const loadingTask = pdfjsLib.getDocument({
        url: finalUrl,
        withCredentials: false,
      });
      const pdfDoc = await loadingTask.promise;
      setPdf(pdfDoc);
      setTotalPages(pdfDoc.numPages);
      if (onPageChange) {
        onPageChange(1, pdfDoc.numPages);
      }
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load PDF document"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdf || !canvasRef.current) return;

    try {
      // Cancel any ongoing render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      renderTaskRef.current = null;
    } catch (err) {
      // Ignore cancellation errors
      if (err instanceof Error && err.message.includes("cancelled")) {
        return;
      }
      console.error("Error rendering page:", err);
      setError("Failed to render page");
      renderTaskRef.current = null;
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (onPageChange) {
        onPageChange(page, totalPages);
      }
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-[#eeeeee]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#67377e] mx-auto mb-4"></div>
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-red-400">
          <p className="text-lg font-semibold mb-2">Error loading PDF</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`} ref={containerRef}>
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-4 bg-[#221f20] border-b border-[#454545]">
        <div className="flex items-center gap-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[#67377e] hover:bg-[#5a2f6b] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-[#eeeeee]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-[#67377e] hover:bg-[#5a2f6b] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={zoomOut}
            className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#333333] text-[#eeeeee] rounded transition-colors"
          >
            -
          </button>
          <span className="text-[#eeeeee]">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#333333] text-[#eeeeee] rounded transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto bg-[#2A2A2A] p-4">
        <div className="flex justify-center">
          <canvas ref={canvasRef} className="shadow-lg" />
        </div>
      </div>
    </div>
  );
}
