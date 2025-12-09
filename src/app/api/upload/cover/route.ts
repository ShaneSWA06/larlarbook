import { NextRequest, NextResponse } from "next/server";
import { uploadBase64ToR2, generateBookCoverKey } from "@/lib/r2";
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

    const body = await request.json();
    const { dataUrl, bookId, filename } = body;

    if (!dataUrl) {
      return NextResponse.json(
        { success: false, error: "Data URL is required" },
        { status: 400 }
      );
    }

    // Generate a unique key for the cover
    const key = generateBookCoverKey(bookId || `temp-${Date.now()}`, filename);

    // Upload to R2
    const publicUrl = await uploadBase64ToR2(dataUrl, key);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key: key,
    });
  } catch (error) {
    console.error("Error uploading cover to R2:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to upload cover",
      },
      { status: 500 }
    );
  }
}
