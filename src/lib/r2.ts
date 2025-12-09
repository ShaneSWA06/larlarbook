import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint:
    process.env.R2_ENDPOINT ||
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "burmese-ebook-app-storage";
const PUBLIC_URL =
  process.env.R2_PUBLIC_URL ||
  "https://pub-2bfaf8b6468e4b76ac7209e67f8b0fba.r2.dev";

/**
 * Upload a file to Cloudflare R2
 * @param file - File buffer or Uint8Array
 * @param key - Object key (path) in the bucket
 * @param contentType - MIME type of the file
 * @returns Public URL of the uploaded file
 */
export async function uploadToR2(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      // Make it publicly accessible
      CacheControl: "public, max-age=31536000, immutable",
    });

    await s3Client.send(command);

    // Return the public URL
    return `${PUBLIC_URL}/${key}`;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error(
      `Failed to upload to R2: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Upload a file from a base64 data URL
 * @param dataUrl - Base64 data URL (e.g., "data:image/png;base64,...")
 * @param key - Object key (path) in the bucket
 * @returns Public URL of the uploaded file
 */
export async function uploadBase64ToR2(
  dataUrl: string,
  key: string
): Promise<string> {
  try {
    // Parse the data URL
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid data URL format");
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    return await uploadToR2(buffer, key, contentType);
  } catch (error) {
    console.error("Error uploading base64 to R2:", error);
    throw new Error(
      `Failed to upload base64 to R2: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Delete a file from R2
 * @param key - Object key (path) in the bucket
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from R2:", error);
    throw new Error(
      `Failed to delete from R2: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Generate a presigned URL for temporary access (if needed)
 * @param key - Object key (path) in the bucket
 * @param expiresIn - Expiration time in seconds (default: 3600)
 * @returns Presigned URL
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error(
      `Failed to generate presigned URL: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Generate a unique key for a book cover
 * @param bookId - Book ID
 * @param filename - Original filename (optional)
 * @returns Unique key for the cover
 */
export function generateBookCoverKey(
  bookId: string,
  filename?: string
): string {
  const timestamp = Date.now();
  const extension = filename
    ? filename.split(".").pop()?.toLowerCase() || "jpg"
    : "jpg";
  return `book-covers/${bookId}-${timestamp}.${extension}`;
}

/**
 * Generate a unique key for book content (PDF, etc.)
 * @param bookId - Book ID
 * @param filename - Original filename
 * @returns Unique key for the content
 */
export function generateBookContentKey(
  bookId: string,
  filename: string
): string {
  const extension = filename.split(".").pop()?.toLowerCase() || "pdf";
  return `book-content/${bookId}.${extension}`;
}

/**
 * Upload book content (chapters) as JSON to R2
 * @param bookId - Book ID
 * @param content - Book content object (chapters, etc.)
 * @returns Public URL of the uploaded content
 */
export async function uploadBookContentToR2(
  bookId: string,
  content: any
): Promise<string> {
  try {
    const key = `book-content/${bookId}/content.json`;
    const jsonString = JSON.stringify(content);
    const buffer = Buffer.from(jsonString, "utf-8");

    return await uploadToR2(buffer, key, "application/json");
  } catch (error) {
    console.error("Error uploading book content to R2:", error);
    throw new Error(
      `Failed to upload book content to R2: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
