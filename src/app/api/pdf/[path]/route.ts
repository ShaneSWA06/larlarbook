import { NextRequest, NextResponse } from "next/server";
import { getPdfUrl } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const { path } = await params;
    
    // Decode the path (it might be URL encoded)
    const decodedPath = decodeURIComponent(path);
    
    // Get the full PDF URL from R2
    const pdfUrl = getPdfUrl(decodedPath);
    
    if (!pdfUrl) {
      return NextResponse.json(
        { success: false, error: "Invalid PDF path" },
        { status: 400 }
      );
    }

    // Fetch the PDF from R2
    const response = await fetch(pdfUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch PDF" },
        { status: response.status }
      );
    }

    // Get the PDF as a blob
    const blob = await response.blob();

    // Return the PDF with proper CORS headers
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${decodedPath.split("/").pop()}"`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error proxying PDF:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to proxy PDF",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

