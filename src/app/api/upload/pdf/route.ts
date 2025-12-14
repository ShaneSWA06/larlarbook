import { NextRequest, NextResponse } from "next/server";
import { uploadToR2, generateBookContentKey } from "@/lib/r2";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bookId = formData.get("bookId") as string;
    const bookName = formData.get("bookName") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File is required" },
        { status: 400 }
      );
    }

    if (!bookName || bookName.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Book name is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { success: false, error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate key for PDF
    const key = bookId
      ? generateBookContentKey(bookId, file.name)
      : `book-content/temp-${Date.now()}-${file.name}`;

    // Upload to R2
    const publicUrl = await uploadToR2(buffer, key, file.type);

    return NextResponse.json({
      success: true,
      path: key, // Return just the path like "book-content/my-book.pdf"
      url: publicUrl,
    });
  } catch (error) {
    console.error("Error uploading PDF to R2:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to upload PDF",
      },
      { status: 500 }
    );
  }
}

