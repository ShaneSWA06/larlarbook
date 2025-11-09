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

    const where = search
      ? {
          OR: [
            { bookName: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          user: true, // Author of the book
          author: true, // Publisher
          bookGenres: {
            include: {
              genre: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.book.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      books,
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
    const { bookName, description, authorId, publisherId, genreIds, ...rest } =
      body;

    // Create book with relations
    const book = await prisma.book.create({
      data: {
        bookName,
        description,
        authorId,
        publisherId,
        ...rest,
        bookGenres: genreIds
          ? {
              create: genreIds.map((genreId: string) => ({
                genreId,
              })),
            }
          : undefined,
      },
      include: {
        user: true,
        author: true,
        bookGenres: {
          include: {
            genre: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, book }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
