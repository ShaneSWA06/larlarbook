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

    // Get or create user settings
    let settings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // If settings don't exist, create default settings
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
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

    // Get or create user settings
    let settings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
          ...body,
        },
      });
    } else {
      settings = await prisma.userSettings.update({
        where: {
          userId: session.user.id,
        },
        data: body,
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
