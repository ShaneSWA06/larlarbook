// API routes for Books
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/books - Get all books with relations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";
    const userId = searchParams.get("userId");

    const where = {
      ...(search
        ? {
            OR: [
              { bookName: { contains: search, mode: "insensitive" as const } },
              {
                description: { contains: search, mode: "insensitive" as const },
              },
            ],
          }
        : {}),
      ...(userId
        ? {
            author: {
              userId: userId,
            },
          }
        : {}),
    };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          author: true,
          publishers: true,
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
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.book.count({ where }),
    ]);

    // Convert BigInt IDs to strings for JSON serialization
    const booksWithConvertedIds = books.map((book) => ({
      ...book,
      bookGenres: book.bookGenres.map((bg) => ({
        ...bg,
        id: bg.id.toString(),
      })),
      bookPublishers: book.bookPublishers.map((bp) => ({
        ...bp,
        id: bp.id.toString(),
      })),
    }));

    return NextResponse.json({
      success: true,
      books: booksWithConvertedIds,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/books - Create a new book
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      bookName,
      description,
      subtitle,
      authorId,
      authorIds,
      genreIds,
      isbn,
      pageCount,
      language,
      price,
      publicationDate,
      status,
      bookCoverPath,
      userId, // Get userId for request
    } = body;

    // Find or create publisher for the user
    let publisherId: string | undefined;

    if (userId) {
      // Check if user already has a publisher
      let publisher = await prisma.publisher.findUnique({
        where: { user_id: userId },
      });

      // If not, create one
      if (!publisher) {
        // Get user's author info for publisher name
        const author = await prisma.author.findUnique({
          where: { userId: userId },
        });

        publisher = await prisma.publisher.create({
          data: {
            publisherName: author?.authorName || "Self-Published",
            user_id: userId,
          },
        });
      }

      publisherId = publisher.id;
    }

    // Prepare authorIds array
    let finalAuthorIds: string[] = [];
    if (authorIds && Array.isArray(authorIds) && authorIds.length > 0) {
      finalAuthorIds = authorIds.filter(
        (aid: any) => aid && String(aid).trim() !== ""
      );
    } else if (authorId) {
      finalAuthorIds = [String(authorId).trim()];
    }

    // Create book with relations
    const book = await prisma.book.create({
      data: {
        bookName,
        subtitle,
        description,
        author: authorId ? { connect: { id: authorId } } : undefined, // Keep for backward compatibility
        publishers: publisherId ? { connect: { id: publisherId } } : undefined,
        isbn,
        pageCount,
        language,
        price: price ? parseFloat(price) : undefined,
        publicationDate,
        status: status || "draft",
        bookCoverPath,
        bookAuthors:
          finalAuthorIds.length > 0
            ? {
                create: finalAuthorIds.map((aid: string) => ({
                  authorId: aid,
                })),
              }
            : undefined,
        bookGenres: genreIds
          ? {
              create: genreIds.map((genreId: string) => ({
                genreId,
              })),
            }
          : undefined,
        bookPublishers: publisherId
          ? {
              create: [
                {
                  publisherId: publisherId,
                },
              ],
            }
          : undefined,
      },
      include: {
        author: true,
        bookAuthors: {
          include: {
            author: true,
          },
        },
        publishers: true,
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
      },
    });

    // Convert BigInt IDs to strings for JSON serialization
    const bookWithConvertedIds = {
      ...book,
      bookGenres: book.bookGenres.map((bg) => ({
        ...bg,
        id: bg.id.toString(),
      })),
      bookPublishers: book.bookPublishers.map((bp) => ({
        ...bp,
        id: bp.id.toString(),
      })),
    };

    return NextResponse.json(
      { success: true, book: bookWithConvertedIds },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
