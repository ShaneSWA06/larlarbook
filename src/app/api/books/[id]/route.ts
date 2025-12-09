// API route for individual book
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadBookContentToR2 } from "@/lib/r2";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        author: true,
        bookAuthors: {
          include: {
            author: true,
          },
        },
        bookGenres: {
          include: {
            genre: true,
          },
        },
        bookPublishers: {
          include: {
            publisher: true,
          },
        },
        bookContent: true,
      },
    });

    if (!book) {
      return NextResponse.json(
        { success: false, error: "Book not found" },
        { status: 404 }
      );
    }

    // Extract chapters from bookContent if it exists
    let chapters = [];
    if (book.bookContent?.jsonContent) {
      const content = book.bookContent.jsonContent as any;
      chapters = content.chapters || [];
    }

    // Convert BigInt IDs to strings and extract authors
    const bookWithConvertedIds = {
      ...book,
      chapters, // Add chapters to the response
      authors:
        book.bookAuthors?.map((ba) => ba.author) ||
        (book.author ? [book.author] : []),
      bookGenres: book.bookGenres.map((bg) => ({
        ...bg,
        id: bg.id.toString(),
      })),
      bookPublishers: book.bookPublishers.map((bp) => ({
        ...bp,
        id: bp.id.toString(),
      })),
      bookAuthors:
        book.bookAuthors?.map((ba) => ({
          ...ba,
          id: ba.id.toString(),
        })) || [],
    };

    return NextResponse.json({ success: true, book: bookWithConvertedIds });
  } catch (error: any) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      chapters,
      status,
      bookName,
      description,
      subtitle,
      language,
      bookCoverPath,
      authorId,
      authorIds,
      genreIds,
    } = body;

    console.log("PATCH request body:", {
      bookName,
      subtitle,
      authorId,
      genreIds,
      hasChapters: !!chapters,
    });

    // If chapters are provided, upload to R2 and save reference
    let contentUrl: string | undefined;
    if (chapters && Array.isArray(chapters)) {
      console.log(`Saving ${chapters.length} chapters for book ${id}`);
      try {
        // Upload book content to R2
        contentUrl = await uploadBookContentToR2(id, { chapters });
        console.log(`Content uploaded to R2: ${contentUrl}`);

        // Save or update BookContent record
        // Use findFirst with unique constraint [bookId, contentType]
        const existingContent = await prisma.bookContent.findFirst({
          where: {
            bookId: id,
            contentType: "json",
          },
        });

        if (existingContent) {
          // Update existing content
          await prisma.bookContent.update({
            where: { id: existingContent.id },
            data: {
              jsonContent: { chapters },
              pdfPath: contentUrl, // Store R2 URL in pdfPath field
            },
          });
          console.log(`Updated existing book content record`);
        } else {
          // Create new content
          await prisma.bookContent.create({
            data: {
              bookId: id,
              contentType: "json",
              jsonContent: { chapters },
              pdfPath: contentUrl, // Store R2 URL in pdfPath field
            },
          });
          console.log(`Created new book content record`);
        }
      } catch (error) {
        console.error("Error uploading book content to R2:", error);
        // Continue with status update even if R2 upload fails
        // But still try to save to database without R2 URL
        try {
          const existingContent = await prisma.bookContent.findFirst({
            where: {
              bookId: id,
              contentType: "json",
            },
          });

          if (existingContent) {
            await prisma.bookContent.update({
              where: { id: existingContent.id },
              data: {
                jsonContent: { chapters },
              },
            });
          } else {
            await prisma.bookContent.create({
              data: {
                bookId: id,
                contentType: "json",
                jsonContent: { chapters },
              },
            });
          }
          console.log("Saved chapters to database (without R2 URL)");
        } catch (dbError) {
          console.error("Error saving to database:", dbError);
        }
      }
    } else {
      console.log("No chapters provided or chapters is not an array");
    }

    // Prepare update data
    const updateData: any = {};

    if (status !== undefined) updateData.status = status;
    if (bookName !== undefined) updateData.bookName = bookName;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (description !== undefined) updateData.description = description;
    if (language !== undefined) updateData.language = language;
    if (bookCoverPath !== undefined) updateData.bookCoverPath = bookCoverPath;

    // Handle authors update (support multiple authors)
    if (authorIds !== undefined && Array.isArray(authorIds)) {
      console.log(`Received authorIds: ${JSON.stringify(authorIds)}`);
      // Delete existing book authors
      await prisma.bookAuthor.deleteMany({
        where: { bookId: id },
      });

      // Create new book authors if provided
      if (authorIds.length > 0) {
        updateData.bookAuthors = {
          create: authorIds
            .filter((aid: any) => aid && aid.trim && aid.trim() !== "")
            .map((authorId: string) => ({
              authorId: String(authorId).trim(),
            })),
        };
        console.log(`Connecting ${authorIds.length} authors to book`);
      }
    } else if (authorId !== undefined) {
      // Legacy support: single authorId
      console.log(
        `Received single authorId: ${authorId}, type: ${typeof authorId}`
      );
      if (authorId && authorId !== null && authorId !== "") {
        // Delete existing book authors
        await prisma.bookAuthor.deleteMany({
          where: { bookId: id },
        });

        // Ensure authorId is a string
        const authorIdString = String(authorId).trim();
        if (authorIdString) {
          updateData.bookAuthors = {
            create: [{ authorId: authorIdString }],
          };
          console.log(`Connecting author: ${authorIdString}`);
        }
      } else {
        // Set authorId to null if empty or invalid
        updateData.authorId = null;
        await prisma.bookAuthor.deleteMany({
          where: { bookId: id },
        });
        console.log("Removing all authors from book (authorId is null/empty)");
      }
    }

    // Handle genres update
    if (genreIds !== undefined && Array.isArray(genreIds)) {
      // Delete existing genres
      await prisma.bookGenre.deleteMany({
        where: { bookId: id },
      });

      // Create new genres if provided
      if (genreIds.length > 0) {
        updateData.bookGenres = {
          create: genreIds.map((genreId: string) => ({
            genreId,
          })),
        };
      }
    }

    const book = await prisma.book.update({
      where: { id },
      data: updateData,
      include: {
        author: true,
        bookAuthors: {
          include: {
            author: true,
          },
        },
        bookGenres: {
          include: {
            genre: true,
          },
        },
        bookPublishers: {
          include: {
            publisher: true,
          },
        },
        bookContent: true,
      },
    });

    // Convert BigInt IDs to strings and extract authors
    const bookWithConvertedIds = {
      ...book,
      authors:
        book.bookAuthors?.map((ba) => ba.author) ||
        (book.author ? [book.author] : []),
      bookGenres: book.bookGenres.map((bg) => ({
        ...bg,
        id: bg.id.toString(),
      })),
      bookPublishers: book.bookPublishers.map((bp) => ({
        ...bp,
        id: bp.id.toString(),
      })),
      bookAuthors:
        book.bookAuthors?.map((ba) => ({
          ...ba,
          id: ba.id.toString(),
        })) || [],
    };

    return NextResponse.json({ success: true, book: bookWithConvertedIds });
  } catch (error: any) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
