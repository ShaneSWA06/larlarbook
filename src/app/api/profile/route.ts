import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        userSettings: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get additional statistics
    const [booksCount, reviewsCount, commentsCount] = await Promise.all([
      prisma.userLibrary.count({
        where: { userId: session.user.id },
      }),
      prisma.review.count({
        where: { userId: session.user.id },
      }),
      prisma.comment.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      profile,
      stats: {
        booksInLibrary: booksCount,
        reviewsWritten: reviewsCount,
        commentsPosted: commentsCount,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, username, avatarUrl } = body;

    const updatedProfile = await prisma.profile.update({
      where: {
        id: session.user.id,
      },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(username !== undefined && { username }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
