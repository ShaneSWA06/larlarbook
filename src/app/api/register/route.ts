import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    // Ensure database is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured. Please set DATABASE_URL." },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingProfile = await prisma.profile.findUnique({
      where: {
        email: validatedData.email,
      },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Generate UUIDs
    const profileId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    // Create both profile (for auth) and user (for author/creator)
    const [profile, user] = await prisma.$transaction([
      // Create profile for authentication
      prisma.profile.create({
        data: {
          id: profileId,
          fullName: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
        },
      }),
      // Create user for author/creator profile
      prisma.user.create({
        data: {
          id: userId,
          name: validatedData.name,
          userId: profileId, // Link to the profile
        },
      }),
    ]);

    return NextResponse.json(
      {
        message: "User created successfully",
        profile: {
          id: profile.id,
          fullName: profile.fullName,
          email: profile.email,
          createdAt: profile.createdAt,
        },
        user: {
          id: user.id,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    // Prisma known request errors (e.g., unique constraint)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Database request error. Please try again." },
        { status: 500 }
      );
    }

    // Prisma initialization / connection errors
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          error:
            "Database connection failed. Check DATABASE_URL and migrations.",
        },
        { status: 500 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
