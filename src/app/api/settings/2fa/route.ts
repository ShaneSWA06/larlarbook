import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { sendVerificationSMS } from "@/lib/sms";

// In-memory storage for verification codes (for development)
// In production, use Redis or a database table with expiration
const verificationCodes = new Map<
  string,
  { code: string; expiresAt: number }
>();

// Clean up expired codes every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of verificationCodes.entries()) {
    if (value.expiresAt < now) {
      verificationCodes.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Send verification code
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { method, contactInfo } = body; // method: "phone" or "email", contactInfo: phone number or email

    if (!method || !contactInfo) {
      return NextResponse.json(
        { error: "Method and contact info are required" },
        { status: 400 }
      );
    }

    if (method !== "phone" && method !== "email") {
      return NextResponse.json(
        { error: "Method must be 'phone' or 'email'" },
        { status: 400 }
      );
    }

    // Generate a 4-digit verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Store the code with expiration (10 minutes)
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    verificationCodes.set(session.user.id, {
      code: verificationCode,
      expiresAt,
    });

    // Send the verification code via email or SMS
    let sendResult;
    if (method === "email") {
      sendResult = await sendVerificationEmail(contactInfo, verificationCode);
    } else {
      sendResult = await sendVerificationSMS(contactInfo, verificationCode);
    }

    // Log for debugging
    console.log(
      `[2FA] Verification code for ${session.user.id} (${method}): ${verificationCode}`
    );

    // If sending failed and we're in production (have API keys), return error
    if (
      !sendResult.success &&
      (process.env.RESEND_API_KEY || process.env.TWILIO_ACCOUNT_SID)
    ) {
      return NextResponse.json(
        { error: sendResult.error || "Failed to send verification code" },
        { status: 500 }
      );
    }

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
          twoFactorMethod: method,
        },
      });
    } else {
      settings = await prisma.userSettings.update({
        where: {
          userId: session.user.id,
        },
        data: {
          twoFactorMethod: method,
        },
      });
    }

    // Return response
    // Only include code in response if email/SMS services aren't configured (development mode)
    const isDevelopmentMode =
      (method === "email" && !process.env.RESEND_API_KEY) ||
      (method === "phone" && !process.env.TWILIO_ACCOUNT_SID);

    return NextResponse.json({
      message: "Verification code sent",
      ...(isDevelopmentMode && { code: verificationCode }), // Only in dev mode
    });
  } catch (error) {
    console.error("2FA send code error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}

// Verify code and enable 2FA
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, enabled } = body;

    // Verify the code against the stored code
    const storedCodeData = verificationCodes.get(session.user.id);

    if (!storedCodeData) {
      return NextResponse.json(
        {
          error: "No verification code found. Please request a new code.",
          success: false,
        },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (storedCodeData.expiresAt < Date.now()) {
      verificationCodes.delete(session.user.id);
      return NextResponse.json(
        {
          error: "Verification code has expired. Please request a new code.",
          success: false,
        },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = code && code.length === 4 && code === storedCodeData.code;

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code", success: false },
        { status: 400 }
      );
    }

    // Code is valid, remove it from storage
    verificationCodes.delete(session.user.id);

    // Get or create user settings
    let settings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!settings) {
      // If settings don't exist, create with enabled status
      // Note: twoFactorMethod should have been set in the POST route
      settings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
          twoFactorEnabled: enabled ?? true,
          twoFactorVerifiedAt: new Date(),
        },
      });
    } else {
      // Update: preserve the existing twoFactorMethod (it was set in POST route)
      // Only update the enabled status and verification timestamp
      settings = await prisma.userSettings.update({
        where: {
          userId: session.user.id,
        },
        data: {
          twoFactorEnabled: enabled ?? true,
          twoFactorVerifiedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings,
      message: enabled
        ? "2FA enabled successfully"
        : "2FA disabled successfully",
    });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify code", success: false },
      { status: 500 }
    );
  }
}
